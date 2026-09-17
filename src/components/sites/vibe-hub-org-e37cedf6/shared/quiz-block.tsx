"use client";

import { useState } from "react";
import type { TermQuiz } from "@/lib/vibehub/types";

export function QuizBlock({ quiz }: { quiz: TermQuiz }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <section className="lesson-practice" aria-labelledby="lesson-practice-title">
      <div className="lesson-practice-heading">
        <span className="lesson-practice-kicker">{quiz.kicker ?? "选择题"}</span>
        {quiz.hint && <span className="lesson-practice-hint">{quiz.hint}</span>}
      </div>
      <h2 id="lesson-practice-title">{quiz.question}</h2>
      <div className="lesson-practice-options">
        {quiz.options.map((opt, i) => (
          <label className="lesson-practice-option" key={i}>
            <input
              type="radio"
              name="quiz"
              checked={picked === i}
              onChange={() => setPicked(i)}
            />
            <span className="lesson-practice-marker" aria-hidden="true">
              {opt.marker}
            </span>
            <span className="lesson-practice-label">{opt.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
