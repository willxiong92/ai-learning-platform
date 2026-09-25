import { CatalogFinder, type CatalogFinderChip } from "./catalog-finder";
import { CategorySidebar } from "./category-sidebar";
import { TermCard } from "./term-card";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { SearchXIcon, StarIcon } from "lucide-react";
import type { ReactNode } from "react";
import { HOME_TOPIC_SLUG, ROUTE_TOPICS, TOPICS } from "@/lib/vibehub/data";
import type { Term, Topic, TopicSection } from "@/lib/vibehub/types";

const topicHref = (slug: string) => (slug === HOME_TOPIC_SLUG ? "/" : `/topics/${slug}`);

// 筛选按钮在这里（server 端）算好再交给 CatalogFinder，浏览器端只拿到按钮需要的几个字段。
const ROUTE_CHIPS: CatalogFinderChip[] = ROUTE_TOPICS.map((t) => ({
  slug: t.slug,
  href: topicHref(t.slug),
  label: t.label,
  count: t.count,
  order: t.route!.order,
  title: `模块 ${t.route!.order} · ${t.route!.title}${t.route!.writing ? "（课程编写中）" : ""}`,
}));
const TOPIC_CHIPS: CatalogFinderChip[] = TOPICS.map((t) => ({
  slug: t.slug,
  href: topicHref(t.slug),
  label: t.label,
  count: t.count,
}));

interface Section {
  cat: string;
  nav?: TopicSection["nav"];
  terms: Term[];
}

/** Normal per-topic catalog: finder chips + subcategory sidebar + grouped grid. */
export function CatalogView({
  activeSlug,
  heading,
  sections,
  note,
}: {
  activeSlug: string;
  heading: string;
  sections: Section[];
  note?: ReactNode;
}) {
  return (
    <div className="catalog-page catalog-directory-page">
      <div className="catalog-layout catalog-directory-layout">
        <CatalogFinder activeSlug={activeSlug} routes={ROUTE_CHIPS} topics={TOPIC_CHIPS} />
        <CategorySidebar items={sections} />
        <div className="grid-wrap">
          <header className="catalog-heading">
            <h1>{heading}</h1>
            {note}
          </header>
          {sections.map((s) => (
            <section className="cat-section" key={s.cat} id={`cat-${s.cat}`}>
              <div className="cat-title">
                {s.cat}
                <span>{s.terms.length} 个条目</span>
              </div>
              <div className="grid">
                {s.terms.map((t) => (
                  <TermCard key={t.id} term={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 术语页标题：学习路线写“模块 N · 模块名”，技术词典写“技术词典 · 方向”。 */
export function topicHeading(topic: Topic): string {
  return topic.route ? `模块 ${topic.route.order} · ${topic.route.title}` : `技术词典 · ${topic.label}`;
}

/** 学习路线模块的说明：对应哪几课、课程是否在写，以及去课程和练习的入口。技术词典不显示。 */
export function TopicNote({ topic }: { topic: Topic }) {
  const r = topic.route;
  if (!r) return null;
  return (
    <p className="catalog-route-note">
      <span>对应 AI 课程{r.lessonRange}</span>
      {r.writing ? (
        <span className="catalog-route-badge">课程编写中 · 先放已有术语卡，课程写好后按教材调整</span>
      ) : null}
      <Link href={r.courseHref}>去学课程</Link>
      <Link href={`/practice?scope=${topic.slug}`}>练这个模块</Link>
    </p>
  );
}

/** Search-results / favorites layout: no finder chips, no sidebar, full width. */
export function CatalogFullView({
  heading,
  sections,
  emptyLabel,
  emptyKind = "search",
}: {
  heading: string;
  sections: Section[];
  emptyLabel?: string;
  /** 空状态说什么：搜索无结果、收藏夹为空，或还在读本地收藏（不显示空状态，避免闪一下） */
  emptyKind?: "search" | "favorites" | "loading";
}) {
  const hasAny = sections.some((s) => s.terms.length > 0);
  const isFavorites = emptyKind === "favorites";
  return (
    <div className="catalog-page catalog-directory-page">
      <div className="catalog-layout catalog-directory-layout catalog-layout-full">
        <div className="grid-wrap">
          <header className="catalog-heading">
            <h1>{heading}</h1>
          </header>
          {!hasAny && emptyKind !== "loading" && (
            // 空状态换成组件库 550 的 EmptyState；「回到全部术语」给搜不到的人一条退路
            <EmptyState
              icon={isFavorites ? <StarIcon /> : <SearchXIcon />}
              title={emptyLabel ?? "没有找到相关内容"}
              description={isFavorites ? "收藏的术语会集中放在这里，方便回头复习。" : "试试更短的关键词，或者换个说法。"}
              action={
                <Link href="/" className="text-primary text-sm font-medium underline-offset-4 hover:underline">
                  回到全部术语
                </Link>
              }
            />
          )}
          {sections
            .filter((s) => s.terms.length > 0)
            .map((s) => (
              <section className="cat-section" key={s.cat} id={`cat-${s.cat}`}>
                <div className="cat-title">
                  {s.cat}
                  <span>{s.terms.length} 个条目</span>
                </div>
                <div className="grid">
                  {s.terms.map((t) => (
                    <TermCard key={t.id} term={t} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
