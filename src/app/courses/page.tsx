import Link from "next/link";
import type { Metadata } from "next";
import { COURSES } from "@/lib/vibehub/data";

export const metadata: Metadata = {
  title: "课程｜VibeHub",
  description: "按照真实项目学习 Vibe Coding 术语。",
};

export default function CoursesIndexPage() {
  return (
    <div className="course-app course-index-app">
      <div className="course-index-main">
        <header className="course-index-heading">
          <h1>课程</h1>
        </header>
        <ul className="course-route-list">
          {COURSES.map((course) => (
            <li key={course.slug}>
              <Link className="course-route-card has-route-visual" href={`/courses/${course.slug}`}>
                <div className="course-route-summary">
                  <h2>{course.title}</h2>
                  <p>{course.lead}</p>
                  <div className="course-route-meta">
                    <span>{course.chapters.length} 章</span>
                  </div>
                </div>
                <span className="course-route-list-visual">
                  <svg width={640} height={640} viewBox="0 0 640 640" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
                    <use href={`/assets/course-blueprints.svg#${course.routeBlueprintId}`} />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
