"use client";

// Browser-local progress store shared by every /learning page in this tab.
// All grading/progress rules live in assessment.mjs; this file only wires them
// to window.localStorage and React (useSyncExternalStore).
//
// - Nothing touches window during render: storage is read when the first
//   component subscribes (after hydration), and on native `storage` events
//   from other tabs.
// - Every write re-reads storage first and applies the change on top, so a
//   stale tab does not overwrite attempts another tab saved meanwhile.
// - A failed save keeps the change in memory and reports "unsaved"; it never
//   claims the data was persisted. Nothing is wiped, reset or exported.
import { useSyncExternalStore } from "react";
import {
  loadProgress,
  markRead,
  recordAttempt,
  saveProgress,
  setAttemptRubric,
  STORAGE_KEY,
  emptyProgress,
  type AttemptInput,
  type Progress,
  type ProgressNotice,
  type SaveResult,
  type StorageLike,
} from "@/lib/ai-learning/assessment.mjs";

export interface ProgressSnapshot {
  loaded: boolean;
  progress: Progress;
  loadNotice: ProgressNotice | null;
  loadWarning: "backup_failed" | null;
  backupKey: string | null;
  saveState: "idle" | "saved" | "unsaved";
  saveWarning: SaveResult["warning"];
}

const SERVER_SNAPSHOT: ProgressSnapshot = {
  loaded: false,
  progress: emptyProgress(),
  loadNotice: null,
  loadWarning: null,
  backupKey: null,
  saveState: "idle",
  saveWarning: null,
};

let snapshot: ProgressSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

// Some browsers throw on the localStorage getter itself (blocked cookies, sandboxed iframes).
function getStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function setSnapshot(next: ProgressSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

// Pulls the saved record into memory. Unsaved in-memory changes win, so a
// failed save is not silently discarded by a later reload.
function reload() {
  if (snapshot.loaded && snapshot.saveState === "unsaved") return;
  const result = loadProgress(getStorage());
  setSnapshot({
    ...snapshot,
    loaded: true,
    progress: result.data,
    loadNotice: result.notice,
    loadWarning: result.warning,
    backupKey: result.backupKey ?? snapshot.backupKey,
  });
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  if (event.storageArea !== getStorage()) return;
  reload();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    // First subscriber on this page (fresh load or client-side navigation): read storage now.
    queueMicrotask(reload);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function update(change: (progress: Progress) => Progress) {
  const storage = getStorage();
  // Start from what is stored right now (another tab may have written), unless
  // storage is unreadable/corrupt or we are holding unsaved changes.
  const fresh = storage && snapshot.saveState !== "unsaved" ? loadProgress(storage) : null;
  const base = fresh && fresh.notice === null ? fresh.data : snapshot.progress;
  const next = change(base);
  const result = saveProgress(storage, next);
  setSnapshot({
    ...snapshot,
    loaded: true,
    progress: next,
    backupKey: result.backupKey ?? snapshot.backupKey,
    saveState: result.ok ? "saved" : "unsaved",
    saveWarning: result.warning,
  });
}

const nowIso = () => new Date().toISOString();

export function markLessonRead(lessonId: string, version: string) {
  update((p) => markRead(p, lessonId, version, nowIso()));
}

export function submitAttempt(lessonId: string, input: Omit<AttemptInput, "at">) {
  update((p) => recordAttempt(p, lessonId, { ...input, at: nowIso() }));
}

export function updateRubric(lessonId: string, attemptIndex: number, checks: boolean[], done: boolean) {
  update((p) => setAttemptRubric(p, lessonId, attemptIndex, checks, done));
}
