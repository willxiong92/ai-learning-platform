import { practiceCaseHref } from '@/lib/ai-learning/practice-cases';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { curriculum, learningUnit, curriculumLessonHref } from '@/lib/ai-learning/practice-curriculum';
import '../../learning-paths.css';
export function generateStaticParams() { return curriculum.lessons.map(unit => ({ unit: unit.id })); }
export async function generateMetadata({ params }: { params: Promise<{ unit: string }> }): Promise<Metadata> { const unit = learningUnit((await params).unit); return { title: `${unit?.title ?? '实践'}｜AI 学习站` }; }
export default async function PracticeUnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const unit = learningUnit((await params).unit); if (!unit) notFound();
  const pilot = unit.pilot;
  return <article className="learning-hub practice-task">
    <nav className="learning-breadcrumb" aria-label="位置"><Link href="/practice">实践</Link><span aria-hidden="true">/</span><span>{unit.id.toUpperCase()}</span></nav>
    <aside className="learning-note">这是保留的单点补练，不是逐课必交任务。<Link href={practiceCaseHref(unit.id)}>优先进入综合业务案例 →</Link></aside><header className="learning-hero"><p className="learning-eyebrow">{pilot ? '可试做 · 全部材料为教学模拟' : '任务框架 · 完整内容待编写'}</p><h1>{unit.title}</h1><p>{pilot?.brief ?? unit.goal}</p></header>
    <section className="task-section"><h2>先理解，再动手</h2><ul>{unit.core.map(point => <li key={point}>{point}</li>)}</ul><Link href={curriculumLessonHref(unit.id)}>{unit.id.startsWith('W') ? '查看 Web 参考课程' : pilot ? '阅读对应基础教材' : '查看原课程计划'} →</Link><p className="learning-muted">先修：{unit.prerequisites}。卡住时可<Link href="/">检索相关术语</Link>。</p><details><summary>本课核心词与产品使用边界</summary><p>{unit.terms}</p><p>{unit.host}</p></details></section>
    {pilot ? <>
      <section className="task-section"><h2>01 · 起步材料</h2><p>复制下面的模拟材料到自己的工具。本页不上传文件、不调用模型，也不保存学习记录。</p><pre className="task-material">{pilot.input}</pre><a href={`/practice-materials/${unit.id}.txt`} download>下载任务材料（TXT） ↓</a></section>
      <section className="task-section"><h2>02 · 操作与交付</h2><ol className="task-steps">{pilot.steps.map(s => <li key={s}>{s}</li>)}</ol><div className="task-deliverable"><strong>留下什么</strong><p>{unit.deliverable}</p></div></section>
      <section className="task-section"><h2>03 · 怎样算做好</h2><p><strong>业务质量：</strong>{unit.quality}</p><ul>{pilot.checklist.map(c => <li key={c}>{c}</li>)}</ul><p className="learning-muted">检查结果需要你对照实际输出判断；未实跑与已运行分开记录，不设自动通过分数。</p></section>
      <section className="task-section"><h2>04 · 先做，再看参照</h2><details className="task-reference"><summary>展开一种合格表达与错误示范</summary><p>参照用于核对事实与思路，不要求逐字一致。先保存自己的结果。</p><pre className="task-material">{pilot.example}</pre><h3>错误示范</h3><p>{pilot.bad}</p></details><h3>换一个条件再试</h3><p>{pilot.variant}</p></section>
    </> : <section className="task-section"><h2>这项实践将怎样做</h2><dl className="task-definition"><dt>任务</dt><dd>{unit.goal}</dd><dt>所需材料（待准备）</dt><dd>{unit.materials}</dd><dt>应交成果</dt><dd>{unit.deliverable}</dd><dt>业务质量</dt><dd>{unit.quality}</dd><dt>准确性与边界</dt><dd>{unit.checks}</dd><dt>参照形式（待编写）</dt><dd>{unit.reference}</dd></dl><p className="learning-note">以上为教学框架，不是已完成的操作教程。完整材料、变式与产品验证准备好后再开放试做。</p></section>}
    <footer className="learning-actions"><Link href="/practice">← 返回实践路线</Link><Link href="/courses">课程与进阶方向 →</Link></footer>
  </article>;
}
