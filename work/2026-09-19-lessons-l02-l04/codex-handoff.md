# Codex 接手：ALS-L02-04（第 2–4 课重写 + 16 篇术语详解）

> 2026-09-19，Claude Code（Opus 5，实现方）写给 Codex（统筹 / 终验）。产品真源仍是 `/Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md` §5.20–§5.21；本文件只是这一批的交接包，不是新的状态文件。

## 一句话现状

实现与自检完成 → Grok 第一轮独立复核 **REVISE**（无阻断，1 条应改，5 条建议）→ Claude 已逐条对照实际文件核实回执 → **尚未修改**，等 Codex 定修复范围后派发。站点仍 draft / not_open，未提交、未推送、未发布；Will 本人验收未开始。

## 本目录文件

| 文件 | 作用 |
|---|---|
| `grok-handoff.md` | 发给 Grok 的只读复核合同 |
| `baseline.sha256` | 被审 25 个文件的冻结哈希；2026-09-19 交接时复核仍全部一致 |
| `grok-review-1.md` | Grok 第一轮回执原文（从 Grok 会话 01a0b8ea… 原样转存） |
| `topics.before.json` | 改 `topics.json` 之前的备份，回滚「验证与改进」分类用 |
| `codex-handoff.md` | 本文件 |

## Claude 对 Grok 回执的核实

| # | Grok 结论 | 核实结果 | 证据 | Claude 建议 |
|---|---|---|---|---|
| 应改 1 | l03「过期材料」与图鉴正式名「过时材料」不一致 | **成立** | `glossary.yaml:210` term=过时材料；`lessons/l03/lesson.md:79,81,223` 与 `terms/stale-material.md:2,7,13,31` 写「过期材料」；`lessons/l03/activities.yaml:97,99` 写「过时材料」 | 以 glossary 为准，正文与详解改「过时材料」，`aliases` 加「过期材料」 |
| 建议 1 | `app` 的 `section: model` 应为 `tools` | **成立**（第 1 课遗留，不是本轮引入） | `glossary.yaml:41`；`lessons/l01/lesson.md:116` 为 `{#tools}` | 改 `section: tools` |
| 建议 2 | 「想弄懂底层」提示框放在章末，样板章放在前面 | **成立** | `l01/lesson.md:65` 位于 `{#model}` 节；`l02:164`、`l03:222`、`l04:247` 均在误区节。模板只规定要有、未规定位置 | 这是样板位置的解读，属可逆排版决定；建议挪到首节，但由 Codex/Will 定 |
| 建议 3 | fresh-sample / baseline / single-variable 的「底层」整表复述课文 S1–S3 分数 | **成立** | `terms/fresh-sample.md:15-20` 与 l04 正文同一张表 | 压成一句例子，保留机制讲解 |
| 建议 4 | l03「本书叫材料包」 | **成立** | `lessons/l03/lesson.md:36` | 改「本课」 |
| 建议 5 | memory 详解「绝对不做靠权限设置」，官方原文还提 hook | **未核实**（本机未打开官方页） | `terms/memory.md:25` | 补「权限禁止规则或 hook」，措辞低风险 |
| 可撤回决定 4 项 | 均判合理 / 可接受 | 无异议 | — | 保留，写进 Will 验收说明 |

Grok 标的 `missing_input`：
- **练习是否未动题干/选项/答案/解析**：改前 activities 未单独备份。**部分补证**：`outputs/AI使用基本功-试学稿.md`（2026-09-19 01:18，早于本轮改动）收录前 4 课练习；l02/l03/l04 activities 里 36/38/37 条题干、解析类文本（前 20 字）在试学稿里全部能找到，0 条缺失。这是前缀匹配，不覆盖选项顺序和答案键，**不等于完整证明**。
- **第 5–24 课未动**：本轮未改 `lessons/l05`–`l24`；Grok 无读取授权，未独立核实。
- **官方页未打开**：Grok 用公开检索摘要核了主要说法，未发现错误；`codex-cli 0.149.1` 帮助输出未复跑，保持 unverified。

## 需要 Codex 决定

1. **修复范围**：只修应改 1（最小），还是连建议 1、3、4、5 一起修（都在已授权文件内、改动小）。建议 2（提示框位置）是否改，涉及对样板的解读，可顺带请 Will 在验收时拍板。
2. **谁修**：默认派回 Claude Code（Opus 5）在原路径修复；修完重算 `baseline.sha256`，派 Grok 第二轮只复核改动点。
3. **Will 验收时机**：Grok 第二轮 ACCEPT 后再请 Will 验收，还是现在就并行让 Will 试读（应改 1 会在试读时露出来）。

## 合同要点（延续 §5.20，未扩大）

```yaml
task_id: ALS-L02-04-V1
policy_version: 2026-09-02.1
executor_role: Claude Code / executor / write（已完成，待修复派发）
approved_write_scope:
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources（l01 术语 4 篇、l02–l04 正文/练习挂靠/术语 12 篇、glossary.yaml）
  - /Users/will/code/网站克隆工作台/src/lib/vibehub/topics.json（仅「验证与改进」一行）
  - /Users/will/code/网站克隆工作台/scripts/ai-site-catalog.test.mjs
  - PROJECT.md 进度记录
do_not_change: 旧工作坊、个人网站、Wiki、A线学习记录、全局登记表、全局 Agent 配置/认证/权限/hooks/MCP、任何 remote / 生产库 / 旧托管；第 5–24 课；练习题干/选项/答案/解析
external_effects: none
human_gates: Will 验收与业务验收；提交 / 推送 / 发布 / 开放给团队
rollback: 内容源在 iCloud 同步区无 git；topics.json 用本目录 topics.before.json 还原；网站仓 git diff 可见其余代码改动（仓内还有本轮之前的大量未提交改动，不属于本批）
```

## 完成回执（实现方）

```yaml
status: implemented_self_checked; independent_review_REVISE; fixes_not_started
files_changed:
  - sources/glossary.yaml（2026-09-19.3）
  - sources/lessons/l02|l03|l04/lesson.md（2026-09-19.1）
  - sources/lessons/l02|l03|l04/activities.yaml（2026-09-19.1，只加 term / 改时间安排 / 改“正文第 N 节”）
  - sources/terms/ 16 篇新文件
  - 网站仓 src/lib/vibehub/topics.json、scripts/ai-site-catalog.test.mjs
  - PROJECT.md §0 / frontmatter / §5.21
checks_passed:
  - npm run content:ai（16 新卡、32 练习、22 篇术语详解）
  - node --test scripts/*.test.mjs 99/99
  - npm run check（typecheck / lint / build）
  - 浏览器：l02–l04 锚点、图、出处、提示框；16 术语页 200；390px 无横向溢出
evidence_refs: [grok-review-1.md, baseline.sha256]
exceptions:
  - /practice?scope=ai 服务端 HTML 未见“核验表”，疑为客户端渲染，未核实
remaining_risks:
  - 过时/过期双名（应改 1）未修，Will 试读会看到
rollback_available: yes（见上）
needs_human_review: true
```
