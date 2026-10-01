import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollabTopic, getPublishedCollabTopics, type CollabPrinciple } from "@/lib/collab-handbook";
import { CollabArticle } from "../collab-copy";
import "../ai-collab.css";

// 只生成已开放的卡片；其余编号直接 404，正文也不在副本里
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedCollabTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = getCollabTopic(slug);
  if (!topic) return {};
  return {
    title: `${topic.title} · AI 协作手册｜AI 学习站`,
    description: topic.summary,
  };
}

function trialText(p: CollabPrinciple) {
  return `${p.status} · ${p.caseCount} 条案例支撑`;
}

// 这件事还碰到、但没有自己主案例的原理：在「为什么会这样」后面简短提一句
function RelatedPrinciple({ principle }: { principle: CollabPrinciple }) {
  return (
    <aside className="collab-related-principle" aria-label={`相关原理 ${principle.id} ${principle.name}`}>
      <p className="collab-related-label">
        这件事还碰到了另一条原理：{principle.id} {principle.name}
        <span className="collab-badge">{trialText(principle)}</span>
      </p>
      <p className="collab-related-headline">{principle.headline}</p>
      <p>{principle.summary}</p>
    </aside>
  );
}

export default async function CollabTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getCollabTopic(slug);
  if (!topic || !topic.published || !topic.sections?.length) notFound();
  const { principle, related, sections } = topic;

  return (
    <article className="collab-page collab-detail">
      <Link className="collab-back" href="/ai-collab">
        ← 返回 AI 协作手册
      </Link>
      <header className="collab-hero">
        <p className="collab-kicker">
          协作手册 · {topic.title} · {topic.caseId}
        </p>
        <h1>{topic.headline}</h1>
        <p className="collab-lead">
          <span className="collab-lead-label">一句话</span>
          {topic.summary}
        </p>
        <p className="collab-trial-note">
          <span className="collab-badge">{principle.status}</span>
          背后的原理「{principle.id} {principle.name}」目前是假设，有 {principle.caseCount} 条真实案例支撑。案例多了、经得起反例，再改成定论。
        </p>
      </header>

      <div className="collab-layout">
        <nav className="collab-index" aria-label="本页目录">
          <p>本页目录</p>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="collab-article-wrap">
          {sections.map((s) => (
            <section className="collab-block" id={s.id} key={s.id} aria-labelledby={`${s.id}-title`}>
              <h2 className="collab-block-title" id={`${s.id}-title`}>
                {s.title}
              </h2>
              <CollabArticle html={s.html} />
              {s.id === "why" && related.map((p) => <RelatedPrinciple key={p.id} principle={p} />)}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
