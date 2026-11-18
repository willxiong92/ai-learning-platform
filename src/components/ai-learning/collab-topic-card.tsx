import Link from "next/link";
import { collabHref, type CollabTopic } from "@/lib/collab-handbook";

export function CollabTopicCard({ topic }: { topic: CollabTopic }) {
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

