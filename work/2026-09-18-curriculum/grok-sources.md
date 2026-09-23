先用 `web_search` 查 l01–l04 的官方教材、X 原帖和 GitHub 仓库。摘要命中不等于全文已核验。已有 l01–l04 和 Skill 的候选。下一轮补核验、工作流官方文档，并核对 GitHub 仓库与规范 URL。再补两条规范 URL：Anthropic 提示词文档原文，以及工作流/Agent 官方工程文。**结论：** 本轮 `web_search` 已拿到 **8 条可进教材的原始出处**，足够 Claude 编 l01–l04；Skill 与「人工流程 AI 化」各有 1 条官方源。全部是 **搜索摘要**，不是全文核验。知识库 / SQL **本轮未补齐**。

**证据性质：** `evidence_level=search_result`。摘要里出现的步骤、数字、stars、点赞以搜索页可见值为准；未见互动或许可一律 `unknown`。未打开全文，不能当已核对的教材正文。

---

## 来源清单（8）

| id | title | author | url | source_type | published_date | 支持课号 | 互动 | license |
|---|---|---|---|---|---|---|---|---|
| SRC-01 | Prompting fundamentals | OpenAI Academy | https://openai.com/academy/prompting/ | official_docs | 2026-04-10 | l01, l02, l04 | unknown | unknown |
| SRC-02 | How I Use LLMs（原帖） | Andrej Karpathy (@karpathy) | https://x.com/karpathy/status/1895242932095209667 | x_original_post | 2025-02-27 | l01, l02 | 点赞 13,683；转发 1,590；回复 395（搜索可见，accessed 2026-09-18） | unknown |
| SRC-03 | Prompt engineering overview | Anthropic | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview | official_docs | unknown | l02, l03, l04 | unknown | unknown |
| SRC-04 | context engineering over prompt engineering（原帖） | Andrej Karpathy (@karpathy) | https://x.com/karpathy/status/1937902205765607626 | x_original_post | 2025-06-25 | l01, l03 | 点赞 14,337；转发 2,047；回复 531；引用 613（搜索可见，accessed 2026-09-18） | unknown |
| SRC-05 | Anthropic courses（含 Prompt Engineering Interactive Tutorial + Prompt evaluations） | Anthropic (`anthropics/courses`) | https://github.com/anthropics/courses | github_official_repo | unknown（仓库于 2026-09-15 归档为只读） | l02, l03, l04 | Stars 22.8k；Forks 2.5k（搜索可见，accessed 2026-09-18） | unknown |
| SRC-06 | Evaluation best practices | OpenAI | https://platform.openai.com/docs/guides/evaluation-best-practices | official_docs | unknown | l04 | unknown | unknown |
| SRC-07 | Public repository for Agent Skills | Anthropic (`anthropics/skills`) | https://github.com/anthropics/skills | github_official_repo | unknown | l13–l16 | Stars 177k；Forks 21k（搜索可见，accessed 2026-09-18） | unknown（About 未显示许可证字段） |
| SRC-08 | Building effective agents | Anthropic Engineering | https://www.anthropic.com/engineering/building-effective-agents | official_engineering | 2024-12-19 | l17, l19, l20（兼 l04 的「先评测再加复杂度」） | unknown | unknown |

`accessed_date` 全部为 **2026-09-18**。检索方式全部为 **`web_search`**。

---

### 每条采用理由、限制、知识点

**SRC-01 · OpenAI Academy Prompting fundamentals**  
- **知识点：** 什么是 prompt engineering；先写清任务（要做什么、给谁、为什么）；用行动动词；Okay / Better / Best 对照；大任务拆小步。  
- **采用理由：** 面向工作用户，不是 API 手册。l02「任务表达」可直接当课堂骨架；Best 列已含格式/长度/对象，能接到 l03。  
- **限制：** 搜索摘要偏 ChatGPT 对话，不是「看懂一个 AI 应用」的产品拆解；许可未在摘要出现。

**SRC-02 · Karpathy《How I Use LLMs》原帖**  
- **知识点：** 聊天产品底层在干什么；模型档位与价格；thinking 模型何时用；搜索 / 深度研究 / 上传文件进上下文；代码解释器、Artifacts、Custom GPT。  
- **采用理由：** 原作者、有章节目录，是 l01「看懂一个 AI 应用」最接近非技术主管的公开原帖；互动数在搜索结果中可见。  
- **限制：** 帖本身是视频导引，教材不能把章节标题当成已看完的 2h11m 内容；部分产品名已过时，编课时要标时间。

**SRC-03 · Anthropic Prompt engineering overview**  
- **知识点：** 先定成功标准再改提示词；按「清楚直接 → 示例 → 让模型思考 → XML → 角色 → 预填 → 拆链 → 长上下文」排查；示例（multishot）与上下文分开。  
- **采用理由：** 官方技术顺序，覆盖 l02–l04；「先有成功标准与可测方法」正好挡住「改一句碰运气」。  
- **限制：** 为 Claude/开发者写的，XML/预填对非技术课堂要降阶；摘要未给发布日与许可。

**SRC-04 · Karpathy context engineering 原帖**  
- **知识点：** 提示词 ≠ 整窗上下文；要装进窗的是任务说明、示例、检索材料、工具、状态；太少或太杂都会变差；应用还要拆步骤、做人机核验。  
- **采用理由：** 原作者定义「组织材料」；给 l03 一个准确名词，避免课上只教「把提示词写长」。  
- **限制：** 工业级 LLM 应用视角，CS 主管课堂只需「材料要选、要限、要对任务」这一层，不要把 RAG/并行调度一次讲完。

**SRC-05 · GitHub `anthropics/courses`**  
- **知识点：** 提示词结构、清楚直接、角色、数据与指令分离、输出格式、逐步思考、用示例；评测 101、人工打分、简单规则打分。  
- **采用理由：** 官方课程仓库，有练习章节，是 l02–l04 最像「教材」的 GitHub 原仓。Stars/Forks 在搜索页可见。  
- **限制：** **2026-09-15 已归档只读**；课内常用 Claude 3 Haiku，例子会旧；大量 Jupyter/API，不能当非技术作业原样布置；许可证摘要未见。

**SRC-06 · OpenAI Evaluation best practices**  
- **知识点：** eval = 结构化测试；先写成功标准再收样本；评测驱动改进；人工共识 vs 用模型当裁判；位置偏差、冗长偏好。  
- **采用理由：** l04 需要「怎么判断变好了」的官方说法，比提示词合集干净。  
- **限制：** 平台/API 导向（dataset、grader）。课堂应抽「标准—样本—对照—再改提示词」，不要把 Dashboard 当必修。

**SRC-07 · GitHub `anthropics/skills`**  
- **知识点：** Skill = 含 `SKILL.md` 的文件夹；YAML 的 `name`/`description`；可带 scripts、references、模板；有 `template` 与 `skill-creator`。  
- **采用理由：** 官方实现仓，结构可直接映射 l13–l16；Stars 在搜索页可见。同检索还命中规范仓 https://github.com/agentskills/agentskills（Apache-2.0，25.5k stars），编 m4 时应把 **规范** 与 **Claude 示例仓** 分开，本条只收示例仓以免占满 8 条。  
- **限制：** 未安装、未运行代码；许可证在 About 中未见；示例偏文档/设计/开发，不是 CS SOP。

**SRC-08 · Building effective agents**  
- **知识点：** 提示词链、门禁检查、Evaluator–optimizer；能拆成固定子任务就用工作流，不要一上来上 Agent；先简单提示词 + 评测，复杂系统只在能证明更好时再加。  
- **采用理由：** l17/l19 的取舍几乎就是这篇文章的摘要级论点；也回扣 l04「没有评测就不要加流程」。  
- **限制：** 2024-12 工程博文，读者对象是做系统的人；MCP/API 细节不在本篇摘要里。同主题更新见 Anthropic Agent SDK / MCP 文，本轮未再占名额。

---

## X / GitHub 尝试结果

| 类型 | 结果 |
|---|---|
| X 原作者帖 | **找到 2 条**，URL 均为搜索直接给出：SRC-02、SRC-04（Karpathy）。未编造帖 ID。 |
| 未采用的 X | 二手解读（如 @petergyang 转述 Karpathy）、营销向「提示词体系」帖——按合同排除。 |
| GitHub 官方仓 | **找到**：`anthropics/courses`（SRC-05）、`anthropics/skills`（SRC-07）。另命中但未单列：`agentskills/agentskills`（规范，Apache-2.0）。 |
| 知识库原帖 | 搜索里见到 Karpathy 知识库/wiki 方法的**转述与个人页摘录**，**没有稳定的原帖 status URL**，故不收录、不猜 ID。 |

---

## 大纲先修缺口（最多 2，不改课）

1. **l01 没有「产品分层」词汇。** 搜索到的官方提示词文直接教怎么下指令；Karpathy 原帖才把聊天产品、工具、文件、Custom GPT 拆开。若不在 l01 用 SRC-02 补「模型 / 窗口 / 工具 / 记忆」四件套，l13 Skill、l18 MCP、l19 Agent 会像突然冒出来的新物种。  
2. **l04 的公开原典几乎全是开发者评测。** SRC-05/SRC-06 是 grader、数据集、promptfoo。非技术主管真正要练的是：对照原文、抽 3 个样本、标对错、再改一版提示词。大纲方向对，但 **不能把 API eval 当第 4 课作业**；要降阶，否则先修跨度过大。

---

## 本轮能力限制

- 只使用 `web_search`；未打开全文、未跑仓库、未用其它接口。  
- 知识库（l09–l12）与 SQL（l07）：按合同可留一轮，**本轮无合格独立条目**。  
- 热度只用于筛选；官方文即使互动为 `unknown` 仍入选。  
- 编课时必须回到原 URL 读正文；本清单纯是检索回执。
