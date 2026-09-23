// Server-only: turns a lesson's raw activities (typed as unknown-ish
// LessonActivities in catalog.ts) into the typed AssessmentActivities the
// assessment core expects. Imports catalog.ts, which pulls in the full
// generated.json, so never import this file from a client component — pass
// the returned objects down as props instead.
//
// Malformed sources throw at build time instead of rendering a broken quiz.
// Missing min_correct / critical_required are filled with the exact defaults
// assessment.mjs would apply anyway, so the grading rule is unchanged.
import type {
  AssessmentActivities,
  QuizOption,
  QuizQuestion,
  QuizRule,
  ShortQuestion,
} from "./assessment.mjs";
import { getLessonContent, getLessonSummaries } from "./catalog";

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => v !== null && typeof v === "object" && !Array.isArray(v);

function fail(where: string, message: string): never {
  throw new Error(`activities ${where}: ${message}`);
}

function obj(v: unknown, where: string): Obj {
  if (!isObj(v)) fail(where, "must be an object");
  return v;
}

function text(v: unknown, where: string): string {
  if (typeof v !== "string" || v.trim() === "") fail(where, "must be a non-empty string");
  return v;
}

function optionalText(v: unknown, where: string): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "string") fail(where, "must be a string");
  return v;
}

function list(v: unknown, where: string): unknown[] {
  if (!Array.isArray(v) || v.length === 0) fail(where, "must be a non-empty list");
  return v;
}

function parseOption(v: unknown, where: string): QuizOption {
  const o = obj(v, where);
  const feedback = o.feedback ?? "";
  if (typeof feedback !== "string") fail(`${where}.feedback`, "must be a string");
  return { text: text(o.text, `${where}.text`), feedback };
}

function parseQuestion(v: unknown, where: string, sectionIds: Set<string>): QuizQuestion {
  const q = obj(v, where);
  const id = text(q.id, `${where}.id`);
  if (!SAFE_ID.test(id)) fail(`${where}.id`, `unsafe id ${id}`);
  const section = text(q.section, `${where}.section`);
  if (!sectionIds.has(section)) fail(`${where}.section`, `unknown section #${section}`);
  const options = list(q.options, `${where}.options`).map((o, i) => parseOption(o, `${where}.options[${i}]`));
  if (options.length < 2) fail(`${where}.options`, "needs at least 2 options");
  const answer = q.answer;
  if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= options.length) {
    fail(`${where}.answer`, "must be a valid option index");
  }
  if (q.critical !== undefined && typeof q.critical !== "boolean") fail(`${where}.critical`, "must be true/false");
  return {
    id,
    critical: q.critical === true,
    section,
    prompt: text(q.prompt, `${where}.prompt`),
    options,
    answer,
    reason: text(q.reason, `${where}.reason`),
  };
}

function parseRule(v: unknown, where: string, questionCount: number): QuizRule {
  const r = v === undefined ? {} : obj(v, where);
  let minCorrect = questionCount;
  if (r.min_correct !== undefined) {
    const m = r.min_correct;
    if (typeof m !== "number" || !Number.isInteger(m) || m < 0 || m > questionCount) {
      fail(`${where}.min_correct`, `must be an integer from 0 to ${questionCount}`);
    }
    minCorrect = m;
  }
  if (r.critical_required !== undefined && typeof r.critical_required !== "boolean") {
    fail(`${where}.critical_required`, "must be true/false");
  }
  return {
    status: optionalText(r.status, `${where}.status`),
    min_correct: minCorrect,
    critical_required: r.critical_required !== false,
    text: optionalText(r.text, `${where}.text`),
  };
}

function parseShort(v: unknown, where: string): ShortQuestion {
  const s = obj(v, where);
  return {
    prompt: text(s.prompt, `${where}.prompt`),
    placeholder: optionalText(s.placeholder, `${where}.placeholder`),
    rubric: list(s.rubric, `${where}.rubric`).map((r, i) => text(r, `${where}.rubric[${i}]`)),
    rubric_note: optionalText(s.rubric_note, `${where}.rubric_note`),
  };
}

/** Full, validated assessment data for one available lesson (for its own page). */
export function getAssessmentActivities(lessonId: string): AssessmentActivities | undefined {
  const content = getLessonContent(lessonId);
  if (!content) return undefined;
  const where = lessonId;
  const raw = content.activities;
  if (raw.version !== content.version) fail(where, "version differs from lesson version");
  const quiz = obj(raw.quiz, `${where}.quiz`);
  const sectionIds = new Set(content.sections.map((s) => s.id));
  const questions = list(quiz.questions, `${where}.quiz.questions`).map((q, i) =>
    parseQuestion(q, `${where}.quiz.questions[${i}]`, sectionIds),
  );
  const ids = questions.map((q) => q.id);
  const duplicate = ids.find((id, i) => ids.indexOf(id) !== i);
  if (duplicate) fail(`${where}.quiz.questions`, `duplicate id ${duplicate}`);
  return {
    version: content.version,
    quiz: {
      notice: optionalText(quiz.notice, `${where}.quiz.notice`),
      rule: parseRule(quiz.rule, `${where}.quiz.rule`, questions.length),
      questions,
      short_question: parseShort(quiz.short_question, `${where}.quiz.short_question`),
    },
  };
}

/**
 * Same grading data with every visible text stripped: only ids, sections,
 * option counts, answer indexes and the rule survive. Enough for
 * deriveLessonStatus on the course map without shipping lesson text.
 */
export function getCompactAssessments(): { lessonId: string; activities: AssessmentActivities }[] {
  return getLessonSummaries()
    .filter((s) => s.status === "available")
    .flatMap((s) => {
      const full = getAssessmentActivities(s.id);
      if (!full) return [];
      const { rule, questions, short_question } = full.quiz;
      return [
        {
          lessonId: s.id,
          activities: {
            version: full.version,
            quiz: {
              rule: { min_correct: rule.min_correct, critical_required: rule.critical_required },
              questions: questions.map((q) => ({
                id: q.id,
                critical: q.critical,
                section: q.section,
                prompt: "",
                options: q.options.map(() => ({ text: "", feedback: "" })),
                answer: q.answer,
                reason: "",
              })),
              short_question: { prompt: "", rubric: short_question.rubric.map(() => "") },
            },
          },
        },
      ];
    });
}
