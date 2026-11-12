---
title: "AI Agent 的高效上下文工程"
source: "https://book.oiloil.org/articles/effective-context-engineering-for-ai-agents"
author:
  - "[[Prithvi Rajasekaran 等]]"
published: 2025-09-29
created: 2026-11-11
description: "当 AI 应用从单轮问答走向多轮长周期的 Agent，核心难题不再是斟酌某一句提示词的措辞，而是如何在模型有限的「注意力预算」下，把真正高质量、高价值的信息送进上下文窗口。Anthropic 应用 AI 团队系统拆解了系统提示词的松紧尺度、清晰省 Token 的工具设计、按需即时检索（Just-in-time），以及应对长周期任务的三大上下文架构。"
tags:
  - "clippings"
---
[![AI Agent 的高效上下文工程 封面](https://book.oiloil.org/assets/course-art/effective-context-engineering-for-ai-agents.webp)](https://book.oiloil.org/assets/course-art/effective-context-engineering-for-ai-agents.png)

本篇目录 6 个小节

过去几年里，做 AI 应用最常聊的词是 **提示词工程（Prompt Engineering）** ；而现在，大家关心的重心正在转向一个更核心的命题： **上下文工程（Context Engineering）** 。用大语言模型（LLM）搭建系统时，真正的难点已经不再是「怎么为某一句提示词找到最巧妙的措辞与句式」，而是回答一个更全局的工程问题： **「每次调用模型时，我们到底该把哪些信息组合在一起喂给它，才能让它最稳定地做出我们想要的结果？」**

所谓 **上下文（Context）** ，就是你每次调用大语言模型生成回答时，一并传给它的全部信息（即全部 Token）。摆在我们面前的工程问题是：在大语言模型自身的能力与注意力上限之内，如何让这些输入信息发挥出最大价值，从而稳定、可靠地拿到预期结果。想要真正用好大语言模型，往往需要建立起 **「以上下文为中心（thinking in context）」** 的思维习惯——换句话说，就是时刻站在模型的视角审视：「它在当前这一步能看到的全部信息到底有哪些？这些信息组合在一起，最可能引导它做出怎样的行为？」

在这篇文章里，我们将系统拆解上下文工程这门新兴技艺，结合一线实战经验，为你提供一套清晰好用的判断框架，帮助你构建出可控、高效、可靠的 AI Agent。

## 上下文工程 vs. 提示词工程

在 Anthropic，我们将上下文工程视为提示词工程顺理成章的演进方向。 **提示词工程** 聚焦于如何编写和组织大语言模型的指令以获得最佳输出（可参阅我们的 [官方提示词工程文档](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) 了解核心概览与实用策略）；而 **上下文工程** 则是指在大语言模型运行过程中，围绕「如何筛选、整理并维护最有用、最高质量的信息（Token）集合」所采取的一整套策略——这不仅包括提示词本身，还涵盖了提示词之外所有会进入上下文窗口的信息。

在大语言模型落地应用的早期，编写提示词几乎占了 AI 工程工作的绝大部分，因为当时除了日常聊天之外，绝大多数应用场景都是单次分类（one-shot classification）或单轮文本生成任务。顾名思义，提示词工程最关心的是怎么把那段提示词（尤其是系统提示词 System Prompt）写好。然而，随着我们开始构建能力更强的 Agent——它们需要跨越几十甚至几百轮推理循环、在更长的时间跨度上持续干活——我们就必须有一套办法来管理 **完整的上下文状态** ，这其中包括：系统指令、工具定义、 [模型上下文协议（Model Context Protocol，简称 MCP）](https://modelcontextprotocol.io/docs/getting-started/intro) 、外部数据，以及不断变长的消息历史（Message History）等。

一个在循环（Loop）中持续运转的 Agent，每走一步都会不断产生可能对下一步有用的新数据；这些信息必须经过反复的筛选与提炼。上下文工程，正是从那个不断膨胀的潜在信息池里，精心挑选「当前这一步到底该把哪些真正有价值的内容放进有限上下文窗口」的 [科学与艺术](https://x.com/karpathy/status/1937902205765607626?lang=en) 。

![提示词工程 vs. 上下文工程](https://book.oiloil.org/assets/articles/effective-context-engineering-for-ai-agents/fig-1.webp)

提示词工程 vs. 上下文工程

与编写单条提示词这种一次性工作不同，上下文工程是一个持续动态调整的过程——每当我们决定下一步要把哪些信息传给模型时，这一轮「筛选与整理（Curation）」的过程就会重新发生一次。

## 为什么上下文工程对构建强力 Agent 至关重要

尽管大语言模型处理数据的速度很快、能装下的文本量也越来越大，但我们在实践中发现，大语言模型和人类一样：一旦手头堆放的信息量超过某个临界点，就会开始抓不住重点，甚至陷入混乱。多项针对「大海捞针（needle-in-a-haystack）」类测试的研究，揭示了 **「上下文腐化（Context Rot）」** 这一现象（详见 Chroma 团队关于 [Context Rot 的研究报告](https://research.trychroma.com/context-rot) ）：随着上下文窗口里的 Token 数量不断增加，模型从中准确找回并提取关键信息的能力会明显下降。

虽然不同模型的性能衰减速度有快有慢，但这一规律在所有模型身上都会出现。因此， **上下文必须被当成一种边际收益递减的有限资源** 。就像人类的 [工作记忆容量有限](https://journals.sagepub.com/doi/abs/10.1177/0963721409359277) 一样，大语言模型在阅读长篇上下文时，同样依赖一笔有限的 **「注意力预算（Attention Budget）」** 。每往窗口里多塞一个 Token，就会消耗掉一部分注意力预算，这就要求我们必须精打细算地挑选送入模型的每一段信息。

这种「注意力不够用」的现象，源于大语言模型底层的架构机制。大语言模型建立在 [Transformer 架构](https://arxiv.org/abs/1706.03762) 之上，它会让整个上下文里的每一个 Token [去和其余所有 Token 计算注意力关联（attend to every other token）](https://huggingface.co/blog/Esmail-AGumaan/attention-is-all-you-need) 。这意味着，当上下文里有 $n$ 个 Token 时，模型需要计算并维护 $n^2$ 个两两之间的关系（pairwise relationships）。

随着上下文越来越长，模型捕捉这些两两关系的能力就会被摊薄，在「塞进更多信息」与「保持注意力集中」之间形成天然的矛盾。此外，模型的注意力习惯是从训练数据中学来的，而在训练语料里，短文本出现的频率远远高于超长文本。这意味着模型在处理跨越超长上下文的远距离关联时，不仅训练经验更少，专门用来处理这类远距离关联的参数能力也更有限。

像 [位置编码插值（Position Encoding Interpolation）](https://arxiv.org/pdf/2306.15595) 这样的技术，虽然能让模型把原本在短文本上练出来的能力迁移到更长的上下文中，但也会让模型对 Token 精确位置的感知产生一定折损。这些因素叠加在一起，形成了一条平缓下滑的 **性能衰减曲线（performance gradient）** ，而不是到了某个长度才突然崩溃：模型在超长上下文下依然很强，但相比于在简短、精炼的上下文中工作，它在找信息的准确度和长链条推理能力上都会有所下降。

看清这些客观规律就能明白：想要做出真正靠谱的 Agent，扎实的上下文工程是绕不开的基本功。

## 高效上下文的三大核心组件

既然大语言模型的注意力预算有限，那么 **优秀的上下文工程，本质上就是用尽可能少、但质量最高且最有价值的信息（high-signal tokens），去换取最稳定、最符合预期的结果** 。这句话听起来简单，落到实际工程里到底该怎么做？下面我们就拆开上下文的各个核心部分，逐一看看具体的实战做法。

### 1\. 系统提示词：找准松紧适中的「黄金尺度」

**系统提示词（System Prompts）** 应当清晰明了，用简单、直接的语言，以 **松紧适中的尺度（right altitude）** 向 Agent 交代要求。所谓松紧适中，就是避开一紧一松两种常见误区，找到中间那个恰到好处的 **「黄金区间（Goldilocks zone）」** ：

- **极端一（管得太死、过于琐碎）** ：我们经常看到工程师在提示词里写满复杂又脆弱的 `if-else` 硬编码规则，试图把每一种细分情况下的具体动作都规定死。这种写法不仅稍微遇到新情况就容易崩，而且后续每改一次需求，维护成本都会成倍失控。
- **极端二（说得太空、过于笼统）** ：有时工程师又只给几句高高在上的空泛口号，既没有告诉模型具体的判断标准，又想当然地以为模型天生就知道团队内部的隐性背景知识。
- **恰到好处的黄金尺度** 则在这两者之间取得了平衡： **既足够具体，能清楚指明做事的方向和边界；又留出足够的弹性，给模型一套实用的判断原则（heuristics，即经验法则），让它能根据现场情况灵活处理。**
![把系统提示词调到松紧适中的尺度](https://book.oiloil.org/assets/articles/effective-context-engineering-for-ai-agents/fig-2.webp)

把系统提示词调到松紧适中的尺度

如上图所示，刻度尺左端是脆弱易碎的 `if-else` 死规矩提示词，右端则是太空泛、误以为模型什么背景都懂的笼统提示词。为了让你直观感受这三种写法的差别，我们把图中「Claude 烘焙店客服 Agent」的三份系统提示词整理对照如下：

```
# ❌ 极端一：管得太死、过于琐碎（Too specific —— 脆弱的 if-else 硬编码）
You are a helpful assistant for Claude's Bakery.
You must respond to the name Claude.
For every user request you MUST FOLLOW THESE STEPS:
1. Identify the user intent as one of the following: ["incident_resolution", "general_inquiry", "order_resubmission", "account_maintenance", "requires_escalation"]
2. - if user intent is "incident_resolution", ask 3 followup questions to gather information, then always call the resolve tool
   - if user intent is "general_inquiry", do not ask followup questions and answer in one shot
   - if user intent ...
3. Here is an exhaustive list of cases that should be tagged as "requires_escalation":
   - If the intent is incident_resolution but the user is in a different country
   - If the user left a physical belonging in the store ...

# ✅ 黄金区间：松紧适中（Just right —— 目标清晰 + 结构化框架 + 实用判断原则）
You are a customer support agent for Claude's Bakery.
You specialize in assisting customers with their orders and basic questions about the bakery. Use the tools available to you to resolve the issue efficiently and professionally.

You have access to order management systems, product catalogs, and store policies. Your goal is to resolve issues quickly when possible. Start by understanding the complete situation before proposing solutions, ask follow-up questions if you do not understand.

Response Framework:
  1. Identify the core issue - Look beyond surface complaints to understand what the customer actually needs
  2. Gather necessary context - Use available tools to verify order details, check inventory, or review policies before responding
  3. Provide clear resolution - Offer concrete next steps with realistic timelines
  4. Confirm satisfaction - Ensure the customer understands the resolution and knows how to follow up if needed

Guidelines:
  - When multiple solutions exist, choose the simplest one that fully addresses the issue
  - If a user mentions an order, check its status before suggesting next steps
  - When uncertain, call the human_assistance tool
  - For legal issues, health/allergy emergencies, or situations requiring financial adjustments beyond standard policies, call the human_assistance tool
  - Acknowledge frustration or urgency in the user's tone and respond with appropriate empathy

# ❌ 极端二：说得太空、过于笼统（Too vague —— 缺乏具体的操作标准与边界）
You are a bakery assistant, you should attempt to solve customers issues in a manner consistent with the principles and essence of the company brand. Escalate to a human if needed.

# ------------------------------------------------------------------
# 中文对照说明：
# 1. 「管得太死」试图穷举所有边缘情况，并写死「必须追问 3 个问题」「满足 7 条中的 5 条」等机械规则，一旦真实对话稍微偏离预设剧本就会直接卡死。
# 2. 「松紧适中」明确交代了角色、可用工具与核心目标，用 4 步「回复框架（Response Framework）」理清做事流程，再用 5 条「实用判断原则（Guidelines）」划清底线与转人工边界。
# 3. 「说得太空」只喊了一句「符合公司品牌原则与精神」，模型根本不知道品牌原则是什么、手头有哪些工具可用、什么情况下才算「需要转交人工」。
```

我们建议把系统提示词拆成职责分明的独立小节（例如 `<background_information>` 、 `<instructions>` 、 `## Tool guidance` 、 `## Output description` 等），并用 XML 标签或 Markdown 标题把各个部分的边界划清楚——不过随着底层模型越来越聪明，具体的排版格式本身正变得不再那么挑剔。

无论你用什么格式组织系统提示词，核心目标都是一致的： **用最精炼但足够完整的信息，把你期望的行为标准讲清楚** （注意：「精炼」不等于「只写两句话」；你依然需要在开局给 Agent 提供充分的背景信息，确保它能按规矩办事）。最稳妥的做法是：先拿你能用上的最强模型去跑一版极简提示词，看它在真实任务里哪里会出错；然后再针对暴露出来的具体翻车场景（failure modes），一点点补上清晰的指令和示例。

### 2\. 工具设计：职责单一、边界清晰、省 Token

**工具（Tools）** 让 Agent 能够与外部世界打交道，并在干活的过程中按需拉取新的上下文信息。因为工具定义了 Agent 能看什么、能干什么，所以工具设计必须极致讲究效率——既要保证 **工具返回的数据本身足够精简、不浪费 Token** ，又要让模型 **一眼就能看懂什么时候该调哪个工具** 。

在《 [用 AI Agent 为 AI Agent 编写工具（Writing tools for AI agents – with AI agents）](https://www.anthropic.com/engineering/writing-tools-for-agents) 》一文中，我们曾专门聊过怎样设计一套让大模型一看就懂、且功能之间几乎不撞车的工具集。就像写好代码库里的函数一样，每个工具都应该功能独立（self-contained）、遇到异常报错时能给出清晰好懂的提示，并且把用途说明写得明明白白。同样，工具的输入参数起名也要直观、没有歧义，顺应模型的理解习惯。

我们在实战中最常看到的翻车原因之一，就是 **工具集塞得太杂太肿** ——要么一个工具包揽了太多杂乱功能，要么好几个工具之间职责重叠，搞得模型在「这一步到底该调谁」的时候犹豫不决。记住一条简单的检验标准： **如果连一名人类工程师在某个场景下都无法斩钉截铁地说出该调哪个工具，那就千万别指望 AI Agent 能猜对。** 正如我们后文还会聊到的，只给 Agent 保留一套「最小够用的工具集（minimal viable set of tools）」，还能让长周期任务里的上下文清理与维护变得省心得多。

### 3\. 少样本示例：用几组有代表性的好例子代替边缘情况流水账

在提示词里放几个例子——也就是大家常说的 **少样本提示（Few-shot Prompting）** ——依然是我们非常推荐的做法。但很多团队容易踩进一个坑：试图把任务里可能碰到的所有刁钻边缘情况（edge cases），统统写成一长串密密麻麻的规则流水账塞进提示词，想靠穷举把每一种突发状况都堵死。 **我们非常不建议这样做。** 相反，你应该花精力挑出几组 **有代表性、能体现不同典型场景的好例子（diverse, canonical examples）** ，直接摆出来给模型看。对大语言模型来说，一个好例子往往顶得上一百条枯燥的文字规定。

总结起来，无论是写系统提示词、定义工具、给示例还是管理消息历史，底层原则只有一句话： **精挑细选，让送进上下文的每一段内容都言之有物、干净利落。** 接下来，我们看看在 Agent 运行过程中（runtime），怎样动态地获取上下文。

## 上下文检索与 Agent 自主搜索

在《 [构建高效的 AI Agent（Building effective AI agents）](https://www.anthropic.com/research/building-effective-agents) 》一文中，我们曾专门区分过「固定流程的大模型工作流（Workflows）」与「自主决策的 Agent（Agents）」。自那篇文章发布以来，我们越来越认同 Simon Willison 提出的那个 [极简 Agent 定义](https://simonwillison.net/2025/Sep/18/agents/) ： **在循环中自主调用工具的大语言模型（LLMs autonomously using tools in a loop）。**

在和大量客户一起落地的过程中，我们看到整个行业都在往这个简单清晰的模式收敛。随着底层模型越来越聪明，Agent 自己拿主意的能力（autonomy）也水涨船高：更强的模型能够独立在复杂的问题里一步步摸索排查，就算中途报错也能自己找路绕出来。

与此同步，工程师为 Agent 准备上下文的方式也在发生一次大转折。过去，很多 AI 应用习惯采用基于向量数据库（embedding-based）的 **推理前预检索（pre-inference time retrieval）** ——也就是在模型开口回答之前，先用向量相似度搜索把可能相关的文档片段捞出来，一股脑塞进提示词里。而随着 Agent 的自主能力越来越强，越来越多团队开始改用 **「按需即时加载（Just-in-time）」** 的上下文策略，来补充甚至替代传统的事前检索。

采用「按需即时加载」思路的 Agent，不再试图在开局前把所有可能用到的数据一次性塞进上下文，而是只保留 **轻量级的索引信息（Lightweight Identifiers）** ——比如文件路径、预存的查询语句、网页链接等——等真正跑到某一步需要看具体内容时，再调用工具把对应的数据动态读进上下文窗口。Anthropic 的编程工具 [Claude Code](https://www.anthropic.com/claude-code) 就是靠这套办法在超大型数据库上做复杂数据分析的：模型可以自己写 SQL 查询、把结果存成临时文件，再用 `head` 、 `tail` 等终端命令先看前几行探探路，从头到尾都不需要把几百兆的原始数据整个塞进上下文窗口里。这其实和人类查资料的习惯一模一样：我们平时不会把整座图书馆的书背在脑子里，而是记住目录、文件夹路径和书签，用到哪一页再去翻哪一页。

![一次性静态塞入全量数据与按需即时检索的对比](https://book.oiloil.org/assets/articles/effective-context-engineering-for-ai-agents/01-static-vs-just-in-time-v1.svg)

一次性静态塞入全量数据与按需即时检索的对比

除了能省下大量上下文空间，这些轻量索引自带的 **元信息（Metadata）** 还能顺带帮 Agent 更聪明地做判断。比如对一个在代码库里干活的 Agent 来说，看到 `tests/` 目录下有个 `test_utils.py` ，和在 `src/core_logic/` 目录下看到同名文件，所代表的含义完全不同。文件夹层级、文件起名方式以及最后修改时间，本身就是非常直观的线索，能帮人类和 Agent 快速判断「这东西是干嘛的、现在需不需要点开看」。

让 Agent 自己去探索和调取数据，还自然而然地实现了 **渐进式披露（Progressive Disclosure）** ——也就是让 Agent 像剥洋葱一样，顺着线索一步步按需深挖上下文。每查一步都会拿到新线索，帮它决定下一步看哪里：文件大小能看出模块复不复杂；命名方式能看出文件的职责；修改时间则提示了内容新不新。Agent 可以一层层拼出全局脉络，在当前的上下文窗口（工作记忆）里只留眼下最需要的几段内容，再配合写笔记把阶段性结论存到外面。这样一来，Agent 的注意力就能始终集中在真正高价值的信息上，而不会被淹没在一大堆虽然全面、但九成以上都和当前步骤无关的资料海里。

当然，这样做也有代价： **让 Agent 在运行时自己一步步翻找，速度肯定比直接读取提前准备好的数据要慢。** 不仅如此，它还要求工程师在背后做好精心的引导设计，确保模型手头既有趁手的工具，又有清晰的查找思路与判断原则。如果缺乏引导，Agent 很容易因为乱调工具、钻进死胡同或抓不住重点，反而白白浪费掉大量上下文。

所以在很多实际场景里，最高效的 Agent 往往会采用 **混合策略（Hybrid Strategy）** ：开局先把最核心的基础信息直接塞进上下文以保证响应速度，遇到具体细节时再让 Agent 按需去即时探索。至于「哪些开局直接给、哪些让它自己查」，完全取决于具体任务的特点。Claude Code 就是这种混合策略的典型代表：像 [`CLAUDE.md`](http://claude.md/) 这样的项目全局规范文件，会在开局时直接放进上下文窗口；而到了查找具体代码时，则交给 `glob` （按文件名查找）和 `grep` （按关键词搜索）等基础工具去实时探索，既拿到了最新最准的代码，又巧妙绕开了传统向量索引容易过期失效（stale indexing）以及维护复杂语法树（AST）的工程泥潭。

对于资料变动不那么频繁的业务场景（比如合同法务审查或财报分析），这种「核心规范预加载 + 细节按需查」的混合模式尤其好用。随着底层模型越来越聪明，Agent 架构设计的大方向一定是「让聪明的模型自己做决定」，逐步减少死板的人工预设。考虑到整个领域演进得极快， **「先用能跑通的最简单方案（do the simplest thing that works）」** ，依然是我们给所有基于 Claude 开发 Agent 的团队最实在的建议。

### 面向长周期任务的上下文工程（Context engineering for long-horizon tasks）

**长周期任务（Long-horizon tasks）** ，指的是那些需要 Agent 连续执行几十甚至上百步动作、累计产生的 Token 总量远远超过单个上下文窗口上限的复杂任务。比如大型代码库重构，或者跨越几十份资料的深度调研，往往需要 Agent 连续运转几十分钟甚至几个小时。在这种任务里，想要让 Agent 始终保持逻辑连贯、不健忘、不跑偏，就必须借助专门的上下文管理技术来突破窗口容量的限制。

有人可能会想：等模型厂商把上下文窗口扩得更大，问题不就自己解决了吗？但实际上，在可预见的未来，不管上下文窗口扩到几百万 Token，只要你追求最顶级的 Agent 表现，就依然逃不开 **上下文污染（context pollution）** 和 **注意力被无关信息稀释** 的问题。为了让 Agent 在长时间运转中始终保持清醒与高效，我们在实战中打磨出了三套正面对抗上下文污染的核心方法： **上下文压缩（Compaction）** 、 **结构化笔记（Structured Note-taking）** 以及 **多 Agent 架构（Multi-agent Architectures）** 。

![应对长周期任务上下文污染的四项核心工程策略](https://book.oiloil.org/assets/articles/effective-context-engineering-for-ai-agents/02-long-horizon-context-strategies-v1.svg)

应对长周期任务上下文污染的四项核心工程策略

#### 1\. 上下文压缩（Compaction）

**上下文压缩** ，是指当一段对话快要把上下文窗口塞满时，先把当前窗口里的核心内容提炼成一份浓缩摘要，然后带着这份摘要开启一个全新上下文窗口继续干活的做法。在处理长周期任务时，压缩通常是保证前后连贯的第一道手段。它的核心作用是在 **不丢失关键信息（high-fidelity）** 的前提下，把臃肿的历史对话浓缩提炼，让 Agent 能轻装上阵继续推进。

以 Claude Code 为例，我们在实现自动压缩时，会把当前的消息历史交给模型，让它总结并保留最关键的细节：模型会把已经敲定的架构决策、还没修好的 Bug 以及核心实现逻辑完整记下来，同时果断扔掉那些冗长的终端报错输出或日常寒暄。接着，Agent 只需要带着这份浓缩摘要和最近改过的 5 个文件，就能在全新的窗口里无缝接着干活，用户根本不用操心上下文窗口见底的问题。

做上下文压缩最考手艺的地方，在于 **拿捏「留什么」和「扔什么」** ：如果压得太狠，很容易把那些眼下看着不起眼、到了后面才发现至关重要的细节给删掉。如果你正在自己写压缩逻辑，建议拿真实的复杂 Agent 运行记录（traces）按下面两步去调优压缩提示词：

1. **第一步先保「全」（提高召回率 Maximize Recall）** ：先确保你的压缩提示词能把运行记录里所有真正有用的关键线索都捞出来，宁可多留一点，也绝不漏掉关键决策；
2. **第二步再求「精」（提升精确率 Improve Precision）** ：在不丢关键信息的前提下，一步步砍掉画蛇添足的水分，把摘要打磨得更紧凑。

而在所有冗余内容里， **最立竿见影、最容易落地的瘦身做法，就是清理历史工具调用的原始返回结果（Tool Result Clearing）** ——你想想看，某次工具调用都已经过去十几轮了，Agent 早就根据那次返回结果得出了结论，为什么还要在后面的每一轮推理里反复背着那几千行的原始返回文本呢？把历史深处的工具原始返回结果清掉，是目前最安全、副作用最小的一种轻量级压缩手段，我们也已经在 Claude 开发者平台上把它做成了一项开箱即用的 [官方上下文管理功能](https://www.anthropic.com/news/context-management) 。

#### 2\. 结构化笔记（Structured note-taking）

**结构化笔记** （也叫 **Agent 记忆 / Agentic Memory** ），是指让 Agent 在干活过程中定期把关键进展写成结构化笔记，保存在上下文窗口之外的文件或数据库里；等后面需要用到时，再随时把笔记读回上下文窗口。

这个办法能用极低的成本，给 Agent 装上跨对话、防失忆的持久记忆。比如 Claude Code 会自己维护一份待办清单（To-do list），或者你让自己的 Agent 持续更新一份 `NOTES.md` 文件（就像我们在《 [为长时间运行的 Agent 构建高效 Harness](https://book.oiloil.org/articles/effective-harnesses-for-long-running-agents) 》里拆解过的 `claude-progress.txt` 进度日志和 `feature_list.json` 功能清单一样）。靠着这本外部笔记，哪怕中间经历了上下文重置或几百次工具调用，Agent 依然能一眼看清全局进度、记住前因后果，不会干着干着就把最初的目标给忘了。

[Claude 玩宝可梦（Claude playing Pokémon）](https://www.twitch.tv/claudeplayspokemon) 的直播实验，非常生动地展示了外部笔记在写代码之外的领域有多大威力。在跨越几千步的游戏过程里，Agent 靠记笔记做到了精准计数与长线目标追踪——比如清晰记下：「在过去的 1,234 步里，我一直在 1 号道路练级，皮卡丘已经升了 8 级，离升满 10 级的目标还差 2 级。」在没有任何人类提示词教它怎么设计笔记格式的情况下，它自己画出了已探索区域的文字地图、记下了哪些关键道具已经拿到，还总结了一份对战心得笔记，记录哪些招式打哪些对手最好使。

每当上下文窗口满了需要重置（context reset）时，Agent 醒来的第一件事就是先读一遍自己留下的笔记，然后立刻接着跑长达几个小时的练级或走迷宫任务。这种跨越多次上下文重置依然不乱套的能力，让原本单靠模型自身窗口根本不可能完成的长线规划变成了现实。

随着 [Claude Sonnet 4.5 的发布](https://www.anthropic.com/news/claude-sonnet-4-5) ，我们也在 Claude 开发者平台上推出了公开测试版的 [记忆工具（Memory Tool）](https://www.anthropic.com/news/context-management) ，方便开发者直接通过类似文件系统的接口，让 Agent 在上下文窗口之外读写笔记。这样 Agent 就能随着时间推移慢慢攒起自己的知识库、在不同对话之间保持项目状态，不用把所有陈年旧账都塞进上下文，也能随时查到以前的工作成果。

#### 3\. 子 Agent 架构（Sub-agent architectures）

**子 Agent 架构** 提供了另一条突破上下文瓶颈的实用路径。与其让一个 Agent 独自硬扛整个大项目、把所有杂事都塞进同一个窗口里，不如拆分出几个专门干具体活的 **子 Agent（Sub-agents）** ，让它们各自带着干净、独立的上下文窗口去处理专门的支线任务。 **主 Agent（Main / Lead Agent）** 只负责统筹全局规划，而各个子 Agent 则负责钻进细节里写代码，或者调用工具翻阅海量资料。每个子 Agent 在探索过程中可能会消耗几万甚至更多 Token，但干完活交回给主 Agent 的，只是一份高度提炼的结论摘要（通常只有 1,000 到 2,000 个 Token）。

这种架构做到了干脆利落的 **职责隔离（Separation of Concerns）** ：繁琐的翻资料、查报错和试错过程被严密关在子 Agent 自己的窗口里，主 Agent 的上下文始终保持清爽，可以专心做全局判断与结果汇总。我们在《 [我们如何构建多 Agent 研究系统（How we built our multi-agent research system）](https://www.anthropic.com/engineering/multi-agent-research-system) 》中详细分享过这套架构，它在复杂深度调研任务上的表现远远超过了单 Agent 系统。

在实际工程中，这三种长周期策略该怎么选，主要看你的任务属于哪一类：

- **上下文压缩（Compaction）** ：最适合需要跟用户来回多轮沟通、保持对话不断档的交互式任务；
- **结构化笔记（Note-taking）** ：最适合目标里程碑清晰、需要一步一个脚印往前推的迭代开发任务；
- **多 Agent 架构（Multi-agent architectures）** ：最适合可以拆成多路同时查资料、分头探索的复杂调研与综合分析任务。

即便底层模型的能力还在不断变强，怎样在长时间、多步骤的任务里始终保持上下文清晰、逻辑不断线，依然会是决定 Agent 好不好用的核心关键。

## 总结

上下文工程，代表着我们使用大语言模型构建系统的方式发生了一次根本性转变。随着模型越来越聪明，今天的核心挑战早已不再是字斟句酌地雕琢某一句完美提示词，而是在模型每走一步时，认真筛选「哪些信息真正值得放进它那有限的注意力预算里」。无论你是在为长周期任务做上下文压缩、设计省 Token 的清晰工具，还是让 Agent 按需即时探索外部环境，背后遵循的核心原则始终只有一条： **用尽可能少、但质量最高且最有价值的信息（Token），让模型最稳定地达成预期目标。**

随着模型不断迭代，我们在文中聊到的这些具体技巧也会继续演进。我们已经看到，越聪明的模型越不需要死板繁琐的人工规则，Agent 自己拿主意的空间正变得越来越大。但无论模型的能力边界如何扩展， **把上下文当成一种珍贵且有限的资源来精打细算** ，依然会是构建可靠、高效 AI Agent 最核心的工程根基。

你今天就可以在 Claude 开发者平台上动手实践上下文工程，并通过我们的 [记忆与上下文管理实战手册（Cookbook）](https://platform.claude.com/cookbook/tool-use-memory-cookbook) 查看更多可直接复用的代码示例与最佳实践。

## 作者与致谢

本文由 Anthropic 应用 AI（Applied AI）团队撰写： **Prithvi Rajasekaran** 、 **Ethan Dixon** 、 **Carly Ryan** 与 **Jeremy Hadfield** ，团队成员 **Rafi Ayub** 、 **Hannah Moran** 、 **Cal Rueb** 及 **Connor Jennings** 亦有贡献。特别感谢 **Molly Vorwerck** 、 **Stuart Ritchie** 与 **Maggie Vo** 提供的支持。

Oil Book · AI 时代最好的实战指南