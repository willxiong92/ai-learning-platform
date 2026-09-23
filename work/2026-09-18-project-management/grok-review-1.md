继续只读复核：先读冻结清单、现文和 before 快照，对照交接范围，不跑命令。三份现文已读到。接着对照 before 快照、交接清单和旧工作台实际文件名。工作台目录已见 `glossary-content.js`。接着核文件头、Q1 原文和成果路径是否可点开。**REVISE**

项目管理入口已经立起来：`PROJECT.md` 是唯一当前状态源，方案是设计，README 只做入口；首个业务项目和提交渠道都标了待决，没有把文档机制写成业务完成。不能 ACCEPT：方案里仍有会把后续迁移带偏的路径错误，外加一张被打断的表、一处重复门禁。

本轮只 Read / ListDir，**未运行**哈希、链接检查、构建或启动网站。`checks.json` 视为 Codex 机器检查回执（`protected_file_drift: []`，`new_missing: []`，`required` 全为 true）。`frozen-review.json` 与 `checks.json` 的三目标哈希字符串一致；**未**对磁盘文件再算 SHA-256。

---

## 各项结果

| # | 核查项 | 结论 | 说明 |
|---|---|---|---|
| 1 | README 能找到背景/方案/进度/成果/待决/下一步 | **PASS** | 入口块指向 PROJECT、方案、§3；一屏在 PROJECT §0。成果深链见缺陷 4，不单独否决入口 |
| 2 | 状态只维护一处；旧站/新载体/教材/框架图/任务字段 | **REVISE** | 唯一状态源成立；9-16 vs 9-18 被写成未决冲突，扩大 ALS-D-03 门禁 |
| 3 | 成果分层；候选/计划未当完成；无伪造日期 | **PASS** | e76f680 / 自检 / 未审查 / 未试学 / W01 非业务成效 均分开；`last_confirmed` 仍为 2026-09-16 |
| 4 | v2 的 Q1/Q2/Q4/Q5 修订或待决；Q3 只候选 | **REVISE** | Q1/Q3/Q4/Q5 已改或待决清楚；Q2 版权与逐类覆盖有，**旧文件路径写错** |
| 5 | 事件驱动更新；读取顺序；冲突；三方冻结；非自动同步 | **PASS** | PROJECT §6–§7、方案头均写明人工/Agent 更新 |
| 6 | 改动限定 README / 方案 / PROJECT / 回执 | **PASS** | 依据 Codex `checks.json`，非本轮自测。`AGENTS.md` 仍为克隆模板正文 |
| 7 | 未提前 ACCEPT | **PASS** | 方案头、PROJECT §5.2 均为待独立复核；本审查为 REVISE |

Q3 候选映射与缺口原文一致（`SC-AWB-01`/`GAP-GEN-01`，`SC-P1-01`/`GAP-GEN-03`/`P1-MVP-01`，`SC-OKKI-01`/`GAP-GEN-04`），保持候选、未选定。首项目/提交渠道未选 **不构成** 本轮否决。

---

## 必须修订

### 缺陷 1 · 方案 §5.1 把术语和成长课指到错误文件

**文件：** `/Users/will/code/网站克隆工作台/docs/AI学习项目-底层方案.md` **L185–L189**

**触发：** Agent 按表去迁「术语图鉴 / 成长课」，会打开 `course-content.js`。

**影响：** 那是付费《AI前端小课》路线和版权页，不是术语母数据，也不是成长课。后续盘点会找错源、漏掉 `glossary-content.js`，并可能把付费课文件当成术语源。

**证据（confirmed_fact）：**

| 资产 | 方案现写 | 实际文件 |
|---|---|---|
| 术语图鉴 | `course-content.js` | `glossary-content.js`（文件头 L1–11 `GlossaryContent`；主管工作坊 PROJECT L224–227 写明 51 条母数据在此） |
| 成长四阶段 / 8 课 / 6 案例 | `course-content.js` | `learning-content.js`（L1–21 `AIGrowthContent`；`lessons` 至 L112，`cases` L113 起共 6 个，`assignments` L164 起） |
| 前端小课版权与阶段作业 | 只写了 index/cards json | `course-content.js` L1–9、L32–80（`CourseFrontendContent`、版权、`homeworkId`） |

本轮**未**重数 51/8/6/58；计数沿用旧站 PROJECT 与卡片 metadata（`篇数.合计: 58`）。

**最小修正：** 只改 §5.1「旧位置」列：术语 → `glossary-content.js`；成长课+案例+成长作业题面 → `learning-content.js`；前端小课补上 `course-content.js`（版权/路线）及现有 json。不要扩写处置策略。

---

### 缺陷 2 · §4.1 表在第 6 行前被注释打断

**文件：** 同上 **L147–L158**

**触发：** 用 GitHub/CommonMark 渲染「闭环」表。

**影响：** 空行 + `>` 会结束表格。第 6 步「外发」掉成普通段落，Agent/人审会漏掉闭环最后一环。

**证据：** L156 表行「5 回流」后空行，L157 `> 注：…ALS-D-02`，L158 `| 6 外发 | … |`，中间没有表头分隔行。

**最小修正：** 把该注释放到**整表之后**（或写进第 3/4 行单元格）。不要插在行间。

---

### 缺陷 3 · PROJECT §4.3 把已确认方向写成未决冲突

**文件：** `/Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md` **L127–L131**；方案 **L187、L190** 同类表述

**触发：** 执行 ALS-D-03 或「裁决前不迁移上述类别」。

**影响：** 9-18 已定「克隆站即新主管工作台」（PROJECT L113–L116、方案 §9）。§4.3 把 9-16「不是对客陪跑工作台」绑在一起，等于要 Will 再批一次方向。`service-content.js` 是对客方法课（L1–19），不是客户原始材料。

**最小修正：** §4.3 只留新范围之外仍未决项：客户原始材料、实际学员记录（先盘点再定）、旧站删除/停服、FY27 规则是链接母源还是复制进站。9-18 工作台方向标已确认，不要再当 conflict。ALS-D-03 仍可逐类处置资产，不必重开产品方向。

---

### 缺陷 4 · 成果索引多数是反引号路径，不是链接

**文件：** PROJECT.md **L89–L96**（ALS-H01/H02/H04/H05/H06）

**触发：** 从 README「成果 → PROJECT §3」点进具体母源。

**影响：** 合同要求「链接母源」。H03 已有 markdown 链接，其余多为 `` `/Users/...` ``。`check-docs.py` 只扫 `[text](url)`，这批路径不会进 `new_missing`。人可以复制路径，但不能从入口直接点开。

**最小修正：** 把已读到且存在的文件改成与 H03 相同的 markdown 链接（分类 v1、框架图、W01、receipt.json、旧站根目录、方案 §5.1）。不要复制正文。

---

## 已核过、不必再改

- **Q1：** 计分须过平台化门槛（成果卡模板 L115–121；平台化 README L39–45）；边界表 V0.1、签字空白（边界表 L1–3、L138–145）；§2.1 区分成熟度/必收，`SC-IS-02` 暂不支持、`SC-PLT-01` 成熟（机制）、`SC-PLT-03` 机制、`SC-OKKI-01` 待验证→冲成熟。
- **Q4：** S3 本机、目录≠正文、草稿/刷新/复制/提交/批阅/返工拆开；提交入口 ALS-D-02 待决；作业可模拟。旧站 `learning.js` L166–169、L232–248 确为 API + 本机草稿兜底，不是未命名「现有流程」。
- **Q5：** 方案 §3.3 已补凭据链接、可反查 ID、截图/录屏/元信息、提炼卡与配图、未获准学习记录、发布包+Git 历史；内部脱敏 ≠ 公开许可。
- **机制：** 读取顺序、冲突进 §4.3、事件驱动、无后台同步、Grok/Codex 终验均标未开始（冻结时）。
- **待决如实：** ALS-D-01 / D-02 未编造；`status: pending_will_input`、`project_id: ai-learning-site` 保留。

Claude 交接中的业务原文，本轮已读到（平台化 README、成果卡、边界表、缺口清单、旧站内容文件头、REDACTION、course.yaml、实现回执、W01、receipt.json）。**未**读客户原始数据或学员作业明细。未逐条打开 `course-frontend/c01–c58.md` 正文。

---

## 核验命令

| 检查 | 本轮 |
|---|---|
| `sha256` / `check-docs.py` | **未执行**（收窄为 Read/ListDir） |
| 构建 / 启动网站 / 写文件 | **未执行** |
| Codex `checks.json` | 引用：`protected_file_drift=[]`，三文件 `new_missing=[]`，`required` 全 true；退出码本轮未见 |
| 内容对照 | 已 Read 三目标全文、三份 `*.before.md`、handoff/receipt/frozen/checks；README 现文 L16 起与 `README.before.md` L1 对齐，前插入口块 |

回滚仍可用 `work/2026-09-18-project-management/*.before.md`。修完后重新冻结再审；本审查 **不是 ACCEPT**。
