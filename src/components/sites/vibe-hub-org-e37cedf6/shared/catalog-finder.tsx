import Link from "next/link";
import { TOPICS } from "@/lib/vibehub/data";
import { FavoritesChipCount } from "./favorites-chip-count";

export function CatalogFinder({ activeSlug }: { activeSlug: string | null }) {
  return (
    <section className="catalog-finder" aria-label="筛选术语">
      <div className="catalog-finder-row">
        <div className="catalog-filter-list">
          {TOPICS.map((t) => (
            <Link
              key={t.slug || "frontend"}
              href={t.slug ? `/topics/${t.slug}` : "/"}
              className="catalog-filter-chip"
              aria-pressed={activeSlug === t.slug}
            >
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
