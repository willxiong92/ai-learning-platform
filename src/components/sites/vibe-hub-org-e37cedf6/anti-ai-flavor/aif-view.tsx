"use client";

import type sections from "@/lib/vibehub/aif-data.json";
type AifSection = (typeof sections)[number];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AifView({ sections }: { sections: AifSection[] }) {
  return (
    <div className="catalog-page aif-catalog-page">
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <nav className="cat-chips" aria-label="防止 AI 味儿">
            {sections.map((s) => (
              <button key={s.id} type="button" onClick={() => scrollToSection(s.id)}>
                {s.title}
              </button>
            ))}
          </nav>
        </aside>
        <div className="grid-wrap">
          <header className="aif-catalog-heading">
            <p>AI 味儿图鉴</p>
            <h1>防止 AI 味儿</h1>
            <div>
              把常见的 AI 口癖、套模板的页面和不好用的交互当成词条来认。每条都给出原句或原页面、正常用法和具体改法。
            </div>
            <small>单个词、视觉元素或交互问题不能证明作者。判断时要看它是否与其他默认选择成组出现。</small>
          </header>

          {sections.map((s) => (
            <section className="cat-section" key={s.id} id={s.id}>
              <div className="cat-title aif-cat-title">
                <div>
                  {s.title}
                  <small>{s.subtitle}</small>
                </div>
                <span>{s.cards.length} 个表现</span>
              </div>
              <div className="grid">
                {s.cards.map((c) => (
                  <article className="card aif-term-card" data-id={c.id} key={c.id}>
                    <a href={`#aif-${c.id}`}>
                      <div className="card-head">
                        <div className="card-title-group">
                          <h3>{c.title}</h3>
                        </div>
                      </div>
                      <div className="card-tagline card-quote">{c.quote}</div>
                      {c.demoHTML && (
                        <div className="card-demo" dangerouslySetInnerHTML={{ __html: c.demoHTML }} />
                      )}
                    </a>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
