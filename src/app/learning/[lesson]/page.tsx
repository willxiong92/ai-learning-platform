import { notFound, redirect } from "next/navigation";
import { getLessonSummaries } from "@/lib/ai-learning/catalog";
import { aiLessonHref } from "@/lib/ai-learning/course-routes";

// Old lesson links (/learning/l01) now point at the lesson inside its course
// (/courses/ai-m1/l01). Lesson IDs and the browser storage key are unchanged,
// so progress saved on the old pages still shows up there.
export const dynamicParams = false;

export function generateStaticParams() {
  return getLessonSummaries().map((lesson) => ({ lesson: lesson.id }));
}

type LessonRedirectProps = { params: Promise<{ lesson: string }> };

export default async function LearningLessonRedirect({ params }: LessonRedirectProps) {
  const { lesson } = await params;
  const href = aiLessonHref(lesson);
  if (!href) notFound();
  redirect(href);
}
