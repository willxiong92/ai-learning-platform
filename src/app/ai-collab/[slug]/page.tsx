import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  collabHref,
  getCollabById,
  getCollabEntry,
  getPublishedCollabEntries,
  type CollabEntry,
} from "@/lib/collab-handbook";
import { CollabArticle } from "../collab-copy";
import "../ai-collab.css";

// 只生成已开放的条目；其余编号直接 404，正文也不在副本里
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedCollabEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCollabEntry(slug);
  if (!entry) return {};
  const kind = entry.kind === "principle" ? "原理" : "案例";
  return {
    title: `${kind} ${entry.id}｜${entry.name} · AI 协作手册｜AI 学习站`,
    description: entry.summary,
  };
}

function RelatedCard({ entry }: { entry: CollabEntry }) {
  const href = collabHref(entry);
  const kind = entry.kind === "principle" ? "原理" : "案例";
  const inner = (
    <>
      <p className="collab-card-meta">
        <span>{entry.id}</span> · {kind} · {entry.name}
      </p>
      <h3>{entry.headline}</h3>
      {href ? (
        <span className="collab-card-cta">
          去看看 <span aria-hidden="true">→</span>
        </span>
      ) : (
        <span className="collab-card-pending">小样阶段暂未开放</span>
      )}
    </>
  );
  return href ? (
    <Link className="collab-card" href={href}>
      {inner}
    </Link>
  ) : (
    <div className="collab-card is-pending">{inner}</div>
  );
}

export default async function CollabEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getCollabEntry(slug);
  if (!entry || !entry.published || !entry.html) notFound();

  const isPrinciple = entry.kind === "principle";
  const relatedIds = isPrinciple ? entry.caseIds : entry.principleIds;
  const related = relatedIds.map(getCollabById).filter((e): e is CollabEntry => Boolean(e));
  const toc = entry.toc ?? [];

  return (
    <article className="collab-page collab-detail">
      <Link className="collab-back" href="/ai-collab">
        ← 返回 AI 协作手册
      </Link>
      <header className="collab-hero">
        <p className="collab-kicker">
          {isPrinciple ? "原理" : "案例"} {entry.id} · {entry.name}
        </p>
        <h1>{entry.headline}</h1>
        <p className="collab-lead">
          <span className="collab-lead-label">一句话</span>
          {entry.summary}
        </p>
        {isPrinciple ? (
          <p className="collab-trial-note">
            <span className="collab-badge">{entry.status}</span>
            这条原理目前是假设，有 {entry.caseIds.length} 条真实案例支撑。案例多了、经得起反例，再改成定论。
          </p>
        ) : (
          entry.principleNoteHtml && (
            <div className="collab-principle-note">
              <p className="collab-principle-note-label">这是哪条原理的实例</p>
              <p dangerouslySetInnerHTML={{ __html: entry.principleNoteHtml }} />
            </div>
          )
        )}
      </header>

      <div className="collab-layout">
        <nav className="collab-index" aria-label="本页目录">
          <p>本页目录</p>
          <ol>
            {toc.map((item, i) => (
              <li key={item.id}>
                <a href={`#${encodeURIComponent(item.id)}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
          {related.length > 0 && <a href="#collab-related">{isPrinciple ? "支撑这条原理的案例" : "这个案例对应的原理"}</a>}
        </nav>

        <CollabArticle html={entry.html}>
          {related.length > 0 && (
            <section className="collab-related" id="collab-related" aria-labelledby="collab-related-title">
              <h2 className="collab-section-title" id="collab-related-title">
                {isPrinciple ? "支撑这条原理的案例" : "这个案例对应的原理"}
              </h2>
              <div className="collab-grid is-compact">
                {related.map((r) => (
                  <RelatedCard key={r.id} entry={r} />
                ))}
              </div>
            </section>
          )}
        </CollabArticle>
      </div>
    </article>
  );
}
