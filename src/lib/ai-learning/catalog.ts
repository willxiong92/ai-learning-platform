// Typed read-only access to the AI learning course data.
// generated.json is produced by scripts/generate-ai-learning.mjs from the
// canonical course sources — never edit it by hand. No fs here, so this is
// safe to import from both server and client components.
import generated from "./generated.json";

/**
 * available: text plus quiz/practice. reading_ready: text is readable, practice
 * is still being written (temporary; no assessment exists yet). planned: no text.
 */
export type LessonStatus = "available" | "reading_ready" | "planned";

/** Lessons with rendered text: available and reading_ready. */
export function isReadableStatus(status: LessonStatus): boolean {
  return status === "available" || status === "reading_ready";
}
export type ContentReviewState = "draft" | "reviewed";

export interface CourseReview {
  content: ContentReviewState;
  /** Mirrors the source as-is, e.g. "not_open" (not opened to the team yet). */
  teamAccess: string;
}

export interface LessonSummary {
  id: string;
  moduleId: string;
  /** 1-based position in the full course. */
  order: number;
  title: string;
  status: LessonStatus;
  topics: string | null;
  outcome: string;
  why: string;
  verify: string;
  prerequisites: string[];
  estimate: string;
}

export interface CourseModule {
  id: string;
  title: string;
  purpose: string | null;
  lessons: LessonSummary[];
}

export interface LessonSection {
  id: string;
  title: string;
  text: string;
}

/** Activities come straight from activities.yaml; only the version is relied on here. */
export interface LessonActivities {
  version: string;
  [key: string]: unknown;
}

export interface LessonContent {
  id: string;
  moduleId: string;
  version: string;
  markdown: string;
  activities: LessonActivities;
  sections: LessonSection[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  en: string | null;
  aliases: string[];
  definition: string;
  example: string;
  needs: string[];
  lesson: string;
  section: string;
}

export interface LearningData {
  schemaVersion: number;
  courseVersion: string;
  title: string;
  audience: string | null;
  depthNote: string | null;
  review: CourseReview;
  period: {
    weeks: number | null;
    hoursPerWeek: number | null;
    totalHours: number | null;
    note: string | null;
  } | null;
  /**
   * available counts every lesson with readable text (reading_ready included);
   * readingReady is the subset whose practice is still pending. Older generated
   * files have no readingReady field.
   */
  counts: { modules: number; lessons: number; available: number; readingReady?: number; planned: number };
  modules: CourseModule[];
  glossary: { version: string | null; terms: GlossaryTerm[] };
  lessons: LessonContent[];
}

const data = generated as LearningData;

export function getCourseMeta() {
  const { schemaVersion, courseVersion, title, audience, depthNote, review, period, counts } = data;
  return { schemaVersion, courseVersion, title, audience, depthNote, review, period, counts };
}

export function getModules(): CourseModule[] {
  return data.modules;
}

export function getModule(id: string): CourseModule | undefined {
  return data.modules.find((m) => m.id === id);
}

export function getLessonSummaries(): LessonSummary[] {
  return data.modules.flatMap((m) => m.lessons);
}

export function getLessonSummary(id: string): LessonSummary | undefined {
  return getLessonSummaries().find((l) => l.id === id);
}

/** Only readable (available / reading_ready) lessons have content; planned lessons return undefined. */
export function getLessonContent(id: string): LessonContent | undefined {
  return data.lessons.find((l) => l.id === id);
}

export function getGlossaryTerms(): GlossaryTerm[] {
  return data.glossary.terms;
}

/** Previous/next lesson in course order, planned lessons included. */
export function getNeighborLessons(id: string): { previous: LessonSummary | undefined; next: LessonSummary | undefined } {
  const all = getLessonSummaries();
  const index = all.findIndex((l) => l.id === id);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: all[index - 1], next: all[index + 1] };
}

/** Status wording shown to readers; available only means readable, not accepted. */
export function getLessonStatusLabel(status: LessonStatus): string {
  if (status === "available") return "可试读·待本人验收";
  if (status === "reading_ready") return "正文可读·练习待编";
  return "待编写";
}

export function getReviewLabel(review: CourseReview): string {
  const content = review.content === "draft" ? "内容草稿 · 待本人试学" : "内容已复核";
  const access = review.teamAccess === "not_open" ? "未向团队开放" : `团队开放状态：${review.teamAccess}`;
  return `${content} · ${access}`;
}

/**
 * Shape of rendered.json, produced by scripts/render-ai-learning.mjs.
 * Types only: the lesson route imports the JSON itself on the server, so the
 * rendered HTML never reaches client bundles through this module.
 */
export interface RenderedLesson {
  id: string;
  version: string;
  reviewStatus: string | null;
  sections: { id: string; title: string }[];
  html: string;
}

export interface RenderedLearningData {
  schemaVersion: number;
  courseVersion: string;
  renderer: string;
  lessons: RenderedLesson[];
}
