# ALS-S3-A4-storage-repair — Claude executor receipt

- task_id: ALS-S3-A4-storage-repair
- executor: Claude Code, claude-opus-5
- policy_version: 2026-09-02.1
- date: 2026-09-19
- tests: **not run by executor** (no shell in this session). Codex to run `node --test scripts/progress-controller.test.mjs` plus the existing checks (`npm run check`, existing `node --test` suites).

## Root cause (as described in the task evidence, confirmed by reading the old store)

`update()` skipped the storage re-read while `saveState === "unsaved"` and used the stale in-memory snapshot as the base, then `saveProgress` wrote the whole object. Another tab's writes made in between were overwritten. `reload()` also returned early while unsaved, so storage events never showed the other tab's data.

## Fix

- New `src/lib/ai-learning/progress-controller.mjs` (+ `.d.mts`): the store logic moved here, with storage, clock, scheduler and storage-event watcher injected. No React or window.
  - Each user action is kept as a change function with its inputs (including the `at` timestamp) captured once.
  - Every write re-reads storage, replays **all unsaved changes plus the new one** on top of the fresh data, then saves. On success the pending list is emptied (no second replay); on failure it is kept and the snapshot shows the merged result as `unsaved`.
  - Corrupt/unsupported/unavailable storage: the base is the last known good data (same as before); backup-before-overwrite in `saveProgress` is unchanged.
  - `reload()` (first subscribe and storage events) no longer returns early while unsaved: it takes fresh storage data and replays pending changes on top, without writing. If storage becomes unavailable after data was loaded, in-memory data is kept instead of blanked.
  - `updateRubric` resolves the numeric index against the snapshot the UI is showing, pins it to that attempt's identity (version, at, aided, shortAnswer, answers — not rubric fields; plus occurrence number for exact duplicates), and on replay finds that attempt in the fresh list. Unknown/out-of-range index is a no-op.
  - Invalid input still throws to the caller, before any state change, so it never enters the pending list.
  - Server snapshot is a single stable object; nothing reads storage until the scheduled first read after subscribe.
- `src/components/ai-learning/progress-store.ts`: now a thin wrapper creating one controller with `window.localStorage` (guarded getter) and the `storage` event filter. Exported API unchanged: `useProgress`, `markLessonRead`, `submitAttempt`, `updateRubric`, `ProgressSnapshot` type (re-exported).
- Unchanged: assessment core, storage schema/key, grading rules, UI components, content, dependencies.

## Tests added (`scripts/progress-controller.test.mjs`, against the real controller)

1. First load reads storage only after subscribe; before that snapshot === server snapshot.
2. Hydration: server snapshot stable and untouched; snapshot reference only changes on updates.
3. Ordinary saved writes visible to a fresh tab.
4. A fails → B new attempt → A recovers: storage has B and A, A exactly once; later write does not duplicate.
5. Same with different lessons.
6. Storage event while unsaved merges other tab's data, keeps ours, does not write.
7. Rubric targets the original attempt across another tab's append, and after refresh (new controller) by stored order.
8. Rubric from a stale view still hits its attempt.
9. Unavailable storage (getter throws / returns null): usable in memory, `unsaved` + `unavailable`, reload keeps data.
10. Repeated failures (including a rubric change while unsaved) then recovery: every change written exactly once, correct attempt got the rubric.
11. Invalid input throws without leaving a pending change.
12. Corrupt stored value backed up before first write; backup kept.

## Notes / residual

- Pending changes live only in this tab's memory; closing the tab while `unsaved` still loses them (existing UI warning already says so). Not changed — no new feature per scope.
- A storage event does not trigger an automatic retry write; recovery happens on the next user action (smallest change).
- `before.ts` rollback copy: not in my read scope, not verified by me.
- Files written: the four code/test files above and this receipt. No other files touched.
