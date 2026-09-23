import { notFound } from "next/navigation";
import { getTopic, getTopicCards, HOME_TOPIC_SLUG, ROUTE_TOPICS, searchTerms, TOPICS } from "@/lib/vibehub/data";
import { CatalogView, CatalogFullView, TopicNote, topicHeading } from "@/components/sites/vibe-hub-org-e37cedf6/shared/catalog-view";

export function generateStaticParams() {
  return [...ROUTE_TOPICS, ...TOPICS].filter((t) => t.slug && t.slug !== HOME_TOPIC_SLUG).map((t) => ({ topic: t.slug }));
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { topic: slug } = await params;
  const { q } = await searchParams;
  const topic = getTopic(slug);
  if (!topic) notFound();

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

  const sections = getTopicCards(slug);
  return <CatalogView activeSlug={slug} heading={topicHeading(topic)} sections={sections} note={<TopicNote topic={topic} />} />;
}
