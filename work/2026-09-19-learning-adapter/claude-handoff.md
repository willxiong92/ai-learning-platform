# ALS-S3-A1: local learning content adapter
Use Claude Opus 5 as executor. New cwd/session; existing four lessons are reviewed drafts. Implement only a deterministic content adapter as the first slice of the approved local learning-site skeleton. Do not build UI yet.
task_id: ALS-S3-A1
objective: Read the canonical course sources and generate validated course/lesson data for future Next.js pages without a second hand-edited textbook.
policy_version: 2026-09-02.1
executor_role: Claude Code executor write
approved_read_scope: repository AGENTS.md/package.json/tsconfig.json; existing src/lib/vibehub/types.ts for style only; /Users/will/code/AI学习站/scripts/content-lib.mjs; canonical sources/course.yaml and glossary.yaml and sources/lessons/l01–l04 under /Users/will/Desktop/业务主线/A-部门项目/AI学习站; task files.
approved_write_scope: scripts/generate-ai-learning.mjs; scripts/generate-ai-learning.test.mjs; src/lib/ai-learning/catalog.ts; work/2026-09-19-learning-adapter/claude-receipt.md. Generator runtime may create src/lib/ai-learning/generated.json when Codex runs it.
source_of_truth: canonical sources; reuse existing loadContent/validateContent/splitSections rather than invent YAML parsing. Existing helper is frozen read-only.
do_not_change: all other files, package manifests/lockfiles, existing dirty changes, textbook sources, PROJECT, websites/pages, settings, auth, old site, deployment. No installation, network, subagents, commits/deletes. Never read customer materials.
data_class: synthetic teaching content and public-source citations only.
risk_level: low local reversible
external_effects: existing subscription call only
cost_budget: at most 8 minutes, stop on quota; no API/model/provider fallback.
stop_conditions: unavailable model/quota, permission denial, required dependency missing, concurrent changes, out-of-scope needs. Return blocker, don't bypass.
expected_output: three small implementation/test files and a brief receipt; no generated JSON authored by model.
automated_checks: Codex runs node --test scripts/generate-ai-learning.test.mjs; node scripts/generate-ai-learning.mjs; npm run check after integration. Worker uses Read/Edit/Write only, no Bash.
rollback: all new files identifiable; no existing files edited.
human_gates: draft/not_open, no user or business acceptance; no production.

Requirements:
- Export a testable build function, command entry guarded so importing tests never writes files. Read existing helper via dynamic file URL; default helper path above, canonical sources default above. Optional environment variables AI_LEARNING_SOURCE_DIR and AI_LEARNING_CONTENT_LIB may override with explicit paths; never infer content from arbitrary folders.
- Run validateContent before any write. Missing/invalid input fails nonzero and must NOT overwrite an existing generated file. Atomic temp+rename only after full validation.
- Generated JSON includes schemaVersion, courseVersion, review, modules with exact 6/24 metadata, glossary, 4 lessons including original markdown, activities and splitSections. Planned lessons have no fabricated bodies. No absolute local source paths, timestamps, fake accepted flags, raw external extra files in output. Keep deterministic bytes on repeated runs.
- Derive counts from mother source; don't hardcode current four as permanent architecture, but tests confirm present 24/4 and planned20.
- catalog.ts imports generated.json and exposes small typed selectors for modules/lessons, preserves available vs planned vs draft/not_open; no any or needless abstractions. No server module fs in browser code.
- tests use node:test, synthetic fixtures or injectable helper functions (no dependency installation). Cover valid output, invalid source leaves prior destination bytes unchanged, missing source fails, deterministic repeated generation, planned bodies absent. Avoid mutating canonical inputs; temp test fixtures in OS temp permitted only within test runtime and clean only own fixture dirs.
- Do not read whole PROJECT/history/hash manifests; this handoff is enough. Don't copy entire sources into logs. Return short status/files_changed/checks_not_run/risks.
