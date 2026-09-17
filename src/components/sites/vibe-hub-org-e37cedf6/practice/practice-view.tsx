"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getTerm, getTopicForTerm, TOPICS } from "@/lib/vibehub/data";
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

export function PracticeView({ questions }: { questions: PracticeQuestion[] }) {
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<string>("all");
  const [scopeOpen, setScopeOpen] = useState(false);
  const [order, setOrder] = useState<PracticeQuestion[]>(questions);
  const [index, setIndex] = useState(0);
  const [optionOrder, setOptionOrder] = useState<string[]>(() => questions[0]?.options.map((o) => o.id) ?? []);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [correctPicked, setCorrectPicked] = useState(false);

  const scopeTriggerRef = useRef<HTMLButtonElement>(null);

  const scopeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) {
      const topic = getTopicForTerm(q.termId);
      if (topic) counts.set(topic.slug, (counts.get(topic.slug) ?? 0) + 1);
    }
    return counts;
  }, [questions]);

  const scopeOptions = useMemo(
    () => [
      { slug: "all", label: "全部方向", count: questions.length },
      ...TOPICS.filter((t) => (scopeCounts.get(t.slug) ?? 0) > 0).map((t) => ({
        slug: t.slug,
        label: t.label,
        count: scopeCounts.get(t.slug) ?? 0,
      })),
    ],
    [questions.length, scopeCounts]
  );

  useEffect(() => {
    setMounted(true);
    const scoped = scope === "all" ? questions : questions.filter((q) => getTopicForTerm(q.termId)?.slug === scope);
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
      const scoped = scope === "all" ? questions : questions.filter((q) => getTopicForTerm(q.termId)?.slug === scope);
      setOrder(shuffle(scoped));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!current) return null;

  const term = getTerm(current.termId);
  const orderedOptions = optionOrder.map((id) => current.options.find((o) => o.id === id)!).filter(Boolean);
  const lastPicked = correctPicked
    ? current.options.find((o) => o.correct)
    : wrongIds.size > 0
      ? current.options.find((o) => o.id === Array.from(wrongIds).at(-1))
      : null;
  const scopeLabel = scopeOptions.find((s) => s.slug === scope)?.label ?? "全部方向";
  const scopeCount = scopeOptions.find((s) => s.slug === scope)?.count ?? questions.length;

  return (
    <div className={`practice-page practice-question${mounted ? " is-ready" : ""}`}>
      <div className="practice-question-layout">
        <section className="practice-answer-panel" aria-labelledby="practice-question-title">
          <h1 id="practice-question-title">{current.title}</h1>
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
          {lastPicked && (
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
                <span>答对后查看完整术语详情</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
