// Maps the AI course modules onto the shared /courses routes.
// Each module in the course source becomes one course card at /courses,
// with its lessons as chapters: /courses/ai-m1/l01. Lesson IDs, content
// versions and the browser storage key are unchanged, so records written on
// the old /learning/l01 pages still count here.
//
// Server-side helper: it reads the full catalog, so client components should
// receive the hrefs they need as props instead of importing this file.
import { getLessonSummary, getModule, getModules, isReadableStatus, type CourseModule } from "./catalog";

const SLUG_PREFIX = "ai-";

/** Visuals in public/assets/ai-course-blueprints.svg, one per module. */
export const AI_BLUEPRINT_FILE = "/assets/ai-course-blueprints.svg";

export function aiCourseSlug(moduleId: string): string {
  return `${SLUG_PREFIX}${moduleId}`;
}

export function aiCourseHref(moduleId: string): string {
  return `/courses/${aiCourseSlug(moduleId)}`;
}

/** Undefined for unknown lesson IDs, so callers can 404 instead of linking nowhere. */
export function aiLessonHref(lessonId: string): string | undefined {
  const lesson = getLessonSummary(lessonId);
  return lesson ? `${aiCourseHref(lesson.moduleId)}/${lesson.id}` : undefined;
}

export function getAiCourseBySlug(slug: string): CourseModule | undefined {
  if (!slug.startsWith(SLUG_PREFIX)) return undefined;
  return getModule(slug.slice(SLUG_PREFIX.length));
}

/** 1-based position of the module in the course source. */
export function getAiCourseNumber(moduleId: string): number {
  return getModules().findIndex((m) => m.id === moduleId) + 1;
}

export function aiCourseBlueprintId(moduleId: string): string {
  return `ai-course-${moduleId}-route-v1`;
}

export function aiChapterBlueprintId(lessonId: string): string {
  return `ai-course-${lessonId}-chapter-v1`;
}

/**
 * Lessons in this module that have readable content: available and
 * reading_ready (text only, practice pending). The name is kept for existing
 * callers; it does not mean the lesson has a quiz.
 */
export function availableLessons(courseModule: CourseModule) {
  return courseModule.lessons.filter((l) => isReadableStatus(l.status));
}
