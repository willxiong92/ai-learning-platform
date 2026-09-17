"use client";

import { useState } from "react";

/** Small copy-to-clipboard button reused across the Skill page (install prompt + rewrite examples). */
export function CopyChip({ text, label, ariaLabel }: { text: string; label: string; ariaLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard unavailable — fail silently
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" className="skill-copy" aria-label={ariaLabel} onClick={handleClick}>
      <span className={`skill-copy-state skill-copy-idle${copied ? "" : ""}`} aria-hidden={copied}>
        <i className="ti ti-copy" />
        <span>{label}</span>
      </span>
      <span className="skill-copy-state skill-copy-success" aria-hidden={!copied} style={copied ? { display: "inline-flex" } : undefined}>
        <i className="ti ti-check" />
        <span>已复制</span>
      </span>
    </button>
  );
}
