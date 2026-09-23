"use client";

// One fresh attempt: 6 single-choice questions + 1 short answer.
// Shows prompts and options only — no correct answers, explanations or rubric
// before submitting. Incomplete forms list what is missing instead of submitting.
import { useId, useRef, useState, type FormEvent } from "react";
import type { Quiz, QuizAnswers } from "@/lib/ai-learning/assessment.mjs";

export interface QuizSubmission {
  answers: QuizAnswers;
  shortAnswer: string;
  aided: boolean;
}

export function QuizForm({ quiz, onSubmit }: { quiz: Quiz; onSubmit: (submission: QuizSubmission) => void }) {
  const formId = useId();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [shortAnswer, setShortAnswer] = useState("");
  const [aided, setAided] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const missingRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittedRef.current) return;
    const gaps = quiz.questions.flatMap((q, i) => (q.id in answers ? [] : [`第 ${i + 1} 题未选择`]));
    if (shortAnswer.trim() === "") gaps.push("简答题未填写");
    if (gaps.length > 0) {
      setMissing(gaps);
      requestAnimationFrame(() => missingRef.current?.focus());
      return;
    }
    submittedRef.current = true;
    setSubmitting(true);
    onSubmit({ answers, shortAnswer, aided });
  }

  const short = quiz.short_question;

  return (
    <form className="ai-learning-quiz" onSubmit={handleSubmit} noValidate>
      {quiz.notice && <p className="ai-learning-note">{quiz.notice}</p>}
      {quiz.rule.text && <p className="ai-learning-note">达标规则：{quiz.rule.text}</p>}
      <p className="ai-learning-note">未提交的作答不会保存，刷新页面会清空。</p>

      {quiz.questions.map((q, i) => (
        <fieldset key={q.id} className="ai-learning-question">
          <legend>
            <span className="ai-learning-question-no">第 {i + 1} 题</span>
            {q.critical && <span className="ai-learning-badge">关键题</span>} {q.prompt}
          </legend>
          {q.options.map((option, optionIndex) => (
            <label key={optionIndex} className="ai-learning-option">
              <input
                type="radio"
                name={`${formId}-${q.id}`}
                checked={answers[q.id] === optionIndex}
                onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))}
              />
              <span>{option.text}</span>
            </label>
          ))}
        </fieldset>
      ))}

      <div className="ai-learning-question">
        <label htmlFor={`${formId}-short`}>
          <span className="ai-learning-question-no">简答</span> {short.prompt}
        </label>
        <textarea
          id={`${formId}-short`}
          className="ai-learning-textarea"
          rows={5}
          value={shortAnswer}
          placeholder={short.placeholder}
          onChange={(event) => setShortAnswer(event.target.value)}
        />
        <p className="ai-learning-note">简答不会自动评分：提交后按要点自己核对。</p>
      </div>

      <label className="ai-learning-option">
        <input type="checkbox" checked={aided} onChange={(event) => setAided(event.target.checked)} />
        <span>作答时参考了笔记或 AI（只做记录，不影响结果）</span>
      </label>

      {missing.length > 0 && (
        <div ref={missingRef} className="ai-learning-warning" role="alert" tabIndex={-1}>
          <p>还不能提交，请先补全：</p>
          <ul>
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="ai-learning-button is-primary" disabled={submitting}>
        {submitting ? "正在提交…" : "提交本次作答"}
      </button>
    </form>
  );
}
