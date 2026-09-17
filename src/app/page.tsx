import { getTopicCards, searchTerms } from "@/lib/vibehub/data";
import { CatalogView, CatalogFullView } from "@/components/sites/vibe-hub-org-e37cedf6/shared/catalog-view";

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

  const sections = getTopicCards("");
  return <CatalogView activeSlug="" heading="前端 VibeCoding 术语" sections={sections} />;
}
