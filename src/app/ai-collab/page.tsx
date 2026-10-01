import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { COLLAB_CASES, COLLAB_PRINCIPLES, collabHref, getCollabById, type CollabEntry } from "@/lib/collab-handbook";
import "./ai-collab.css";

export const metadata: Metadata = {
  title: "AI 协作手册｜AI 学习站",
  description: "人和 AI 怎么配合：AI 为什么会错、该怎么跟它说、真实发生过的案例。",
};

const LAYERS = [
  { label: "原理", text: "为什么会这样。一条原理解释一类反复出现的错。" },
  { label: "范式", text: "下次怎么说。可以直接复制的说法，分一句话的简版和填空的完整版。" },
  { label: "案例", text: "真实发生过的事。先讲经过，再对照原理，最后给范式。" },
];

function principleLabel(id: string) {
  const p = getCollabById(id);
  return p ? `${p.id} ${p.name}` : id;
}

function EntryCard({ entry, meta, children }: { entry: CollabEntry; meta: string; children?: ReactNode }) {
  const href = collabHref(entry);
  const inner = (
    <>
      <p className="collab-card-meta">
        <span>{entry.id}</span>
        {meta}
      </p>
      <h3>{entry.headline}</h3>
      <p className="collab-card-summary">{entry.summary}</p>
      {children}
      {href ? (
        <span className="collab-card-cta">
          读这{entry.kind === "principle" ? "条原理" : "个案例"} <span aria-hidden="true">→</span>
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

export default function AiCollabPage() {
  return (
    <div className="collab-page">
      <header className="collab-hero">
        <p className="collab-kicker">AI 协作手册 · 试行</p>
        <h1>AI 协作手册</h1>
        <p className="collab-lead">
          和 AI 一起干活，出问题往往不是它不够聪明，而是它只能照你给的东西做。这里收的都是真实踩过的坑：AI 为什么会错、该怎么跟它说。
        </p>
        <ol className="collab-layers" aria-label="手册怎么读">
          {LAYERS.map((layer) => (
            <li key={layer.label}>
              <strong>{layer.label}</strong>
              <span>{layer.text}</span>
            </li>
          ))}
        </ol>
        <p className="collab-trial-note">
          <span className="collab-badge">试行</span>
          下面的原理都还是假设：每条后面写着有几条真实案例支撑。案例攒够了、经得起反例，才改成定论。
        </p>
      </header>

      <section className="collab-section" aria-labelledby="collab-principles">
        <h2 className="collab-section-title" id="collab-principles">原理</h2>
        <div className="collab-grid">
          {COLLAB_PRINCIPLES.map((p) => (
            <EntryCard key={p.id} entry={p} meta={` · ${p.name}`}>
              <p className="collab-card-foot">
                <span className="collab-badge">{p.status}</span>
                {p.caseIds.length} 条案例支撑
              </p>
            </EntryCard>
          ))}
        </div>
      </section>

      <section className="collab-section" aria-labelledby="collab-cases">
        <h2 className="collab-section-title" id="collab-cases">案例</h2>
        <div className="collab-grid">
          {COLLAB_CASES.map((c) => (
            <EntryCard key={c.id} entry={c} meta={` · ${c.name}`}>
              <dl className="collab-card-facts">
                <div>
                  <dt>范式</dt>
                  <dd>{c.paradigm}</dd>
                </div>
                <div>
                  <dt>对应原理</dt>
                  <dd>{c.principleIds.map(principleLabel).join("、")}</dd>
                </div>
              </dl>
            </EntryCard>
          ))}
        </div>
      </section>
    </div>
  );
}
