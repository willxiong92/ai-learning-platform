# ALS-S3-A2 receipt (Claude Code executor)

- task_id: ALS-S3-A2
- policy_version: 2026-09-02.1
- executor: Claude Code, Opus 5 (claude-opus-5)
- date: 2026-09-19
- verification: **the executor ran no tests, scripts, lint, or builds** (Read/Edit/Write only). Codex reported 26 tests passing before round 3. `npm run check` is pending a Codex re-run after round 3.

## Changed files (all rounds)

| File | Change |
|---|---|
| scripts/render-ai-learning.mjs | New. Compiles generated.json with the installed VitePress createMarkdownRenderer, expands the 8 textbook components, checks source and output HTML against allowlists, and writes rendered.json atomically. Round 2: strips `v-pre` from `<pre>` in the output stage only. Round 3: the LessonIntro draft label now reads 内容草稿 · 待本人试学. |
| scripts/render-ai-learning.test.mjs | New. Round 2: v-pre regression test. Round 3: the draft-label assertion now expects the new wording. |
| src/lib/ai-learning/catalog.ts | Existing selectors kept. Added getNeighborLessons, getLessonStatusLabel, getReviewLabel, and rendered-data types. Round 3: the draft label now reads 内容草稿 · 待本人试学. |
| src/app/learning/page.tsx | New. Course map (6 modules, 24 lessons). |
| src/app/learning/[lesson]/page.tsx | New. Reading page, honest planned page, 404 for unknown IDs, previous/next links with status. Round 3: `module` renamed to `courseModule` (lint rule @next/next/no-assign-module-variable), and the renderer detail in the reader note replaced with a plain reading hint. |
| src/app/learning/learning.css | New. Scoped `.ai-learning-*` styles. |
| package.json | Scripts only: content:ai, predev, prebuild, precheck. No dependency or lockfile changes. |
| src/components/sites/vibe-hub-org-e37cedf6/shared/site-header.tsx | Added a 学习路线 link to desktop and mobile navigation. Existing links and the user's language-switch removal kept. |
| README.md | Appended the /learning section. |

## Round 4 (typecheck fix + README status)

- src/app/learning/[lesson]/page.tsx: replaced `PageProps<"/learning/[lesson]">` in generateMetadata and the page with an explicit local type `LessonPageProps = { params: Promise<{ lesson: string }> }`. Codex saw this new route fail typecheck because its generated route types do not exist yet and typecheck runs before build. The async `await params` and all other behavior are unchanged.
- README.md: status wording updated (see open item 1).
- **No checks were executed in this round.** Codex will re-run `npm run check`.

## Source status

Unchanged: course review.content stays `draft`, team_access stays `not_open`. Only the UI wording changed.

## Open items / risks

1. Round 4: the README status now reads “draft（内容复核通过，待本人试学）”; team access stays not_open.
2. Dark mode has not been checked in a browser.
3. `npm run check` generates data twice (once in precheck, once in prebuild).
4. Human gates are unchanged: no publishing and no acceptance claimed. Quiz, progress, and scores are not connected.
