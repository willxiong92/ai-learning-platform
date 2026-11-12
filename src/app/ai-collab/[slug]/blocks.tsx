import type { CollabBlock, CollabPrinciple } from "@/lib/collab-handbook";
import { CopyButton } from "../collab-copy";

// 详情页部件。版式参考课程页的图解框（标题 + 灰色副标题 + 左右对照），字号放大到正文可读。
// 文字全部来自母源，经同步脚本渲染、校验过；这里只负责排版，网站自己只加很短的栏目标签。

function H({ html, as: Tag = "span", className }: { html: string; as?: "span" | "p" | "div" | "dd"; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Figure({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <figure className={`cb-figure ${className}`}>
      <figcaption>
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </figcaption>
      {children}
    </figure>
  );
}

function Notes({ items, kind }: { items?: string[]; kind: "lead" | "note" }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((html, i) => (
        <H key={i} as="p" className={`cb-${kind}`} html={html} />
      ))}
    </>
  );
}

export function PrincipleCard({ p, related = false }: { p: CollabPrinciple; related?: boolean }) {
  return (
    <div className={`cb-principle${related ? " is-related" : ""}`}>
      <div className="cb-principle-id">
        <small>{related ? "也碰到了" : "背后的原理"}</small>
        <b>
          {p.id} {p.name}
        </b>
        <span className="collab-badge">
          {p.status} · {p.caseCount} 条案例
        </span>
      </div>
      <div className="cb-principle-body">
        <p className="cb-principle-headline">{p.headline}</p>
        <p>{p.summary}</p>
      </div>
    </div>
  );
}

export function Block({ block }: { block: CollabBlock }) {
  switch (block.type) {
    case "chat":
      return (
        <div className="cb-chat">
          {block.items.map((item, i) => (
            <div className={`cb-chat-row is-${item.who}`} key={i}>
              <i aria-hidden="true">{item.who === "me" ? "我" : "AI"}</i>
              <div>
                <small>{item.label}</small>
                <H as="p" html={item.html} />
              </div>
            </div>
          ))}
        </div>
      );

    case "versus":
      return (
        <div className="cb-versus">
          {[block.left, block.right].map((side) => (
            <section className={`is-${side.tone}`} key={side.label}>
              <header>
                <b>{side.label}</b>
                <span>{side.tag}</span>
              </header>
              <dl>
                {side.items.map((item) => (
                  <div key={item.k}>
                    <dt>{item.k}</dt>
                    <H as="dd" html={item.html} />
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      );

    case "takeaway":
    case "summary":
      return (
        <div className={`cb-strip is-${block.type}`}>
          <b>{block.label}</b>
          <H as="p" html={block.html} />
        </div>
      );

    case "analogy":
      return (
        <div className="cb-strip is-analogy">
          <b>这像什么</b>
          <H as="p" html={block.html} />
        </div>
      );

    case "details":
      return (
        <details className="cb-details">
          <summary>{block.summary}</summary>
          <H as="div" className="term-article collab-article" html={block.html} />
        </details>
      );

    case "contrast":
      return (
        <Figure title={block.title} sub="左边是当时以为的，右边是实际缺的" className="is-contrast">
          <ol className="cb-contrast">
            {block.rows.map((row, i) => (
              <li key={i}>
                <div className="cb-contrast-left">
                  <H as="p" className="cb-contrast-head" html={row.head} />
                  <p className="cb-contrast-before">
                    当时看起来：<H html={row.before} />
                  </p>
                </div>
                <span className="cb-arrow" aria-hidden="true">
                  →
                </span>
                <div className="cb-contrast-right">
                  <H as="p" html={row.after} />
                  <H as="p" className="cb-term" html={row.term} />
                </div>
              </li>
            ))}
          </ol>
        </Figure>
      );

    case "principle":
      return <PrincipleCard p={block} />;

    case "myths":
      return (
        <Figure title={block.title} sub="以为的 → 实际的" className="is-myths">
          <ul className="cb-grid">
            {block.items.map((item, i) => (
              <li key={i}>
                <p className="cb-myth">
                  <small>以为</small>
                  <H html={item.myth} />
                </p>
                <p className="cb-fact">
                  <small>其实</small>
                  <H html={item.fact} />
                </p>
                <H as="p" className="cb-term" html={item.term} />
              </li>
            ))}
          </ul>
        </Figure>
      );

    case "cards":
      return (
        <Figure title={block.title} className="is-cards">
          <ul className="cb-grid">
            {block.items.map((item, i) => (
              <li key={i}>
                <H as="p" className="cb-card-title" html={item.title} />
                <H as="p" html={item.html} />
              </li>
            ))}
          </ul>
        </Figure>
      );

    case "checklist":
      return (
        <Figure title={block.title} className="is-checklist">
          <Notes items={block.lead} kind="lead" />
          <ol className="cb-checklist">
            {block.items.map((item, i) => (
              <li key={i} className={item.title ? "" : "no-title"}>
                <i>{i + 1}</i>
                {item.title && <H as="p" className="cb-check-title" html={item.title} />}
                <H as="p" html={item.html} />
              </li>
            ))}
          </ol>
          <Notes items={block.notes} kind="note" />
        </Figure>
      );

    case "lead":
    case "note":
      return <H as="p" className={`cb-${block.type}`} html={block.html} />;

    case "steps":
      return (
        <Figure title={block.title} sub={`${block.items.length} 步，每步都有可以直接说的话`} className="is-steps">
          <Notes items={block.lead} kind="lead" />
          <ol className={`cb-steps has-${block.items.length}`}>
            {block.items.map((item, i) => (
              <li key={i}>
                <p className="cb-step-name">
                  <i>{i + 1}</i>
                  <H html={item.step} />
                </p>
                <H as="p" className="cb-step-what" html={item.what} />
                <H as="p" className="cb-step-say" html={item.say} />
              </li>
            ))}
          </ol>
          <Notes items={block.notes} kind="note" />
        </Figure>
      );

    case "paradigm":
      return (
        <Figure title={`沟通范式：${block.title}`} sub="简版和完整版，挑一个复制" className="is-paradigm">
          <div className="cb-strip is-when">
            <b>什么时候用</b>
            <H as="p" html={block.when} />
          </div>
          <div className="cb-paradigm">
            <section className="is-short">
              <header>
                <b>简版</b>
                <H html={block.short.note} />
              </header>
              <H as="p" className="cb-say-quote" html={block.short.html} />
              <CopyButton text={block.short.text} label="复制这句" />
            </section>
            <section className="is-full">
              <header>
                <b>完整版</b>
                <H html={block.full.note} />
              </header>
              <pre>{block.full.text}</pre>
              <CopyButton text={block.full.text} label="复制模板" />
            </section>
          </div>
          <div className="cb-diff">
            {block.diff.map((html, i) => (
              <H key={i} as="p" html={html} />
            ))}
          </div>
          <Notes items={block.notes} kind="note" />
        </Figure>
      );

    case "quiz":
      return (
        <div className="cb-quiz">
          <div>
            <small>题目</small>
            <H as="p" html={block.question} />
          </div>
          <details>
            <summary>先自己想，再点开参考答案</summary>
            <H as="p" html={block.answer} />
          </details>
        </div>
      );
  }
}
