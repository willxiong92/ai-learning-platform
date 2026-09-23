import type { TopicSection } from "@/lib/vibehub/types";

// 左侧目录：技术词典直接显示分类名；学习路线显示课号 + 短名，完整课名在悬停提示和右侧分组标题里。
export function CategorySidebar({ items }: { items: { cat: string; nav?: TopicSection["nav"] }[] }) {
  if (!items.length) return null;
  return (
    <aside className="catalog-sidebar">
      <nav className="cat-chips" aria-label="术语目录">
        {items.map(({ cat, nav }) => (
          <a key={cat} href={`#cat-${cat}`} className="catalog-filter-chip" title={nav ? cat : undefined}>
            {nav ? (
              <>
                <em>{nav.num}</em>
                {nav.label}
              </>
            ) : (
              cat
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
}
