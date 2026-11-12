"use client";

import { useId, useState } from "react";
import type { CrmFeedbackQuestion } from "@/lib/crm-ai-practice/types";

export function LessonQuestion({ item, number }: { item: CrmFeedbackQuestion; number: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const feedbackId = useId();
  const answer = selected === null ? undefined : item.options[selected];

  return (
    <fieldset className="crm-quiz">
      <legend>{number}. {item.question}</legend>
      <div className="crm-options">
        {item.options.map((option, index) => (
          <button
            type="button"
            className="crm-option"
            key={option.text}
            aria-pressed={selected === index}
            aria-describedby={selected === index ? feedbackId : undefined}
            onClick={() => setSelected(index)}
          >
            <span aria-hidden="true">{String.fromCharCode(65 + index)}. </span>
            {option.text}
          </button>
        ))}
      </div>
      <div id={feedbackId} aria-live="polite" aria-atomic="true">
        {answer && (
          <p className={`crm-feedback ${answer.correct ? "is-correct" : "is-retry"}`}>
            <strong>{answer.correct ? "判断符合材料。" : "再对照一下材料。"}</strong>
            {answer.feedback}
          </p>
        )}
      </div>
    </fieldset>
  );
}

export function HtmlDownload({ html, filename }: { html: string; filename: string }) {
  const [message, setMessage] = useState("");

  function download() {
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("已发起 HTML 文件下载。");
    } catch {
      setMessage("下载未能启动，请复制下方源码并保存为 .html 文件。");
    }
  }

  return (
    <>
      <button type="button" className="crm-button" onClick={download}>下载 HTML 参考文件</button>
      <span role="status">{message}</span>
    </>
  );
}
