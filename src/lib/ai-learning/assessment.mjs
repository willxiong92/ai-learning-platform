// Assessment core for the learning site: quiz grading, short-answer self-check
// state, and local progress records. Pure functions only — no window, no
// localStorage, no Node APIs — so it runs in the browser and in node:test.
// Storage is always passed in by the caller.
//
// Grading and progress rules are carried over from the old VitePress site
// (grading.js / progress.js / status.js); the thresholds come from each
// lesson's activities.yaml (quiz.rule), never from this file.
//
// Principles:
// - Unanswered, malformed or out-of-range answers never count as correct.
// - Short answers are never auto-graded; "done" only means the learner wrote
//   something and explicitly ticked the rubric self-check.
// - Pass/fail and scores are never stored or trusted from storage; status is
//   recomputed from the saved answers against the current questions.
// - Records from an older activities.version are kept but never count toward
//   the current version's completion.
// - "self_check_complete" is a local self-test result, not human acceptance.

export const STORAGE_KEY = "ai-learning-next:v1:progress";
export const BACKUP_PREFIX = "ai-learning-next:v1:progress-backup:";
export const SCHEMA_VERSION = 1;

export const STATUS_LABEL = {
  not_started: "未开始",
  in_progress: "学习中",
  read_quiz_pending: "已读，待测验",
  quiz_not_passed: "测验未达标",
  short_pending: "客观题达标，简答待自查",
  read_pending: "测验已达标，正文未标记已读",
  self_check_complete: "本机自测完成（不代表人工验收）",
};

// ---------- small helpers ----------

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const str = (v) => (typeof v === "string" ? v : "");
const nonEmpty = (v) => typeof v === "string" && v !== "";
const bools = (v) => (Array.isArray(v) ? v.slice(0, 64).map((x) => x === true) : []);

// Ids (lessons, questions) are plain identifiers. Anything that could reach an
// object prototype is dropped, even though it would match the pattern.
const SAFE_KEY = /^[A-Za-z0-9_-]{1,64}$/;
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const isSafeKey = (k) => typeof k === "string" && SAFE_KEY.test(k) && !BLOCKED_KEYS.has(k);

// ---------- grading ----------

export function normalizeAnswer(value, optionCount) {
  return Number.isInteger(value) && value >= 0 && value < optionCount ? value : null;
}

export function gradeQuiz(quiz, answers) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const rule = isObj(quiz?.rule) ? quiz.rule : {};
  const given = isObj(answers) ? answers : {};
  const results = questions.map((q) => {
    const optionCount = Array.isArray(q.options) ? q.options.length : 0;
    const chosen = own(given, q.id) ? normalizeAnswer(given[q.id], optionCount) : null;
    return {
      id: q.id,
      section: typeof q.section === "string" ? q.section : null,
      critical: q.critical === true,
      chosen,
      answered: chosen !== null,
      correct: chosen !== null && chosen === q.answer,
    };
  });
  const correctCount = results.filter((r) => r.correct).length;
  const criticalOk = results.filter((r) => r.critical).every((r) => r.correct);
  const minCorrect =
    Number.isInteger(rule.min_correct) && rule.min_correct >= 0 ? rule.min_correct : questions.length;
  const passed =
    questions.length > 0 &&
    correctCount >= minCorrect &&
    (rule.critical_required === false || criticalOk);
  return {
    results,
    total: questions.length,
    correctCount,
    unansweredCount: results.filter((r) => !r.answered).length,
    minCorrect,
    criticalOk,
    passed,
  };
}

// Short answers: only "was something written" and "which rubric points were
// self-checked". Length is never scored.
export function shortAnswerState(attempt, rubricCount) {
  const total = Number.isInteger(rubricCount) && rubricCount > 0 ? rubricCount : 0;
  const written = typeof attempt?.shortAnswer === "string" && attempt.shortAnswer.trim() !== "";
  if (!written) return { written: false, done: false, checked: 0, total };
  const checked = bools(attempt.rubricChecks).slice(0, total).filter(Boolean).length;
  return { written: true, done: attempt.rubricDone === true, checked, total };
}

export function sectionsToReview(grade) {
  const seen = new Set();
  const out = [];
  for (const r of grade.results) {
    if (!r.correct && r.section && !seen.has(r.section)) {
      seen.add(r.section);
      out.push(r.section);
    }
  }
  return out;
}

// ---------- progress schema ----------

export function emptyProgress() {
  return { schemaVersion: SCHEMA_VERSION, lessons: {} };
}

function sanitizeAnswers(v) {
  const out = {};
  if (!isObj(v)) return out;
  for (const k of Object.keys(v)) {
    const val = v[k];
    if (isSafeKey(k) && Number.isInteger(val) && val >= 0) out[k] = val;
  }
  return out;
}

// Deliberately has no passed/score field: anything like that in storage is dropped.
function sanitizeAttempt(a) {
  if (!isObj(a) || !nonEmpty(a.version) || !nonEmpty(a.at)) return null;
  return {
    version: a.version,
    at: a.at,
    answers: sanitizeAnswers(a.answers),
    shortAnswer: str(a.shortAnswer),
    rubricChecks: bools(a.rubricChecks),
    rubricDone: a.rubricDone === true,
    aided: a.aided === true,
  };
}

function sanitizeLesson(l) {
  const lesson = { readVersion: null, readAt: null, attempts: [] };
  if (!isObj(l)) return lesson;
  if (nonEmpty(l.readVersion)) {
    lesson.readVersion = l.readVersion;
    lesson.readAt = nonEmpty(l.readAt) ? l.readAt : null;
  }
  lesson.attempts = Array.isArray(l.attempts) ? l.attempts.map(sanitizeAttempt).filter(Boolean) : [];
  return lesson;
}

// Rebuilds a clean copy. Unknown lesson ids are kept (safely) so a record for a
// lesson this build does not know yet is not lost on the next save.
function normalizeProgress(p) {
  const data = emptyProgress();
  const lessons = isObj(p?.lessons) ? p.lessons : {};
  for (const id of Object.keys(lessons)) {
    if (isSafeKey(id)) data.lessons[id] = sanitizeLesson(lessons[id]);
  }
  return data;
}

// Returns { data, notice }. notice: null | "corrupt" | "unsupported".
// Never modifies the raw string; the caller decides whether to back it up.
export function parseProgress(raw) {
  if (raw === null || raw === undefined || raw === "") return { data: emptyProgress(), notice: null };
  if (typeof raw !== "string") return { data: emptyProgress(), notice: "corrupt" };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { data: emptyProgress(), notice: "corrupt" };
  }
  if (!isObj(parsed)) return { data: emptyProgress(), notice: "corrupt" };
  if (own(parsed, "schemaVersion") && parsed.schemaVersion !== SCHEMA_VERSION) {
    return { data: emptyProgress(), notice: "unsupported" };
  }
  if (parsed.schemaVersion !== SCHEMA_VERSION || !isObj(parsed.lessons)) {
    return { data: emptyProgress(), notice: "corrupt" };
  }
  return { data: normalizeProgress(parsed), notice: null };
}

// ---------- updates (all return a new progress object) ----------

function requireLessonId(lessonId) {
  if (!isSafeKey(lessonId)) throw new TypeError("invalid lesson id");
}

function withLesson(progress, lessonId, update) {
  requireLessonId(lessonId);
  const data = normalizeProgress(progress);
  const current = own(data.lessons, lessonId) ? data.lessons[lessonId] : sanitizeLesson(null);
  data.lessons[lessonId] = update(current);
  return data;
}

export function markRead(progress, lessonId, version, at) {
  if (!nonEmpty(version) || !nonEmpty(at)) throw new TypeError("version and at are required");
  return withLesson(progress, lessonId, (l) => ({ ...l, readVersion: version, readAt: at }));
}

export function recordAttempt(progress, lessonId, input) {
  const attempt = sanitizeAttempt(input);
  if (!attempt) throw new TypeError("attempt needs version and at");
  return withLesson(progress, lessonId, (l) => ({ ...l, attempts: [...l.attempts, attempt] }));
}

// Self-check happens after submitting, so the rubric is updated on an existing attempt.
export function setAttemptRubric(progress, lessonId, attemptIndex, rubricChecks, rubricDone) {
  return withLesson(progress, lessonId, (l) => {
    if (!Number.isInteger(attemptIndex) || attemptIndex < 0 || attemptIndex >= l.attempts.length) return l;
    const attempts = l.attempts.slice();
    attempts[attemptIndex] = {
      ...attempts[attemptIndex],
      rubricChecks: bools(rubricChecks),
      rubricDone: rubricDone === true,
    };
    return { ...l, attempts };
  });
}

// ---------- derived status ----------

export function deriveLessonStatus(lesson, activities) {
  const version = activities.version;
  const quiz = activities.quiz;
  const rubricCount = Array.isArray(quiz?.short_question?.rubric) ? quiz.short_question.rubric.length : 0;
  const l = lesson ? sanitizeLesson(lesson) : null;
  const all = l ? l.attempts : [];
  const current = all.filter((a) => a.version === version);
  const readCurrent = l !== null && l.readVersion === version;
  const staleRead = l !== null && l.readVersion !== null && !readCurrent;

  const latest = current.length > 0 ? current[current.length - 1] : null;
  const latestGrade = latest ? gradeQuiz(quiz, latest.answers) : null;
  const short = latest ? shortAnswerState(latest, rubricCount) : null;

  // "First" is the very first attempt ever; it only gets a grade when it was
  // made on the current version, otherwise it would be graded against questions
  // the learner never saw.
  const first = all.length > 0 ? all[0] : null;
  const firstIsCurrent = first !== null && first.version === version;
  const firstGrade = firstIsCurrent ? gradeQuiz(quiz, first.answers) : null;

  let key;
  if (!l || (l.readVersion === null && all.length === 0)) key = "not_started";
  else if (!latest) key = readCurrent ? "read_quiz_pending" : "in_progress";
  else if (!latestGrade.passed) key = "quiz_not_passed";
  else if (!short.done) key = "short_pending";
  else if (!readCurrent) key = "read_pending";
  else key = "self_check_complete";

  return {
    key,
    label: STATUS_LABEL[key],
    version,
    readCurrent,
    staleRead,
    first: { attempt: first, isCurrent: firstIsCurrent, grade: firstGrade },
    latest: { attempt: latest, grade: latestGrade, short },
    currentAttempts: current.length,
    retakeCount: current.length - (firstIsCurrent ? 1 : 0),
    staleAttempts: all.length - current.length,
    aidedCount: current.filter((a) => a.aided).length,
    reviewSections: latestGrade ? sectionsToReview(latestGrade) : [],
  };
}

// ---------- storage (injected, Storage-like) ----------

const defaultNow = () => new Date().toISOString();
const hasStorage = (s) => !!s && typeof s.getItem === "function" && typeof s.setItem === "function";

function findBackup(storage, raw) {
  try {
    const n = typeof storage.length === "number" ? storage.length : 0;
    if (typeof storage.key !== "function") return null;
    for (let i = 0; i < n; i++) {
      const k = storage.key(i);
      if (typeof k === "string" && k.startsWith(BACKUP_PREFIX) && storage.getItem(k) === raw) return k;
    }
  } catch {
    // Cannot enumerate: fall through and write a new backup.
  }
  return null;
}

// The same bad raw value is backed up only once, so reloads do not pile up copies.
function ensureBackup(storage, raw, now) {
  const existing = findBackup(storage, raw);
  if (existing) return existing;
  try {
    const base = BACKUP_PREFIX + now();
    let key = base;
    for (let i = 1; storage.getItem(key) !== null && storage.getItem(key) !== raw; i++) key = `${base}#${i}`;
    storage.setItem(key, raw);
    return key;
  } catch {
    return null;
  }
}

// Returns { data, notice, warning, backupKey }.
// notice: null | "corrupt" | "unsupported" | "unavailable"; warning: null | "backup_failed".
// Never throws and never overwrites the stored value.
export function loadProgress(storage, options = {}) {
  const now = options.now ?? defaultNow;
  if (!hasStorage(storage)) return { data: emptyProgress(), notice: "unavailable", warning: null, backupKey: null };
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: emptyProgress(), notice: "unavailable", warning: null, backupKey: null };
  }
  const { data, notice } = parseProgress(raw);
  if (!notice) return { data, notice, warning: null, backupKey: null };
  const backupKey = ensureBackup(storage, raw, now);
  return { data, notice, warning: backupKey ? null : "backup_failed", backupKey };
}

// Returns { ok, warning, backupKey }; warning: null | "unavailable" | "backup_failed" | "write_failed".
// If the stored value is corrupt/unsupported it is backed up first; when that
// backup fails, nothing is overwritten.
export function saveProgress(storage, progress, options = {}) {
  const now = options.now ?? defaultNow;
  if (!hasStorage(storage)) return { ok: false, warning: "unavailable", backupKey: null };
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, warning: "unavailable", backupKey: null };
  }
  let backupKey = null;
  if (parseProgress(raw).notice) {
    backupKey = ensureBackup(storage, raw, now);
    if (!backupKey) return { ok: false, warning: "backup_failed", backupKey: null };
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
  } catch {
    return { ok: false, warning: "write_failed", backupKey };
  }
  return { ok: true, warning: null, backupKey };
}
