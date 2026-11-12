"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GuideArticle } from "@/lib/ai-guide";

type Font = "sans" | "serif";
type Size = "sm" | "md" | "lg";
type Neighbor = Pick<GuideArticle, "slug" | "title">;
type ReaderArticle = Pick<GuideArticle, "slug" | "title" | "author" | "date" | "cover" | "headings" | "status">;
type Props = {
  article: ReaderArticle;
  html: string;
  category: { id: string; name: string; count: number };
  sources: { label: string; url: string }[];
  authorIcon?: string;
  previous?: Neighbor;
  next?: Neighbor;
};
const STORAGE = "okki:ai-guide:source-reading";
const chapters = ["ai-agent-common-operations", "ai-and-dev-core-concepts", "vibe-coding-website-from-scratch", "ai-ui-design", "git-from-scratch"];
const articleHref = (slug: string) => `/ai-guide/articles/${encodeURIComponent(slug)}/`;

export function GuideReader({ article, html, category, sources, authorIcon, previous, next }: Props) {
  const headings = article.headings.filter(heading => heading.level === 2);
  const [font, setFont] = useState<Font>("sans");
  const [size, setSize] = useState<Size>("md");
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mobileTocRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const shelfHref = `/ai-guide/#path-${category.id}`;
  const chapter = chapters.indexOf(article.slug);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) ?? localStorage.getItem("okki:ai-guide:reader") ?? "null");
      // Preferences are restored after hydration so exported HTML stays deterministic.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved?.font === "sans" || saved?.font === "serif") setFont(saved.font);
      if (["sm", "md", "lg"].includes(saved?.size)) setSize(saved.size);
    } catch { /* Storage failure must not prevent reading. */ }
  }, []);

  useEffect(() => {
    const body = contentRef.current;
    if (!body) return;
    body.querySelectorAll("img").forEach(img => {
      if (img.closest(".inline-link-favicon")) return;
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `放大查看：${img.alt || "文章图片"}`);
    });
    // Keep code text untouched; the toolbar is a sibling of the preformatted body.
    const toolbars: HTMLDivElement[] = [];
    body.querySelectorAll(".code-block").forEach(block => {
      const toolbar = document.createElement("div");
      toolbar.className = "code-toolbar";
      const label = document.createElement("span");
      label.textContent = "代码";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "复制";
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(block.querySelector("pre")?.textContent ?? "");
          button.textContent = "已复制";
        } catch { button.textContent = "请选中代码复制"; }
      });
      toolbar.append(label, button);
      block.prepend(toolbar);
      toolbars.push(toolbar);
    });
    const targets = article.headings.filter(heading => heading.level === 2).map(heading => document.getElementById(heading.id)).filter((element): element is HTMLElement => !!element);
    function updateToc() {
      let current = targets[0];
      const edge = (document.querySelector(".site-shell > .nav")?.getBoundingClientRect().bottom ?? 60) + 48;
      for (const node of targets) if (node.getBoundingClientRect().top <= edge) current = node;
      setActive(current?.id ?? "");
    }
    const frame = requestAnimationFrame(updateToc);
    window.addEventListener("scroll", updateToc, { passive: true });
    window.addEventListener("resize", updateToc);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateToc);
      window.removeEventListener("resize", updateToc);
      toolbars.forEach(toolbar => toolbar.remove());
    };
  }, [html, article.headings]);

  useEffect(() => {
    if (!image) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [image]);

  function update(nextFont: Font, nextSize: Size) {
    setFont(nextFont);
    setSize(nextSize);
    try { localStorage.setItem(STORAGE, JSON.stringify({ font: nextFont, size: nextSize })); } catch { /* Current page preferences still apply. */ }
  }
  function enlarge(src: string, alt: string, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setImage({ src, alt });
    dialogRef.current?.showModal();
  }
  function enlargeTarget(target: EventTarget | null, preventDefault: () => void) {
    if (!(target instanceof HTMLImageElement) || target.closest(".inline-link-favicon")) return;
    preventDefault();
    enlarge(target.currentSrc || target.src, target.alt, target);
  }
  const toc = <nav className="article-toc" aria-label="本篇目录">{headings.map(heading =>
    <a key={heading.id} href={`#${heading.id}`} aria-current={active === heading.id ? "location" : undefined} onClick={() => { if (mobileTocRef.current) mobileTocRef.current.open = false; }}>
      <span className="toc-title">{heading.title}</span>
    </a>)}</nav>;

  return <div className="guide-reading-page" data-reader-font={font} data-reader-size={size}>
    <div className="reader-shell">
      <nav className="guide-reader-breadcrumbs" aria-label="页面位置"><Link href="/ai-guide/">实践指南</Link><span>/</span><Link href={shelfHref}>{category.name}</Link></nav>
      <div className="reader-layout">
        <div className="reading-above">
          <Link className="portal-back" href={shelfHref}>← {category.name}</Link>
          <div className="reader-tuner ReaderTuner_tuner__ugURF" data-ready="true">
            <div className="ReaderTuner_track__ShGwy ReaderTuner_fontTrack__l2CNJ" data-active={font} role="group" aria-label="阅读字体">
              <span className="ReaderTuner_slider__a4IEt" aria-hidden="true" />
              <button data-selected={font === "sans"} aria-pressed={font === "sans"} onClick={() => update("sans", size)}>非衬线</button>
              <button data-selected={font === "serif"} aria-pressed={font === "serif"} onClick={() => update("serif", size)}>衬线</button>
            </div>
            <div className="ReaderTuner_track__ShGwy ReaderTuner_sizeTrack__5S3Cc" data-active={size} role="group" aria-label="正文字号">
              <span className="ReaderTuner_slider__a4IEt" aria-hidden="true" />
              {(["sm", "md", "lg"] as const).map((value, index) => <button key={value} data-selected={size === value} aria-pressed={size === value} aria-label={["小字号", "标准字号", "大字号"][index]} onClick={() => update(font, value)}>{["A−", "标准", "A+"][index]}</button>)}
            </div>
          </div>
        </div>
        <aside className="page-toc" aria-label="篇内导航">{toc}</aside>
        <article className="reading has-article">
          <header className="reading-hero">
            <button className="reading-cover article-image-link" aria-label={`放大查看封面：${article.title}`} onClick={event => enlarge(article.cover, `${article.title} · 封面`, event.currentTarget)}>
              <img src={article.cover} width="720" height="960" alt={`${article.title} · 封面`} />
            </button>
            <div className="reading-hero-main">
              <h1>{article.title}</h1>
              <div className="page-properties"><div className="article-byline">
                {chapter >= 0 && <span className="issue-pill">从 0 到 1 学 Vibe Coding · 第 {String(chapter + 1).padStart(2, "0")} 章</span>}
                <span className="property-author">{article.author.startsWith("Oil ") && authorIcon && <img src={`/ai-guide/media/${authorIcon}`} alt="" width="14" height="14" />}{article.author}</span>
                {article.date && <><span>·</span><time dateTime={article.date}>{article.date.replaceAll("-", ".")}</time></>}
              </div></div>
              <details className="reader-source"><summary>参考来源</summary><div>{sources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>)}</div></details>
            </div>
          </header>
          {headings.length > 0 && <details className="mobile-contents" ref={mobileTocRef}><summary>本篇目录 <span>{headings.length} 个小节</span></summary>{toc}</details>}
          <div ref={contentRef} className="article-body long-form guide-prose" onClick={event => enlargeTarget(event.target, () => event.preventDefault())} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") enlargeTarget(event.target, () => event.preventDefault()); }} dangerouslySetInnerHTML={{ __html: html }} />
          {article.status === "public_excerpt" && <aside className="reader-incomplete">本篇目前收录公开部分，Pro 正文待补充。</aside>}
          <nav className="reader-footer" aria-label="继续阅读">
            {previous && <Link href={articleHref(previous.slug)}><span>上一篇</span>{previous.title}</Link>}
            {next && <Link href={articleHref(next.slug)}><span>下一篇</span>{next.title}</Link>}
            <Link className="shelf-return" href={shelfHref}>返回{category.name} · {category.count} 篇</Link>
          </nav>
        </article>
      </div>
    </div>
    <dialog className="source-lightbox" ref={dialogRef} aria-label="图片放大" onClose={() => { setImage(null); triggerRef.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <button onClick={() => dialogRef.current?.close()} aria-label="关闭放大图片">关闭 ×</button>
      {image && <img src={image.src} alt={image.alt} />}
    </dialog>
  </div>;
}
