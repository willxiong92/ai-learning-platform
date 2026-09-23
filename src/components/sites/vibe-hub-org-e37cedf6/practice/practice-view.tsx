"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getRouteForQuestion, getTerm, getTopicForTerm, ROUTE_TOPICS, TOPICS } from "@/lib/vibehub/data";
import type { PracticeQuestion } from "@/lib/vibehub/types";
import { TermDetailBody } from "@/components/sites/vibe-hub-org-e37cedf6/shared/term-detail-body";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROUTE_SLUGS = new Set(ROUTE_TOPICS.map((t) => t.slug));

// 练习范围两类：学习路线模块（m1–m6，跟课程走）和技术词典方向（ai、frontend…，按卡片所在方向）。
function inScope(q: PracticeQuestion, scope: string): boolean {
  if (scope === "all") return true;
  if (ROUTE_SLUGS.has(scope)) return getRouteForQuestion(q) === scope;
  return getTopicForTerm(q.termId)?.slug === scope;
}

// 旧链接（第 01 课正文里的“去练习”）写的是 ?scope=ai，指课程练习，按模块 1 处理。
const LEGACY_SCOPES: Record<string, string> = { ai: "m1" };

export function PracticeView({ questions }: { questions: PracticeQuestion[] }) {
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<string>("all");
  const [scopeOpen, setScopeOpen] = useState(false);
  const [order, setOrder] = useState<PracticeQuestion[]>(questions);
  const [index, setIndex] = useState(0);
  const [optionOrder, setOptionOrder] = useState<string[]>(() => questions[0]?.options.map((o) => o.id) ?? []);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [correctPicked, setCorrectPicked] = useState(false);
  // “写一写”卡（AI 课程）：写的内容只留在这一题里，换题即清空，不计分也不保存。
  const [draft, setDraft] = useState("");

  const scopeTriggerRef = useRef<HTMLButtonElement>(null);

  const scopeOptions = useMemo(() => {
    const count = (slug: string) => questions.filter((q) => inScope(q, slug)).length;
    return [
      { slug: "all", label: "全部", count: questions.length },
      ...ROUTE_TOPICS.map((t) => ({
        slug: t.slug,
        label: `模块 ${t.route!.order} · ${t.label}${t.route!.writing ? "（课程编写中）" : ""}`,
        count: count(t.slug),
      })),
      ...TOPICS.map((t) => ({ slug: t.slug, label: `技术词典 · ${t.label}`, count: count(t.slug) })),
    ].filter((o) => o.count > 0);
  }, [questions]);

  // 课程页、术语页的“去练习”链接带 ?scope=m1 这类参数：进来时直接切到对应范围。
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("scope");
    const wanted = raw ? LEGACY_SCOPES[raw] ?? raw : null;
    if (wanted && wanted !== "all" && scopeOptions.some((o) => o.slug === wanted)) setScope(wanted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMounted(true);
    const scoped = questions.filter((q) => inScope(q, scope));
    setOrder(shuffle(scoped));
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const current = order[index] ?? questions[0];

  useEffect(() => {
    if (!current) return;
    setOptionOrder(shuffle(current.options.map((o) => o.id)));
    setWrongIds(new Set());
    setCorrectPicked(false);
    setDraft("");
  }, [current]);

  function selectScope(slug: string) {
    setScope(slug);
    setScopeOpen(false);
  }

  function pickOption(optId: string) {
    if (correctPicked) return;
    const opt = current.options.find((o) => o.id === optId);
    if (!opt) return;
    if (opt.correct) {
      setCorrectPicked(true);
    } else {
      setWrongIds((prev) => new Set(prev).add(optId));
    }
  }

  function nextQuestion() {
    if (index + 1 >= order.length) {
      const scoped = questions.filter((q) => inScope(q, scope));
      setOrder(shuffle(scoped));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!current) return null;

  const term = getTerm(current.termId);
  const write = current.kind === "write" ? current.write : undefined;
  const orderedOptions = optionOrder.map((id) => current.options.find((o) => o.id === id)!).filter(Boolean);
  const lastPicked = correctPicked
    ? current.options.find((o) => o.correct)
    : wrongIds.size > 0
      ? current.options.find((o) => o.id === Array.from(wrongIds).at(-1))
      : null;
  const scopeLabel = scopeOptions.find((s) => s.slug === scope)?.label ?? "全部";
  const scopeCount = scopeOptions.find((s) => s.slug === scope)?.count ?? questions.length;

  return (
    <div className={`practice-page practice-question${mounted ? " is-ready" : ""}`}>
      <div className="practice-question-layout">
        <section className="practice-answer-panel" aria-labelledby="practice-question-title">
          <h1 id="practice-question-title">{current.title}</h1>
          {write ? (
            <div className="practice-write">
              {write.steps.length > 0 && (
                <ol className="practice-write-steps">
                  {write.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
              <label className="sr-only" htmlFor="practice-write-input">
                写下你的回答
              </label>
              <textarea
                id="practice-write-input"
                className="practice-write-input"
                rows={5}
                placeholder={write.placeholder ?? "用自己的话写几句"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {write.hint && !correctPicked && <p className="practice-write-hint">提示：{write.hint}</p>}
              {!correctPicked && (
                <button className="practice-primary-action" type="button" onClick={() => setCorrectPicked(true)}>
                  看解析
                  <i className="ti ti-eye" aria-hidden="true" />
                </button>
              )}
              {correctPicked && (
                <div className="practice-feedback is-correct practice-write-answer" role="status" aria-live="polite">
                  <strong>解析</strong>
                  {write.answer && <p>{write.answer}</p>}
                  {write.points.length > 0 && (
                    <>
                      <p className="practice-write-points-title">对照这几条要点，看看自己写到了哪些：</p>
                      <ul>
                        {write.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
          <fieldset className="practice-options">
            <legend className="sr-only">你会怎么处理？</legend>
            {orderedOptions.map((opt, i) => {
              const isWrong = wrongIds.has(opt.id);
              const isCorrectMark = correctPicked && opt.correct;
              const cls = isCorrectMark ? "practice-option is-correct" : isWrong ? "practice-option is-incorrect" : "practice-option";
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={cls}
                  aria-pressed={isWrong || isCorrectMark}
                  disabled={correctPicked}
                  onClick={() => pickOption(opt.id)}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  <b>{opt.label}</b>
                  {isCorrectMark && <i className="ti ti-check" aria-hidden="true" />}
                  {isWrong && !correctPicked && <i className="ti ti-x" aria-hidden="true" />}
                </button>
              );
            })}
          </fieldset>
          )}
          {!write && lastPicked && (
            <div className={`practice-feedback ${correctPicked ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite">
              <strong>{correctPicked ? "答对了" : "还不对"}</strong>
              <p>{lastPicked.feedback}</p>
            </div>
          )}
          {correctPicked && (
            <button className="practice-primary-action" type="button" onClick={nextQuestion}>
              继续下一题
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          )}
        </section>

        <section className="practice-detail-column" aria-label="对应术语详情">
          <header className="practice-run-head">
            <div className="practice-loop-copy">
              <span>第 {index + 1} 题</span>
            </div>
            <div className="practice-scope-picker">
              <span id="practice-scope-label">练习方向</span>
              <div className="practice-scope-select">
                <button
                  ref={scopeTriggerRef}
                  type="button"
                  className="practice-scope-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={scopeOpen}
                  aria-labelledby="practice-scope-label practice-scope-value"
                  onClick={() => setScopeOpen((v) => !v)}
                >
                  <span className="practice-scope-value" id="practice-scope-value">
                    {scopeLabel}（{scopeCount}）
                  </span>
                  <i className="practice-scope-chevron" aria-hidden="true" />
                </button>
                {scopeOpen && (
                  <div className="practice-scope-menu" role="listbox">
                    {scopeOptions.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        role="option"
                        aria-selected={scope === s.slug}
                        className={`practice-scope-option${scope === s.slug ? " is-selected" : ""}`}
                        onClick={() => selectScope(s.slug)}
                      >
                        <span>
                          {s.label} ({s.count})
                        </span>
                        <i className="ti ti-check" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {correctPicked && term ? (
            <div className="practice-term-panel is-revealed">
              <Link className="practice-term-open" href={`/${term.id}`} target="_blank" rel="noreferrer" aria-label={`在新标签页打开${term.cn}`}>
                <span>{term.cn}</span>
                <i className="ti ti-arrow-up-right" aria-hidden="true" />
              </Link>
              <div className="practice-term-content">
                <TermDetailBody term={term} embedded />
              </div>
            </div>
          ) : (
            <div className="practice-term-panel is-locked">
              <div className="practice-detail-lock">
                <i className="ti ti-eye-off" aria-hidden="true" />
                <span>{write ? "看解析后查看完整术语详情" : "答对后查看完整术语详情"}</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
