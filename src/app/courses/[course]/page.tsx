import { RetiredCourse } from "@/components/ai-learning/retired-course";
import { COURSES } from "@/lib/vibehub/data";
import { getModules } from "@/lib/ai-learning/catalog";
import { aiCourseSlug } from "@/lib/ai-learning/course-routes";

export function generateStaticParams() {
  return [
    ...getModules().map((m) => ({ course: aiCourseSlug(m.id) })),
    ...COURSES.map((c) => ({ course: c.slug })),
  ];
}

export default function RetiredCoursePage() {
  return <RetiredCourse />;
}
