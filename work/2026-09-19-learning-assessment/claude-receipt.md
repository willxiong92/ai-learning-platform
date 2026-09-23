# Receipt · ALS-S3-A3-core

- executor: Claude Code · claude-opus-5
- policy_version: 2026-09-02.1
- date: 2026-09-19
- status: `implemented` · `not_executed` (executor has no shell) · not `technically_verified` · not `human_accepted`

## Files written (all new, within approved_write_scope)

| File | Purpose |
|---|---|
| `src/lib/ai-learning/assessment.mjs` | Pure, browser-safe core: grading, short-answer self-check state, progress schema 1, derived status, injected-storage load/save |
| `src/lib/ai-learning/assessment.d.mts` | TS declarations (no `any`); quiz types mirror `activities.yaml` `quiz` block |
| `scripts/assessment.test.mjs` | `node:test` suite with a small synthetic fixture (4 questions, 3-item rubric) |
| this receipt | |

No existing file edited. No dependency, package, page, config, 教材母源 or A2 file touched.

## Reads (all within approved_read_scope)

Old `grading.js`, `progress.js`, `status.js`; `catalog.ts`; l01 `activities.yaml`. `tests/progress.test.mjs` was in scope but not read (not needed).

## What was reused vs. changed from the old site

Reused as-is: `normalizeAnswer`; `gradeQuiz` rule (`min_correct` falling back to all questions, `critical_required !== false`, empty quiz never passes); `shortAnswerState` (written + explicit `rubricDone`, no length scoring, checked count reported only); `sectionsToReview`; status ladder; backup-once-per-identical-raw.

Changed on purpose:
- Storage key `ai-learning-next:v1:progress`, backup prefix `ai-learning-next:v1:progress-backup:` (old site key not read or written).
- Attempt field `contentVersion` renamed `version`; `kind` no longer stored — first/retake derived from order.
- Lesson record reduced to `readVersion` / `readAt` / `attempts` (no `read` boolean, practice, draft or feedback — out of scope this batch). Read counts only when `readVersion === activities.version`.
- Final status key `completed` renamed `self_check_complete`, label says 不代表人工验收.
- Stale first attempt gets no grade (not graded against questions the learner never saw).
- Lesson ids no longer limited to `lNN`: any safe id is kept so unknown lessons survive a save; they show nothing unless the UI passes their own activities.
- Prototype keys (`__proto__`, `constructor`, `prototype`) dropped from lessons and answers.
- `saveProgress` backs up corrupt/unsupported raw before overwrite and refuses to overwrite if the backup fails.
- load/save never throw: `notice: "unavailable"` / `warning: "unavailable" | "backup_failed" | "write_failed"`.
- Update helpers (`markRead`, `recordAttempt`, `setAttemptRubric`) return new objects instead of mutating.

## Public interface (for later UI)

Constants `STORAGE_KEY`, `BACKUP_PREFIX`, `SCHEMA_VERSION`, `STATUS_LABEL`; functions `normalizeAnswer`, `gradeQuiz(quiz, answers)`, `shortAnswerState(attempt, rubricCount)`, `sectionsToReview(grade)`, `emptyProgress`, `parseProgress(raw)`, `markRead`, `recordAttempt`, `setAttemptRubric`, `deriveLessonStatus(lesson, activities)`, `loadProgress(storage, {now})`, `saveProgress(storage, progress, {now})`. No reset/delete/export.

## Checks

| Check | Status |
|---|---|
| `node --test scripts/assessment.test.mjs` | not_executed — for Codex to run |
| `npm run typecheck` (d.mts consumption) | not_executed; no TS file imports the module yet, so it is only exercised once UI integration lands |
| lint | not_executed |

Test coverage: all-correct pass; missing answers fail; critical wrong fails despite `min_correct`; malformed/out-of-range; empty quiz; short answer not auto-marked; forged `passed`/`score` ignored; stale read + stale attempt no completion; stale read with current pass = `read_pending`; first vs retake; immutability; corrupt/unsupported parse; unknown lesson preserved; corrupt backup once + no destroy; unsupported backed up before overwrite; backup failure blocks overwrite; storage unavailable; write failure; old key untouched; prototype pollution.

## Open points for A2 / UI batch

- `LessonActivities` in `catalog.ts` types quiz as `unknown`; UI will need a cast or narrowing to `AssessmentActivities` — not changed here (out of scope).
- Short answer `done` does not require every rubric box ticked (old-site rule kept, no new threshold invented). Decide at UI review if that should change.
- No human/business acceptance is implied by any status.
