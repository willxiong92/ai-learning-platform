task_id: ALS-S3-A6
objective: Implement authorized S3-A case template→related learning→practice draft→local save/reload/copy. No real case publication or external submission.
policy_version:2026-09-02.1
executor_role:Claude executor claude-opus-5
approved_read_scope:["src/app/learning/cases/page.tsx", "src/app/learning/practice/page.tsx", "src/components/ai-learning/practice-draft.tsx", "src/lib/ai-learning/practice-draft.mjs", "src/lib/ai-learning/practice-draft.d.mts", "scripts/practice-draft.test.mjs", "src/app/learning/page.tsx", "src/app/learning/learning.css", "README.md", "work/2026-09-19-practice-draft/claude-receipt.md", "src/lib/ai-learning/assessment.mjs", "src/lib/ai-learning/assessment.d.mts", "src/components/ai-learning/learning-progress.tsx", "src/lib/ai-learning/catalog.ts", "AGENTS.md"]
approved_write_scope:["src/app/learning/cases/page.tsx", "src/app/learning/practice/page.tsx", "src/components/ai-learning/practice-draft.tsx", "src/lib/ai-learning/practice-draft.mjs", "src/lib/ai-learning/practice-draft.d.mts", "scripts/practice-draft.test.mjs", "src/app/learning/page.tsx", "src/app/learning/learning.css", "README.md", "work/2026-09-19-practice-draft/claude-receipt.md"]
source_of_truth:Plan §3.2/§7 supplied below and existing learning platform. Textbook mother unchanged.
 do_not_change:all other files,assessment/progress cores,content,auth,deps,oldsite,sharednav
 data_class:public/synthetic only; prohibit entering raw customer details
risk_level:low
external_effects:none; clipboard only on user's button click
cost_budget:existing subscription 8min nofallback
stop_conditions:quota/denial/time/missinginput
expected_output:two local pages,typed draft storage,tests,receipt
 automated_checks:Codex node --test scripts/practice-draft.test.mjs and npm run check/browser
rollback:before snapshots in task folder
human_gates:no real case,submission channel,review workflow,publish/teamopen

Approved plan: cases describe businessproblem,SC/gap,steps,reusablePrompt/Skill/SOP/template,evidence,boundary andrelatedchapters. Practice may be synthetic. S3-A localcase template/card/localdraft save/reload/copy authorized; S3-B realcase/submission/reviewer pendingWill. Do not claim completed real businesscase or fabricate SC/gap assignments/businessmetrics/customeridentity.

Build /learning/cases as case-template entry with prominent '尚无已验收业务案例；以下为模拟练习，不是客户案例/业务成果'. One compact original synthetic weekly-report exercise aligned l02 task-expression+l03material+l04verification, all source inputs shown, e.g. taskAstatuspending vs taskBcompleted, no brand/people/ROI. Show facts vs missing and whyhumanverifies; can label SC/gap '待业务项目确定' rather than makecodes. Not new textbookmodule, only template practice. Related links actual /learning/l02,l03,l04 sections known? usepage roots unlesssection verified. Link /learning/practice.

Practice page: blank initial draft, not automatic plausible completed answer. Fixed syntheticexercise context displayed separately from learner fields. Fields: own businessproblem/goal,inputs+source boundaries,steps+humanconfirmation,plannedoutput,acceptancechecks,actualresult/evidence(or待验证),limits+nextstep; SC/gap optional notautofilled. prominent synthetic/private-not-customerdata notice. Explicit保存草稿 thenreloadrestore; dirtyunsavedindicator. Deterministic plain Markdown copy via navigator.clipboard triggeredbutton only; ifclipboard unavailable/fails, show selectable text fallback manual copy (no falsecopied). Copied content includes '模拟练习草稿/未验收/未提交' and missingfields='待补充'; copy is not submitted,no external endpoint,recipient or ready score. No delete/reset/export/reviewflags. Exactly one localdraft dedicated key 'ai-learning-next:v1:practice-draft'; never touch progress key. Header warning browserlocal/clearbrowserloss. Save errors stayinmemory and visible notsaved. Corrupt/unsupported raw preserved, backupbeforeoverwrite; unavailable getter caught; pendingdraft from another tab must not silentlyoverwrite: compare raw savedbase on save and return conflict with clearinstruction preserve currenttext manually; no autowrite; don't invent mergeUI. No cross-tab automatic changes while editing. Small module pure injected storage helpers and companion d.mts; actual tests failure/reload/backup/copyformat/conflict, no dependencies.

Map header add '模拟案例与作业' link, existing我的学习 preserved. Styles only .ai-learning-* currenttheme andmobile. README only existinglearningsection update capabilities stilldraft/not_open/independentreviewpending. Do not add actual acceptedcase,paidassets,scoretracking/productiondata or fictitiouspassedstatus. Do not launch tools/skills/subagents unrelated. One writer ownscope, preserve otherchanges. Return receipt no claimedchecks. Max8min.