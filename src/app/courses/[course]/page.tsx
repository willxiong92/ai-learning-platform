import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COURSES, getCourse } from "@/lib/vibehub/data";
import { getModules } from "@/lib/ai-learning/catalog";
import { aiCourseSlug, getAiCourseBySlug } from "@/lib/ai-learning/course-routes";
import { AiCourseOverview } from "@/components/ai-learning/ai-course-overview";
import "../ai-courses.css";

export function generateStaticParams() {
  return [
    ...getModules().map((m) => ({ course: aiCourseSlug(m.id) })),
    ...COURSES.map((c) => ({ course: c.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}): Promise<Metadata> {
  const { course: slug } = await params;
  const aiCourse = getAiCourseBySlug(slug);
  if (aiCourse) {
    return { title: `${aiCourse.title}｜AI 应用课程`, description: aiCourse.purpose ?? undefined };
  }
  const course = getCourse(slug);
  if (!course) return {};
  return { title: `${course.title}｜AI 学习站`, description: course.lead };
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;
  const aiCourse = getAiCourseBySlug(slug);
  if (aiCourse) return <AiCourseOverview courseModule={aiCourse} />;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <div className="course-app course-home-app">
      <div className="course-home-main">
        <header className="course-home-intro">
          <Link className="course-home-back" href="/courses">
            全部课程
          </Link>
          <h1>{course.title}</h1>
          <p className="course-home-lead">{course.lead}</p>
          <div className="course-home-actions">
            <Link className="course-primary-link" href={`/courses/${course.slug}/${course.chapters[0].slug}`}>
              从第一章开始<span aria-hidden="true">→</span>
            </Link>
            <span className="course-progress-copy" aria-live="polite">
              已读完 0 / {course.chapters.length} 章
            </span>
          </div>
        </header>
        <nav className="course-chapter-list" aria-label="章节目录">
          <ol>
            {course.chapters.map((chapter) => (
              <li key={chapter.slug}>
                <Link className="course-chapter-card has-list-visual is-not-started" href={`/courses/${course.slug}/${chapter.slug}`}>
                  <div className="course-chapter-summary">
                    <span className="course-chapter-number">{chapter.number}</span>
                    <div className="course-chapter-title-row">
                      <h3>{chapter.title}</h3>
                      <span className="course-status is-not-started">未开始</span>
                    </div>
                    <p>{chapter.summary}</p>
                  </div>
                  <span className="course-chapter-card-highlight" aria-hidden="true" />
                  <span className="course-chapter-list-visual">
                    <svg width={640} height={640} viewBox="0 0 640 640" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
                      <use href={`/assets/course-blueprints.svg#${chapter.blueprintId}`} />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
