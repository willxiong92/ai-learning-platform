# ALS-S3-A2 — read-only learning pages
New bounded implementation on current clone; previous adapter ACCEPT. Do not repeat textbook authoring. Follow existing visual style.
task_id: ALS-S3-A2
objective: Show canonical 24-lesson map and COMPLETE four reviewed-draft textbooks in local Next.js, preserving teaching structure. Add automatic data generation before dev/build.
policy_version: 2026-09-02.1
executor_role: Claude Code executor write
approved_read_scope: exact repository files in allowedTools; original old site content-lib.mjs and installed vitepress/dist/node/index.js + types/index.d.ts; canonical l01–l04 lesson.md/activities.yaml, glossary/course metadata. No whole PROJECT or historical logs.
approved_write_scope: scripts/render-ai-learning.mjs; scripts/render-ai-learning.test.mjs; src/app/learning/page.tsx; src/app/learning/[lesson]/page.tsx; src/app/learning/learning.css; src/lib/ai-learning/catalog.ts; package.json scripts only; shared/site-header.tsx navigation only; README.md append short section; task receipt. Generated derived artifacts only when Codex executes script: src/lib/ai-learning/rendered.json.
source_of_truth: canonical sources; accepted generator and catalog; existing site CSS/Next local docs. Read Next installed layouts/pages guide before route changes.
do_not_change: textbooks, old repo, existing site data/design, package deps/lockfile, auth/config, unrelated dirty changes. No installs/network/deploy/commit/deletion/subagents.
data_class: public/synthetic course material only
risk_level: low local reversible
external_effects: none beyond current subscription call
cost_budget: 10 minutes max; existing Opus5 route; stop on quota, no model/provider fallback.
stop_conditions: denied required tools, quota/model unavailable, source drift, missing dependency, out-of-scope; no bypass.
expected_output: read-only map and 4 full reading pages, all source metadata/draft labels; honest planned empty pages; short receipt.
automated_checks: worker Read/Edit/Write only; Codex runs scripts/tests/npm run check and browser review. No fabricated self-test.
rollback: before copies exist in task work/before, preserve user edits in header/README.
human_gates: draft/not_open; no publishing, no team/user acceptance; quiz scoring/progress not part of this batch.

Implementation requirements:
1. /learning renders 6 modules/24 lessons from catalog, audience/time/why/outcome/prerequisites; label available as 可试读·待本人验收, planned as 待编写, no fake completion or scores. /learning/l01..l04 full reading pages; planned IDs display honest no-content page, nonexistent IDs 404; navigation previous/next must distinguish planned.
2. Reuse installed VitePress createMarkdownRenderer for build-time Markdown, not a home-made general Markdown parser. It is exported at /Users/will/code/AI学习站/node_modules/vitepress/dist/node/index.js. Reuse old dependency only, no install. Compilation runs outside Next, generated rendered.json imports into server route; don't bundle Node/Vue runtime to browser. Existing generator stays unchanged. Render script imports generated JSON after generator executes; allow explicit AI_LEARNING_VITEPRESS_DIR env absolute override for other local setup; default existing old path. Deterministic atomic output, reject malformed/unknown component before replace.
3. Preserve ALL instructional content: Markdown tables/code/list/callouts/figure diagrams; expand known textbook components LessonIntro,TermCards,Cite,ContrastDemo,GuidedPractice,ReadMark,SourceList,NextStep using current activity/glossary data. No raw Vue tags or internal file paths in result. Do not dump whole chapter plain text. Demonstrations full input/output/why, practice prompts/checklists + answers inside native details; citations links correct per chapter. ReadMark merely states progress feature not connected; quiz link should say interactive quiz not yet connected (don't fake it). SourceList and NextStep truthful. Standalone chapter includes sections and anchors for future quiz explanations. Keep source origin/version and draft labels.
4. Source HTML allowed only structural markup actually used in these lessons; reject script/iframe/event handlers/javascript URLs and executable/unknown tags. Don't claim universal sanitizer. Tests include malicious source rejection, unknown component rejection, tables/figures/code preserved, all known tags consumed, all4 chapters rendered, invalid input preserves previous output, deterministic output. Avoid importing whole textbook into test output.
5. Scoped .ai-learning-* styles, existing theme vars and readable width, mobile tables scroll; don't redesign original site. Desktop+mobile header add 学习路线 only, retain user's language-switch removal and all existing links. No editor/export toolbar.
6. package scripts: content:ai runs accepted generator then renderer; predev/prebuild call content:ai so stale generated data isn't silently used. No dependency changes. README append exact source ownership/local dependency/commands/draft/not_open/quiz not yet connected.
7. catalog keep existing selectors; reader can import rendered JSON server-side directly or typed helpers. Do not broaden client bundle unnecessarily.
Read only relevant sections, concise output. New runtime no full prior context. Stop after write+read-back; Codex executes tests. Return exact changed files and unchecked risks.
