task_id: ALS-S3-A4-storage-repair
objective: Fix concrete data loss in progress-store after failed save then another tab writes; extract testable minimal controller to verify actual storage/update code.
policy_version: 2026-09-02.1
executor_role: Claude executor claude-opus-5
approved_read_scope: ["src/components/ai-learning/progress-store.ts", "src/lib/ai-learning/progress-controller.mjs", "src/lib/ai-learning/progress-controller.d.mts", "scripts/progress-controller.test.mjs", "work/2026-09-19-learning-storage-repair/claude-receipt.md", "src/lib/ai-learning/assessment.mjs", "src/lib/ai-learning/assessment.d.mts", "src/components/ai-learning/lesson-assessment.tsx", "src/components/ai-learning/learning-progress.tsx"]
approved_write_scope: ["src/components/ai-learning/progress-store.ts", "src/lib/ai-learning/progress-controller.mjs", "src/lib/ai-learning/progress-controller.d.mts", "scripts/progress-controller.test.mjs", "work/2026-09-19-learning-storage-repair/claude-receipt.md"]
source_of_truth: existing store/core and evidence below
 do_not_change: core assessment,UI,content,dependencies,auth,other files
 data_class: synthetic/public
risk_level: low
external_effects: none
cost_budget: subscription only 8min,no fallback
stop_conditions: denial/quota/time/missinginput
expected_output: minimal fix + real controller tests + receipt
 automated_checks: Codex node --test scripts/progress-controller.test.mjs and existingchecks
rollback: current store captured in before.ts
human_gates: no team/publish/learning acceptance

Concrete evidence: progress-store.ts update uses fresh = storage && snapshot.saveState !== 'unsaved' ? loadProgress : null. If A save fails, B saves another attempt, A later recovers and writes, base remains stale A snapshot, saveProgress writes whole object => B lost. onStorage reload also returns early during unsaved. Fix without changing storage schema or grading rules. Retain in-memory unsaved operations and replay against fresh stored state before successful write; don't silently discard either tab. Rubric change must target original attempt rather than numericindex of a different appended attempt. No duplicate replay after successful persistence. Storage unavailable should remain usable in memory; backup protection core remains. Small injected controller .mjs + .d.mts consumed by existing React wrapper enables tests of production behavior, no parallel fake implementation. Methods for subscribe/read/update can chosen internally; UI exported API useProgress/markLessonRead/submitAttempt/updateRubric unchanged. No new reset/export/UIfeature. Need tests: first load; ordinary savedwrites; Afailed→Bnewattempt→Arecovery preservesB&A exactlyonce; same with differentlesson; rubric applies correct attempt across refresh; unavailable getter/storage; repeated failures/recovery; hydration snapshot stable. Scope one writer, core frozen, don't revert others. No external refs/no tool skill exploration. Return receipt no selfclaimedtests, Codexruns. This is repair not redesign entire learning app.