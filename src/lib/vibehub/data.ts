import termsData from "./terms.json";
import topicsData from "./topics.json";
import aifData from "./aif-data.json";
import changelogData from "./changelog-data.json";
import practiceData from "./practice-data.json";
import coursesData from "./courses-data.json";
import courseLessonsData from "./course-lessons-data.json";
import type { Term, Topic, AifSection, ChangelogData, PracticeQuestion, Course, CourseLesson } from "./types";

export const ALL_TERMS = termsData as unknown as Term[];
export const TOPICS = topicsData as unknown as Topic[];
export const AIF_SECTIONS = aifData as unknown as AifSection[];
export const CHANGELOG = changelogData as unknown as ChangelogData;
export const PRACTICE_QUESTIONS = practiceData as unknown as PracticeQuestion[];
export const COURSES = coursesData as unknown as Course[];
export const COURSE_LESSONS = courseLessonsData as unknown as CourseLesson[];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCourseLesson(courseSlug: string, lessonSlug: string): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.courseSlug === courseSlug && l.slug === lessonSlug);
}

const termById = new Map<string, Term>(ALL_TERMS.map((t) => [t.id, t]));

export function getTerm(id: string): Term | undefined {
  return termById.get(id);
}

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

/** Ordered card list for a topic, grouped by its category sections. */
export function getTopicCards(slug: string): { cat: string; terms: Term[] }[] {
  const topic = getTopic(slug);
  if (!topic) return [];
  return topic.sections.map((s) => ({
    cat: s.cat,
    terms: s.ids.map((id) => termById.get(id)).filter((t): t is Term => !!t),
  }));
}

/** Flat, in-catalog-order term list for a topic (used for prev/next nav). */
export function getTopicFlatIds(slug: string): string[] {
  const topic = getTopic(slug);
  if (!topic) return [];
  return topic.sections.flatMap((s) => s.ids);
}

/** Which topic a given term belongs to (first match wins). */
export function getTopicForTerm(id: string): Topic | undefined {
  return TOPICS.find((t) => t.sections.some((s) => s.ids.includes(id)));
}

/**
 * Prev/next cycles within the term's own category section (matches the
 * source site: e.g. 按钮 <-> 链接 within the 2-item 按钮与链接 category),
 * not across the whole topic tab.
 */
export function getAdjacentTerms(id: string): { prev: Term | null; next: Term | null } {
  const topic = getTopicForTerm(id);
  if (!topic) return { prev: null, next: null };
  const section = topic.sections.find((s) => s.ids.includes(id));
  if (!section) return { prev: null, next: null };
  const ids = section.ids;
  const i = ids.indexOf(id);
  if (i === -1) return { prev: null, next: null };
  const prevId = i > 0 ? ids[i - 1] : ids[ids.length - 1];
  const nextId = i < ids.length - 1 ? ids[i + 1] : ids[0];
  return { prev: termById.get(prevId) ?? null, next: termById.get(nextId) ?? null };
}

export function searchTerms(query: string): Term[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_TERMS.filter((t) => {
    if (t.name.toLowerCase().includes(q)) return true;
    if (t.cn.includes(q)) return true;
    if (t.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
    if (t.tagline?.toLowerCase().includes(q)) return true;
    return false;
  });
}
