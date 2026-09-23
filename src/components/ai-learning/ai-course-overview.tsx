import Link from 'next/link';
import { type CourseModule, isReadableStatus } from '@/lib/ai-learning/catalog';
import { aiLessonHref } from '@/lib/ai-learning/course-routes';
import { learningUnit } from '@/lib/ai-learning/practice-curriculum';
import '@/app/learning-paths.css';
export function AiCourseOverview({ courseModule }: { courseModule: CourseModule }) {
  return <div className="learning-hub"><header className="learning-hero"><Link href="/courses">← 基础与进阶学习路线</Link><h1>{courseModule.title}</h1><p>本页保留原章节分组，学习顺序与按需分支请以新版课程路线为准。每堂课都关联一项实践。</p></header><section className="learning-path"><ol>{courseModule.lessons.map(lesson => { const unit = learningUnit(lesson.id); return <li key={lesson.id}><Link href={aiLessonHref(lesson.id) ?? '/courses'}><span className="learning-id">{lesson.id.toUpperCase()}</span><span><strong>{unit?.title ?? lesson.title}</strong><small>{isReadableStatus(lesson.status) ? '基础教材可读' : '完整正文待编写'}</small></span></Link><p>{unit?.quality ?? lesson.outcome}</p><Link className="learning-sub-link" href={`/practice/${lesson.id}`}>{unit?.status === 'pilot' ? '做对应实践' : '看实践框架'} →</Link></li>; })}</ol></section></div>;
}
