import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COURSES, getCourse, getCourseLesson } from "@/lib/vibehub/data";
import { CourseLessonView } from "@/components/sites/vibe-hub-org-e37cedf6/courses/course-lesson-view";

export function generateStaticParams() {
  return COURSES.flatMap((c) => c.chapters.map((ch) => ({ course: c.slug, lesson: ch.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.slug === lessonSlug);
  if (!course || !chapter) return {};
  return {
    title: `${chapter.title}｜${course.title} · VibeHub 课程`,
    description: chapter.summary,
  };
}

export default async function CourseLessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.slug === lessonSlug);
  const lesson = getCourseLesson(courseSlug, lessonSlug);
  if (!course || !chapter || !lesson) notFound();

  return <CourseLessonView course={course} chapter={chapter} lesson={lesson} />;
}
