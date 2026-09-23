# Claude receipt — ALS-S3-A4 (learner flow on /learning)

- executor: Claude Code, claude-opus-5
- policy_version: 2026-09-02.1
- date: 2026-09-19
- status: implemented, **not run** (no Bash in this session; tests/lint/typecheck/build/browser not executed by Claude)

## Files written (all inside approved_write_scope)

| File | Change |
|---|---|
| `src/lib/ai-learning/activities.ts` | New, server-only. `getAssessmentActivities(id)` validates `LessonActivities.quiz` into typed `AssessmentActivities` and throws on malformed sources (bad ids, unknown section, answer out of range, <2 options, duplicate ids, non-boolean flags, empty rubric, version mismatch). Missing `rule` / `min_correct` / `critical_required` are filled with the exact defaults the core already applies (all questions / required), so grading is unchanged. `getCompactAssessments()` returns text-free grading data (ids, sections, option counts, answer indexes, rule, rubric count) for available lessons only. |
| `src/components/ai-learning/progress-store.ts` | New client store on `useSyncExternalStore`. Safe `localStorage` getter (try/catch). Loads on first subscribe (after hydration) and on native `storage` events; server snapshot is a constant. Writes re-read storage and apply the change on top (no stale-tab overwrite). Failed save keeps the change in memory with `saveState: "unsaved"`. Uses only core exports: `loadProgress`, `saveProgress`, `markRead`, `recordAttempt`, `setAttemptRubric`. No reset/wipe/export. |
| `src/components/ai-learning/quiz-form.tsx` | New. Fieldset/legend per question, radios, short-answer textarea with label, aided checkbox. Missing MCQ / blank short answer shows a focused missing list (`role="alert"`) instead of submitting. Double submit blocked by ref + disabled button. No answers, reasons or rubric rendered. |
| `src/components/ai-learning/lesson-assessment.tsx` | New `#assessment` section: local-only note, noscript note, status (`aria-live`), first vs latest, retakes/stale/aided counts, read mark (with stale-version note), quiz form, per-question result (choice, correct answer, wrong-option feedback, explanation, section anchor), review-section links, rubric self-check checkboxes + explicit "我已按要点完成自查" / "撤回确认", retry with fresh form (new key). Status from `deriveLessonStatus`. |
| `src/components/ai-learning/learning-progress.tsx` | New. `ProgressStorageNotice` (load/save warnings), `LessonMapProgress` (per-lesson local badge on the map). |
| `src/app/learning/[lesson]/page.tsx` | Passes only the current lesson's validated activities + section titles to `LessonAssessment`; section placed after `<article>`, above pager; TOC gets a "本章测验与进度" link. Header note no longer says read-only. |
| `src/app/learning/page.tsx` | Replaced "尚未接入" note with local-only / browser-specific / clearing loses data / not a formal exam note; adds `ProgressStorageNotice`; local badge only for available lessons (planned never gets one). |
| `src/app/learning/learning.css` | Assessment, form, button, warning, result styles; theme-derived colors only (dark mode via existing variables). |
| `scripts/render-ai-learning.mjs` | `ReadMark` now links to `#assessment` with a no-JS/local-only note; practice note "本页是只读版" → "此练习…"; demo note "本页是静态阅读版" → "此演示是静态版". Validation unchanged. |
| `scripts/render-ai-learning.test.mjs` | Updated only the two obsolete ReadMark assertions; added checks for the new link, practice wording, and no leftover "尚未接入"/"本页是只读版". |

Not changed: `assessment.mjs` / `assessment.d.mts` (frozen), `catalog.ts`, generated/rendered JSON, textbook sources, dependencies, `README.md` (its header says it does not maintain status; nothing obsolete about /learning found in the lines read).

## Needed from Codex (not done by Claude)

1. Regenerate `src/lib/ai-learning/rendered.json` (`node scripts/render-ai-learning.mjs`, or the project's content script) — the ReadMark/practice text changes only show after re-render.
2. Run `node --test scripts/*.test.mjs`, `npm run lint`, `npm run typecheck`, `npm run build`, browser check of `/learning` and the 4 lessons.
3. Watch for: real activities may fail the new strict validation (e.g. a question without `section`, or `section` not matching a section id) — build will throw with the exact path; decide source fix vs looser rule. Import of `@/lib/ai-learning/assessment.mjs` from TS client files relies on the existing `.d.mts`; confirm tsconfig resolves it.

## Revision 1 (2026-09-19) — README

- Codex reported: 46 tests and `npm run check` passed; test-port browser checks passed (missing-answer block, all-correct submit, short-answer self-check, restore after refresh). Claude did not run these.
- `README.md`: in the closing "AI 学习站阅读页（/learning）" section only, replaced the obsolete "交互测验、标记已读、进度和成绩尚未接入" sentence with two bullets: what the local learner flow does (browser-only storage, not a formal exam), and verification status kept separate — technical checks passed / independent review not complete / Will has not trial-studied / not_open. No whole-site acceptance claimed. Project-status entry block at the top of README untouched.

## Revision 2 (2026-09-19) — anchor offset CSS

- Codex measured at 390px wide: fixed `nav.nav` bottom at 108px, `#assessment` top at 79.75px, so the heading was covered (light and dark).
- `src/app/learning/learning.css` only: added `--ai-learning-anchor-offset: 8rem` (128px) on `.ai-learning-page`, and all three `scroll-margin-top: 5rem` rules (prose `h2`, prose `h1`/`[id]`, `.ai-learning-assessment`) now use it. That leaves at least 108px + 20px on every screen width; the desktop offset grows from 80px to 128px. Shared nav and global CSS are untouched; no JS, no quiz or content changes.
- Not re-run by Claude: browser measurement, `npm run check`.

## Known limits

- Unsubmitted answers are not saved (stated in the form); core schema not widened.
- Rubric self-check can be confirmed without ticking every point — the core defines "done" as the explicit confirmation only; not changed.
- Human gates unchanged: draft / not_open; no publish, no team acceptance.
