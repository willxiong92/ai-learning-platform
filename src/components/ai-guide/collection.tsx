import Link from "next/link";
import { collectionLabel, guideHref, type GuideArticle } from "@/lib/ai-guide";
export function ArticleCard({ article }: { article: GuideArticle }) {
  return <article className="guide-card">
    <p className="guide-category">{article.category}</p>
    <h3>
      <Link href={guideHref(article.slug)}>{article.title}</Link>
    </h3>
    {article.excerpt && <p className="guide-excerpt">{article.excerpt}</p>}
    <div className="guide-card-bottom">
      <span>{article.author}</span>
      <span className={`guide-status ${article.status === "public_excerpt" ? "is-pending" : ""}`}>{article.status === "public_excerpt" ? "Pro 部分待补充" : "完整收录"}</span>
    </div>
    <Link className="guide-read" href={guideHref(article.slug)}>{article.status === "public_excerpt" ? "阅读公开部分" : "阅读全文"} <span aria-hidden="true">→</span>
    </Link>
  </article>;
}
export function GuideCollection({ kind, articles }: { kind: GuideArticle["kind"]; articles: GuideArticle[] }) {
  const categories = [...new Set(articles.map(a => a.category))];
  return <div className="guide-container">
    <Link className="guide-back" href="/ai-guide">← AI 实战指南</Link>
    <header className="guide-collection-hero">
      <p className="guide-eyebrow">Oil Book 授权收录</p>
      <h1>{collectionLabel(kind)}</h1>
      <p>{kind === "original" ? "从基础操作到工程实践，阅读作者的经验与方法。" : "值得反复阅读的文章与译文，保留原作者和原始来源。"}</p>
      <span>{articles.length} 篇文章</span>
    </header>
    <nav className="guide-category-nav" aria-label="文章分类">{categories.map((c, i) => <a href={`#category-${i}`} key={c}>{c}</a>)}</nav>
    {categories.map((category, i) => <section className="guide-section" id={`category-${i}`} key={category}>
      <div className="guide-section-heading">
        <h2>{category}</h2>
        <span>{articles.filter(a => a.category === category).length} 篇</span>
      </div>
      <div className="guide-grid">{articles.filter(a => a.category === category).map(a => <ArticleCard article={a} key={a.slug} />)}</div>
    </section>)}
  </div>;
}
