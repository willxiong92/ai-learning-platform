import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COURSES, getCourse, getCourseLesson } from "@/lib/vibehub/data";
import { getModules } from "@/lib/ai-learning/catalog";
import { aiCourseSlug, getAiCourseBySlug } from "@/lib/ai-learning/course-routes";
import { AiCourseLesson } from "@/components/ai-learning/ai-course-lesson";
import "../../ai-courses.css";
import "../../../learning/learning.css";
import { CourseLessonView } from "@/components/sites/vibe-hub-org-e37cedf6/courses/course-lesson-view";

export function generateStaticParams() {
  return [
    ...getModules().flatMap((m) => m.lessons.map((l) => ({ course: aiCourseSlug(m.id), lesson: l.id }))),
    ...COURSES.flatMap((c) => c.chapters.map((ch) => ({ course: c.slug, lesson: ch.slug }))),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const aiCourse = getAiCourseBySlug(courseSlug);
  if (aiCourse) {
    const aiLesson = aiCourse.lessons.find((l) => l.id === lessonSlug);
    if (!aiLesson) return {};
    return { title: `${aiLesson.title}｜${aiCourse.title} · AI 应用课程`, description: aiLesson.outcome };
  }
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.slug === lessonSlug);
  if (!course || !chapter) return {};
  return {
    title: `${chapter.title}｜${course.title} · AI 学习站`,
    description: chapter.summary,
  };
}

export default async function CourseLessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const aiCourse = getAiCourseBySlug(courseSlug);
  if (aiCourse) {
    // A lesson only exists under the course (module) it belongs to; anything else is a 404.
    const aiLesson = aiCourse.lessons.find((l) => l.id === lessonSlug);
    if (!aiLesson) notFound();
    return <AiCourseLesson courseModule={aiCourse} lesson={aiLesson} />;
  }
  const course = getCourse(courseSlug);
  const chapter = course?.chapters.find((c) => c.slug === lessonSlug);
  const lesson = getCourseLesson(courseSlug, lessonSlug);
  if (!course || !chapter || !lesson) notFound();

  return <CourseLessonView course={course} chapter={chapter} lesson={lesson} />;
}
