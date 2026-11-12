import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EXERCISE_CELLS, PRACTICE_CASE, PRACTICE_LESSONS, getPracticeLesson, practiceLessonHref, practiceRef } from "@/lib/practice-path";
import { PRACTICE_CONTENT, PRACTICE_MATERIALS, type PracticeExercise, type PracticeMaterial } from "@/lib/practice-path/content";
import { PRACTICE_SOURCES } from "@/lib/practice-path/sources";
import { CopyButton } from "../../../ai-collab/collab-copy";
import "../../../ai-collab/ai-collab.css";
import "../../practice-path.css";

// 实践课详情（框架 v0 骨架）。版式照搬 AI 协作手册详情页：标题区左右两栏 + 左侧目录 + 结构化部件。
// 有正文的课按正文渲染；还没写的课保留「待填充」。材料都是教学模拟，方法要点的出处列在页尾。

export const dynamicParams = false;

export function generateStaticParams() {
  return PRACTICE_LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const lesson = getPracticeLesson((await params).id);
  if (!lesson) return {};
  return { title: `${lesson.no} ${lesson.title} · 实践｜AI 学习站` };
}

function sectionsFor(hasContent: boolean) {
  return [
    { id: "goal", title: "这一课做成什么" },
    ...(hasContent ? [{ id: "method", title: "先懂这几条" }] : []),
    { id: "exercises", title: "小练习" },
    { id: "refs", title: "回课程补课" },
    { id: "tools", title: "当前推荐工具和操作入口" },
    ...(hasContent ? [{ id: "sources", title: "出处" }] : []),
  ];
}

function Todo({ children }: { children?: React.ReactNode }) {
  return (
    <p className="pp-todo-line">
      <span className="pp-todo">待填充</span>
      {children}
    </p>
  );
}

function MaterialPack({ items }: { items: PracticeMaterial[] }) {
  return (
    <figure className="cb-figure pp-materials">
      <figcaption>
        <strong>本步材料包</strong>
        <span>全部是教学模拟，公司和人都是虚构的</span>
      </figcaption>
      <div className="pp-material-list">
        {items.map((m) => (
          <details key={m.id} id={`material-${m.id}`}>
            <summary>
              <b>{m.id}</b>
              {m.title}
              <small>{m.note}</small>
            </summary>
            <pre>{m.body}</pre>
          </details>
        ))}
      </div>
    </figure>
  );
}

function Exercise({ no, ex }: { no: string; ex: PracticeExercise }) {
  return (
    <figure className="cb-figure pp-exercise">
      <figcaption>
        <strong>
          练习 {no} · {ex.title}
        </strong>
      </figcaption>
      <div className="pp-exercise-grid">
        <div className="pp-exercise-do">
          <div>
            <small>{EXERCISE_CELLS[0]}</small>
            <p className="pp-material-refs">
              {ex.materials.map((id) => (
                <a key={id} href={`#material-${id}`}>
                  {id}
                </a>
              ))}
              {ex.materialNote}
            </p>
          </div>
          <div>
            <small>{EXERCISE_CELLS[1]}</small>
            <ol>
              {ex.task.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        </div>
        <div className="pp-exercise-check">
          <div>
            <small>{EXERCISE_CELLS[2]}</small>
            <ul>
              {ex.criteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <details>
            <summary>{EXERCISE_CELLS[3]}（先自己做，再点开）</summary>
            <div className="pp-reference">
              {ex.reference.note && <p className="cb-note">{ex.reference.note}</p>}
              {ex.reference.kind === "prompt" ? (
                <>
                  <pre>{ex.reference.text}</pre>
                  <CopyButton text={ex.reference.text} label="复制提示词" />
                </>
              ) : (
                <pre className="is-text">{ex.reference.text}</pre>
              )}
            </div>
          </details>
        </div>
      </div>
    </figure>
  );
}

export default async function PracticeLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const lesson = getPracticeLesson((await params).id);
  if (!lesson) notFound();
  const { step, prev, next } = lesson;
  const content = PRACTICE_CONTENT[lesson.id];
  const materials = PRACTICE_MATERIALS[step.n];
  const sections = sectionsFor(Boolean(content));

  return (
    <article className="collab-page collab-detail pp-page">
      <Link className="collab-back" href={`/practice#step-${step.n}`}>
        ← 返回实践 · 第 {step.n} 步
      </Link>

      <header className="collab-hero collab-detail-hero">
        <div>
          <p className="collab-kicker">
            实践 · 第 {step.n} 步 {step.title} · {lesson.no}
          </p>
          <h1>{lesson.title}</h1>
          <p className="collab-lead">
            <span className="collab-lead-label">一句话</span>
            {content ? content.oneLiner : <span className="pp-todo">待填充</span>}
          </p>
          <p className="collab-trial-note">
            <span className="collab-badge">{content ? "初稿" : "框架 v0"}</span>
            {content
              ? "练习材料是教学模拟；方法要点按公开资料改写，出处在页尾。参照只是一种做法，不是唯一答案。"
              : "课目标题是暂定的，练习内容、询盘材料和参照答案待填充。"}
          </p>
        </div>
        {/* 右栏：这一步在主线里的位置，上一步成果进、这一步成果出 */}
        <aside className="collab-hero-say pp-hero-flow" aria-label="主线位置">
          <p className="collab-say-label">主线 · {PRACTICE_CASE}</p>
          <dl>
            <div>
              <dt>拿到</dt>
              <dd>{step.input}</dd>
            </div>
            <div>
              <dt>留下</dt>
              <dd>{step.output}</dd>
            </div>
          </dl>
        </aside>
      </header>

      <div className="collab-layout">
        <nav className="collab-index" aria-label="本页目录">
          <p>本页目录</p>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="collab-article-wrap">
          <section className="collab-block" id="goal" aria-labelledby="goal-title">
            <h2 className="collab-block-title" id="goal-title">
              这一课做成什么
            </h2>
            <div className="cb-stack">
              <div className="cb-strip is-takeaway">
                <b>本课成果</b>
                {content ? <p>{content.outcome}</p> : <Todo />}
              </div>
              <div className="cb-strip">
                <b>为什么做</b>
                {content ? <p>{content.why}</p> : <Todo />}
              </div>
            </div>
          </section>

          {content && (
            <section className="collab-block" id="method" aria-labelledby="method-title">
              <h2 className="collab-block-title" id="method-title">
                先懂这几条
              </h2>
              <figure className="cb-figure is-checklist">
                <figcaption>
                  <strong>做这一课要用到的方法</strong>
                  <span>左边是要点，右边是为什么</span>
                </figcaption>
                <ol className="cb-checklist">
                  {content.principles.map((p, i) => (
                    <li key={p.point}>
                      <i>{i + 1}</i>
                      <p className="cb-check-title">{p.point}</p>
                      <p>{p.explain}</p>
                    </li>
                  ))}
                </ol>
              </figure>
            </section>
          )}

          <section className="collab-block" id="exercises" aria-labelledby="exercises-title">
            <h2 className="collab-block-title" id="exercises-title">
              小练习
            </h2>
            <div className="cb-stack">
              {content ? (
                <>
                  <p className="cb-lead">按顺序做。每个练习左边是材料和要做的事，右边是怎样算做好；参照折起来，自己做完再看。</p>
                  {materials && <MaterialPack items={materials} />}
                  {content.exercises.map((ex, k) => (
                    <Exercise key={ex.title} no={`${lesson.no}.${k + 1}`} ex={ex} />
                  ))}
                </>
              ) : (
                <>
                <p className="cb-lead">本课 3–4 个小练习，数量和内容填充时定。每个都按下面四格写：左边是材料和要做的事，右边是怎样算做好，参照先折起来，做完再看。</p>
                <figure className="cb-figure pp-exercise">
                  <figcaption>
                    <strong>练习 {lesson.no}.1</strong>
                    <span className="pp-todo">待填充</span>
                  </figcaption>
                  <div className="pp-exercise-grid">
                    <div className="pp-exercise-do">
                      <div>
                        <small>{EXERCISE_CELLS[0]}</small>
                        <Todo />
                      </div>
                      <div>
                        <small>{EXERCISE_CELLS[1]}</small>
                        <Todo />
                      </div>
                    </div>
                    <div className="pp-exercise-check">
                      <div>
                        <small>{EXERCISE_CELLS[2]}</small>
                        <Todo />
                      </div>
                      <details>
                        <summary>{EXERCISE_CELLS[3]}（先自己做，再点开）</summary>
                        <Todo>参照答案需要真实询盘材料，到位前不写</Todo>
                      </details>
                    </div>
                  </div>
                </figure>
                </>
              )}
            </div>
          </section>

          <section className="collab-block" id="refs" aria-labelledby="refs-title">
            <h2 className="collab-block-title" id="refs-title">
              回课程补课
            </h2>
            <figure className="cb-figure is-checklist">
              <figcaption>
                <strong>第 {step.n} 步对应的课程</strong>
                <span>卡住了再回去看，不用先学完</span>
              </figcaption>
              <ol className="cb-checklist">
                {step.refs.map((ref, i) => {
                  const r = practiceRef(ref);
                  return (
                    <li key={ref}>
                      <i>{i + 1}</i>
                      <p className="cb-check-title">
                        <Link href={r.href}>
                          {r.id} {r.title}
                        </Link>
                      </p>
                      {content?.refNotes[ref] ? <p>{content.refNotes[ref]}</p> : <Todo>这一课具体补哪一节</Todo>}
                    </li>
                  );
                })}
              </ol>
            </figure>
          </section>

          <section className="collab-block" id="tools" aria-labelledby="tools-title">
            <h2 className="collab-block-title" id="tools-title">
              当前推荐工具和操作入口
            </h2>
            <div className="cb-stack">
              <p className="cb-lead">正文写通用做法；用什么工具、从哪里进，只写在这里。工具换代时只改这一节。</p>
              <div className="cb-strip">
                <b>推荐工具</b>
                {content ? <p>{content.tools.recommend}</p> : <Todo />}
              </div>
              <div className="cb-strip">
                <b>操作入口</b>
                {content ? <p>{content.tools.entry}</p> : <Todo />}
              </div>
            </div>
          </section>

          {content && (
            <section className="collab-block" id="sources" aria-labelledby="sources-title">
              <h2 className="collab-block-title" id="sources-title">
                出处
              </h2>
              <ol className="pp-sources">
                {content.sources.map((key) => {
                  const src = PRACTICE_SOURCES[key];
                  return (
                    <li key={key}>
                      <a href={src.url} target="_blank" rel="noreferrer">
                        {src.title}
                      </a>
                      <small>{src.kind}</small>
                    </li>
                  );
                })}
              </ol>
              <p className="cb-note">方法要点是按这些资料拆解后改写的，不是原文。外部链接的内容可能更新，以原页面为准。</p>
            </section>
          )}

          <nav className="pp-pager" aria-label="上一课和下一课">
            {prev ? (
              <Link href={practiceLessonHref(prev.id)}>
                <small>上一课</small>
                {prev.no} {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="is-next" href={practiceLessonHref(next.id)}>
                <small>下一课</small>
                {next.no} {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>
    </article>
  );
}
