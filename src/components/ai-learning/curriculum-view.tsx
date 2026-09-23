import { practiceCaseHref, practiceCaseForLesson } from '@/lib/ai-learning/practice-cases';
import Link from 'next/link';
import { curriculum, curriculumLessonHref, learningUnit } from '@/lib/ai-learning/practice-curriculum';

// Keep the original course-card visual language; expand only the selected route.
export function LearningRoutes({ practice = false }: { practice?: boolean }) {
  const visuals = ['m1', 'm3', 'm4', 'm5', 'm6', 'm2'];
  return <ul className="course-route-list curriculum-route-list">{curriculum.groups.map((group, index) => {
    const ready = group.ids.filter(id => learningUnit(id)?.status === 'pilot').length;
    return <li key={group.id} id={group.id}>
      <details className="curriculum-route">
        <summary className="course-route-card has-route-visual">
          <div className="course-route-summary">
            <span className="curriculum-level">{index === 0 ? '全员基础' : index === 5 ? '综合交付' : '按需进阶'}</span>
            <h2>{group.title}</h2><p>{group.intro}</p>
            <div className="course-route-meta"><span>{group.ids.length} {practice ? '项实践' : '课'}</span><span className={ready ? 'is-available' : ''}>{ready ? `${ready} 课可读` : '完整内容待编写'}</span><span className="curriculum-expand">展开目录 ⌄</span></div>
          </div>
          <span className="course-route-list-visual"><svg width={640} height={640} viewBox="0 0 640 640" aria-hidden="true" focusable="false"><use href={`/assets/curriculum-route-blueprints.svg#ai-course-${visuals[index]}-route-v1`} /></svg></span>
        </summary>
        <ol className="curriculum-units">{group.ids.map(id => { const unit = learningUnit(id)!; return <li key={id}>
          <Link href={practice ? practiceCaseHref(id) : curriculumLessonHref(id)}><span className="learning-id">{id.toUpperCase()}</span><span><strong>{unit.title}</strong><small>{unit.status === 'pilot' ? '基础教材可读 · 关联综合案例' : '课程与实践计划 · 完整内容待编写'}</small></span><span aria-hidden="true">→</span></Link>
          <p>{unit.quality}</p>{!practice && <Link className="learning-sub-link" href={practiceCaseHref(id)}>{practiceCaseHref(id) === '/practice' ? '浏览业务案例' : unit.status === 'pilot' ? `共用案例：${practiceCaseForLesson(id)?.title}` : '查看案例方向'} →</Link>}
        </li>; })}</ol>
      </details>
    </li>;
  })}</ul>;
}

export function LessonGuide({ id }: { id: string }) {
  const unit = learningUnit(id);
  if (!unit) return null;
  return <section className="lesson-guide" aria-labelledby="lesson-guide-title">
    <p className="learning-eyebrow">{unit.group === 'foundation' ? '基础学习' : '技术进阶'} · 外贸对客应用</p>
    <h2 id="lesson-guide-title">这堂课，学会什么、做出什么</h2>
    <ul>{unit.core.map(point => <li key={point}>{point}</li>)}</ul>
    <p><strong>实践目标：</strong>{unit.goal}。</p><p><strong>做好标准：</strong>{unit.quality}</p>
    <details><summary>先修与产品使用说明</summary><p>先修：{unit.prerequisites}。</p><p>{unit.host}</p></details>
    <Link className="learning-action" href={practiceCaseHref(id)}>{practiceCaseHref(id) === '/practice' ? '浏览业务案例' : unit.status === 'pilot' ? `共用案例：${practiceCaseForLesson(id)?.title}` : '查看案例方向'} →</Link>
    <p className="learning-muted">本页下方保留基础教材；旧单点练习作为补充材料保留，不逐课必交。新版掌握检查在综合案例中完成；同一案例可覆盖多课，不要求逐课交作业。</p>
  </section>;
}
