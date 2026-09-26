import { getTopic, getTopicCards, HOME_TOPIC_SLUG, searchTerms } from "@/lib/vibehub/data";
import { CatalogView, CatalogFullView, TopicNote, topicHeading } from "@/components/sites/vibe-hub-org-e37cedf6/shared/catalog-view";
import { HomeIntro } from "@/components/home/home-intro";
// 首屏样式只在首页加载，避免影响课程页等其他页面
import "@/app/home.css";

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

  // 首页默认：先是「从 L01 开始 + 路线条」首屏，下面接学习路线模块 1（AI 基本功）的术语目录。
  // 搜索结果页不放首屏，搜东西的人要直接看到结果。
  const topic = getTopic(HOME_TOPIC_SLUG)!;
  const sections = getTopicCards(HOME_TOPIC_SLUG);
  return (
    <>
      <HomeIntro />
      <div id="home-terms">
        <CatalogView activeSlug={HOME_TOPIC_SLUG} heading={topicHeading(topic)} sections={sections} note={<TopicNote topic={topic} />} />
      </div>
    </>
  );
}
