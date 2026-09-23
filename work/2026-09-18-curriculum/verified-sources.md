# 供编课使用的来源核验包

核验日期 2026-09-18；Codex 阅读正文，Grok 先提供候选。以下摘要是编课边界，不是可整段搬运的教材。所有示例须原创模拟；不要复制网页正文、API 代码或付费课程。未知发布日期和许可写未核验。正文每一处事实引用应指向这里对应的原页；同一源跨四课只做短小摘要，教材主体以原创解释和模拟练习为主。

## 首四课可采用

- G01｜Google LLM introduction｜https://developers.google.com/machine-learning/crash-course/llm ｜Codex 补充、旧 l01 已采用；已核正文：语言模型根据上下文估计后续 token；token 不等于固定一个字；本课仅用直观说明，不教算法。l01。
- G02｜Google Fine-tuning, distillation, prompt engineering｜https://developers.google.com/machine-learning/crash-course/llm/tuning ｜已核正文 Prompt engineering 节：在输入中给指令或示例不改变模型参数，示例会影响模式/格式。l01/l02/l03。不要把个别任务必须微调的网页概括扩成所有任务的规则。
- G03｜Google What's a large language model｜https://developers.google.com/machine-learning/crash-course/llm/transformers ｜旧 l01 来源，本轮重新打开；用于模型局限及幻觉的基础说明，不引入未讲过的 Transformer 细节。l01。
- SRC-08｜Anthropic Building effective agents｜https://www.anthropic.com/engineering/building-effective-agents ｜Grok 候选、Codex 已读正文：模型可与检索、工具和记忆组成应用；workflow 与 agent 的控制方式不同；从简单方案开始。l01 只借模型/应用/工具链路，后续 l19 再扩。不能据此声称所有应用都有记忆或系统访问权。
- SRC-01｜OpenAI Prompting｜https://learn.chatgpt.com/docs/prompting ｜Grok 旧链接跳转至此，已核正文：按需要提供目标、上下文、输出要求和边界；不是每次都要填齐四项；明确期望结果与相关材料。l02/l03。原 Grok 写的发布日期未独立确认，不写日期为事实。
- SRC-03｜Anthropic Prompt engineering overview｜https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview ｜已核正文：先有成功标准、检验方式和初始提示词，再优化；当前页面把具体技巧移至 best practices。l02/l04。不把旧摘要中的 XML、prefill 或“写思维链”当所有模型通用规则。
- SRC-06｜OpenAI Evaluation best practices｜https://developers.openai.com/api/docs/guides/evaluation-best-practices ｜已核正文 What are evals/Design your eval process：明确目标、准备样例、定标准、比较结果并持续改进；关注真实任务和异常，结合人工判断，不凭观感。本课仅转为手工小实验，不教 API 或已进入退役流程的 Evals 平台。l04。不能把几个模拟样例包装成统计显著性或真实提效数据。
- A01｜Anthropic Define success criteria and build evaluations｜https://platform.claude.com/docs/en/test-and-evaluate/develop-tests ｜Codex 补充、已核正文：标准具体、可衡量、可达成、相关；定性量表可用；包含无输入/无关输入/模糊情况。l04。不要照搬开发者指标 F1/BLEU/API 代码，更不要写未经业务测量的达标数值。

## GitHub / X 候选，限制要保留

- SRC-05｜https://github.com/anthropics/courses ｜Grok 发现，Codex 已核仓库页面：2026-09-15 已归档，页面显示 22.8k stars / 2.5k forks（仅当日观察）。未逐个读 notebook，许可未逐文件核验。可借“讲解→例题→练习”组织思路，不能宣称执行验证、直接复制代码或代表当前产品操作。不是首四课技术主依据。
- SRC-07｜https://github.com/anthropics/skills ｜Grok 发现、Codex 已打开仓库页面；未深读每个 skill、未执行、未逐文件核许可。仅登记为 l14–l16 候选，不能标成本轮已写好 Skill 课程。热度不采用 Grok 未独立核验数字。
- SRC-02｜https://x.com/karpathy/status/1895242932095209667 ｜Grok 搜索命中 How I Use LLMs 原帖；仅搜索摘要，Codex 直接打开失败，视频正文未看。状态：candidate_unverified。互动数、发布日期不作为确认事实；不作为教材具体主张的唯一依据。
- SRC-04｜https://x.com/karpathy/status/1937902205765607626 ｜Grok 搜索命中 context engineering 原帖；同样仅摘要，Codex 直接打开失败。状态：candidate_unverified。核心概念以已核官方文档支持，暂不引用未核原帖全文。

后续模块的原始资料入口（待各模块编写时细读）：https://agentskills.io/skill-creation/best-practices （Skill）；https://docs.dify.ai/en/cloud/use-dify/knowledge/readme （知识库）；https://www.postgresql.org/docs/current/tutorial-sql.html （SQL）。这三项不算 Grok 本轮 8 条来源，不假称已完成对应教材或实验。

来源采用判定：官方/原作者、相关性、时间版本、能否查到原文、可复现性、许可和读者门槛；点赞与 star 只用于发现。本轮公开检索未提交客户/员工资料。
