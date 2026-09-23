import Link from 'next/link';
import { notFound } from 'next/navigation';
import { practiceCases, getPracticeCase, practiceCaseAliases } from '@/lib/ai-learning/practice-cases';
import { curriculumLessonHref, learningUnit } from '@/lib/ai-learning/practice-curriculum';
import '../../../learning-paths.css';
import '../../practice-cases.css';
export function generateStaticParams() { return [...practiceCases.map(c=>({caseId:c.id})), ...Object.keys(practiceCaseAliases).map(caseId=>({caseId}))]; }
export async function generateMetadata({params}:{params:Promise<{caseId:string}>}) { const c=getPracticeCase((await params).caseId); return {title:`${c?.title ?? '案例'}｜AI 学习站`}; }
export default async function PracticeCasePage({params}:{params:Promise<{caseId:string}>}) {
 const c=getPracticeCase((await params).caseId); if(!c) notFound();
 return <article className="learning-hub practice-task"><nav className="learning-breadcrumb" aria-label="位置"><Link href="/practice">实践</Link><span>/</span><span>{c.level}</span></nav>
 <header className="learning-hero"><p className="learning-eyebrow">{c.status==='pilot'?'第一实践 · 方案预览，待实跑':'可选案例规划 · 材料待完善'}</p><h1>{c.title}</h1><p>{c.brief ?? c.scene}</p></header>
 <div className="task-deliverable"><strong>{c.status === 'pilot' && c.materials ? '这一轮只围绕一份成果' : '规划中的成果形式（尚未开放）'}</strong><p>{c.outcome}</p></div>

 {c.materials ? <>
 <section className="task-section"><h2>01 · 准备买家线索和我方资料</h2><p>先选择一个公开资料足够的潜在买家。固定示范对象与实跑记录待补齐；本站只提供流程和模板。</p><p><a href="https://agenthub.accio-ai.com/space/global/客户背调" target="_blank" rel="noreferrer">查看参考 Agent：吕洪伟「客户背调」 ↗</a></p><pre className="task-material">{c.materials}</pre><a href={`/practice-materials/${c.id}.txt`} download>下载准备清单与起步指令（TXT） ↓</a></section>
 <section className="task-section"><h2>02 · 从了解客户到准备开发</h2>{c.starterPrompt && <details><summary>展开起步指令，填写你的买家线索</summary><pre className="task-material">{c.starterPrompt}</pre></details>}<ol className="case-workflow">{c.steps?.map(s=><li key={s.title}><h3>{s.title}</h3><p>{s.action}</p><p className="learning-muted">这一步留下：{s.evidence}</p>{s.concept && <details><summary>这一步用到了什么知识？</summary><p>{s.concept}</p><Link href={curriculumLessonHref(s.lesson)}>遇到卡点，回课程补这一点 →</Link></details>}</li>)}</ol></section>
 <section className="task-section"><h2>03 · 检查简报是否能支持下一步</h2><ul>{c.checks?.map(x=><li key={x}>{x}</li>)}</ul><p>有依据地判断“不适合继续开发”同样合格。核验是为了做出更好的业务决定，不需要刻意找出一个错误。</p></section>
 <section className="task-section"><h2>04 · 整理成一份客户开发简报</h2><details className="task-reference"><summary>展开成果结构参考</summary><p>以下是成果结构，尚不是实际买家的示范答案。完成样板试跑后，再补充输入、输出和人工修订过程。</p><pre className="task-material">{c.reference}</pre></details></section>
 </> : <section className="task-section"><h2>案例准备方向</h2><p>{c.scene}</p><p><strong>预计成果形式：</strong>{c.outcome}</p><p>完整委托、模拟材料、步骤和测试参照尚未准备好，当前不作为可完成任务。相关课程按需学习，不必一次完成所有进阶分支。</p></section>}
 <section className="task-section"><h2>一个案例，串起四个知识点</h2><ul className="case-points">{c.points.map(p=><li key={p}>{p}</li>)}</ul><details><summary>卡住时，回到相关课程补知识</summary><ul>{c.lessons.map(id=><li key={id}><Link href={curriculumLessonHref(id)}>{id.toUpperCase()} · {learningUnit(id)?.title}</Link></li>)}</ul><p>按遇到的问题补课，不要求为每课另做一次实践。</p></details></section>
 {c.extensions && <section className="task-section"><h2>第一课做到哪里，后面怎样继续</h2><ul>{c.extensions.map(item=><li key={item}>{item}</li>)}</ul></section>}
 {c.sources && <details className="task-section"><summary>场景来源与使用边界</summary><p>参考 Agent 的公开说明用于设计业务流程，尚未安装或实跑；不把作者的能力描述当作已验证结果。来源核对日期：2026-09-20；不以平台推荐或下载量证明实际效果。</p><ul>{c.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></details>}
 <footer className="learning-actions"><Link href="/practice">← 返回业务案例</Link><Link href="/courses">按需补课 →</Link></footer></article>;
}
