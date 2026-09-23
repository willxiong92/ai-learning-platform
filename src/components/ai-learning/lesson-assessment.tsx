"use client";

// Live "mark read + quiz + self-check" block at the end of an available lesson.
// Flow: read → answer → submit → per-question feedback → short-answer
// self-check → optional retry with a fresh form. Everything is stored only in
// this browser (progress-store.ts); status comes from deriveLessonStatus.
import { useState } from "react";
import {
  deriveLessonStatus,
  type AssessmentActivities,
  type Attempt,
  type QuizGrade,
} from "@/lib/ai-learning/assessment.mjs";
import { ProgressStorageNotice } from "./learning-progress";
import { markLessonRead, submitAttempt, updateRubric, useProgress } from "./progress-store";
import { QuizForm, type QuizSubmission } from "./quiz-form";

interface Props {
  lessonId: string;
  activities: AssessmentActivities;
  sections: { id: string; title: string }[];
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("zh-CN", { hour12: false });
};

function gradeLine(grade: QuizGrade, criticalRequired: boolean) {
  const need = `至少答对 ${grade.minCorrect} 题${criticalRequired && grade.results.some((r) => r.critical) ? "且关键题全对" : ""}`;
  return `答对 ${grade.correctCount}/${grade.total} · ${grade.passed ? "客观题达标" : `未达标（需${need}）`}`;
}

export function LessonAssessment({ lessonId, activities, sections }: Props) {
  const state = useProgress();
  const [retrying, setRetrying] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { quiz, version } = activities;
  const sectionTitle = (id: string) => sections.find((s) => s.id === id)?.title ?? id;

  const lesson = state.progress.lessons[lessonId];
  const status = deriveLessonStatus(lesson, activities);
  const latest = status.latest.attempt;
  const latestGrade = status.latest.grade;
  // Index of the latest current-version attempt in the stored list, for the rubric update.
  const latestIndex = lesson ? lesson.attempts.map((a) => a.version).lastIndexOf(version) : -1;
  const showForm = retrying || latest === null;

  function handleSubmit(submission: QuizSubmission) {
    submitAttempt(lessonId, { version, ...submission, rubricChecks: [], rubricDone: false });
    setRetrying(false);
  }

  function startRetry() {
    setFormKey((k) => k + 1);
    setRetrying(true);
  }

  return (
    <section id="assessment" className="ai-learning-assessment" aria-labelledby="assessment-title">
      <h2 id="assessment-title">本章测验与进度</h2>
      <p className="ai-learning-note">
        作答与进度只保存在当前浏览器，不上传；换浏览器或清除浏览器数据会丢失。这是自测，不是正式考试，也不代表人工验收。
      </p>
      <noscript>
        <p>需要启用 JavaScript 才能标记已读和作答。</p>
      </noscript>

      {!state.loaded ? (
        <p className="ai-learning-note" role="status">
          正在读取本机进度…
        </p>
      ) : (
        <>
          <ProgressStorageNotice state={state} />

          <div className="ai-learning-assessment-status" role="status" aria-live="polite">
            <p>
              <b>当前状态：</b>
              {status.label}
              {state.saveState === "saved" && <span className="ai-learning-note">（已保存到本浏览器）</span>}
            </p>
            {status.first.attempt && (
              <p className="ai-learning-note">
                首次作答：
                {status.first.isCurrent && status.first.grade
                  ? gradeLine(status.first.grade, quiz.rule.critical_required)
                  : "在旧版本教材上完成，不计入当前版本"}
              </p>
            )}
            {latestGrade && status.currentAttempts > 1 && (
              <p className="ai-learning-note">最近一次：{gradeLine(latestGrade, quiz.rule.critical_required)}</p>
            )}
            {(status.retakeCount > 0 || status.staleAttempts > 0 || status.aidedCount > 0) && (
              <p className="ai-learning-note">
                {[
                  status.retakeCount > 0 ? `重做 ${status.retakeCount} 次` : null,
                  status.staleAttempts > 0 ? `旧版本记录 ${status.staleAttempts} 次（保留，不计入）` : null,
                  status.aidedCount > 0 ? `参考笔记或 AI ${status.aidedCount} 次` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <p className="ai-learning-note">当前教材版本 {version}</p>
          </div>

          <div className="ai-learning-assessment-block">
            <h3>阅读</h3>
            {status.readCurrent ? (
              <p>
                已标记读完本版本
                {lesson?.readAt ? `（${formatTime(lesson.readAt)}）` : ""}。
              </p>
            ) : (
              <>
                {status.staleRead && <p className="ai-learning-note">之前读的是旧版本教材，本版本需要重新标记。</p>}
                <button type="button" className="ai-learning-button" onClick={() => markLessonRead(lessonId, version)}>
                  标记本章已读
                </button>
              </>
            )}
          </div>

          <div className="ai-learning-assessment-block">
            <h3>测验</h3>
            {showForm ? (
              <>
                {retrying && (
                  <button type="button" className="ai-learning-button" onClick={() => setRetrying(false)}>
                    取消重做，回到上次结果
                  </button>
                )}
                <QuizForm key={formKey} quiz={quiz} onSubmit={handleSubmit} />
              </>
            ) : (
              latest &&
              latestGrade && (
                <AttemptResult
                  activities={activities}
                  attempt={latest}
                  grade={latestGrade}
                  reviewSections={status.reviewSections}
                  sectionTitle={sectionTitle}
                  onRubricChange={(checks, done) => updateRubric(lessonId, latestIndex, checks, done)}
                  onRetry={startRetry}
                />
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}

interface ResultProps {
  activities: AssessmentActivities;
  attempt: Attempt;
  grade: QuizGrade;
  reviewSections: string[];
  sectionTitle: (id: string) => string;
  onRubricChange: (checks: boolean[], done: boolean) => void;
  onRetry: () => void;
}

function AttemptResult({ activities, attempt, grade, reviewSections, sectionTitle, onRubricChange, onRetry }: ResultProps) {
  const { quiz } = activities;
  const rubric = quiz.short_question.rubric;
  const checks = rubric.map((_, i) => attempt.rubricChecks[i] === true);

  return (
    <div className="ai-learning-result">
      <p>
        <b>{gradeLine(grade, quiz.rule.critical_required)}</b>
        <span className="ai-learning-note">（提交于 {formatTime(attempt.at)}）</span>
      </p>
      {reviewSections.length > 0 && (
        <p>
          建议回看：
          {reviewSections.map((id, i) => (
            <span key={id}>
              {i > 0 && "、"}
              <a href={`#${id}`}>{sectionTitle(id)}</a>
            </span>
          ))}
        </p>
      )}

      <ol className="ai-learning-result-list">
        {quiz.questions.map((q, i) => {
          // grade is recomputed by the core from saved answers; pass/fail is never read from storage.
          const r = grade.results[i];
          const chosen = r.chosen === null ? null : q.options[r.chosen];
          return (
            <li key={q.id} className={r.correct ? "is-correct" : "is-wrong"}>
              <p>
                <b>
                  第 {i + 1} 题 · {r.correct ? "答对" : r.answered ? "答错" : "未作答"}
                </b>
                {q.critical && <span className="ai-learning-badge">关键题</span>}
              </p>
              <p>{q.prompt}</p>
              <p className="ai-learning-note">你的选择：{chosen ? chosen.text : "无"}</p>
              {!r.correct && <p className="ai-learning-note">正确答案：{q.options[q.answer].text}</p>}
              {!r.correct && chosen?.feedback && <p>{chosen.feedback}</p>}
              <p>
                <b>解析：</b>
                {q.reason}
              </p>
              {!r.correct && (
                <p className="ai-learning-note">
                  回看：<a href={`#${q.section}`}>{sectionTitle(q.section)}</a>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <fieldset className="ai-learning-question">
        <legend>简答自查（不是 AI 评分）</legend>
        <p>{quiz.short_question.prompt}</p>
        <p className="ai-learning-note">你的回答：</p>
        <p className="ai-learning-multiline ai-learning-output">{attempt.shortAnswer}</p>
        {quiz.short_question.rubric_note && <p className="ai-learning-note">{quiz.short_question.rubric_note}</p>}
        {rubric.map((item, i) => (
          <label key={i} className="ai-learning-option">
            <input
              type="checkbox"
              checked={checks[i]}
              onChange={(event) => {
                const next = checks.slice();
                next[i] = event.target.checked;
                onRubricChange(next, attempt.rubricDone);
              }}
            />
            <span>{item}</span>
          </label>
        ))}
        {attempt.rubricDone ? (
          <p>
            已确认完成自查。{" "}
            <button type="button" className="ai-learning-button" onClick={() => onRubricChange(checks, false)}>
              撤回确认
            </button>
          </p>
        ) : (
          <button type="button" className="ai-learning-button" onClick={() => onRubricChange(checks, true)}>
            我已按要点完成自查
          </button>
        )}
      </fieldset>

      <button type="button" className="ai-learning-button is-primary" onClick={onRetry}>
        重新作答（空白新表单）
      </button>
    </div>
  );
}
