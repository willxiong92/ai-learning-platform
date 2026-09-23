# 项目管理入口落地 · Claude Code 执行合同

用户最新要求：按 Codex 规划 → Claude Code 实现 → Grok 独立复核 → Codex 最终核验推进。需要能持续说明背景需求与规划、当前设计、历史阶段成果和当前进度的项目管理载体，用于减少 AI 幻觉并让 Will 看清下一步。你是唯一文档执行者；这是现有项目管理文档整理，不做网站代码或新管理系统。

## Harness
```yaml
task_id: AI-PLATFORM-PM-20260918
policy_version: 2026-09-02.1
executor_role: Claude Code / executor / write
objective: 建立一个可持续更新、来源可追溯的项目管理入口，并承接本次 v2 复核
approved_read_scope:
  - /Users/will/code/网站克隆工作台/README.md
  - /Users/will/code/网站克隆工作台/docs/AI学习项目-底层方案.md
  - /Users/will/code/网站克隆工作台/docs/AI学习内容分类-v1.md
  - /Users/will/code/网站克隆工作台/docs/AI学习内容迭代-落地方案.md
  - /Users/will/code/网站克隆工作台/work/2026-09-18-project-management/
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md
  - 下方逐项列明的证据文件；只读相关段落，不读取客户或人员记录
  - 适用 AGENTS.md 与跨库路由
approved_write_scope:
  - /Users/will/code/网站克隆工作台/README.md
  - /Users/will/code/网站克隆工作台/docs/AI学习项目-底层方案.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md
  - /Users/will/code/网站克隆工作台/work/2026-09-18-project-management/claude-receipt.md
source_of_truth:
  current_state: /Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md
  design: /Users/will/code/网站克隆工作台/docs/AI学习项目-底层方案.md
  business_facts: 下方业务主线原文，优先于方案解释
  textbook: /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/
do_not_change:
  - 网站代码、配置、CLAUDE/AGENTS、教材、旧工作台、其他个人项目
  - 全局项目登记表、正式业务规则、原始证据
  - 框架图 HTML、内容分类和 v1 落地方案；只能在入口标明旧范围和待同步
  - 既有源仓及其他人的未提交改动；不commit/push/delete/rename
  - 不修改认证、权限、hooks、MCP，不另派 Agent
risk_level: low_local_documentation
data_class: internal_project_management; no raw customer or employee data
external_effects: none; no publication or messages
cost_budget: 仅现有已登录 Claude 订阅，指定 claude-opus-5，无后备 API；单轮最多12分钟
stop_conditions:
  - 指定模型不可用、工具被拒、文件基线改变或需要越界写入，停相关操作并报告
  - 缺用户裁决则记录 pending_will_input，不编造批准，不阻塞其余文档整理
expected_output:
  - 上述三个目标文档及一份完成回执
  - 一处当前状态源，稳定任务ID，证据索引，决策与阻塞，唯一下一步
  - README短入口，不复制完整计划或第二套状态表
  - v2方案事实修订与未决条件；不是宣布全项目验收
  - 保留之前阶段性成果和状态，不把执行方自检变成独立审查或业务成果
automated_checks:
  - 在回执列出目标文件、链接、标识与状态一致性自检；不启动构建
  - Codex会另行运行本地链接/越界改动/哈希检查；Grok只读复核
rollback: work/2026-09-18-project-management/*.before.md；由统筹按差异回退，不自行删除
human_gates:
  - 首个业务项目尚未指定
  - 首期提交入口、接收人、批阅回流位置尚未确认
  - 内容验收、团队试用、发布/成本/真实数据分别需相应批准
  - 不改变项目正式组合状态、优先级、WIP或自行登记
```

## 设计与写作要求

1. 业务 PROJECT.md 作为当前状态唯一来源。保留 project_id=ai-learning-site、status=pending_will_input 及未登记事实，不新增业务项目或改变组合优先级。标题/目标可体现已确认的“AI业务实践与学习平台”方向，代码承接现有克隆站。明确它承接同一项目，旧AI学习站冻结为教材与逻辑来源，不复制母源。
2. 顶部一屏能回答：为什么做、给谁用、目前在哪、已经有什么、还差什么、谁做、唯一下一步。背景和详细需求只摘要并链接方案，不全文再抄。
3. 设置阶段/任务表：稳定 ID、目标/交付物、负责人、依赖、状态、验收条件、证据位置、最后核验日期。状态统一用 未开始/进行中/待复核/待裁决/受阻/完成/历史参考 之类清晰语义；完成必须可追溯，不能用时间表或文件存在当完成。
4. 现有成果索引至少涵盖：VibeHub克隆基线e76f680（仓库存在不等于新平台已验收）；10领域分类（文档记载已确认）；VitePress首章教材与实现回执（实现方自检，未完成独立审查/本人试学）；旧工作台资产候选；v2方案、框架图（v2辅助图未同步新修订）；W01练习与复盘（学习证据，不是业务成效）。链接母源，不复制材料。
5. 设决策/未决列表：已确认与候选分开，裁决依据可引用方案记录但不能声称本轮重新取得确认。明确个人网站待首业务项目跑通后，不并行启动；旧站弃用是目标决策，不是已经删除/停服，迁移没验收前保留。
6. 防幻觉流程必须可执行：每次开工读PROJECT→方案当前版→本任务证据；高影响结论标事实/推断/待确认及来源；证据冲突保留双方；文件/版本变化重新核验；每次任务开始、结果确认、阻塞、决策后更新当前状态与证据。时间标为本轮实际核验日期，不臆造精确时间。说明是事件驱动人工/Agent更新，不是后台自动实时同步。
7. 三方过程：Codex拆任务/定验收，Claude实现与自检，Grok冻结版本只读复核，Codex汇总最终结果；技术、本人/用户、业务三类验收独立。Grok本轮尚未审，不能提前写通过；Claude完成只写待独立复核。
8. README 在现有全文之前增加短“项目管理入口”块，链接 PROJECT、方案、当前/历史成果定位；保留现有模板README及用户内容原样。下方原模板说明标明历史脚手架说明，不能让用户继续当成当前任务。
9. 主方案改为2026-09-18.3（v2.1修订稿，待独立复核/人审），修复下面已证实错误，保留有效范围、待定项目与三类载体。第12节保留5问，加指向PROJECT中复核问题的链接，避免另一套动态问题台账。框架图只在入口标“仍为v2辅助图，不覆盖当前文字修订”。
10. 不新增PM软件、网站页面或HTML看板，不添加后台或定时器。最终人可打开文档，Agent有明确读取顺序，日后只维护一次当前状态。

## 上轮 Codex 只读复核（2026-09-18，目标hash e66ab8fa90583dcdfb159126b06cd2b4a7f88d85fd4b3f8c6af6688e0872c925）

Q1 FAIL：别名、50/30/20、成果卡基本规则、龙虎榜节奏有原文支持；但“做出成果就能计分”错，必须通过平台化门槛和评审；方案4.1也不能直接把草稿记成30%得分。边界表“其余待验证”错：SC-IS-02暂不支持，SC-PLT-01成熟(机制)，SC-PLT-03机制，SC-OKKI-01待验证→冲成熟，SC-AWB-01文档级成熟。区分成熟度与收集优先级。边界表本身V0.1草案、签字空白，不能升级成正式业务承诺。
Q2 FAIL：51术语/8课/6案例/58前端篇计数通过，但初列迁移不能验收“整体迁完”。至少逐类覆盖对客服务学习层、作业题面、前端索引/提炼卡、术语链接与出处、FY27规则/12模板依赖、可能的本机/D1记录处置、旧侧轨弃用范围。没有查实际用户记录，不能声称存在多少。保留/引用/重写/延后/不迁可明确推荐但未定标待确认。版权继承原有内网、完整署名、不导出、不外传、不进客户材料、未经作者授权不对外演示、配图不随站分发；提炼卡同样受限，直接资源URL也需访问限制；不是断言已外泄。
Q3 PASS（仅候选映射）：AWB SC-AWB-01/GAP-GEN-01；建档SC-P1-01/GAP-GEN-03/P1-MVP-01；OKKI SC-OKKI-01/GAP-GEN-04。缺口仍为预判；必收不等于成熟、未选定Q3。
Q4 FAIL：S3本机可做、无需部署；需把目录挂载与正文完成分开；本机草稿/刷新/复制/提交/批阅/返工都要验收。旧提交依赖API+D1，“现有流程”未命名；先列提交入口/接收人/记录位置的待裁决，不能强迫上后端也不能谎称已解决。S2每个项目需预期/实际/验收人，S4试学与内容复核分开，S7审批不是上线验收（之后再决定具体托管）。作业练习可模拟，不把所有作业强制碰真实客户生产。
Q5 FAIL：除已有黑名单，还需密钥/Token/Cookie/认证及凭据链接、可反查身份ID、截图录屏日志元信息、受限提炼卡/图片、未获准个人能力评测和学习记录。公开发布包和Git历史均需检查，内部脱敏规则不能自动成为公开许可。

记录这5项历史结论为本轮前状态；各项修订只能标“已修订待复核/仍有待决”，不能自行改为Codex已PASS或Grok已ACCEPT。

## 精确可读证据路径

- /Users/will/Desktop/业务主线/C-业务机制/平台化能力建设/README.md（31–46、73–100行）
- /Users/will/Desktop/业务主线/C-业务机制/平台化能力建设/04-工具与模板/成果卡模板.md（4–6、20–26、101–121）
- /Users/will/Desktop/业务主线/C-业务机制/平台化能力建设/03-落地方案/一期有限场景边界表.md（3、34–68、107–145）
- /Users/will/Desktop/业务主线/C-业务机制/平台化能力建设/03-落地方案/缺口清单-汇总.md（3、20–34）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/PROJECT.md（90–131、200–248，只读方法/版权/历史记录）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/course-content.js（9、32、76–79）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/service-content.js（9、15、21、84、126）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/learning-content.js（164起，题面）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/learning.js（166–169、232–248，保存提交逻辑）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/templates/generic/manifest.json
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/data/course-frontend-index.json
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/public/workbench/data/course-frontend-cards.json（只读版权和metadata，不复制正文）
- /Users/will/Desktop/业务主线/A-部门项目/主管工作坊/程序化底座/陪跑AI工作台-Sites镜像/db/schema.ts
- /Users/will/code/agent-personal/content/REDACTION.md
- /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/course.yaml
- /Users/will/code/AI学习站/outputs/IMPLEMENTATION_RECEIPT.md
- /Users/will/code/AI学习站/README.md
- /Users/will/Desktop/AI学习/A-学习路线/执行单/W01_CUSTOMER_DIAGNOSIS.md
- /Users/will/Desktop/AI学习/A-学习路线/work/2026-09-16-textbook-iteration/receipt.json

## 执行说明

先核验三个目标对比baseline的哈希或内容未漂移。你没有Bash工具，按Read查看原件与before副本对齐即可，Codex负责机器哈希。仅Read/Edit/Write，确需其他工具则报告，不改权限。输出写入限定4文件，不需要另写任何脚本。终端最终回报包括 status/files_changed/actions_executed/checks_passed/evidence_refs/exceptions/remaining_risks/rollback_available/needs_human_review；同时写claude-receipt.md，不含账号身份或凭据。
