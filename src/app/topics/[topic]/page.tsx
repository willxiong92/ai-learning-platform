import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTopic, HOME_TOPIC_SLUG, ROUTE_TOPICS, TOPICS } from "@/lib/vibehub/data";
import { StaticCatalog } from "@/components/ai-learning/static-catalog";

export function generateStaticParams() {
  return [...ROUTE_TOPICS, ...TOPICS].filter((t) => t.slug && t.slug !== HOME_TOPIC_SLUG).map((t) => ({ topic: t.slug }));
}

// Sites 静态发布版：只生成上面列出的分类页，?q= 搜索在浏览器里执行。
export const dynamicParams = false;

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params;
  if (!getTopic(slug)) notFound();
  return (
    <Suspense fallback={<p>正在加载术语图鉴…</p>}>
      <StaticCatalog slug={slug} />
    </Suspense>
  );
}
