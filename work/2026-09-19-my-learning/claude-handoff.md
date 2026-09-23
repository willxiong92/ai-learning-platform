task_id: ALS-S3-A5
objective: Implement planned 我的学习 page /learning/me consolidating existing local four-lesson study state. Plan §8 names 我的学习 as deliverable. Use existing data/store only.
policy_version:2026-09-02.1
executor_role:Claude executor claude-opus-5
approved_read_scope:["src/app/learning/me/page.tsx", "src/components/ai-learning/my-learning.tsx", "src/app/learning/page.tsx", "src/app/learning/learning.css", "README.md", "work/2026-09-19-my-learning/claude-receipt.md", "src/lib/ai-learning/activities.ts", "src/lib/ai-learning/catalog.ts", "src/lib/ai-learning/assessment.d.mts", "src/components/ai-learning/progress-store.ts", "src/components/ai-learning/learning-progress.tsx", "AGENTS.md"]
approved_write_scope:["src/app/learning/me/page.tsx", "src/components/ai-learning/my-learning.tsx", "src/app/learning/page.tsx", "src/app/learning/learning.css", "README.md", "work/2026-09-19-my-learning/claude-receipt.md"]
source_of_truth:existing catalog/activities and assessment API
 do_not_change:all other files/core/textbook/schema/dependencies/auth/deploy
 data_class:synthetic/public; learner data never uploaded
risk_level:low
external_effects:none
cost_budget:subscription only 6minutes no fallback
stop_conditions:quota/denial/time/missinginput
expected_output:working local summary page and clear links,receipt
 automated_checks:Codex npm run check and browser
rollback:before snapshots in this task folder
human_gates:no acceptance/teamopen/publish

/learning/me server route gets compact grading props+id/title/order/section titles from catalog, never import full catalog client-side. Client uses useProgress and deriveLessonStatus; reuse ProgressStorageNotice. Show empty state explicit no data+startfirstavailable link. For each4available show status, first+latest current-version grade (oldversion clearlynotcount), attempts/retakes/aided counts, completed local selfchecks count denominator available4 (don'tcount20planned); no fabricated studytime/streak/percentability. Include short selfcheck pending, read pending, stale version notes and direct link to correct #assessment or firstwrongsection, section title. Do not expose student's shortanswer text unnecessarily on overview. Pending20 separate label not treated incomplete student homework; no gamification/ranking. Localonly/browserloss/notformalexam/draftnot_open maintained. Page heading 我的学习 and back to学习路线, map headerlink 我的学习. No shared header changes, no new library/backend/reset/export/automaticgradechange. Good mobile/dark existingcss; scope newselectors. README append/update existing学习段 only to statepage available but independentreview/persontrialpending. No tests mirroring markup; Codexbrowserchecks real states. No agent/skill exploration. You are not alone; preserve existingfixes and do not revertcore/store. Return actualfiles and checknotrun. Single bounded implementation.