"use client";

// Section rail for an AI course chapter, with the same scroll-following
// highlight as the Web Coding lesson reader (course-lesson-view.tsx): the
// section nearest the top of the reading pane is marked is-active and the
// course-nav-indicator slides behind it. Without JavaScript it is a plain
// list of anchor links.
import { useEffect, useRef, useState } from "react";

export interface RailItem {
  id: string;
  title: string;
}

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const key = ids.join(" ");

  useEffect(() => {
    const targets = key
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const scrollRoot = targets[0].closest(".course-article");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { root: scrollRoot, rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}

export function AiSectionRail({ items }: { items: RailItem[] }) {
  const activeId = useActiveSection(items.map((i) => i.id));
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ top: number; height: number; width: number } | null>(null);

  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLAnchorElement>(`a[href="#${activeId}"]`);
    // Measures the rendered link so the highlight can slide to it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (link) setIndicator({ top: link.offsetTop, height: link.offsetHeight, width: link.offsetWidth });
  }, [activeId]);

  return (
    <aside className="course-section-rail" aria-label="本章目录">
      <strong>本章目录</strong>
      <nav aria-label="本章目录" ref={navRef}>
        {indicator && (
          <span
            aria-hidden="true"
            className="course-nav-indicator"
            style={{ left: 0, width: indicator.width, height: indicator.height, transform: `translateY(${indicator.top}px)` }}
          />
        )}
        {items.map((item) => (
          <a key={item.id} className={item.id === activeId ? "is-active" : ""} href={`#${item.id}`}>
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export function AiMobileSectionSheet({ items }: { items: RailItem[] }) {
  const activeId = useActiveSection(items.map((i) => i.id));
  return (
    <details className="course-mobile-section-sheet">
      <summary>本章目录</summary>
      <nav aria-label="本章目录">
        {items.map((item) => (
          <a key={item.id} className={item.id === activeId ? "is-active" : ""} href={`#${item.id}`}>
            {item.title}
          </a>
        ))}
      </nav>
    </details>
  );
}
