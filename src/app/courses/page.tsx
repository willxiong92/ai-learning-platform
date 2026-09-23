import Link from 'next/link';
import type { Metadata } from 'next';
import { COURSES } from '@/lib/vibehub/data';
import { LearningRoutes } from '@/components/ai-learning/curriculum-view';
import '../learning-paths.css';
import '@/app/courses/ai-courses.css';
export const metadata: Metadata = { title: '课程｜AI 学习站', description: '从零学习AI，基于Accio Work完成外贸对客实践，按需进阶知识问答、Skill、Agent与Web Coding。' };
export default function CoursesIndexPage() {
  return <div className="course-app course-index-app"><div className="course-index-main learning-index">
    <header className="course-index-heading learning-index-heading"><h1>课程</h1><p>先学基础，用综合业务案例检验关键能力，再按客户需要选择知识问答、Skill、Agent 或 Web Coding。Accio Work 是业务实践载体。</p><div className="learning-actions"><Link className="learning-entry" href="/courses/ai-m1/l01">从第一课开始 →</Link><Link href="/practice">看实践任务</Link><Link href="/">遇到卡点？查术语</Link></div></header>
    <aside className="learning-note">目前前四课有基础教材，并整合为一个模拟业务案例。后续单元展示教学和任务框架，完整教材仍待编写；页面不接入客户系统。</aside>

    <LearningRoutes />
    <section id="web-resources" className="course-reference-group"><h2>Web Coding 参考课程</h2><p>已有网页与 Git 内容可按需补课；上方 W01–W03 是新的外贸交付实践规划，尚未编成完整课程。</p>          <ul className="course-route-list">
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
          </ul></section>
  </div></div>;
}
