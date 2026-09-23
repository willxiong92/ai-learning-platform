# ALS-S3-A5 receipt — 我的学习 (/learning/me)

- executor: Claude Code, claude-opus-5
- date: 2026-09-19
- policy_version: 2026-09-02.1

## Files changed

| File | Change |
|---|---|
| `src/app/learning/me/page.tsx` | New server route. Builds compact props (id/order/title, text-free grading data from `getCompactAssessments`, id+title of sections that quiz questions point at). Heading 我的学习, back link to /learning, local-only / not formal exam / draft·not_open notes. |
| `src/components/ai-learning/my-learning.tsx` | New client component. `useProgress` + `deriveLessonStatus`, reuses `ProgressStorageNotice`. Loading line, explicit empty state with link to first available lesson, per-lesson card, completed count `x/<available>` with planned count labeled separately. |
| `src/app/learning/page.tsx` | One link added in the header, before `<ProgressStorageNotice />`: 我的学习 → /learning/me. |
| `src/app/learning/learning.css` | Two scoped selectors added before `.ai-learning-pager`: `.ai-learning-me-next`, `.ai-learning-me-card.is-self_check_complete`. |
| `README.md` | One bullet appended to the existing AI 学习站 section. |

No changes to core/store/assessment/catalog/activities, shared header, schema, dependencies, tests.

## Behaviour per lesson card

- status label from `deriveLessonStatus`; read: current / stale version / none
- first attempt: grade if current version, else "首次作答是旧版本，不计入当前成绩"
- latest attempt: current version only
- attempts: current count, retakes, aided; stale attempts listed separately as not counted
- short answer: written / self-check done / checked n/m — never the text
- review sections by title; next-step link: first wrong section anchor when quiz not passed, otherwise `#assessment` (or lesson top when not started)
- no study time, streak, ability %, ranking, reset, export, or grade change

## Rollback

`me/page.tsx` and `my-learning.tsx` are new: delete them. For `page.tsx`, remove the `<p className="ai-learning-me-next">…</p>` block in the header. For `learning.css`, remove the `/* 我的学习 (/learning/me) */` block. For `README.md`, remove the `**我的学习（/learning/me…）**` bullet. No separate before-snapshot files were written: this task could only write this receipt in the task folder.

## Checks

Not run: this session had no shell tool, so `npm run check`, tests and browser checks did not run. Left for Codex: typecheck/lint/build, browser states (empty, in progress, quiz not passed with section link, short pending, stale version, complete, storage unavailable), mobile width, dark mode.

Assumption: lesson pages expose section anchors as `#<section id>` (same ids quiz `section` fields validate against) and the assessment block as `#assessment`. Not verified in this session because the lesson page was outside the read scope.
