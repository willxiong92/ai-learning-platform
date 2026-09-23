import Link from "next/link";
import type { Term } from "@/lib/vibehub/types";
import { QuizBlock } from "@/components/sites/vibe-hub-org-e37cedf6/shared/quiz-block";
import { PronunciationButton } from "@/components/sites/vibe-hub-org-e37cedf6/shared/pronunciation-button";

/** Full term write-up: hero, AI course article (if any), AI prompt, quiz, distinctions, anatomy, variants,
 * scenarios, references. Shared between the standalone /[id] page and the
 * embedded reveal panel on /practice (which skips the cat breadcrumb). */
export function TermDetailBody({ term, embedded = false }: { term: Term; embedded?: boolean }) {
  return (
    <div className={embedded ? "detail is-embedded" : undefined}>
      <div className={`detail-body detail-entry-${term.id}`}>
        <section className="detail-hero" id="detail-hero">
          <div className="dh-head">
            <h1>
              {term.cn}
              <span>{term.name}</span>
            </h1>
            <PronunciationButton name={term.name} />
          </div>
          {!embedded && (
            <div className="breadcrumb-cat">
              <Link href={`/#cat-${term.cat}`}>{term.cat}</Link>
            </div>
          )}

          {term.quote && (
            <section>
              <div className="section-title">你可能会说</div>
              <blockquote className="dh-quote">{term.quote}</blockquote>
            </section>
          )}

          <p className="dh-desc">{term.desc}</p>

          {term.aliases && term.aliases.length > 0 && (
            <p className="dh-aliases">
              也常被叫作
              {term.aliases.map((a) => (
                <span className="alias-tag" key={a}>
                  {a}
                </span>
              ))}
            </p>
          )}
        </section>

        {term.article && (
          <section className="term-article" aria-label={`${term.cn}详解`} dangerouslySetInnerHTML={{ __html: term.article }} />
        )}

        {term.aiPrompt && (
          <section className="lesson-agent-prompt" aria-labelledby="lesson-agent-title">
            <h2 id="lesson-agent-title">你可以这样告诉 AI Agent</h2>
            <blockquote>
              <span className="lesson-agent-quote" aria-hidden="true">
                “
              </span>
              <p>{term.aiPrompt}</p>
            </blockquote>
          </section>
        )}

        {term.quiz && term.quiz.options.length > 0 && <QuizBlock quiz={term.quiz} />}

        {term.distinctionsDetail && term.distinctionsDetail.length > 0 && (
          <section className="distinctions">
            <div className="section-title">容易混淆？这样区分</div>
            <div className="distinction-grid">
              {term.distinctionsDetail.map((d, i) => (
                <div className="distinction-card" key={i} dangerouslySetInnerHTML={{ __html: d.html }} />
              ))}
            </div>
          </section>
        )}

        {term.anatomy && (
          <section>
            <div className="section-title">组成结构 · Anatomy</div>
            <div className="anat-wrap">
              {term.anatomy.stageHtml && (
                <div className="anat-stage" dangerouslySetInnerHTML={{ __html: term.anatomy.stageHtml }} />
              )}
              {term.anatomy.parts.length > 0 && (
                <div className="anat-parts">
                  {term.anatomy.parts.map((p, i) => (
                    <div className="anat-part" key={i}>
                      <span className="idx">{p.idx}</span>
                      <span className="pn">{p.name}</span>
                      <span className="pe">{p.en}</span>
                      <span className="pd">{p.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {term.variants && term.variants.length > 0 && (
          <section>
            <div className="section-title">常见变体 · Variants</div>
            <div className="variant-grid">
              {term.variants.map((v, i) => (
                <div className="variant-card" key={i}>
                  <div className="variant-name">
                    {v.name}
                    <span>{v.en}</span>
                  </div>
                  {v.demoHtml && <div className="variant-demo" dangerouslySetInnerHTML={{ __html: v.demoHtml }} />}
                  <div className="variant-when">{v.when}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {term.scenarios && term.scenarios.length > 0 && (
          <section className="scenes">
            <div className="section-title">典型使用场景</div>
            <div className="scene-list">
              {term.scenarios.map((s, i) => (
                <div className="scene-item" key={i}>
                  <div className="scene-cap">{s.caption}</div>
                  {s.html && <div className="scene-shot is-plain" dangerouslySetInnerHTML={{ __html: s.html }} />}
                </div>
              ))}
            </div>
          </section>
        )}

        {term.references && term.references.length > 0 && (
          <section className="references-section">
            <div className="section-title">延伸阅读 · 权威出处</div>
            <div className="reference-list">
              {term.references.map((r, i) => (
                <a className="reference-link" href={r.href} target="_blank" rel="noopener noreferrer" key={i}>
                  <span className="reference-title">{r.title}</span>
                  {r.sub && <span className="reference-sub">{r.sub}</span>}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
