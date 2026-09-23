// Progress controller behind progress-store.ts: keeps the in-memory snapshot,
// the list of changes not yet saved, and the read/replay/write cycle against
// an injected Storage-like object. No React and no window here, so node:test
// exercises exactly the code the pages run. Grading and the storage format
// stay in assessment.mjs.
//
// Why changes are kept as a list: when a save fails, the change stays in
// memory. Another tab may save meanwhile. On the next write we re-read what is
// stored and replay our unsaved changes on top of it, so neither tab's work is
// dropped. After a successful write the list is emptied, so nothing is
// replayed twice.
import {
  emptyProgress,
  loadProgress,
  markRead,
  recordAttempt,
  saveProgress,
  setAttemptRubric,
} from "./assessment.mjs";

const defaultNow = () => new Date().toISOString();
const defaultSchedule = (task) => queueMicrotask(task);

// Identity of an attempt without the rubric fields that updateRubric changes,
// so a rubric change finds its attempt even after another tab appended others.
function attemptKey(a) {
  const answers = Object.keys(a.answers)
    .sort()
    .map((k) => [k, a.answers[k]]);
  return JSON.stringify([a.version, a.at, a.aided, a.shortAnswer, answers]);
}

function lessonAttempts(progress, lessonId) {
  const lessons = progress.lessons;
  return Object.prototype.hasOwnProperty.call(lessons, lessonId) ? lessons[lessonId].attempts : [];
}

const replay = (changes, base) => changes.reduce((p, change) => change(p), base);

export function createProgressController({ getStorage, now = defaultNow, schedule = defaultSchedule, watch }) {
  const serverSnapshot = {
    loaded: false,
    progress: emptyProgress(),
    loadNotice: null,
    loadWarning: null,
    backupKey: null,
    saveState: "idle",
    saveWarning: null,
  };
  let snapshot = serverSnapshot;
  // Last progress known to be in storage (or the clean starting point).
  let committed = emptyProgress();
  // Changes applied in memory but not yet written, in call order.
  let pending = [];
  const listeners = new Set();
  let unwatch = null;

  // Some browsers throw on the localStorage getter itself.
  function readStorage() {
    try {
      return getStorage() ?? null;
    } catch {
      return null;
    }
  }

  function setSnapshot(next) {
    snapshot = next;
    for (const listener of [...listeners]) listener();
  }

  // Pulls the saved record into memory and replays unsaved changes on top, so
  // another tab's writes show up without discarding ours.
  function reload() {
    const fresh = loadProgress(readStorage(), { now });
    // Storage went away after we had data: keep what we know rather than blanking the page.
    if (!(fresh.notice === "unavailable" && snapshot.loaded)) committed = fresh.data;
    setSnapshot({
      ...snapshot,
      loaded: true,
      progress: replay(pending, committed),
      loadNotice: fresh.notice,
      loadWarning: fresh.warning,
      backupKey: fresh.backupKey ?? snapshot.backupKey,
    });
  }

  function apply(change) {
    const storage = readStorage();
    // Start from what is stored right now; if unreadable/corrupt, from what we last knew.
    const fresh = loadProgress(storage, { now });
    const base = fresh.notice === null ? fresh.data : committed;
    const changes = [...pending, change];
    // Invalid input throws here, before any state changes.
    const next = replay(changes, base);
    const result = saveProgress(storage, next, { now });
    if (result.ok) {
      pending = [];
      committed = next;
    } else {
      pending = changes;
      committed = base;
    }
    setSnapshot({
      ...snapshot,
      loaded: true,
      progress: next,
      backupKey: result.backupKey ?? snapshot.backupKey,
      saveState: result.ok ? "saved" : "unsaved",
      saveWarning: result.warning,
    });
  }

  function subscribe(listener) {
    listeners.add(listener);
    if (listeners.size === 1) {
      unwatch = watch ? watch(reload) : null;
      // First subscriber (fresh load or client-side navigation): read storage after hydration.
      schedule(reload);
    }
    return () => {
      if (!listeners.delete(listener)) return;
      if (listeners.size === 0 && unwatch) {
        unwatch();
        unwatch = null;
      }
    };
  }

  function updateRubric(lessonId, attemptIndex, checks, done) {
    // The index refers to the list the caller is showing; pin it to that attempt.
    const shown = lessonAttempts(snapshot.progress, lessonId);
    if (!Number.isInteger(attemptIndex) || attemptIndex < 0 || attemptIndex >= shown.length) return;
    const key = attemptKey(shown[attemptIndex]);
    const nth = shown.slice(0, attemptIndex).filter((a) => attemptKey(a) === key).length;
    const rubric = [...checks];
    apply((p) => {
      const list = lessonAttempts(p, lessonId);
      let seen = 0;
      for (let i = 0; i < list.length; i++) {
        if (attemptKey(list[i]) === key && seen++ === nth) return setAttemptRubric(p, lessonId, i, rubric, done);
      }
      return p;
    });
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    reload,
    markRead(lessonId, version) {
      const at = now();
      apply((p) => markRead(p, lessonId, version, at));
    },
    submitAttempt(lessonId, input) {
      const attempt = { ...input, at: now() };
      apply((p) => recordAttempt(p, lessonId, attempt));
    },
    updateRubric,
  };
}
