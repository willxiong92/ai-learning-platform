"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 正文是同步脚本渲染好的 HTML。范式「完整版」是一段要整段复制、再填空的模板，
 * 这里给正文里每个代码框补一个「复制」按钮；正文 HTML 本身不带按钮，保持同步脚本的白名单校验简单。
 */
export function CollabArticle({ html, children }: { html: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const buttons: HTMLButtonElement[] = [];
    root.querySelectorAll<HTMLElement>("div[class*='language-']").forEach((block) => {
      const code = block.querySelector("pre");
      if (!code) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "collab-copy";
      button.textContent = "复制模板";
      button.setAttribute("aria-label", "复制这段模板");
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code.innerText.trimEnd());
          button.textContent = "已复制";
        } catch {
          button.textContent = "复制失败，请手动选中";
        }
        window.setTimeout(() => {
          button.textContent = "复制模板";
        }, 1600);
      });
      block.appendChild(button);
      buttons.push(button);
    });
    return () => buttons.forEach((b) => b.remove());
  }, [html]);

  return (
    <div className="collab-article-wrap">
      <div ref={ref} className="term-article collab-article" dangerouslySetInnerHTML={{ __html: html }} />
      {children}
    </div>
  );
}
