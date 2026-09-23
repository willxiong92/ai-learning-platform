# ALS-CUR-01：24 课目录与 AI 使用基本功四课教材

你是 Claude Code 唯一教材执行者（claude-opus-5）。这是新会话的 write 任务。Codex 已定大纲，Grok 已完成外部检索，用户 Will 已明确授权先写前四课。请直接完成实际教材，不再提出方案或等待批准。

## Harness

task_id: ALS-CUR-01
objective: 将 Codex 大纲落入唯一目录母源，完成 l01–l04 可从零试学的教材、练习、测验与来源登记。
policy_version: 2026-09-02.1
executor_role: executor / Claude Code / write / low
approved_read_scope: 当前项目 PROJECT.md、sources/course.yaml、sources/glossary.yaml、sources/lessons/l01–l04；/Users/will/code/AI学习站/scripts/content-lib.mjs；本任务 work 目录中的 outline-contract.json、verified-sources.md、grok-sources.md、baseline.json；适用 AGENTS.md。
approved_write_scope: 仅当前项目 sources/course.yaml、sources/glossary.yaml、sources/reading-list.md、sources/lessons/l01/lesson.md、sources/lessons/l01/activities.yaml、sources/lessons/l02/lesson.md、sources/lessons/l02/activities.yaml、sources/lessons/l03/lesson.md、sources/lessons/l03/activities.yaml、sources/lessons/l04/lesson.md、sources/lessons/l04/activities.yaml；及 /Users/will/code/网站克隆工作台/work/2026-09-18-curriculum/claude-receipt.md。
source_of_truth: 用户本轮四课授权 > outline-contract.json 教学结构 > verified-sources.md 已核来源 > 现有 sources 格式。Grok 搜索摘要是候选材料，不能覆盖已核正文。
do_not_change: 网站代码、docs、PROJECT.md、README、登记表、其他教材、旧站生成内容、Git 状态、配置、记忆、凭据、付费原文；不安装、不发布、不删除、不提交、不再委派。
data_class: 公开技术资料摘要 + 原创模拟教学数据；不读取或发送客户/员工信息。
risk_level: low，教材草稿本地可回滚。
external_effects: 无；仅既有订阅模型调用，不联网检索。
cost_budget: 单次最多 10 分钟、约 30 轮；使用当前已登录路由；无新增付费 API、充值或模型切换。
stop_conditions: 必需工具被拒、模型不可用、目标发生其他人并发修改、缺必需输入、预算到达、越界；只停止依赖项，不扩大权限。
expected_output: 11 个母源文件及回执；真实正文、示范、测验，不是空目录或 TODO。
automated_checks: 阅读 content-lib.mjs 对齐 schema；本进程只提供 Read/Edit/Write，不能运行 Bash，自查格式与引用。Codex 接手运行只读 validateContent、检查目录/题数/版本/保护路径并导出试学稿。
rollback: 已有文件原件保存在 /Users/will/code/网站克隆工作台/work/2026-09-18-curriculum/before/sources/；新增文件不自动删除。
human_gates: 保持 draft / not_open；Will 试学与团队开放尚未验收；不把客观题达标当业务能力认证。

## 先读这三份输入

1. /Users/will/code/网站克隆工作台/work/2026-09-18-curriculum/outline-contract.json（完整 6 模块 24 课；严格使用 ID、顺序、标题、目标、先修）
2. /Users/will/code/网站克隆工作台/work/2026-09-18-curriculum/verified-sources.md（已核技术来源，编课主依据）
3. 现有 sources/course.yaml、glossary.yaml、lessons/l01/lesson.md 和 activities.yaml，加 content-lib.mjs 理解格式。无需读大批历史业务材料。

## 内容交付

- course.yaml 使用版本 2026-09-18.4；24 课，每课 title/outcome/why/verify/estimate/prerequisites/status；保留 topics，补 purpose；l01–l04 available，l05–l24 planned；review.content draft，team_access not_open。10 领域是检索标签，6 模块是授课顺序。保留24周×10小时学习预算，单课45–90分钟，不伪装四课等于完成四周。
- l01 保留身份及 terms/map/model/context/tools/check/demo/practice/summary 锚点、基础解释和图，可在原文上修订；将旧后续课号更新为新目录。训练/推理、Token、模型/应用关系仍要讲清。不要只剩证据边界的重复追问。
- l02–l04 每课写完整正文，约1000–1800汉字是参考而非硬阈值，足够初学者独立理解。概念→白话解释→完整示范→小练习→测验。明确学完能做什么，不用连续问答替代教材。
- l02 用一份原创模拟“项目周报/会议行动”任务，交付可直接复制的提示词：目标、已知输入、输出、边界、成功标准；解释每部分作用和坏/好对比。不是每次对话都必须填固定表。
- l03 沿用 l02 情境，给出具体原始材料、来源/时间/状态、过时或矛盾项、选入/排除理由，展示一份可用上下文包；不暗示材料越多越好，不能机械取最新为真；示例与当前事实分开。
- l04 使用前述素材做手工核验表、固定样例基线、改一个变量、同题比较、再用新样例检查。附可填写的实验记录（总人工时间/复核/返工/错误等未测留空）。所有预写输出标“教学示范”，不得声称真实调用或提效百分比；不要求学 API 评测框架。
- 每课至少一个异常或反例、一项可完成的学习产物；后测含与讲解案例不同的变式。每课 6 道单选（0 起始 answer，至少两道 critical，错选项有具体反馈、reason、正确的回看 section），1 道简答与人工自查 rubric；沿用草案5/6且关键题全对的规则。成绩只用于自测。
- 每课 activities 保留 intro（objectives/prerequisite/duration/plan/simulation_note/scope_note）、sources、demo.steps(input/output/why)、practice（含 checklist/explanation）、quiz、feedback。所有 lesson frontmatter 与 activities version 都为 2026-09-18.4。给正文用现有组件，不引入新组件；允许添加合法 section 锚点。
- glossary 保留现有10个 ID 与链接，适量新增 l02–l04 核心术语；不将词条指向 planned 课。每课 TermCards 可选3–6个关键词（l01 保留原有规模亦可）。
- sources/reading-list.md 区分“已核采用”“GitHub 参考候选”“X 待核候选”“后续模块入口”；记录源ID、URL、采用点、适用课、核验日期、限制；Grok 8条候选数与 Codex 补充明确分开。不复制网页全文、不伪造许可/日期/互动。X 仅搜索摘要未读全文，不能当教材唯一依据；Anthropic courses 已归档，不当当前 API 教程。
- 每课正文事实引用用现有 Cite 及 activities.sources 映射；采用 verified-sources 的已核URL和2026-09-18核验日期。原创模拟例子与源主张区分，主体写自己的解释，不大段翻译；单一网页摘要宜控制短小。
- 旧测验语义变化必须升版本，旧成绩不代表新版本通过。用户是编者也是学者，看过示范后会做不等于陌生任务能迁移，简答明示此点。

## 返回

完成后读回核对，写 claude-receipt.md 并最终返回 status/files_changed/actions_executed/checks_passed/evidence_refs/exceptions/remaining_risks/rollback_available/needs_human_review；明确自动校验由 Codex 待做，不捏造运行。别把尚未完成的人工试学写为通过。
