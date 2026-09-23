# ALS-L02-04-R1 · Claude Code 修复合同

> Codex 于 2026-09-19 裁决。任务状态只在产品真源 `PROJECT.md` §5.21 维护；本文件是待执行合同，不代表已经派发或完成。

## 三项裁决

1. 修应改 1，以及建议 1、4、5；建议 3 收窄到 `fresh-sample.md`。建议 2 保持当前位置，待 Will 试读反馈；`baseline.md` 已是一句例子，`single-variable.md` 是方法对照表，均不机械删改。
2. Claude Code / `claude-opus-5` 在原内容路径单写修复；保留首审基线，修后重新冻结，再由 Grok 只读二审。Codex 负责终验。
3. Grok 第二轮 ACCEPT、Codex 检查通过后，一次交 Will 试读第 2–4 课及相关术语；不在当前有已知命名问题的版本上启动正式验收。

## 执行前置条件

本次命令行预检：Claude Code 2.1.277，`claude auth status --json` 返回 `loggedIn=false`、`authMethod=none`、`apiProvider=firstParty`、`subscriptionType=null`。见 `dispatch-preflight.json`。当前没有启动修复进程，也没有产生执行 session_id。

只有当前执行环境恢复**已批准的账号/订阅路由**并核实指定模型可用后，才能派发本合同。不得登录其他账号、注入 API Key、启用付费 API、变更 provider/权限模式、绕过安全控制，或自行换执行器。恢复后先重查基线，不能把本次通过视作未来仍通过。

```yaml
task_id: ALS-L02-04-R1
objective: 消除术语命名与回链错误，压缩一处重复示例，修正记忆强制限制的说明；保留既定课程和练习边界
policy_version: 2026-09-02.1
executor_role: Claude Code / executor / write / claude-opus-5
approved_read_scope:
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/course-materials.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/course.yaml
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/glossary.yaml
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/lessons/l01/lesson.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/lessons/l02
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/lessons/l03
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/lessons/l04
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/terms
  - /Users/will/code/网站克隆工作台/work/2026-09-19-lessons-l02-l04
  - 网站仓现有 AGENTS.md、README.md、package.json、现有内容生成/渲染脚本及 tests；仅为核对与运行既定检查
  - 检查脚本已经引用的内容库依赖；不修改冻结旧站
approved_write_scope:
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/glossary.yaml
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/lessons/l03/lesson.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/lessons/l03/activities.yaml（仅顶层 version）
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/terms/stale-material.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/terms/fresh-sample.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/terms/memory.md
  - /Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md（仅本批进度与证据，不更改正式项目阶段）
  - /Users/will/code/网站克隆工作台/work/2026-09-19-lessons-l02-l04（本批回滚快照、差异、日志、哈希、回执）
  - 仅既定 content:ai/build/typecheck 自动生成的 generated.json、site-catalog.json、rendered.json、term-articles.json、构建缓存及临时文件；不手改生成物
source_of_truth: PROJECT.md §5.20–5.21 > sources/course-materials.md 模板与样板反馈 1–7；内容母源为 sources/
do_not_change:
  - 所有练习的题干、选项、顺序、答案键、解析、term、section、安排；l03 仅同步顶层 version
  - l01、l02、l04 正文；第 5–24 课；course.yaml；其他术语正文
  - 提示框位置、课程标题、l04 演示位置、分类、题目挂靠、前端样式、生成器、测试与依赖
  - 全局登记表、Wiki、A线学习记录、旧工作台、个人网站
  - 全局 Agent 配置、认证、权限、hooks、MCP、remote、生产库、旧托管
  - 仓内既有未提交改动及所有备份
data_class: 原创教学内容、公开出处、模拟案例；不含客户原始数据或认证信息
risk_level: low
external_effects: none；不提交、不推送、不发布、不开团队访问
cost_budget: 仅已批准订阅；不新增费用；单次最多 600 秒、12 轮，额度或预算不足即停
stop_conditions:
  - 认证/已批准路由/指定模型不可用；权限拒绝；出现密钥或认证材料
  - policy_version 不一致、冻结文件漂移、并发写入、缺少必要来源
  - 需要修改合同以外路径、生产、外部写入或新增费用
  - 检查失败阻止冻结为通过版；已授权路径内可诊断修复，两轮仍失败则回 Codex 重判
expected_output: claude-repair-receipt.md、repair.diff、修前快照、首审基线副本、更新后的 baseline.sha256 与命令日志
automated_checks:
  - 开始前及结束时核查本批范围和基线；逐项确认练习除允许的 version 外完全一致
  - npm run content:ai
  - node --test scripts/*.test.mjs
  - npm run check
  - 使用现有本机浏览器/预览能力验证命名、术语回链、三篇改动词条及 390px 布局；缺能力则明确未核，不宣称通过
rollback: 修前在本任务 work/ 内保存 6 个源文件的逐字快照；只允许对本批文件恢复，禁止 git reset 或清理其他改动；不自动删除备份
human_gates: Will 本人/业务验收；任何提交、推送、发布、对团队开放仍须明确批准
```

## 精确修改清单

| 项 | 文件与依据 | 修改与验收 |
|---|---|---|
| R1 正式名统一 | `glossary.yaml:209–213`；`lessons/l03/lesson.md:79,81,223`；`terms/stale-material.md` | 正式名保持「过时材料」；第 3 课正文、图题、术语链接和详解中的术语用名统一；glossary aliases 加「过期材料」，保留现有别名；id 不变，不改练习 |
| R2 app 回链 | `glossary.yaml:33–42`；l01 `{#tools}` | 仅 app 的 section 从 model 改 tools，验证图鉴回到真实讲解小节 |
| R3 去除重复示范 | `terms/fresh-sample.md:15–20` | 删除重复的 S1/S2/S3 分数表，换一句标明教学模拟的例子；保留「未见样例为何能暴露旧样例之外的问题」机制及来源；不改 l04 原始示范表 |
| R4 网页课程称谓 | `lessons/l03/lesson.md:36` | 「本书叫」改「本课叫」 |
| R5 强制限制说明 | `terms/memory.md:25` 与避坑第 3 条 | 区分说明文件的行为提示与工具层拦截：权限禁止规则或 PreToolUse hook（工具执行前检查）可用于拦截匹配的操作；避免写成说明文件能保证「绝对不做」；仅修改教材措辞，绝不配置实际 hooks/权限 |
| 版本元数据 | course-materials.md「改版提醒」 | glossary 升到 2026-09-19.4；l03 lesson 与 activities 的顶层 version 同步升到 2026-09-19.2；activities 其他字段和序列逐字保持 |

建议 3 的首审表述过宽：`baseline.md` 当前只有一句带分数的教学例子，`single-variable.md` 当前是固定条件/单一改动/同题比较的方法表，不是整张分数表。二者保持，避免无依据返工。保留其他四项可撤回决定供 Will 试读，不在本轮扩改。

## 已核实的官方依据

Codex 于 2026-09-19 打开以下官方正文；无须凭检索摘要补写能力。仅支持 R5，不代表其他历史产品说法全部重核。

- Anthropic，`How Claude remembers your project` → `CLAUDE.md vs auto memory`：两类记忆作为上下文，并非强制配置；对需要阻止的动作，文档指向 PreToolUse hook。https://code.claude.com/docs/en/memory
- 同页 `Deploy organization-wide CLAUDE.md`：明确区分 permissions.deny 等由客户端执行的设置与表达行为要求的 CLAUDE.md。
- Anthropic，`Configure permissions`：https://code.claude.com/docs/en/permissions

## 执行及复核顺序

1. 重新核实已批准路由、模型、权限、单写状态；查验原 `baseline.sha256` 25 项。先存修前快照及 `baseline.review-1.sha256`，不得覆盖唯一首审证据。
2. 按上表修改并运行既有检查。写清实际命令、退出码、日志；本轮未重跑的历史 99/99 不能作为本轮成绩。
3. 记录逐文件 diff；l03 activities 必须只有顶层 version 差异，l02/l04 activities 必须无差异。题目历史改前版本仍不足，不能声称补齐首轮历史证据。
4. 对原 25 项按原格式重新计算 `baseline.sha256`；保留来源版本与修复回执哈希，交接期间不再改被审源文件。
5. 返回 Codex。由 Codex 核对变更范围后派发 `grok-review-2-handoff.md`；Claude 不自行调用其他 Agent。

回执字段必须完整：`status`、`files_changed`、`actions_executed`、`checks_passed`、`evidence_refs`、`exceptions`、`remaining_risks`、`rollback_available`、`needs_human_review`。状态至多写 implemented_self_checked / pending_independent_review，不能写 Will 已验收或业务已验证。
