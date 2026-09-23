"use client";

// Reading area of an AI course chapter with the same term side panel as the
// Web Coding chapters (course-lesson-view.tsx): clicking a term in the text
// ([文字](term:id) in the lesson source, rendered as .course-term-ref) opens
// that term's card from the 术语图鉴 on the right, without leaving the page.
// The chapter content itself stays server-rendered and is passed as children.
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { getTerm } from "@/lib/vibehub/data";
import { TermDetailBody } from "@/components/sites/vibe-hub-org-e37cedf6/shared/term-detail-body";

export function AiTermWorkspace({ children }: { children: ReactNode }) {
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const activeTerm = activeTermId ? getTerm(activeTermId) : undefined;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".course-term-ref");
    const termId = btn?.dataset.termId;
    if (termId) setActiveTermId(termId);
  }

  return (
    <div
      className={`course-workspace ai-term-workspace${activeTerm ? " has-term" : ""}`}
      style={{ "--course-reader-main-share": "50%" } as React.CSSProperties}
      onClick={handleClick}
    >
      {children}

      <button type="button" className="course-pane-splitter" aria-label="调整分栏宽度" tabIndex={-1} />

      {activeTerm && (
        <div className="course-term-panel">
          <div className="course-term-toolbar">
            <div>
              <strong>{activeTerm.cn}</strong>
            </div>
            <div className="course-term-actions">
              <Link href={`/${activeTerm.id}`} target="_blank" rel="noreferrer">
                新标签页打开
              </Link>
              <button type="button" aria-label="关闭术语详情" onClick={() => setActiveTermId(null)}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="course-term-scroll">
            <TermDetailBody term={activeTerm} embedded />
          </div>
        </div>
      )}
      {activeTerm && (
        <button
          type="button"
          className="course-term-backdrop"
          aria-label="关闭术语详情"
          onClick={() => setActiveTermId(null)}
        />
      )}
    </div>
  );
}
