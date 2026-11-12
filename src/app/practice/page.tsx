import type { Metadata } from "next";
import Link from "next/link";
import { PRACTICE_STEPS, practiceLessonHref, practiceRef, type PracticeStep } from "@/lib/practice-path";
import { PRACTICE_CONTENT } from "@/lib/practice-path/content";
import "../ai-collab/ai-collab.css";
import "./practice-path.css";

export const metadata: Metadata = {
  title: "实践｜AI 学习站",
  description: "跟着一封询盘走完四步：跟 AI 沟通、固化成 Skill、做 Agent、做成网页。",
};

// 实践入口（框架 v0 骨架）。版式沿用 AI 协作手册：标题区 + 术语卡式卡片，详情页同手册详情页。
// 现有实践内容按 §5.48 收编到各步，这里只标去向，原页面地址保留不动。

function StepSection({ step }: { step: PracticeStep }) {
  return (
    <section className="collab-section pp-step" id={`step-${step.n}`} aria-labelledby={`step-${step.n}-title`}>
      <h2 className="cat-title" id={`step-${step.n}-title`}>
        第 {step.n} 步 · {step.title}
        <span>{step.lessons.length} 课</span>
      </h2>
      <p className="pp-step-flow">
        <span>拿到</span>
        {step.input}
        <i aria-hidden="true">→</i>
        <span>留下</span>
        <b>{step.output}</b>
      </p>

      <div className="grid">
        {step.lessons.map((lesson) => (
          <article className="card collab-topic-card pp-lesson-card" key={lesson.id}>
            <div className="card-head">
              <Link className="card-title-group card-title-link collab-topic-link" href={practiceLessonHref(lesson.id)}>
                <h3>
                  {lesson.title}
                  <span>{lesson.no}</span>
                </h3>
              </Link>
            </div>
            <div className="card-tagline card-quote">
              {PRACTICE_CONTENT[lesson.id] ? (
                PRACTICE_CONTENT[lesson.id].oneLiner
              ) : (
                <>
                  <span className="pp-todo">待填充</span>这一课做成什么、为什么要做
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="pp-step-foot">
        <p>
          <b>回课程补课</b>
          {step.refs.map((ref) => {
            const r = practiceRef(ref);
            return (
              <Link key={ref} href={r.href}>
                {r.id} {r.title}
              </Link>
            );
          })}
        </p>
        {step.absorb.length > 0 && (
          <p>
            <b>收编到这一步</b>
            {step.absorb.map((a) => (
              <Link key={a.href} href={a.href}>
                {a.label}
              </Link>
            ))}
          </p>
        )}
      </div>
    </section>
  );
}

export default function PracticePage() {
  return (
    <div className="collab-page pp-page">
      <header className="collab-hero">
        <p className="collab-kicker">实践 · 四步主线</p>
        <h1>一封询盘，走完四步</h1>
        <p className="collab-lead">
          四步跟着同一封询盘走，上一步的成果是下一步的材料：先跟 AI 一起读懂并回复它，再把这套做法固化成 Skill，再让 Agent 去背调发询盘的买家，最后把这些结果汇到一个询盘跟进看板上。课程用来补知识，实践用来把事做成。
        </p>
        <p className="collab-trial-note">
          <span className="collab-badge">试学版</span>
          第 1 步四课已有正文和练习，可开始试学；第 2–4 步仍为待填充框架。练习按「材料 / 动手做 / 怎样算做好 / 做完再看参照」展开，整批内容仍待人工试学验收。
        </p>
      </header>

      <p className="collab-trial-note"><Link href="/practice/questions/l01">基础课题库 · L01–L04 共 24 道情境题及动手任务 →</Link></p>
      <p className="collab-trial-note"><Link href="/practice/crm-ai">CRM 客户成功六课实践 · 前 3 课试学，后 3 课大纲 →</Link></p>

      {/* 四步入口：横向步骤条，点一步跳到这一步的课卡 */}
      <nav className="pp-steps" aria-label="四步入口">
        <ol>
          {PRACTICE_STEPS.map((step) => (
            <li key={step.n}>
              <a href={`#step-${step.n}`}>
                <p className="pp-steps-name">
                  <i>{step.n}</i>
                  {step.title}
                </p>
                <p className="pp-steps-plain">{step.plain}</p>
                <p className="pp-steps-out">
                  <small>留下</small>
                  {step.output}
                </p>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {PRACTICE_STEPS.map((step) => (
        <StepSection step={step} key={step.n} />
      ))}
    </div>
  );
}
