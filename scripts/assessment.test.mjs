// Tests for src/lib/ai-learning/assessment.mjs. Run: node --test scripts/assessment.test.mjs
// Uses a small synthetic fixture shaped like activities.yaml, not generated course data.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  BACKUP_PREFIX,
  gradeQuiz,
  shortAnswerState,
  emptyProgress,
  parseProgress,
  markRead,
  recordAttempt,
  setAttemptRubric,
  deriveLessonStatus,
  loadProgress,
  saveProgress,
} from "../src/lib/ai-learning/assessment.mjs";

const opts = (n) => Array.from({ length: n }, (_, i) => ({ text: `option ${i}`, feedback: "" }));

// Synthetic: 4 questions, need 3 correct, q1 and q3 critical.
const activities = {
  version: "v2",
  quiz: {
    rule: { min_correct: 3, critical_required: true },
    questions: [
      { id: "q1", critical: true, section: "model", prompt: "p", options: opts(3), answer: 1, reason: "r" },
      { id: "q2", section: "context", prompt: "p", options: opts(3), answer: 0, reason: "r" },
      { id: "q3", critical: true, section: "tools", prompt: "p", options: opts(3), answer: 2, reason: "r" },
      { id: "q4", section: "check", prompt: "p", options: opts(3), answer: 0, reason: "r" },
    ],
    short_question: { prompt: "p", rubric: ["a", "b", "c"] },
  },
};
const ALL_RIGHT = { q1: 1, q2: 0, q3: 2, q4: 0 };

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
  };
}
const backups = (s) => [...s.map.keys()].filter((k) => k.startsWith(BACKUP_PREFIX));
const now = () => "2026-09-19T00:00:00.000Z";

function passedLesson(version = "v2") {
  let p = markRead(emptyProgress(), "l01", version, "t0");
  p = recordAttempt(p, "l01", { version, at: "t1", answers: ALL_RIGHT, shortAnswer: "my answer" });
  return setAttemptRubric(p, "l01", 0, [true, true, true], true);
}

test("all correct passes", () => {
  const g = gradeQuiz(activities.quiz, ALL_RIGHT);
  assert.equal(g.correctCount, 4);
  assert.equal(g.passed, true);
});

test("missing answers fail and never count as correct", () => {
  const g = gradeQuiz(activities.quiz, { q1: 1, q3: 2 });
  assert.equal(g.correctCount, 2);
  assert.equal(g.unansweredCount, 2);
  assert.equal(g.passed, false);
  assert.equal(gradeQuiz(activities.quiz, {}).passed, false);
  assert.equal(gradeQuiz(activities.quiz, null).passed, false);
});

test("wrong critical question fails even when min_correct is met", () => {
  const g = gradeQuiz(activities.quiz, { ...ALL_RIGHT, q1: 0 });
  assert.equal(g.correctCount, 3);
  assert.equal(g.criticalOk, false);
  assert.equal(g.passed, false);
});

test("malformed and out-of-range answers are unanswered", () => {
  const g = gradeQuiz(activities.quiz, { q1: "1", q2: 0.0001, q3: 5, q4: -1 });
  assert.equal(g.correctCount, 0);
  assert.equal(g.unansweredCount, 4);
  assert.ok(g.results.every((r) => r.chosen === null));
});

test("empty question list never passes", () => {
  assert.equal(gradeQuiz({ rule: { min_correct: 0, critical_required: true }, questions: [] }, {}).passed, false);
});

test("short answer is never auto-marked", () => {
  assert.deepEqual(shortAnswerState({ shortAnswer: "   ", rubricChecks: [true], rubricDone: true }, 3), {
    written: false, done: false, checked: 0, total: 3,
  });
  const noSelfCheck = shortAnswerState({ shortAnswer: "a long thoughtful answer ".repeat(50), rubricChecks: [], rubricDone: false }, 3);
  assert.equal(noSelfCheck.written, true);
  assert.equal(noSelfCheck.done, false);

  let p = markRead(emptyProgress(), "l01", "v2", "t0");
  p = recordAttempt(p, "l01", { version: "v2", at: "t1", answers: ALL_RIGHT, shortAnswer: "written" });
  assert.equal(deriveLessonStatus(p.lessons.l01, activities).key, "short_pending");
});

test("full current-version record reaches self_check_complete only", () => {
  const s = deriveLessonStatus(passedLesson().lessons.l01, activities);
  assert.equal(s.key, "self_check_complete");
  assert.match(s.label, /不代表人工验收/);
});

test("forged passed/score fields in storage are ignored", () => {
  const raw = JSON.stringify({
    schemaVersion: 1,
    lessons: {
      l01: {
        readVersion: "v2",
        passed: true,
        status: "completed",
        attempts: [{ version: "v2", at: "t1", answers: {}, passed: true, score: 100, correctCount: 4, shortAnswer: "x", rubricDone: true }],
      },
    },
  });
  const { data, notice } = parseProgress(raw);
  assert.equal(notice, null);
  assert.equal("passed" in data.lessons.l01.attempts[0], false);
  assert.equal("score" in data.lessons.l01.attempts[0], false);
  const s = deriveLessonStatus(data.lessons.l01, activities);
  assert.equal(s.key, "quiz_not_passed");
  assert.equal(s.latest.grade.passed, false);
});

test("stale read and stale attempts never complete the current version", () => {
  const stale = passedLesson("v1").lessons.l01;
  const s = deriveLessonStatus(stale, activities);
  assert.equal(s.key, "in_progress");
  assert.equal(s.readCurrent, false);
  assert.equal(s.staleRead, true);
  assert.equal(s.staleAttempts, 1);
  assert.equal(s.currentAttempts, 0);
  assert.equal(s.first.isCurrent, false);
  assert.equal(s.first.grade, null);
  assert.equal(s.latest.attempt, null);

  // Current attempt passes but read mark is still stale.
  let p = passedLesson("v1");
  p = recordAttempt(p, "l01", { version: "v2", at: "t2", answers: ALL_RIGHT, shortAnswer: "x", rubricDone: true });
  assert.equal(deriveLessonStatus(p.lessons.l01, activities).key, "read_pending");
});

test("first attempt and retakes stay distinct", () => {
  let p = markRead(emptyProgress(), "l01", "v2", "t0");
  p = recordAttempt(p, "l01", { version: "v2", at: "t1", answers: { q1: 0 } });
  p = recordAttempt(p, "l01", { version: "v2", at: "t2", answers: ALL_RIGHT, shortAnswer: "x", rubricDone: true, aided: true });
  const s = deriveLessonStatus(p.lessons.l01, activities);
  assert.equal(s.first.attempt.at, "t1");
  assert.equal(s.first.grade.passed, false);
  assert.equal(s.latest.attempt.at, "t2");
  assert.equal(s.latest.grade.passed, true);
  assert.equal(s.retakeCount, 1);
  assert.equal(s.aidedCount, 1);
  assert.equal(s.key, "self_check_complete");
  assert.deepEqual(deriveLessonStatus(undefined, activities).key, "not_started");
});

test("updates do not mutate the input progress", () => {
  const p = emptyProgress();
  markRead(p, "l01", "v2", "t0");
  assert.deepEqual(p, emptyProgress());
  assert.throws(() => markRead(p, "__proto__", "v2", "t0"), TypeError);
});

test("corrupt and unsupported data return notice and empty data", () => {
  assert.equal(parseProgress("{not json").notice, "corrupt");
  assert.equal(parseProgress("[]").notice, "corrupt");
  assert.equal(parseProgress('{"lessons":{}}').notice, "corrupt");
  const u = parseProgress('{"schemaVersion":2,"lessons":{}}');
  assert.equal(u.notice, "unsupported");
  assert.deepEqual(u.data, emptyProgress());
  assert.deepEqual(parseProgress(null), { data: emptyProgress(), notice: null });
});

test("unknown lessons are preserved but show nothing completed for known ones", () => {
  const raw = JSON.stringify({ schemaVersion: 1, lessons: { l99: { readVersion: "x", attempts: [] } } });
  const { data } = parseProgress(raw);
  assert.equal(data.lessons.l99.readVersion, "x");
  const next = recordAttempt(data, "l01", { version: "v2", at: "t", answers: {} });
  assert.ok(next.lessons.l99);
  assert.equal(deriveLessonStatus(next.lessons.l02, activities).key, "not_started");
});

test("corrupt raw is backed up once and not destroyed", () => {
  const bad = "{broken";
  const s = memoryStorage({ [STORAGE_KEY]: bad });
  const first = loadProgress(s, { now });
  assert.equal(first.notice, "corrupt");
  assert.equal(s.getItem(first.backupKey), bad);
  assert.equal(s.getItem(STORAGE_KEY), bad, "load never overwrites");
  loadProgress(s, { now: () => "later" });
  assert.equal(backups(s).length, 1, "identical raw is not backed up twice");

  const saved = saveProgress(s, passedLesson(), { now: () => "even-later" });
  assert.equal(saved.ok, true);
  assert.equal(backups(s).length, 1);
  assert.equal(s.getItem(saved.backupKey), bad);
  assert.equal(loadProgress(s).notice, null);
});

test("unsupported schema is backed up before overwrite", () => {
  const future = '{"schemaVersion":2,"lessons":{"l01":{}}}';
  const s = memoryStorage({ [STORAGE_KEY]: future });
  const r = saveProgress(s, emptyProgress(), { now });
  assert.equal(r.ok, true);
  assert.deepEqual(backups(s).map((k) => s.getItem(k)), [future]);
});

test("backup failure blocks overwrite", () => {
  const s = memoryStorage({ [STORAGE_KEY]: "{broken" });
  const setItem = s.setItem;
  s.setItem = (k, v) => {
    if (k.startsWith(BACKUP_PREFIX)) throw new Error("quota");
    setItem(k, v);
  };
  assert.equal(loadProgress(s, { now }).warning, "backup_failed");
  const r = saveProgress(s, emptyProgress(), { now });
  assert.deepEqual(r, { ok: false, warning: "backup_failed", backupKey: null });
  assert.equal(s.getItem(STORAGE_KEY), "{broken");
});

test("storage unavailable returns warning instead of throwing", () => {
  const throwing = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("SecurityError"); } };
  for (const st of [undefined, null, {}, throwing]) {
    const l = loadProgress(st);
    assert.equal(l.notice, "unavailable");
    assert.deepEqual(l.data, emptyProgress());
    assert.equal(saveProgress(st, emptyProgress()).warning, "unavailable");
  }
});

test("write failure is reported", () => {
  const s = memoryStorage();
  s.setItem = () => {
    throw new Error("QuotaExceededError");
  };
  assert.deepEqual(saveProgress(s, emptyProgress()), { ok: false, warning: "write_failed", backupKey: null });
});

test("uses its own storage key, not the old site's", () => {
  const s = memoryStorage({ "ai-learning-site:v1:progress": '{"schemaVersion":1,"lessons":{"l01":{"readVersion":"v2"}}}' });
  assert.equal(STORAGE_KEY, "ai-learning-next:v1:progress");
  assert.deepEqual(loadProgress(s).data, emptyProgress());
  saveProgress(s, passedLesson());
  assert.ok(s.getItem(STORAGE_KEY));
  assert.equal(s.getItem("ai-learning-site:v1:progress"), '{"schemaVersion":1,"lessons":{"l01":{"readVersion":"v2"}}}');
});

test("prototype pollution keys are dropped", () => {
  const raw =
    '{"schemaVersion":1,"__proto__":{"polluted":1},"lessons":{"__proto__":{"polluted":1},"constructor":{},' +
    '"l01":{"readVersion":"v2","attempts":[{"version":"v2","at":"t","answers":{"__proto__":{"x":1},"constructor":1,"q1":1}}]}}}';
  const { data, notice } = parseProgress(raw);
  assert.equal(notice, null);
  assert.deepEqual(Object.keys(data.lessons), ["l01"]);
  assert.deepEqual(Object.keys(data.lessons.l01.attempts[0].answers), ["q1"]);
  assert.equal(Object.getPrototypeOf(data.lessons), Object.prototype);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  const s = deriveLessonStatus(data.lessons.l01, activities);
  assert.equal(s.latest.grade.correctCount, 1);
});
