"use client";

// Browser-local progress store shared by every /learning page in this tab.
// All grading/progress rules live in assessment.mjs; the read/replay/write
// logic lives in progress-controller.mjs (tested in node). This file only
// wires the controller to window.localStorage and React (useSyncExternalStore).
//
// - Nothing touches window during render: storage is read when the first
//   component subscribes (after hydration), and on native `storage` events
//   from other tabs.
// - Every write re-reads storage first and replays unsaved changes on top, so
//   neither this tab nor another tab loses attempts.
// - A failed save keeps the change in memory and reports "unsaved"; it never
//   claims the data was persisted. Nothing is wiped, reset or exported.
import { useSyncExternalStore } from "react";
import { STORAGE_KEY, type AttemptInput, type StorageLike } from "@/lib/ai-learning/assessment.mjs";
import { createProgressController, type ProgressSnapshot } from "@/lib/ai-learning/progress-controller.mjs";

export type { ProgressSnapshot };

// Some browsers throw on the localStorage getter itself (blocked cookies, sandboxed iframes).
function getStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const controller = createProgressController({
  getStorage,
  watch(onExternalChange) {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      if (event.storageArea !== getStorage()) return;
      onExternalChange();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
});

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
}

export function markLessonRead(lessonId: string, version: string) {
  controller.markRead(lessonId, version);
}

export function submitAttempt(lessonId: string, input: Omit<AttemptInput, "at">) {
  controller.submitAttempt(lessonId, input);
}

export function updateRubric(lessonId: string, attemptIndex: number, checks: boolean[], done: boolean) {
  controller.updateRubric(lessonId, attemptIndex, checks, done);
}
