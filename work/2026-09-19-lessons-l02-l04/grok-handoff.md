task_id: ALS-L02-04-REVIEW
objective: 独立只读复核 ALS-L02-04-V1（第 2–4 课按第 1 课模板重写 + 16 篇术语详解），给出 ACCEPT / REVISE / BLOCKED
policy_version: 2026-09-02.1
executor_role: Grok reviewer readonly（实现者为 Claude Code Opus 5，不能自审；Codex 终验）
approved_read_scope: 仅下方「要求」与「被审文件」列出的文件；公开官方网页可只读核对术语详解中的出处
approved_write_scope: []
source_of_truth: PROJECT.md §5.20（范围）+ course-materials.md 章节模板与「Will 的样板反馈」1–7 条（标准）；样板章 lessons/l01/lesson.md
do_not_change: 所有文件
data_class: 原创课程 + 公开来源 + 模拟案例；无客户数据
risk_level: low
external_effects: none（不提交、不推送、不发布；站点保持 draft / not_open）
cost_budget: 现有订阅；最多 600 秒、12 轮
stop_conditions: 权限拒绝、额度或时间耗尽、被审文件哈希与 baseline.sha256 不一致 → 返回 BLOCKED 并说明
expected_output: 中文回执。总结论 ACCEPT / REVISE / BLOCKED；每个问题给「文件:行 | 问题 | 触发依据（引用哪条要求） | 影响 | 最小修改」；按严重度排序（阻断 / 应改 / 建议）。不输出推理过程，不重写正文。
automated_checks: 实现方已跑 npm run content:ai、node --test scripts/*.test.mjs（99/99）、npm run check（通过）；复核方不跑 shell，只读实际文件独立判断
rollback: 只读，无改动
human_gates: Will 本人验收与业务验收不在本次范围；ACCEPT 只代表内容独立复核通过

## 固定版本

先核对下列文件的 SHA-256 与 `baseline.sha256`（同目录）一致；不一致即 BLOCKED，不审漂移后的版本。

## 要求（按这些判断，不要自创标准）

1. `/Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md` 第 379–397 行：§5.20 的「Will 定的下一批」是范围；§5.21 是实现方自述，**只作线索，不作证据**。
2. `/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/course-materials.md` 第 17 行起的章节模板、第 114 行起的样板反馈 1–7 条。
3. 样板章 `sources/lessons/l01/lesson.md` 与第 1 课原有术语详解 `sources/terms/context.md`，作为对照。

## 重点检查

A. **范围**：只动了第 1 课 4 篇术语 + 第 2–4 课正文、练习挂靠和 12 篇术语；第 5–24 课未动；「练习不动」——题干、选项、答案、解析与改前一致（只允许加 `term`、改学习安排时间、把“正文第 N 节”换成小节名）。改前版本不在本机可读时，标 `missing_input`，不要推断。
B. **模板一致**：每课 h1 无“第 NN 课”；每节 `## 短标题 {#id}`、开头是读者提问、有 `::: figure`、结尾有 `<Cite>`；有「想弄懂底层，点开这几个词」提示框且链接本课 4 个术语；总结一段 + 3 条要点 + 练习入口 + “下一章，我们……”；无 TermCards / GuidedPractice / ReadMark。
C. **术语详解**：顺序为 是什么 / 底层怎么运作 / 避坑指南（≤3，每条以“不要”开头）/ 使用建议（≤3）/ 出处；讲的是机制而非复述正文；术语 id 与 glossary.yaml 对应；`site_term` 指向已有卡，其余有 `site_cat` + `site_demo`。
D. **事实性**：无编造的数字、日期、版本、产品能力；会变化的产品事实写了查阅日期与来源；app / tool / permission / memory 四篇对 Claude Code、Codex、OpenAI、Anthropic 能力的说法与所引官方文档一致（可只读打开核对；打不开就标 unverified，不要当错误）。
E. **合规**：模拟内容标明模拟；无付费课程原文、客户数据、本机绝对路径、密钥。
F. **一致性**：各课下一章预告与 course.yaml 下一课标题一致；正文里 `term:` 链接的 id 都存在于 glossary.yaml；activities.yaml 里每题 `term` 属于本课 4 个术语。
G. **可撤回决定，请判断是否合理（给意见，不作阻断）**：新增 AI 分类「验证与改进」（topics.json 一行）；第 3、4 课标题沿用 course.yaml；第 4 课演示一节挪到「新样例」之后；l04 q5、q6 挂「基线」。

## 被审文件

内容源（`/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/`）：
- glossary.yaml、course.yaml（只读对照下一课标题）
- lessons/l02/lesson.md、lessons/l02/activities.yaml
- lessons/l03/lesson.md、lessons/l03/activities.yaml
- lessons/l04/lesson.md、lessons/l04/activities.yaml
- terms/app.md、tool.md、permission.md、memory.md
- terms/prompt.md、task-brief.md、success-criteria.md、example.md
- terms/context-pack.md、source-label.md、stale-material.md、material-conflict.md
- terms/verification-table.md、baseline.md、single-variable.md、fresh-sample.md

网站仓（`/Users/will/code/网站克隆工作台/`）：
- src/lib/vibehub/topics.json（只看「验证与改进」一项）
- scripts/ai-site-catalog.test.mjs（只看真实目录测试 l01–l04 断言是否与内容一致）

读完以上文件即可下结论，不需要翻历史记录、技能或其它课程。
