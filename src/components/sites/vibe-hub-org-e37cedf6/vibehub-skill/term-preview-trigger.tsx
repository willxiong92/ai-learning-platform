"use client";

import { useState } from "react";
import Link from "next/link";
import type { Term } from "@/lib/vibehub/types";

/** Inline "click a term, see its explanation in place" trigger — used by the Skill page demo. */
export function TermPreviewTrigger({ term, label }: { term: Term; label: string }) {
  const [open, setOpen] = useState(false);
  const popoverId = `skill-tooltip-preview-${term.id}`;

  return (
    <>
      <button
        type="button"
        className="skill-browser-term-trigger"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <aside
          id={popoverId}
          className="skill-browser-term-popover"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${popoverId}-title`}
        >
          <header>
            <span>{term.cat}</span>
            <button type="button" aria-label="关闭术语解释" onClick={() => setOpen(false)}>
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </header>
          <h2 id={`${popoverId}-title`}>
            {term.cn}
            <small>{term.name}</small>
          </h2>
          <strong>{term.tagline}</strong>
          <p>{term.desc}</p>
          <Link href={`/${term.id}`}>
            打开完整词条
            <i className="ti ti-arrow-up-right" aria-hidden="true" />
          </Link>
        </aside>
      )}
    </>
  );
}
