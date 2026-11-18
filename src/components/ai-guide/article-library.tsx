"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import learningPath from "@/data/ai-guide-learning-path.json";
import type { GuideArticle } from "@/lib/ai-guide";

type ShelfArticle = Pick<GuideArticle, "slug" | "title" | "excerpt" | "cover">;
export function ArticleLibrary({ articles }: { articles: ShelfArticle[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(learningPath.phases[0].id);
  const bySlug = new Map(articles.map(article => [article.slug, article]));
  const filter = query.trim().toLowerCase();
  const phases = learningPath.phases.map(phase => ({ ...phase, groups: phase.groups.map((group, index) => ({
    ...group, id: `${phase.id}-${index}`, articles: group.slugs.map(slug => bySlug.get(slug)!).filter(article => article && (!filter || `${article.title} ${article.excerpt}`.toLowerCase().includes(filter)))
  })) })).map(phase => ({ ...phase, count: phase.groups.reduce((sum, group) => sum + group.articles.length, 0) })).filter(phase => phase.count > 0);
  useEffect(() => {
    function update() {
      const sections = Array.from(document.querySelectorAll<HTMLElement>(".guide-library-stage"));
      let current = sections[0];
      const edge = (document.querySelector(".guide-library-nav")?.getBoundingClientRect().bottom ?? 70) + 20;
      for (const section of sections) if (section.getBoundingClientRect().top <= edge) current = section;
      if (current) setActive(current.dataset.category!);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [query]);
  function toggle(id: string) { setExpanded(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  return <div className="guide-library">
    <header className="guide-library-heading">
      <div><h1>课程</h1><span>{articles.length} 篇文章</span></div>
      <label><span className="sr-only">搜索文章</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="标题或关键词" /></label>
    </header>
    <nav className="guide-library-nav" aria-label="文章分类">{phases.map(phase => <a key={phase.id} href={`#path-${phase.id}`} aria-current={active === phase.id ? "true" : undefined}>{phase.name}</a>)}</nav>
    {filter && <p className="guide-library-results" role="status">{phases.reduce((sum, phase) => sum + phase.count, 0)} 篇匹配文章</p>}
    {phases.map(phase => <section className="guide-library-stage" id={`path-${phase.id}`} data-category={phase.id} key={phase.id} aria-labelledby={`title-${phase.id}`}>
      <header className="guide-library-stage-heading"><h2 id={`title-${phase.id}`}>{phase.name}</h2><span>{phase.count} 篇</span></header>
      {phase.groups.filter(group => group.articles.length).map(group => <section className="guide-library-group" key={group.id}>
        {group.name && <header className="guide-library-group-heading"><h3>{group.name}</h3><span>{group.articles.length} 篇</span></header>}
        <div className="guide-books" id={`shelf-${group.id}`}>{group.articles.map((article, index) => <article key={article.slug} className="guide-book" hidden={!filter && !expanded.has(group.id) && index >= 4}>
          <Link prefetch={false} className="guide-book-cover" href={`/ai-guide/articles/${article.slug}/`} aria-label={`阅读：${article.title}`}><img src={article.cover} alt={`${article.title} · 封面`} width="720" height="960" loading="lazy" /></Link>
          <h3><Link prefetch={false} href={`/ai-guide/articles/${article.slug}/`}>{article.title}</Link></h3>
        </article>)}</div>
        {!filter && group.articles.length > 4 && <button className="guide-shelf-toggle" onClick={() => toggle(group.id)} aria-expanded={expanded.has(group.id)} aria-controls={`shelf-${group.id}`}>{expanded.has(group.id) ? "收起 ↑" : `查看全部 ${group.articles.length} 篇 ↓`}</button>}
      </section>)}
    </section>)}
  </div>;
}
