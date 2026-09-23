// Type declarations for progress-controller.mjs (used by progress-store.ts).
import type { AttemptInput, Progress, ProgressNotice, SaveResult, StorageLike } from "./assessment.mjs";

export interface ProgressSnapshot {
  loaded: boolean;
  progress: Progress;
  loadNotice: ProgressNotice | null;
  loadWarning: "backup_failed" | null;
  backupKey: string | null;
  saveState: "idle" | "saved" | "unsaved";
  saveWarning: SaveResult["warning"];
}

export interface ProgressControllerOptions {
  /** May throw or return null; both mean "storage unavailable". */
  getStorage: () => StorageLike | null | undefined;
  now?: () => string;
  /** Runs the first read after subscribe; defaults to queueMicrotask. */
  schedule?: (task: () => void) => void;
  /** Called on the first subscriber; call onExternalChange when another tab writes. Returns an unwatch function. */
  watch?: (onExternalChange: () => void) => () => void;
}

export interface ProgressController {
  subscribe(listener: () => void): () => void;
  getSnapshot(): ProgressSnapshot;
  getServerSnapshot(): ProgressSnapshot;
  reload(): void;
  markRead(lessonId: string, version: string): void;
  submitAttempt(lessonId: string, input: Omit<AttemptInput, "at">): void;
  /** attemptIndex refers to the attempts in the current snapshot. */
  updateRubric(lessonId: string, attemptIndex: number, checks: boolean[], done: boolean): void;
}

export function createProgressController(options: ProgressControllerOptions): ProgressController;
