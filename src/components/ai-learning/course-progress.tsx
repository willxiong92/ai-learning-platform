"use client";

// Progress displays for the AI courses inside /courses. They read the same
// browser-local record as the lesson pages and "我的学习" (progress-store.ts),
// and every status comes from deriveLessonStatus, so the three places always
// agree. Before the record is read (server render, first paint) nothing
// pretends to know the learner's progress.
import Link from "next/link";
import { deriveLessonStatus, type AssessmentActivities } from "@/lib/ai-learning/assessment.mjs";
import { useProgress } from "./progress-store";

export interface CourseLessonProgressInput {
  id: string;
  href: string;
  title: string;
  activities: AssessmentActivities;
}

type Snapshot = ReturnType<typeof useProgress>;

function statusOf(state: Snapshot, lesson: CourseLessonProgressInput) {
  return deriveLessonStatus(state.progress.lessons[lesson.id], lesson.activities);
}

/** Status pill on one available chapter card. */
export function AiChapterStatus({ lessonId, activities }: { lessonId: string; activities: AssessmentActivities }) {
  const state = useProgress();
  if (!state.loaded) return <span className="course-status is-not-started">可试学</span>;
  const status = deriveLessonStatus(state.progress.lessons[lessonId], activities);
  if (status.key === "not_started") return <span className="course-status is-not-started">未开始</span>;
  if (status.key === "self_check_complete") {
    return (
      <span className="course-status is-completed" title={status.label}>
        本机自测完成
      </span>
    );
  }
  return <span className="course-status is-in-progress">{status.label}</span>;
}

/** "开始学习 / 继续学习" button plus the local progress line on a course overview. */
export function AiCourseActions({ lessons }: { lessons: CourseLessonProgressInput[] }) {
  const state = useProgress();
  const first = lessons[0];
  if (!first) return null;

  if (!state.loaded) {
    return (
      <div className="course-home-actions">
        <Link className="course-primary-link" href={first.href}>
          开始学习<span aria-hidden="true">→</span>
        </Link>
        <span className="course-progress-copy">正在读取本机学习记录…</span>
      </div>
    );
  }

  const rows = lessons.map((lesson) => ({ lesson, status: statusOf(state, lesson) }));
  const done = rows.filter((r) => r.status.key === "self_check_complete").length;
  const started = rows.some((r) => r.status.key !== "not_started");
  const target = rows.find((r) => r.status.key !== "self_check_complete");
  const label = !started ? "开始学习" : target ? "继续学习" : "回看课程";
  const href = (target ?? rows[0]).lesson.href;

  return (
    <div className="course-home-actions">
      <Link className="course-primary-link" href={href}>
        {label}
        {target && started ? ` 第 ${rows.indexOf(target) + 1} 章` : ""}
        <span aria-hidden="true">→</span>
      </Link>
      <span className="course-progress-copy" aria-live="polite">
        {target && started ? `下一步：${target.lesson.title}。` : ""}本机自测完成 {done} / {lessons.length} 章（只算可试学章节，记录只在当前浏览器）
      </span>
    </div>
  );
}

/** Short local-progress tag on a course card in /courses. Hidden until there is a record. */
export function AiCourseCardProgress({ lessons }: { lessons: Omit<CourseLessonProgressInput, "href" | "title">[] }) {
  const state = useProgress();
  if (!state.loaded) return null;
  const statuses = lessons.map((l) => deriveLessonStatus(state.progress.lessons[l.id], l.activities));
  if (statuses.every((s) => s.key === "not_started")) return null;
  const done = statuses.filter((s) => s.key === "self_check_complete").length;
  return <span>本机自测完成 {done}/{lessons.length}</span>;
}
