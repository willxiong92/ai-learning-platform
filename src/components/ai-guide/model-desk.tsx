"use client";
import { useState } from "react";
import type { GuideModel } from "@/lib/ai-guide";
const text = (value: string | string[]) => Array.isArray(value) ? value.join("；") : value;
const personalAgents = [
  { id: "personal-grok-bot", name: "GROK BOT", logo: "", tagline: "Will 的个人 Agent", description: "Will 日常使用的个人 Agent。", strengths: "", limitations: "", scenarios: "" },
  { id: "personal-muse", name: "MUSE", logo: "", tagline: "Will 的个人 Agent", description: "Will 日常使用的个人 Agent。", strengths: "", limitations: "", scenarios: "" },
];
function ModelLogo({ name, logo }: { name: string; logo?: string }) {
  const brand = logo || /^(Claude|Kimi|Gemini|GPT|DeepSeek)\b/.exec(name)?.[1].toLowerCase();
  return brand ? <img className="guide-model-logo" src={`/ai-guide/model-logos/${brand === "gpt" ? "openai" : brand}.svg`} width={22} height={22} alt="" /> : null;
}
export function ModelDesk({ models }: { models: GuideModel[] }) {
  const [selected, setSelected] = useState(personalAgents[0].id);
  const personal = personalAgents.find(m => m.id === selected);
  const current = personal ?? models.find(m => m.id === selected) ?? models[0];
  const categories = [...new Set(models.map(m => m.category))];
  if (!current) return null;
  return <div className="guide-model-desk">
    <div className="guide-model-options">
      <section className="personal-agent-group">
        <h3>PERSONAL AGENT <small>Will 的个人 Agent</small></h3>
        <div className="guide-model-grid">{personalAgents.map(agent =>
          <button key={agent.id} className={agent.id === current.id ? "is-selected" : ""} aria-pressed={agent.id === current.id} aria-controls="guide-model-detail" onClick={() => setSelected(agent.id)}>
            <strong><ModelLogo name={agent.name} logo={agent.logo} />{agent.name}</strong><span>{agent.tagline}</span>
          </button>)}</div>
      </section>
      {categories.map((c, i) => <section key={c} data-model-group={i+1}>
      <h3>
        <span>{String(i + 1).padStart(2, "0")}</span>{c}</h3>
      <div className="guide-model-grid">{models.filter(m => m.category === c).map(m => <button key={m.id} className={m.id === current.id ? "is-selected" : ""} aria-pressed={m.id === current.id} onClick={() => setSelected(m.id)} aria-controls="guide-model-detail">
        <strong><ModelLogo name={m.name} />{m.name}</strong>
        <span>{m.tagline}</span>
        <span className="guide-model-arrow" aria-hidden="true">↗</span>
      </button>)}</div>
    </section>)}</div>
    <section className="guide-model-detail" id="guide-model-detail" aria-label={personal ? "个人使用习惯" : "作者实测记录"} aria-live="polite">
      <p className="guide-eyebrow">{personal ? "PERSONAL AGENT · Will 的个人 Agent" : "Oil Book · 作者实测记录"}</p>
      <h3><ModelLogo name={current.name} logo={personal?.logo} />{current.name}</h3>
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
      </div>}{!personal && <p className="guide-source-note">来自 Oil Book 作者的使用经验，不代表团队已完成复测。</p>}
    </section>
  </div>;
}
