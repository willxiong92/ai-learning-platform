"use client";

// Small progress displays shared by the course map and lesson pages.
// Status always comes from deriveLessonStatus in the assessment core.
import { deriveLessonStatus, type AssessmentActivities } from "@/lib/ai-learning/assessment.mjs";
import { useProgress, type ProgressSnapshot } from "./progress-store";

const LOAD_NOTICE: Record<string, string> = {
  corrupt: "本机进度记录无法读取，已从空白开始",
  unsupported: "本机进度记录来自不认识的版本，已从空白开始",
  unavailable: "这个浏览器不允许本地存储：可以照常作答，但不会保存",
};

const SAVE_WARNING: Record<string, string> = {
  unavailable: "浏览器不允许本地存储",
  backup_failed: "旧记录备份失败，为避免覆盖没有写入",
  write_failed: "写入失败（可能是存储空间已满）",
};

/** Load and save problems, in plain words. Renders nothing when everything is fine. */
export function ProgressStorageNotice({ state }: { state?: ProgressSnapshot }) {
  const own = useProgress();
  const s = state ?? own;
  if (!s.loaded) return null;
  const lines: string[] = [];
  if (s.loadNotice) {
    const backup = s.backupKey ? `（原记录已备份在本浏览器：${s.backupKey}）` : "";
    lines.push(`${LOAD_NOTICE[s.loadNotice]}${s.loadNotice === "unavailable" ? "" : backup}。`);
  }
  if (s.loadWarning === "backup_failed") lines.push("原记录备份失败，本页不会覆盖它。");
  if (s.saveState === "unsaved") {
    lines.push(
      `刚才的操作没有保存到本浏览器（${SAVE_WARNING[s.saveWarning ?? "write_failed"]}）：本页仍可继续，但刷新或关闭后会丢失。`,
    );
  }
  if (lines.length === 0) return null;
  return (
    <div className="ai-learning-warning" role="status">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

/** Saved local status for one available lesson on the course map. */
export function LessonMapProgress({ lessonId, activities }: { lessonId: string; activities?: AssessmentActivities }) {
  const { loaded, progress } = useProgress();
  if (!loaded || !activities) return null;
  const status = deriveLessonStatus(progress.lessons[lessonId], activities);
  return (
    <span className={`ai-learning-badge is-progress is-${status.key}`} title="只保存在当前浏览器">
      本机：{status.label}
    </span>
  );
}
