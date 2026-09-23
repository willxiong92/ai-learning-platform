# ALS-COURSE-UI-01 完成回执（Claude Code Opus 5，2026-09-19）

状态：technically_verified。未经 Will 视觉/试学验收（human_accepted 未达成）；draft / not_open 不变。

## 改动文件
新增：`src/lib/ai-learning/course-routes.ts`、`src/components/ai-learning/course-progress.tsx`、`ai-course-overview.tsx`、`ai-course-lesson.tsx`、`src/app/courses/ai-courses.css`、`public/assets/ai-course-blueprints.svg`。
修改：`src/app/courses/page.tsx`、`[course]/page.tsx`、`[course]/[lesson]/page.tsx`、`src/app/learning/page.tsx`、`src/app/learning/[lesson]/page.tsx`（改为跳转）、`my-learning.tsx`、`learning/me|cases|practice/page.tsx`、`site-header.tsx`、`scripts/render-ai-learning.mjs` 及其测试、`README.md`。
未动：教材母源（12 个文件哈希与基线一致）、题目与评分、后 20 课、依赖、部署、密钥、旧站。

## 验证
- `node --test scripts/*.test.mjs` 69/69；`npm run check` 通过。
- 3301 隔离生产预览浏览器实测（见 PROJECT.md §5.12）；截图在 `screenshots/`。

## Grok
- r0：`--prompt-file` 相对路径按 `--cwd` 解析，未启动（`grok-r0-pathfail.*`）。
- r1、r2：360 秒上限终止，exit 142，无结论（`grok-r1.*`、`grok-r2.*`）。未指定 `--tools`（工具名未经 help 验证）；依赖 dontAsk 与只读提示词。前后 `frozen-hashes.txt` 校验一致。
- 结论：独立复核未完成，超时不算通过。

## 回滚
- 课程页三文件：`git checkout -- src/app/courses/page.tsx 'src/app/courses/[course]/page.tsx' 'src/app/courses/[course]/[lesson]/page.tsx'`。
- 其余修改文件：用 `rollback-originals/` 覆盖回去（已按基线哈希核对；`.ts/.tsx` 备份加了 `.orig` 后缀避免被类型检查扫到，覆盖时去掉后缀）；删除上面列出的新增文件。
- 缺口：`src/app/learning/page.tsx`、`src/app/learning/[lesson]/page.tsx` 无改动前副本，无法逐字节还原。
