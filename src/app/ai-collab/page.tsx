import type { Metadata } from "next";
import Link from "next/link";
import { COLLAB_TOPICS, collabHref, type CollabTopic } from "@/lib/collab-handbook";
import "./ai-collab.css";

export const metadata: Metadata = {
  title: "AI 协作手册｜AI 学习站",
  description: "人和 AI 怎么配合：真实踩过的坑、为什么会这样、下次该怎么跟它说。",
};

// 卡片外形沿用术语卡（.card / .card-head / .card-quote），顶边书签条和滚动浮现由 handbook-motion.css 统一提供。
// 一张卡 = 一个坑的一整套：标题是沟通范式，引言是一句话，灰框里是可以直接发给 AI 的那句话。
function TopicCard({ topic }: { topic: CollabTopic }) {
  const href = collabHref(topic);
  const title = (
    <h3>
      {topic.title}
      <span>{topic.caseId}</span>
    </h3>
  );
  return (
    <article className={`card collab-topic-card${href ? "" : " is-pending"}`}>
      <div className="card-head">
        {href ? (
          <Link className="card-title-group card-title-link collab-topic-link" href={href}>
            {title}
          </Link>
        ) : (
          <div className="card-title-group">{title}</div>
        )}
      </div>
      <div className="card-tagline card-quote">{topic.summary}</div>
      <div className="collab-say">
        <p className="collab-say-label">下次这样说</p>
        <p>{topic.sayShort}</p>
      </div>
      <p className="collab-topic-meta">
        <span className="collab-badge">{topic.principle.status}</span>
        原理 {topic.principle.id} {topic.principle.name}
        {topic.related.length > 0 && <> · 也涉及 {topic.related.map((p) => `${p.id} ${p.name}`).join("、")}</>}
      </p>
      {!href && <p className="collab-card-pending">小样阶段暂未开放</p>}
    </article>
  );
}

export default function AiCollabPage() {
  return (
    <div className="collab-page">
      <header className="collab-hero">
        <p className="collab-kicker">AI 协作手册 · 试行</p>
        <h1>AI 协作手册</h1>
        <p className="collab-lead">
          和 AI 一起干活，出问题往往不是它不够聪明，而是它只能照你给的东西做。这里每一张卡是一个真实踩过的坑：事情经过、为什么会这样、下次怎么说，一张卡讲完。
        </p>
        <p className="collab-trial-note">
          <span className="collab-badge">试行</span>
          卡片背后的原理都还是假设，每张卡里写着有几条真实案例支撑。案例攒够了、经得起反例，才改成定论。
        </p>
      </header>

      <section className="collab-section" aria-labelledby="collab-topics">
        <h2 className="cat-title" id="collab-topics">
          踩过的坑
          <span>{COLLAB_TOPICS.length} 张卡</span>
        </h2>
        <div className="grid">
          {COLLAB_TOPICS.map((t) => (
            <TopicCard key={t.slug} topic={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
