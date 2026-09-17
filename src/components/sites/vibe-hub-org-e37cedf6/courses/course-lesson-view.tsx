"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getTerm } from "@/lib/vibehub/data";
import type { Course, CourseChapter, CourseLesson } from "@/lib/vibehub/types";
import { TermDetailBody } from "@/components/sites/vibe-hub-org-e37cedf6/shared/term-detail-body";

interface RailItem {
  id: string;
  label: string;
}

export function CourseLessonView({
  course,
  chapter,
  lesson,
}: {
  course: Course;
  chapter: CourseChapter;
  lesson: CourseLesson;
}) {
  const articleRef = useRef<HTMLDivElement>(null);
  const railNavRef = useRef<HTMLElement>(null);
  const [rail, setRail] = useState<RailItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [indicator, setIndicator] = useState<{ top: number; height: number; width: number } | null>(null);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);

  const chapterIndex = course.chapters.findIndex((c) => c.slug === chapter.slug);
  const prevChapter = chapterIndex > 0 ? course.chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < course.chapters.length - 1 ? course.chapters[chapterIndex + 1] : null;

  useEffect(() => {
    // Closes any open term panel when navigating to a different lesson.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTermId(null);
    const container = articleRef.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll<HTMLElement>(".course-lesson-section[id]"));
    const items = sections
      .map((s) => {
        const h2 = s.querySelector("h2");
        return { id: s.id, label: h2?.textContent ?? "" };
      })
      .filter((item) => item.id);
    setRail(items);
    if (items.length) setActiveId(items[0].id);

    const scrollRoot = container.closest(".course-article");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root: scrollRoot, rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [lesson.slug]);

  useEffect(() => {
    const nav = railNavRef.current;
    if (!nav || !activeId) return;
    const link = nav.querySelector<HTMLAnchorElement>(`a[href="#${activeId}"]`);
    if (!link) return;
    setIndicator({ top: link.offsetTop, height: link.offsetHeight, width: link.offsetWidth });
  }, [activeId, rail]);

  function handleBodyClick(e: React.MouseEvent<HTMLDivElement>) {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".course-term-ref");
    if (!btn) return;
    const termId = btn.dataset.termId;
    if (termId) setActiveTermId(termId);
  }

  const activeTerm = activeTermId ? getTerm(activeTermId) : undefined;

  return (
    <div className="course-app course-reader-app">
      <div
        className={`course-workspace${activeTerm ? " has-term" : ""}`}
        style={{ "--course-reader-main-share": "50%" } as React.CSSProperties}
      >
        <div className="course-reader-pane">
          <article className="course-article">
            <div className="course-article-layout">
              <div className="course-article-side">
                <Link
                  className="detail-back-button course-reader-back"
                  href={`/courses/${course.slug}`}
                  aria-label="返回章节目录"
                  title="返回章节目录"
                >
                  <svg className="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M19 12H5m6-6-6 6 6 6" />
                  </svg>
                </Link>
                <aside className="course-section-rail" aria-label="本章目录">
                  <strong>本章目录</strong>
                  <nav aria-label="本章目录" ref={railNavRef}>
                    {indicator && (
                      <span
                        aria-hidden="true"
                        className="course-nav-indicator"
                        style={{
                          left: 0,
                          width: indicator.width,
                          height: indicator.height,
                          transform: `translateY(${indicator.top}px)`,
                        }}
                      />
                    )}
                    {rail.map((item) => (
                      <a key={item.id} className={item.id === activeId ? "is-active" : ""} href={`#${item.id}`}>
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </aside>
              </div>
              <div className="course-article-inner" ref={articleRef} onClick={handleBodyClick}>
                <header className="course-chapter-hero">
                  <span className="course-section-eyebrow">第 {Number(chapter.number)} 章</span>
                  <h1>{chapter.title}</h1>
                  <p className="course-chapter-intro">{chapter.summary}</p>
                </header>
                <div dangerouslySetInnerHTML={{ __html: lesson.bodyHtml }} />
                <nav className="course-bottom-nav" aria-label="上一章和下一章">
                  {prevChapter && (
                    <Link className="is-prev" href={`/courses/${course.slug}/${prevChapter.slug}`}>
                      <span>上一章</span>
                      <strong>{prevChapter.title}</strong>
                    </Link>
                  )}
                  {nextChapter ? (
                    <Link className="is-next" href={`/courses/${course.slug}/${nextChapter.slug}`}>
                      <span>下一章</span>
                      <strong>{nextChapter.title}</strong>
                    </Link>
                  ) : (
                    <Link className="is-next" href={`/courses/${course.slug}`}>
                      <span>完成</span>
                      <strong>返回章节目录</strong>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </article>
          <details className="course-mobile-section-sheet">
            <summary>本章目录</summary>
            <nav aria-label="本章目录">
              {rail.map((item) => (
                <a key={item.id} className={item.id === activeId ? "is-active" : ""} href={`#${item.id}`}>
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
        </div>

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
    </div>
  );
}
