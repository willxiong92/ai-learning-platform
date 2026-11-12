"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { getTopic, getTopicCards, searchTerms } from "@/lib/vibehub/data";
import { CatalogView, CatalogFullView, TopicNote, topicHeading } from "@/components/sites/vibe-hub-org-e37cedf6/shared/catalog-view";

// Sites 发布是纯静态文件，没有服务器读 ?q=，所以搜索改在浏览器里算。
// 结果和服务端版本一致：同一个 searchTerms，同样按分类分组。
export function StaticCatalog({ slug, intro }: { slug: string; intro?: ReactNode }) {
  const q = useSearchParams().get("q");

  if (q) {
    const results = searchTerms(q);
    const byCat = new Map<string, typeof results>();
    for (const t of results) {
      if (!byCat.has(t.cat)) byCat.set(t.cat, []);
      byCat.get(t.cat)!.push(t);
    }
    const sections = [...byCat.entries()].map(([cat, terms]) => ({ cat, terms }));
    return (
      <CatalogFullView
        heading={`「${q}」的搜索结果`}
        sections={sections}
        emptyLabel={`没有找到和「${q}」相关的术语`}
      />
    );
  }

  const topic = getTopic(slug)!;
  const catalog = (
    <CatalogView activeSlug={slug} heading={topicHeading(topic)} sections={getTopicCards(slug)} note={<TopicNote topic={topic} />} />
  );
  if (!intro) return catalog;
  // 首页：搜索结果页不放首屏，搜东西的人要直接看到结果
  return (
    <>
      {intro}
      <div id="home-terms">{catalog}</div>
    </>
  );
}
