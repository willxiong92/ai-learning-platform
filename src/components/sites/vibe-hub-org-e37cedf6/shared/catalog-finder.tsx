"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FavoritesChipCount } from "./favorites-chip-count";

export interface CatalogFinderChip {
  slug: string;
  href: string;
  label: string;
  count: number;
  order?: number;
  title?: string;
}

// 两排筛选：学习路线（跟 AI 课程模块走，从零到一按顺序学）和技术词典（按技术方向查词）。
// 做成 client 组件只为量高度：两排按钮换行后高度会变，把实际高度写到外层布局的 --catalog-finder-h，
// 左侧目录的吸顶位置和点目录跳转后的停靠位置都按它算，避免被吸顶筛选挡住。
// 术语数据由 CatalogView（server）算好当 props 传进来，这里不引数据文件，免得整份术语打进浏览器端 JS。
export function CatalogFinder({
  activeSlug,
  routes,
  topics,
}: {
  activeSlug: string | null;
  routes: CatalogFinderChip[];
  topics: CatalogFinderChip[];
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    const layout = el?.closest<HTMLElement>(".catalog-directory-layout");
    if (!el || !layout) return;
    const sync = () => layout.style.setProperty("--catalog-finder-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      observer.disconnect();
      layout.style.removeProperty("--catalog-finder-h");
    };
  }, []);

  return (
    <section ref={ref} className="catalog-finder" aria-label="筛选术语">
      <div className="catalog-finder-row">
        <span className="catalog-finder-label">学习路线</span>
        <div className="catalog-filter-list">
          {routes.map((t) => (
            <Link key={t.slug} href={t.href} className="catalog-filter-chip" aria-pressed={activeSlug === t.slug} title={t.title}>
              <em>{t.order}</em>
              {t.label}
              <span>{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="catalog-finder-row">
        <span className="catalog-finder-label">技术词典</span>
        <div className="catalog-filter-list">
          {topics.map((t) => (
            <Link key={t.slug} href={t.href} className="catalog-filter-chip" aria-pressed={activeSlug === t.slug}>
              {t.label}
              <span>{t.count}</span>
            </Link>
          ))}
          <Link href="/favorites" className="catalog-filter-chip" aria-pressed={activeSlug === "favorites"}>
            收藏
            <FavoritesChipCount />
          </Link>
        </div>
      </div>
    </section>
  );
}
