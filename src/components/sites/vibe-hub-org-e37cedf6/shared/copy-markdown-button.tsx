"use client";

import { useState } from "react";
import type { Term } from "@/lib/vibehub/types";

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function termToMarkdown(term: Term): string {
  const lines: string[] = [];
  lines.push(`# ${term.cn} ${term.name}`);
  lines.push("");
  lines.push(term.cat);
  if (term.quote) {
    lines.push("");
    lines.push(`> ${term.quote}`);
  }
  lines.push("");
  lines.push(term.desc);
  if (term.aliases?.length) {
    lines.push("");
    lines.push(`也常被叫作：${term.aliases.join("、")}`);
  }
  if (term.distinctionsDetail?.length) {
    lines.push("");
    lines.push("## 容易混淆？这样区分");
    for (const d of term.distinctionsDetail) {
      lines.push(`- ${stripHtml(d.text)}`);
    }
  }
  if (term.anatomy?.parts?.length) {
    lines.push("");
    lines.push("## 组成结构");
    for (const p of term.anatomy.parts) {
      lines.push(`${p.idx ?? ""}. ${p.name ?? ""} ${p.en ?? ""} — ${p.desc ?? ""}`);
    }
  }
  if (term.variants?.length) {
    lines.push("");
    lines.push("## 常见变体");
    for (const v of term.variants) {
      lines.push(`- ${v.name ?? ""} ${v.en ?? ""}：${v.when ?? ""}`);
    }
  }
  if (term.scenarios?.length) {
    lines.push("");
    lines.push("## 典型使用场景");
    for (const s of term.scenarios) {
      lines.push(`- ${s.caption ?? ""}`);
    }
  }
  if (term.quiz) {
    lines.push("");
    lines.push("## 小测验");
    if (term.quiz.question) lines.push(term.quiz.question);
    for (const o of term.quiz.options) {
      lines.push(`- ${o.marker ?? ""}. ${o.label ?? ""}`);
    }
  }
  if (term.references?.length) {
    lines.push("");
    lines.push("## 延伸阅读");
    for (const r of term.references) {
      lines.push(`- [${r.title ?? r.href}](${r.href})${r.sub ? ` — ${r.sub}` : ""}`);
    }
  }
  return lines.join("\n");
}

export function CopyMarkdownButton({ term }: { term: Term }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const md = termToMarkdown(term);
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // clipboard API unavailable (e.g. insecure context) — fail silently
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      className={`detail-copy-markdown${copied ? " is-copied" : ""}`}
      aria-label="复制为 Markdown"
      data-locale="zh"
      onClick={handleClick}
    >
      <span className="detail-copy-icon" aria-hidden="true">
        <svg className="ui-icon copy-icon-default" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
        <svg className="ui-icon copy-icon-success" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m5 12.5 4.2 4.2L19 7" />
        </svg>
      </span>
      <span className="detail-copy-label" aria-hidden="true">
        <span className="copy-label-default">复制为 Markdown</span>
        <span className="copy-label-success">已复制</span>
      </span>
    </button>
  );
}
