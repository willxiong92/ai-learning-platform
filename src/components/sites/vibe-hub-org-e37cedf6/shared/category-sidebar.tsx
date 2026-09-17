export function CategorySidebar({ cats }: { cats: string[] }) {
  if (!cats.length) return null;
  return (
    <aside className="catalog-sidebar">
      <nav className="cat-chips" aria-label="术语目录">
        {cats.map((cat) => (
          <a key={cat} href={`#cat-${cat}`} className="catalog-filter-chip">
            {cat}
          </a>
        ))}
      </nav>
    </aside>
  );
}
