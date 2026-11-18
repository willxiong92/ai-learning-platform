import type { Metadata } from "next";
import Link from "next/link";
import { PRACTICE_STEPS, practiceLessonHref, type PracticeStep } from "@/lib/practice-path";
import { PRACTICE_CONTENT } from "@/lib/practice-path/content";
import "../ai-collab/ai-collab.css";
import "./practice-path.css";
import "../ai-guide/guide.css";
import "./practice-merged.css";
import { ModelDesk } from "@/components/ai-guide/model-desk";
import { getGuide } from "@/lib/ai-guide";
import { getPublishedCollabTopics } from "@/lib/collab-handbook";
import { CollabTopicCard } from "@/components/ai-learning/collab-topic-card";
import { PracticeOutline } from "@/components/ai-learning/practice-outline";

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
          <Link href="/ai-guide/">浏览课程</Link>
          {step.refs.includes("/ai-collab") && <a href="#collaboration">协作案例</a>}
        </p>
        {step.absorb.length > 0 && (
          <p>
            <b>相关练习</b>
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
      <section className="collab-section" id="models" aria-labelledby="models-title">
        <h2 className="cat-title" id="models-title">模型参考</h2>
        <p className="collab-trial-note practice-case-note">Will 使用的个人 Agent，以及 Oil Book 作者的模型使用体验。</p>
        <ModelDesk models={getGuide().models} />
      </section>
      <header className="collab-hero">
        <p className="collab-kicker">实践 · 动手练习与协作案例</p>
        <h1>一封询盘，走完四步</h1>
        <p className="collab-lead">
          从读懂、回复一封询盘开始，逐步把方法固化成 Skill、Agent 和网页。遇到协作问题时，参考下方案例。
        </p>
        <p className="collab-trial-note">
          <span className="collab-badge">试学版</span>
          第 1 步四课可试学；第 2–4 步仅大纲。
        </p>
      </header>

      <nav className="practice-shortcuts" aria-label="页内导航">
        <a href="#step-1">动手练习 ↓</a><a href="#collaboration">协作案例 ↓</a><span />
        <Link href="/practice/questions/l01">基础课题库 →</Link>
        <Link href="/practice/crm-ai">CRM 客户成功实践 →</Link>
      </nav>

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

      <StepSection step={PRACTICE_STEPS[0]} />
      <section className="collab-section" id="collaboration" aria-labelledby="collaboration-title">
        <h2 className="cat-title" id="collaboration-title">协作案例<span>{getPublishedCollabTopics().length} 个已开放</span></h2>
        <p className="collab-trial-note practice-case-note">从真实协作经历中，看看哪里容易出问题、下次怎样跟 AI 说。</p>
        <div className="grid">{getPublishedCollabTopics().map(topic => <CollabTopicCard key={topic.slug} topic={topic} />)}</div>
      </section>
      <PracticeOutline>
        {PRACTICE_STEPS.slice(1).map(step => <StepSection step={step} key={step.n} />)}
      </PracticeOutline>
    </div>
  );
}
