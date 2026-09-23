// Tests for the real progress controller used by progress-store.ts.
// Each "tab" is a controller instance; tabs share one in-memory Storage.
import { test } from "node:test";
import assert from "node:assert/strict";
import { STORAGE_KEY } from "../src/lib/ai-learning/assessment.mjs";
import { createProgressController } from "../src/lib/ai-learning/progress-controller.mjs";

let tick = 0;
const now = () => new Date(Date.UTC(2026, 8, 19, 0, 0, 0, tick++)).toISOString();

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const storage = {
    failWrites: false,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem(k, v) {
      if (storage.failWrites) throw new Error("QuotaExceededError");
      data.set(k, String(v));
    },
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
  return storage;
}

// Opens a tab and runs its first read synchronously. `external()` simulates a storage event.
function openTab(getStorage) {
  let onExternal = () => {};
  const tab = createProgressController({
    getStorage,
    now,
    schedule: (task) => task(),
    watch(fn) {
      onExternal = fn;
      return () => {};
    },
  });
  tab.subscribe(() => {});
  return { tab, external: () => onExternal() };
}

const attempt = (label) => ({
  version: "v1",
  answers: { q1: 0 },
  shortAnswer: label,
  rubricChecks: [],
  rubricDone: false,
  aided: false,
});

const stored = (storage) => JSON.parse(storage.getItem(STORAGE_KEY));
const storedLabels = (storage, lesson) => stored(storage).lessons[lesson].attempts.map((a) => a.shortAnswer);
const viewLabels = (tab, lesson) => tab.getSnapshot().progress.lessons[lesson].attempts.map((a) => a.shortAnswer);

test("first load reads storage only after subscribe", () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, lessons: { l1: { readVersion: "v1", readAt: "x", attempts: [] } } }),
  });
  let reads = 0;
  const queued = [];
  const tab = createProgressController({
    getStorage: () => {
      reads++;
      return storage;
    },
    now,
    schedule: (task) => queued.push(task),
  });
  assert.equal(tab.getSnapshot(), tab.getServerSnapshot());
  assert.equal(tab.getSnapshot().loaded, false);
  tab.subscribe(() => {});
  assert.equal(reads, 0, "no storage access during subscribe itself");
  queued.forEach((task) => task());
  const snap = tab.getSnapshot();
  assert.equal(snap.loaded, true);
  assert.equal(snap.loadNotice, null);
  assert.equal(snap.progress.lessons.l1.readVersion, "v1");
});

test("hydration: server snapshot is stable and snapshots only change on updates", () => {
  const storage = memoryStorage();
  const tab = createProgressController({ getStorage: () => storage, now, schedule: () => {} });
  const server = tab.getServerSnapshot();
  assert.equal(tab.getServerSnapshot(), server);
  assert.equal(tab.getSnapshot(), tab.getSnapshot());
  tab.subscribe(() => {});
  tab.reload();
  const loaded = tab.getSnapshot();
  assert.equal(tab.getSnapshot(), loaded);
  tab.markRead("l1", "v1");
  assert.notEqual(tab.getSnapshot(), loaded);
  assert.equal(tab.getServerSnapshot(), server);
  assert.equal(server.loaded, false);
  assert.deepEqual(server.progress, { schemaVersion: 1, lessons: {} });
});

test("ordinary writes are saved and visible to a fresh tab", () => {
  const storage = memoryStorage();
  const { tab } = openTab(() => storage);
  tab.markRead("l1", "v1");
  tab.submitAttempt("l1", attempt("first"));
  assert.equal(tab.getSnapshot().saveState, "saved");
  assert.equal(tab.getSnapshot().saveWarning, null);
  assert.deepEqual(storedLabels(storage, "l1"), ["first"]);
  const { tab: other } = openTab(() => storage);
  assert.equal(other.getSnapshot().progress.lessons.l1.readVersion, "v1");
  assert.deepEqual(viewLabels(other, "l1"), ["first"]);
});

test("A fails, B saves, A recovers: both kept, A's attempt exactly once", () => {
  const storage = memoryStorage();
  const { tab: a } = openTab(() => storage);
  const { tab: b } = openTab(() => storage);

  storage.failWrites = true;
  a.submitAttempt("l1", attempt("A"));
  assert.equal(a.getSnapshot().saveState, "unsaved");
  assert.equal(a.getSnapshot().saveWarning, "write_failed");
  assert.equal(storage.getItem(STORAGE_KEY), null);

  storage.failWrites = false;
  b.submitAttempt("l1", attempt("B"));
  assert.deepEqual(storedLabels(storage, "l1"), ["B"]);

  a.markRead("l1", "v1");
  assert.equal(a.getSnapshot().saveState, "saved");
  assert.deepEqual(storedLabels(storage, "l1"), ["B", "A"]);
  assert.equal(stored(storage).lessons.l1.readVersion, "v1");
  assert.deepEqual(viewLabels(a, "l1"), ["B", "A"]);

  // No second replay after the successful write.
  a.markRead("l1", "v1");
  assert.deepEqual(storedLabels(storage, "l1"), ["B", "A"]);
});

test("A fails on one lesson, B saves another lesson, A recovers: both lessons kept", () => {
  const storage = memoryStorage();
  const { tab: a } = openTab(() => storage);
  const { tab: b } = openTab(() => storage);

  storage.failWrites = true;
  a.submitAttempt("l1", attempt("A"));
  storage.failWrites = false;
  b.submitAttempt("l2", attempt("B"));
  a.markRead("l3", "v1");

  assert.deepEqual(storedLabels(storage, "l1"), ["A"]);
  assert.deepEqual(storedLabels(storage, "l2"), ["B"]);
  assert.equal(stored(storage).lessons.l3.readVersion, "v1");
  a.markRead("l3", "v1");
  assert.deepEqual(storedLabels(storage, "l1"), ["A"]);
});

test("storage event while unsaved shows the other tab's data and keeps ours", () => {
  const storage = memoryStorage();
  const { tab: a, external } = openTab(() => storage);
  const { tab: b } = openTab(() => storage);

  storage.failWrites = true;
  a.submitAttempt("l1", attempt("A"));
  storage.failWrites = false;
  b.submitAttempt("l1", attempt("B"));
  external();
  assert.deepEqual(viewLabels(a, "l1"), ["B", "A"]);
  assert.equal(a.getSnapshot().saveState, "unsaved");
  assert.deepEqual(storedLabels(storage, "l1"), ["B"], "a storage event does not write");
});

test("rubric targets the original attempt, not the same index of another tab's attempt", () => {
  const storage = memoryStorage();
  const { tab: a } = openTab(() => storage);
  const { tab: b } = openTab(() => storage);
  a.submitAttempt("l1", attempt("A0"));

  storage.failWrites = true;
  a.submitAttempt("l1", attempt("A1"));
  storage.failWrites = false;
  b.reload();
  b.submitAttempt("l1", attempt("B"));

  // A's view is [A0, A1]; index 1 is A1. In storage index 1 is B.
  assert.deepEqual(viewLabels(a, "l1"), ["A0", "A1"]);
  a.updateRubric("l1", 1, [true, false], true);

  const saved = stored(storage).lessons.l1.attempts;
  assert.deepEqual(saved.map((x) => x.shortAnswer), ["A0", "B", "A1"]);
  assert.deepEqual(saved[2].rubricChecks, [true, false]);
  assert.equal(saved[2].rubricDone, true);
  assert.deepEqual(saved[1].rubricChecks, []);
  assert.equal(saved[1].rubricDone, false);

  // After a refresh (new tab on the same storage) indexes follow the stored order.
  const { tab: refreshed } = openTab(() => storage);
  refreshed.updateRubric("l1", 1, [false, true], true);
  const after = stored(storage).lessons.l1.attempts;
  assert.deepEqual(after[1].rubricChecks, [false, true]);
  assert.deepEqual(after[2].rubricChecks, [true, false]);
  assert.equal(after.length, 3);
});

test("rubric change on a stale view still hits its attempt", () => {
  const storage = memoryStorage();
  const { tab: a } = openTab(() => storage);
  const { tab: b } = openTab(() => storage);
  a.submitAttempt("l1", attempt("A0"));
  b.reload();
  b.submitAttempt("l1", attempt("B"));
  a.submitAttempt("l1", attempt("A1"));
  // a's view is now [A0, B, A1]; b's view is stale at [A0, B].
  b.updateRubric("l1", 1, [true], true);
  const saved = stored(storage).lessons.l1.attempts;
  assert.deepEqual(saved.map((x) => x.shortAnswer), ["A0", "B", "A1"]);
  assert.equal(saved[1].rubricDone, true);
  assert.equal(saved[2].rubricDone, false);
});

test("unavailable storage: getter throws, page stays usable in memory", () => {
  const { tab } = openTab(() => {
    throw new Error("SecurityError");
  });
  assert.equal(tab.getSnapshot().loadNotice, "unavailable");
  tab.markRead("l1", "v1");
  tab.submitAttempt("l1", attempt("one"));
  tab.submitAttempt("l1", attempt("two"));
  tab.updateRubric("l1", 0, [true], true);
  const snap = tab.getSnapshot();
  assert.equal(snap.saveState, "unsaved");
  assert.equal(snap.saveWarning, "unavailable");
  assert.equal(snap.progress.lessons.l1.readVersion, "v1");
  assert.deepEqual(viewLabels(tab, "l1"), ["one", "two"]);
  assert.equal(snap.progress.lessons.l1.attempts[0].rubricDone, true);
  // A later reload (client-side navigation) keeps the in-memory data.
  tab.reload();
  assert.deepEqual(viewLabels(tab, "l1"), ["one", "two"]);
});

test("unavailable storage: getter returns null", () => {
  const { tab } = openTab(() => null);
  tab.submitAttempt("l1", attempt("one"));
  assert.equal(tab.getSnapshot().saveWarning, "unavailable");
  assert.deepEqual(viewLabels(tab, "l1"), ["one"]);
});

test("repeated failures then recovery write every change exactly once", () => {
  const storage = memoryStorage();
  const { tab: a } = openTab(() => storage);
  const { tab: b } = openTab(() => storage);

  storage.failWrites = true;
  a.submitAttempt("l1", attempt("A1"));
  a.submitAttempt("l1", attempt("A2"));
  a.updateRubric("l1", 0, [true], true);
  assert.equal(a.getSnapshot().saveState, "unsaved");
  assert.deepEqual(viewLabels(a, "l1"), ["A1", "A2"]);

  storage.failWrites = false;
  b.submitAttempt("l1", attempt("B"));
  storage.failWrites = true;
  a.submitAttempt("l1", attempt("A3"));
  assert.equal(a.getSnapshot().saveState, "unsaved");
  assert.deepEqual(storedLabels(storage, "l1"), ["B"]);

  storage.failWrites = false;
  a.markRead("l1", "v1");
  assert.equal(a.getSnapshot().saveState, "saved");
  const saved = stored(storage).lessons.l1.attempts;
  assert.deepEqual(saved.map((x) => x.shortAnswer), ["B", "A1", "A2", "A3"]);
  assert.equal(saved[1].rubricDone, true);
  assert.equal(saved[0].rubricDone, false);

  a.submitAttempt("l1", attempt("A4"));
  assert.deepEqual(storedLabels(storage, "l1"), ["B", "A1", "A2", "A3", "A4"]);
});

test("invalid input throws without leaving a pending change behind", () => {
  const storage = memoryStorage();
  const { tab } = openTab(() => storage);
  assert.throws(() => tab.submitAttempt("l1", { ...attempt("bad"), version: "" }));
  assert.throws(() => tab.markRead("bad id", "v1"));
  tab.submitAttempt("l1", attempt("ok"));
  assert.equal(tab.getSnapshot().saveState, "saved");
  assert.deepEqual(storedLabels(storage, "l1"), ["ok"]);
});

test("corrupt stored value is backed up before the first write", () => {
  const storage = memoryStorage({ [STORAGE_KEY]: "{not json" });
  const { tab } = openTab(() => storage);
  assert.equal(tab.getSnapshot().loadNotice, "corrupt");
  const backupKey = tab.getSnapshot().backupKey;
  assert.ok(backupKey);
  assert.equal(storage.getItem(backupKey), "{not json");
  tab.submitAttempt("l1", attempt("after"));
  assert.equal(tab.getSnapshot().saveState, "saved");
  assert.deepEqual(storedLabels(storage, "l1"), ["after"]);
  assert.equal(storage.getItem(backupKey), "{not json");
});
