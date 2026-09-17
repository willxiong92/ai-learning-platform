"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { ALL_TERMS } from "@/lib/vibehub/data";
import { CatalogFullView } from "@/components/sites/vibe-hub-org-e37cedf6/shared/catalog-view";

export default function FavoritesPage() {
  const { ids, ready } = useFavorites();
  const favTerms = ALL_TERMS.filter((t) => ids.includes(t.id));

  const byCat = new Map<string, typeof favTerms>();
  for (const t of favTerms) {
    if (!byCat.has(t.cat)) byCat.set(t.cat, []);
    byCat.get(t.cat)!.push(t);
  }
  const sections = [...byCat.entries()].map(([cat, terms]) => ({ cat, terms }));

  return (
    <CatalogFullView
      heading="我的收藏"
      sections={ready ? sections : []}
      emptyLabel={ready ? "还没有收藏任何术语，点卡片右上角的星标试试" : "加载中…"}
    />
  );
}
