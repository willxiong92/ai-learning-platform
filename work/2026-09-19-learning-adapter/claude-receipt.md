# ALS-S3-A1 receipt (Claude Code executor, claude-opus-5)

status: implemented, not run (worker had Read/Edit/Write only, no Bash)

## files_changed (all new; no existing file edited)
- scripts/generate-ai-learning.mjs — exports resolveOptions / loadContentLib / buildLearningData / serialize / generate; CLI entry runs only when executed directly.
- scripts/generate-ai-learning.test.mjs — node:test; synthetic fixtures in OS temp dir with an injected fake helper, plus one read-only test against canonical sources.
- src/lib/ai-learning/catalog.ts — imports ./generated.json; typed selectors getCourseMeta / getModules / getModule / getLessonSummaries / getLessonSummary / getLessonContent / getGlossaryTerms.
- work/2026-09-19-learning-adapter/claude-receipt.md — this file.

## behavior
- Load via the frozen helper's loadContent, then validateContent plus adapter checks (course.version, review.content in draft/reviewed, review.team_access present, only available lessons have bodies). Nothing is written before all checks pass.
- Output: schemaVersion, courseVersion, title, audience, depthNote, review {content, teamAccess}, period, counts (derived), modules with lesson metadata, glossary (known fields), lessons (available only: markdown, activities, splitSections).
- No timestamps, no absolute paths (fails if the source dir, /Users/, /home/ or file:// appears in the output), no acceptance flags. JSON.stringify with 2-space indentation plus a trailing newline, so repeated runs give identical bytes.
- Write: temp file in the same dir, then rename; the temp file is removed on failure.
- Env overrides AI_LEARNING_SOURCE_DIR / AI_LEARNING_CONTENT_LIB must be absolute paths.

## checks_not_run (for Codex)
1. node --test scripts/generate-ai-learning.test.mjs
2. node scripts/generate-ai-learning.mjs  (creates src/lib/ai-learning/generated.json)
3. npm run check  (typecheck needs generated.json to exist first)

## risks
- content-lib.mjs imports `yaml`; it resolves from /Users/will/code/AI学习站/node_modules. Not verified. If it is missing, the generator and the canonical test fail (a blocker, do not install here).
- Read of lessons/l01/activities.yaml was permission-denied, so the activities shape is typed loosely (version + unknown fields). Lesson bodies were not read.
- The local-path guard would also reject legitimate lesson text containing "/Users/" or "/home/". None expected now.
- `generated as LearningData` relies on the JSON-inferred type being comparable. If tsc complains, the fix stays inside catalog.ts.
- human gates unchanged: content draft, team_access not_open; no user or business acceptance.
