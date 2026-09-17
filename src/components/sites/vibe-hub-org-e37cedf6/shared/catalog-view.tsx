import { CatalogFinder } from "./catalog-finder";
import { CategorySidebar } from "./category-sidebar";
import { TermCard } from "./term-card";
import type { Term } from "@/lib/vibehub/types";

interface Section {
  cat: string;
  terms: Term[];
}

/** Normal per-topic catalog: finder chips + subcategory sidebar + grouped grid. */
export function CatalogView({
  activeSlug,
  heading,
  sections,
}: {
  activeSlug: string;
  heading: string;
  sections: Section[];
}) {
  return (
    <div className="catalog-page catalog-directory-page">
      <div className="catalog-layout catalog-directory-layout">
        <span className="catalog-finder-sentinel" aria-hidden="true" />
        <CatalogFinder activeSlug={activeSlug} />
        <CategorySidebar cats={sections.map((s) => s.cat)} />
        <div className="grid-wrap">
          <header className="catalog-heading">
            <h1>{heading}</h1>
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

/** Search-results / favorites layout: no finder chips, no sidebar, full width. */
export function CatalogFullView({
  heading,
  sections,
  emptyLabel,
}: {
  heading: string;
  sections: Section[];
  emptyLabel?: string;
}) {
  const hasAny = sections.some((s) => s.terms.length > 0);
  return (
    <div className="catalog-page catalog-directory-page">
      <div className="catalog-layout catalog-directory-layout catalog-layout-full">
        <div className="grid-wrap">
          <header className="catalog-heading">
            <h1>{heading}</h1>
          </header>
          {!hasAny && (
            <div className="catalog-empty">{emptyLabel ?? "没有找到相关内容"}</div>
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
