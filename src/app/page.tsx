import { getTopic, getTopicCards, HOME_TOPIC_SLUG, searchTerms } from "@/lib/vibehub/data";
import { CatalogView, CatalogFullView, TopicNote, topicHeading } from "@/components/sites/vibe-hub-org-e37cedf6/shared/catalog-view";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

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

  // 首页默认显示学习路线模块 1（AI 基本功）
  const topic = getTopic(HOME_TOPIC_SLUG)!;
  const sections = getTopicCards(HOME_TOPIC_SLUG);
  return <CatalogView activeSlug={HOME_TOPIC_SLUG} heading={topicHeading(topic)} sections={sections} note={<TopicNote topic={topic} />} />;
}
