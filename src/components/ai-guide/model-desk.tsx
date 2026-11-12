"use client";
import { useState } from "react";
import type { GuideModel } from "@/lib/ai-guide";
const text = (value: string | string[]) => Array.isArray(value) ? value.join("；") : value;
export function ModelDesk({ models }: { models: GuideModel[] }) {
  const [selected, setSelected] = useState(models[0]?.id);
  const current = models.find(m => m.id === selected) ?? models[0];
  const categories = [...new Set(models.map(m => m.category))];
  if (!current) return null;
  return <div className="guide-model-desk">
    <div className="guide-model-options">{categories.map((c, i) => <section key={c}>
      <h3>
        <span>{String(i + 1).padStart(2, "0")}</span>{c}</h3>
      <div className="guide-model-grid">{models.filter(m => m.category === c).map(m => <button key={m.id} className={m.id === current.id ? "is-selected" : ""} aria-pressed={m.id === current.id} onClick={() => setSelected(m.id)} aria-controls="guide-model-detail">
        <strong>{m.name}</strong>
        <span>{m.tagline}</span>
        <span className="guide-model-arrow" aria-hidden="true">↗</span>
      </button>)}</div>
    </section>)}</div>
    <section className="guide-model-detail" id="guide-model-detail" aria-label="作者实测记录" aria-live="polite">
      <p className="guide-eyebrow">作者实测记录</p>
      <h3>{current.name}</h3>
      <p className="guide-model-tagline">{current.tagline}</p>
      <p className="guide-model-description">{current.description}</p>{(text(current.strengths) || text(current.limitations)) && <div className="guide-model-facts">{text(current.strengths) && <div>
        <h4>核心长处</h4>
        <p>{text(current.strengths)}</p>
      </div>}{text(current.limitations) && <div>
        <h4>短板与门槛</h4>
        <p>{text(current.limitations)}</p>
      </div>}</div>}{text(current.scenarios) && <div className="guide-model-scenarios">
        <h4>典型场景</h4>
        <p>{text(current.scenarios)}</p>
      </div>}<p className="guide-source-note">来自 Oil Book 作者的使用经验，不代表团队已完成复测。</p>
    </section>
  </div>;
}
