import { RetiredCourse } from "@/components/ai-learning/retired-course";
import { COURSES } from "@/lib/vibehub/data";
import { getModules } from "@/lib/ai-learning/catalog";
import { aiCourseSlug } from "@/lib/ai-learning/course-routes";

export function generateStaticParams() {
  return [
    ...getModules().flatMap((m) => m.lessons.map((l) => ({ course: aiCourseSlug(m.id), lesson: l.id }))),
    ...COURSES.flatMap((c) => c.chapters.map((ch) => ({ course: c.slug, lesson: ch.slug }))),
  ];
}

export default function RetiredCoursePage() {
  return <RetiredCourse />;
}
