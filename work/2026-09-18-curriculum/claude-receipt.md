# ALS-CUR-01 执行回执（Claude Code · claude-opus-5）

- 回执时间：2026-09-19（定时恢复轮）
- status: completed_pending_independent_review
- 课程状态：保持 draft / not_open；course.yaml 顺序与 version `2026-09-18.4` 未改

## files_changed（均在 approved_write_scope 内）

- sources/course.yaml（首轮写入，本轮未改）
- sources/glossary.yaml（本轮：example 定义改为“不改变模型参数”；fresh-sample 例句改为“把已确定的培训日期写成‘尚未确定’”）
- sources/reading-list.md（首轮写入；Codex 追加的“后续 24 课选材入口”一节保留未动）
- sources/lessons/l01/lesson.md、activities.yaml（首轮写入，本轮未改）
- sources/lessons/l02/lesson.md、activities.yaml
- sources/lessons/l03/lesson.md、activities.yaml
- sources/lessons/l04/lesson.md、activities.yaml
- 本回执

## 五项缺陷修复

1. l02 绝对化措辞：§01 表格、§02 表格、§03 示例与记忆、§05 角色、反例，以及 activities 的 demo/q1/q2/q4/q5 反馈都已改写。去掉了“只能猜/只能编”“角色只影响语气”，也不再断言“新对话一定用不到示例”；现在写的是“取决于应用是否保存、取回或再次提供”。
2. 导入数量 286 / ~300：l03 正文（选材表 M3 行、§04 冲突二、判断要点、§05 冲突规则）、l03 activities（demo 第 1、3 步，q4 全题）、l04 §01 都已改成并列写两个数字，注明口径未核对，并给出核对动作：B 公司 IT 提供 300 条来源清单，与系统导入日志逐项比对。q4 新增干扰项“少导入 14 条，需要补导”，附反馈。全文不再出现“少导14条”“全量完成”的正面表述，也不再说“系统记录自动更可靠”。
3. l02 demo 第 3 步现为 YAML `|` 写的完整周报：5 条进展、3 行行动项表、4 条需客户确认事项。l03 §05 材料包已放入 M1、M2、M3 实际内容和两条冲突规则，不再是占位符。
4. l04 C3 已重新定义为“保留材料的确定程度：既不把未知写成确定，也不把确定写成未定”。S3 版本 B 的输出改为明确的错误陈述：“纪要 P1 显示培训日期尚未确定，需客户确认（P1）”，与 P1 相反，C3/C4/C5 不达标，得 2/5。
5. l04 计分：S1/S2 给出 A/B 完整输出，评分表带依据列（S1 A 2/5、B 3/5；S2 A 4/5、B 5/5）。另外补了三点：单次演示不能证明因果；S3 对 Will 不是没见过的样例；允许报告原始计数，但不外推成稳定的提升比例。q2 反馈同步更新。

## actions_executed

- 只用 Read / Edit / Write 修改上述文件
- 未请求 Bash，未联网，未安装、发布、删除或提交，未再委派
- 未读取 course-materials.md、PROJECT.md 全文、baseline 哈希或其他历史文件

## checks_passed

- 只做了人工自查：本轮 Read 回查了 l02 lesson.md、glossary.yaml，以及 l03 activities 的 demo 和 q1–q4 段落
- 没有运行自动测试，也没有运行 validateContent 或 YAML 解析
- 没有 Grok 审查通过
- 没有人工验收

## evidence_refs

- work/2026-09-18-curriculum/verified-sources.md（来源核对，2026-09-18）
- work/2026-09-18-curriculum/outline-contract.json（24 课大纲合同）

## exceptions

- 10 个领域标签未分配：分类文档不在读取范围内
- 前两轮因 10 分钟超时中断，本轮只补做剩余部分
- 本轮没有联网重新打开来源

## remaining_risks

- YAML 与组件结构未经工具验证，需要 Codex 运行结构检查
- 所有演示和输出都是教学模拟，不是真实模型调用结果
- l04 S3 对 Will 不是没见过的样例，正文已注明
- 第二轮修订后尚待 Grok 复核，Will 未试学

## 第二轮修订（2026-09-19，Grok REVISE）

只改了两个 practice 段落：
- l03 practice.explanation：P1（15 人）、P2（18 人）、P3（约 20 人）三者都保留并各自标注；注明统计范围和时间口径未核对，不按日期或来源类型认定谁取代谁；删掉了“P1 已被 P2 更新”和“P3 不应采用”。P4 因字段已确知过时而排除，P5 保留。冲突说明写明材料没有培训日期、不自行补日期；请客户确认培训日期、名单是否为最终版、待入职人员能否参加。
- l03 practice.hint：删掉“3 个人培训那天还没到岗”，改为说明材料没有培训日期、不能断定能否参加。checklist 第 4 条同步改写。
- l04 practice：K1 改为“3 人 10 月 8 日到岗、能否参加培训请客户确认（材料没有培训日期，不得断定）”；Y 的边界语句和 Y 的输出同步改写，K1 与 Y 输出逐字对应。X 的 K1 扣分理由改为“把名单人数写成确定参加人数”。评分保持 X 2/4、Y 3/4。解析注明是“每版一次预写示范，不是真实运行结果”。
- 修后已 Read 回查两个 practice 段落。没有运行自动检查，尚待 Grok 复核，没有人工验收。

## rollback_available

- 是。原件在 work/2026-09-18-curriculum/before/sources/，覆盖回去即可；新建文件需要人工决定是否删除，不会自动删除

## needs_human_review

- 是：需要 Codex 做结构检查、Grok 做独立审查，并由 Will 试学
