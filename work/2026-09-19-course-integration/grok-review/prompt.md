# Independent read-only review: ALS-COURSE-UI-01 (frozen version)

You are an independent REVIEWER. Do NOT edit, create, delete or move any file. Do NOT run builds, installs, servers, git commands that change state, or network access. Read only.

Repo: /Users/will/code/网站克隆工作台 (Next.js 16 App Router, React 19).
Frozen version: sha256 of every file in scope is in work/2026-09-19-course-integration/grok-review/frozen-hashes.txt.
Complete diff of this batch (the only thing to review): work/2026-09-19-course-integration/grok-review/batch.diff
You may open files listed in frozen-hashes.txt, plus src/lib/ai-learning/catalog.ts, src/lib/ai-learning/activities.ts, src/components/ai-learning/progress-store.ts, src/components/ai-learning/lesson-assessment.tsx for context. Nothing else is needed.

## Requirements this batch must meet
1. /courses is the single main entry, with two groups: "AI 应用课程" (6 AI modules as 6 courses) and "Web Coding 课程" (existing 产品官网 and Git courses kept).
2. Only module m1 has 4 available lessons (l01-l04). All other chapters show "待编写" with NO fabricated content (no fake text, quiz or progress).
3. No 24-week plan or internal notes on the first screen of /courses.
4. Course overview: what it teaches, what you can do afterwards, prerequisites, chapter cards. Progress only from real localStorage (key ai-learning-next:v1:progress), never invented before load.
5. Lesson page: back link, chapter navigation (section rail), previous/next; keeps lesson text, quiz, review and retry. Content has a single source (rendered.json from scripts/render-ai-learning.mjs); lesson text, quiz items and scoring are NOT changed.
6. /learning becomes a compatibility redirect; old links /learning/lNN still work (incl. hash); lesson IDs, versions, storage keys unchanged. /learning/me and /learning/cases remain as secondary entries.
7. No change to dependencies, deploy config, secrets. No unrelated pages changed.

## What to check
- Correctness bugs: wrong hrefs, 404 paths, redirect loops, lessons rendered in the wrong course, hydration mismatch, SSR vs client progress divergence.
- Any fabricated content or progress for planned lessons.
- Any change to lesson text / quiz / scoring / storage keys.
- XSS or unsafe HTML introduced by this batch (dangerouslySetInnerHTML use must only take build-time rendered.json).
- Accessibility regressions that block use (e.g. nested interactive elements, missing labels).
Ignore style nits.

## Output (required, exact format)
First line: VERDICT: ACCEPT | REVISE | BLOCKED
Then findings, most severe first, each: `[P1|P2|P3] path:line - problem - concrete failure scenario - suggested fix`.
P1 = must fix before human trial; P2 = should fix; P3 = optional.
Only REVISE if there is at least one P1 or P2. If you could not read something needed, say BLOCKED and what.
