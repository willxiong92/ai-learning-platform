import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollabTopic, getPublishedCollabTopics } from "@/lib/collab-handbook";
import { CopyButton } from "../collab-copy";
import { Block, PrincipleCard } from "./blocks";
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
      {/* 标题区左右两栏：左边是这件事，右边是看完要带走的那句话 */}
      <header className="collab-hero collab-detail-hero">
        <div>
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
        </div>
        <aside className="collab-hero-say" aria-label="下次这样说">
          <p className="collab-say-label">下次这样说</p>
          <p className="collab-hero-say-text">{topic.sayShort}</p>
          <CopyButton text={topic.sayShort} label="复制这句" />
        </aside>
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
              <div className="cb-stack">
                {s.blocks.map((b, i) => (
                  <Block block={b} key={i} />
                ))}
                {s.id === "why" && related.map((p) => <PrincipleCard key={p.id} p={p} related />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
