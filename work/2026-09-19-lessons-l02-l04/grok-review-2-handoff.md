# ALS-L02-04-REVIEW-2 · 条件就绪后由 Codex 派发

> 当前只是二审合同；Claude 修复与新基线尚未产生，不得现在对旧稿重审并宣称修复通过。任务状态真源为 PROJECT.md §5.21。

```yaml
task_id: ALS-L02-04-REVIEW-2
objective: 独立复核 R1 五项内容修复与版本同步，只检查改动点和直接回归
policy_version: 2026-09-02.1
executor_role: Grok / reviewer / readonly
approved_read_scope:
  - 本目录 claude-repair-handoff.md、grok-review-1.md、claude-repair-receipt.md、repair.diff、修前快照与冻结哈希
  - PROJECT.md §5.20–5.21、sources/course-materials.md 模板和样板反馈 1–7
  - 原 baseline.sha256 的 25 项文件；只评议本次差异及其直接关联
  - sources/lessons/l01/lesson.md（核对 app 回链）
  - content:ai、tests、check 与浏览器的本批实际日志；公开官方出处可只读核对
approved_write_scope: []
source_of_truth: PROJECT.md §5.20–5.21 与 claude-repair-handoff.md 的精确裁决；实际源文件、逐字快照、diff 和冻结哈希
do_not_change: 所有文件、配置、认证、权限、hooks、MCP、外部系统；不得自行修复
data_class: 原创教学内容、公开出处、模拟案例；不含客户原始数据和认证信息
risk_level: low
external_effects: none
cost_budget: 仅已批准订阅、不新增费用；最多 600 秒、12 轮
stop_conditions: 修复回执/新基线缺失、哈希漂移、并发写入、模型/认证/权限不可用、预算耗尽
expected_output: 中文 ACCEPT / REVISE / BLOCKED 回执；问题逐项给文件行号、依据、触发/影响、证据、最小修正
automated_checks: Codex 在二审前后比较冻结哈希；Grok 只读检查 source、diff、日志，不能用实现方总结替代证据
rollback: readonly，无改动；修前快照由 Codex 保留
human_gates: ACCEPT 仅代表本次独立复核通过；Will 本人/业务验收、提交/发布/开放不在本次授权
```

## 检查项目

1. 「过时材料」在正文、图题、词条统一；「过期材料」只作为图鉴别名保留；id 和练习内容不变。
2. app 的回链指向 l01 `tools`；不以 metadata 正确代替实际回链检查，缺运行证据则单列未核。
3. fresh-sample 用一句教学例子替代重复分数表，机制和来源保留；baseline 与 single-variable 未被误删。
4. l03「本书」已改「本课」；提示框位置、其他正文和四项可撤回决定保持。
5. memory 区分上下文提示与权限/hook 拦截，未夸大保障范围，未修改真实配置；官方出处由 Codex 已打开核实，见修复合同。
6. glossary 与 l03 版本更新合理；l03 activities 除顶层 version 无其他差异，l02/l04 activities 无差异。没有原始改前版本的历史缺口继续保留，当前快照只能证明这轮修复未改题。
7. 当前变更范围与合同一致；旧基线保留，新基线可验证；测试、生成、构建、浏览器检查区分本次执行与沿用历史证据。

不把提示框位置偏好、基线的一句例子或单变量的方法表重新包装成阻断问题；出现新缺陷须给可复现依据并说明与本轮的关联。缺少必要证据应 BLOCKED，而非推断通过。

回执必须包含：status、files_changed（应为空）、actions_executed、checks_passed、evidence_refs、exceptions、remaining_risks、rollback_available、needs_human_review。回执正文由 Codex 保存为 `grok-review-2.md`，Grok 不写文件。
