"use client";
import { useEffect, useRef } from "react";
export function PracticeOutline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const reveal = () => {
      if (/^#step-[234]$/.test(location.hash)) {
        if (ref.current) ref.current.open = true;
        requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
      }
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  return <details ref={ref} className="practice-future"><summary>第 2–4 步 · 后续实践大纲 <span>尚未开放，按需展开</span></summary>{children}</details>;
}
