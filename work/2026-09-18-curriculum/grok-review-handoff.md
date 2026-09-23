# ALS-CUR-01 independent textbook review

你是新的 Grok reviewer 会话（与此前公开检索角色分开）。不要写文件，不再搜索外网，不执行命令，不委派。Codex 需要实质教材审查，不重复管理方案审查。

task_id: ALS-CUR-01-REVIEW
objective: 对冻结版本的24课目录与首4课教材给出ACCEPT/REVISE/BLOCKED，并以具体位置支持。
policy_version: 2026-09-02.1
executor_role: Grok / reviewer / review
approved_read_scope: /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/course.yaml、glossary.yaml、reading-list.md、lessons/l01至l04中的lesson.md和activities.yaml；/Users/will/code/网站克隆工作台/work/2026-09-18-curriculum/outline-contract.json、verified-sources.md、content-check.json、frozen-review.json。
approved_write_scope: []
source_of_truth: 用户本轮明确先定24课大纲→Grok查外部最佳实践→Claude编写AI使用基本功4课；outline-contract.json约定具体课程顺序；verified-sources.md为Codex原文核验，Grok旧搜索摘要不能覆盖它。
do_not_change: 所有文件、配置、Git、账号、网络状态；不能修复自己的发现。
data_class: 原创模拟教学内容和公开技术来源；无客户或员工数据。
risk_level: low
external_effects: 无；当前已登录订阅模型调用，无外部检索或写入。
cost_budget: 最多15轮、5分钟；不更换模型/路由或付费API。
stop_conditions: 必需读取被拒、缺证据、目标漂移、预算到达、越界；缺证据给BLOCKED，不猜测。
expected_output: 主结论、逐项PASS/FAIL、至多5个实质缺陷（路径/行或小节/触发/影响/最小修法）、偏好单列、完整completion receipt。
automated_checks: Codex已跑原有validateContent与新增结构检查，结果content-check.json；不用重跑，只审实际正文与题目，不用执行器自报代替阅读。
rollback: read-only，无改动；Codex前后比对冻结哈希。
human_gates: draft/not_open不变；通过只代表本轮内容检查，不能当Will学懂、团队试用或业务有效。

## 阅读顺序与重点

1. 先读 outline-contract.json、verified-sources.md、content-check.json。
2. 读 course.yaml，核对六模块包含提示词、上下文、资料检索/表格/SQL、知识库/RAG、Skill、人工流程AI化、工程理解及交付；先修合理。不要把10个检索领域误当必须改成10模块。
3. 实读l01–l04各lesson.md与activities.yaml（每课正文和测验都读）。重点：
   - 非技术学习者无需API/代码知识也能看懂；有解释、完整输入输出示范及为什么，再练习和自测，避免又陷入循环追问。
   - l02真正教任务表达并提供可用提示词；l03有具体材料筛选、版本/冲突和示例；l04有可填核验与比较记录，不能只讲“不要幻觉”。
   - 教材与测验匹配：有术语题也有任务/变式，答案唯一、错因成立、没有把示例里的未知事实写成已确认；自测分数不是岗位认证。
   - 模型/应用/上下文/工具/记忆关系准确；提供材料不等于训练、角色提示不赋权、工具无结果不能证明无事实；不要绝对化。
   - 预写输出明确模拟；没有真实运行/效果伪装；X候选未核全文、GitHub归档/许可边界准确；技术主张以核验包为限。
4. 读reading-list和glossary，核对来源与术语链接，不要求在本轮补齐后20课正文。

已定范围：本轮写教材母源和导出的Markdown试学稿，不改网站、不部署、不给团队开放；不应因未做网站而FAIL。本次6题5对且关键题全对为试学草案，不必争论分数阈值，只确认写明草案与人工验收。

把会导致学错/无法练习/错答案/缺关键教学环节的事项列为缺陷；措辞偏好不阻断。若无实质缺陷给ACCEPT。引用到具体源路径与章节或题号，不能只说“建议加强”。返回status/files_changed/actions_executed/checks_passed/evidence_refs/exceptions/remaining_risks/rollback_available/needs_human_review。

Codex 阅读初稿时有三个待你独立核实的具体点（先以当前冻结文件为准，勿只复述）：l02 是否把新对话不会记得说成绝对事实；l03 是否只凭来源类型便选择系统286条而不核对统计范围/口径；l02/l03 标“完整示范”的输入/输出是否仍有占位符或只说“4条/3行”而没有可对照全文。其余内容也照上述清单检查。
