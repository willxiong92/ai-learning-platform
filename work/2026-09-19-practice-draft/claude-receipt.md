# ALS-S3-A6 receipt — Claude executor (claude-opus-5)

Date: 2026-09-19. Scope: S3-A only (case template, synthetic exercise, local practice draft save/reload/copy).
No real case, submission channel, review workflow, publication or team opening was implemented.

## Checks

None run by Claude. This session had no shell tool, so `node --test scripts/practice-draft.test.mjs`,
`npm run check` and the browser check were **not executed by Claude**. Codex reported 10/10 tests and
`npm run check` passing on the first version (Claude did not observe this). Those runs came **before** the
wording correction below; they have not been re-run since. Independent review: **pending**.

## Wording correction (follow-up, 2026-09-19)

Only `PRACTICE_EXERCISE.facts`, `.missing` and `.humanCheck` in `src/lib/ai-learning/practice-draft.mjs` were
changed. Structure, fields, ids, pages and interactions are unchanged. Claude read the edited lines back.

- The old humanCheck said status must follow the table and any mismatch should be changed back to the table.
  That wrongly treated the table as real-world truth. Removed.
- facts: each item now starts with "记录表显示：…". A fourth item records the verbal remark as a supplied statement:
  "同事口头补充：预计任务 A 这周能完成（这是一句预计，不是完成确认）".
- missing: the task A forecast cannot establish completion. No C review outcome means "材料里没有提供，不代表一定没有评审".
- humanCheck: explains that a forecast cannot establish completion. Asks the learner to check each statement's source,
  time, scope and original wording, and says neither source type (table or verbal) is trusted by default. Unresolved
  conflicts keep both statements and go to the responsible person to confirm. Gaps are marked "待确认".
- Not changed in that follow-up: the heading "有来源的事实" in `src/app/learning/cases/page.tsx`. It was fixed in
  the next follow-up, below.

## Heading wording sync (second follow-up, 2026-09-19)

These are wording-only fixes, so the pages no longer suggest that a record equals a real-world fact. Structure and
behaviour are unchanged. Claude read the changed lines back.

- `src/app/learning/cases/page.tsx`: "有来源的事实" becomes "材料中记载的信息". It appeared twice: in the header note
  and in the compare heading. "缺失、不能写进周报的" becomes "缺失或不能直接下结论的信息".
- `src/app/learning/practice/page.tsx`: "完整的事实/缺失对照" becomes "完整的来源/缺失对照".
- No other files changed. Claude ran no tests. The earlier Codex check results do not cover this change.
  Independent review: **pending**.

## Files

New:
- `src/lib/ai-learning/practice-draft.mjs` — pure helpers with injected storage (object or getter). One key
  `ai-learning-next:v1:practice-draft`; backups under `ai-learning-next:v1:practice-draft-backup:`. `loadDraft`
  returns `baseRaw`; `saveDraft(storage, fields, baseRaw)` refuses with `conflict` when the stored raw differs
  (no write), backs up corrupt/unsupported raw before overwrite, blocks on `backup_failed`, reports
  `unavailable`/`write_failed`. `draftToMarkdown` is deterministic (no timestamps), header
  "模拟练习草稿（未验收 · 未提交）", empty fields "待补充", empty SC/gap "待业务项目确定". Also holds the fixed
  synthetic exercise `PRACTICE_EXERCISE` (weekly report: task A pending / B completed / C in progress + one
  unrecorded verbal guess; no brands, people, customers or metrics).
- `src/lib/ai-learning/practice-draft.d.mts` — types.
- `scripts/practice-draft.test.mjs` — 10 tests: blank start, save/reload + progress key untouched, unavailable
  (null / throwing getter / throwing getItem), write failure, corrupt backup-once-then-overwrite, unsupported and
  non-text fields, backup failure blocks write, cross-tab conflict, dirty check, copy format.
- `src/components/ai-learning/practice-draft.tsx` — client editor. Mounts after hydration
  (`useSyncExternalStore`), loads once via lazy `useState`, no `storage` event listener. Explicit 保存草稿;
  dirty indicator; save failures and conflict shown, text kept in memory. Copy only on click via
  `navigator.clipboard.writeText`; on failure shows a read-only selectable textarea and does not claim copied.
- `src/app/learning/cases/page.tsx` — banner "尚无已验收业务案例；以下为模拟练习，不是客户案例/业务成果", 7-part
  template, the synthetic exercise with all inputs, facts vs missing, why a human verifies, SC/gap
  "待业务项目确定", evidence "无", related lessons linked at page roots `/learning/l02|l03|l04` (section anchors
  not verified, so not used), link to `/learning/practice`.
- `src/app/learning/practice/page.tsx` — synthetic/no-customer-data banner, browser-local warning, fixed
  exercise context shown separately, blank draft editor.

Edited:
- `src/app/learning/page.tsx` — one `<p className="ai-learning-me-next">` link "模拟案例与作业" added after the
  existing 我的学习 link.
- `src/app/learning/learning.css` — new block "模拟案例与作业 … 练习草稿" inserted before the `@media (max-width: 640px)`
  rule, plus `.ai-learning-case-compare` single-column rule inside that media query. Only `.ai-learning-*`.
- `README.md` — one bullet "模拟案例与作业 …" added in the existing /learning section, before "验证现状".

## Rollback

No before-snapshots were found in this task folder (the receipt path did not exist; no other folder files were in
read scope). Rollback by reversal: delete the six new files above; remove the added `<p>` in
`src/app/learning/page.tsx`; remove the added CSS block and the media-query rule in `learning.css`; remove the added
README bullet. `src/app/learning/` is untracked in git, so `git checkout` cannot restore it.

## Assumptions / open items

- Lesson-focus sentences for l02/l03/l04 follow the plan's alignment (task expression / material / verification);
  not checked against lesson text.
- Save timestamp shown in UTC.
- A conflict has no override button by design; the learner copies their text, reloads, and saves again.
- S3-B (real cases, submission, reviewer) pending Will. Independent review and Will's trial not done.
