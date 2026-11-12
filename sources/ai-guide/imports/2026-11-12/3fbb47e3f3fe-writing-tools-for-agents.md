---
title: "如何为 Agent 编写好用的工具"
source: "https://book.oiloil.org/articles/writing-tools-for-agents"
author:
  - "[[Ken Aizawa]]"
published: 2025-09-11
created: 2026-11-11
description: "为什么把传统软件的 API 直接包装给 AI Agent 会频频出错？Anthropic 工程师 Ken Aizawa 系统拆解了面向 Agent 的工具开发与优化方法：从快速搭建原型、设计贴近真实场景的评测集、让 Claude Code 分析调用日志自动重构工具，到工具粒度合并、命名空间划分、精简返回值与可操作报错、以及打磨工具描述的五大工程原则。"
tags:
  - "clippings"
---
[![如何为 Agent 编写好用的工具 封面](https://book.oiloil.org/assets/course-art/writing-tools-for-agents.webp)](https://book.oiloil.org/assets/course-art/writing-tools-for-agents.png)

本篇目录 5 个小节

借助 [模型上下文协议（Model Context Protocol，简称 MCP）](https://modelcontextprotocol.io/docs/getting-started/intro) ，我们可以为大语言模型（LLM）Agent 装上几十甚至上百个工具，去解决真实世界里的复杂任务。但问题也随之而来： **怎样才能让这些工具真正趁手好用、发挥出最大威力？**

在这篇文章中，我们将分享 Anthropic 在各类 Agent 系统中验证过的核心工程经验，聊聊除了升级底层大模型本身之外，如何通过改进工具设计大幅提升 Agent 的实战表现。

我们会先从一套完整的工具开发与调优流程讲起：

- 快速搭建并本地测试你的工具原型
- 结合真实业务场景，用 Agent 构建并运行全面的工具评测（Evaluation）
- 与 [Claude Code](https://www.anthropic.com/claude-code) 等智能体协作，根据评测结果自动迭代并提升工具表现

随后，我们会将实战中提炼出的高价值经验，浓缩为编写好用工具的五大核心原则：

- 挑准真正该做的工具（以及果断放弃不该做的工具）
- 用清晰的命名空间（Namespacing）划定工具职责边界
- 让工具向 Agent 返回真正有价值的上下文信息
- 极致优化工具返回结果的 Token 占用效率
- 用写提示词的功夫精细打磨工具描述与参数规范（Specs）
![与 Claude Code 协作评测并自动优化工具的闭环](https://book.oiloil.org/assets/articles/writing-tools-for-agents/fig-eval-loop.svg)

与 Claude Code 协作评测并自动优化工具的闭环

如上图所示，搭建一套系统的评测机制，能让你清晰量化工具的真实表现；而将评测日志交回给 Claude Code，就能围绕评测指标自动闭环优化工具的实现与说明。

## 什么是工具？

在计算机科学中， **确定性系统（Deterministic systems）** 只要给定相同的输入，每次都会雷打不动地返回完全一致的输出；而像 AI Agent 这样的 **非确定性系统（Non-deterministic systems）** ，哪怕初始条件一模一样，每次生成的回答与采取的动作也可能不尽相同。

当我们按传统方式写软件时，本质上是在两个确定性系统之间签订契约。举个例子，像 `getWeather("NYC")` 这样的函数调用，无论调用多少次，都会以完全相同的方式去拉取纽约市的天气数据。

而 **面向 Agent 的工具（Tools）** 则是一种全新的软件形态：它是在「确定性的底层系统」与「非确定性的智能体」之间建立契约。当用户问出一句「今天出门要带伞吗？」时，Agent 可能会去调用天气工具，可能会凭自己的通用常识直接回答，甚至可能先反问一句「你在哪个城市？」。不仅如此，Agent 有时还会产生幻觉，或者根本没看懂某个工具到底该怎么调。

这意味着，在为 Agent 编写软件时，我们必须彻底扭转以往的开发思维：不能再按照给其他程序员或传统系统写函数、写 API 接口的老习惯去写工具和 [MCP 服务端（MCP servers）](https://modelcontextprotocol.io/) ，而是必须 **专门针对 Agent 的认知与决策特点来设计工具** 。

我们的目标，是拓宽 Agent 能够稳定解决问题的能力范围，让它在面对五花八门的真实任务时，都能灵活调用工具走通不同策略。好消息是，我们在实践中发现：那些让 Agent 用起来最顺手、最不容易出错的工具，人类工程师读起来往往也格外直观好懂。

## 如何编写与打磨工具

在这一节里，我们来看看如何与 Agent 结对协作，共同编写并持续改进你提供给它的工具。最稳妥的起步方式是：先快速搭好一个工具原型并在本地跑通测试；接着运行一套全面的自动化评测，用来衡量后续每一次改动的真实效果。和 Agent 并肩配合，你可以反复循环「评测 → 改进」的过程，直到工具在真实业务任务上取得稳定可靠的表现。

### 1\. 快速搭建原型（Building a prototype）

在没有亲手试跑之前，人类其实很难凭空预判哪些工具设计对 Agent 来说顺手好用、哪些又会让它频频卡壳。所以第一步，是先快速搭起一套可运行的工具原型。如果你用 [Claude Code](https://www.anthropic.com/claude-code) 来帮你写工具（很多时候甚至可以一步到位生成初版代码），建议把工具所依赖的软件库、API 接口或 SDK（包括 [MCP SDK](https://modelcontextprotocol.io/docs/sdk) ）的官方文档一并提供给 Claude。现在很多官方文档网站都会在根目录下提供专门面向大模型排版的纯文本文件 `llms.txt` （例如 [Anthropic 官方 API 的 `llms.txt`](https://docs.anthropic.com/llms.txt) ），直接喂给模型效果非常好。

将工具封装成 [本地 MCP 服务端（Local MCP server）](https://modelcontextprotocol.io/docs/develop/connect-local-servers) 或 [桌面扩展包（Desktop extension，简称 DXT）](https://www.anthropic.com/engineering/desktop-extensions) ，就能直接在 Claude Code 或 Claude 桌面端（Claude Desktop app）里挂载并实测你的工具：

- 要把本地 MCP 服务端接入 Claude Code，只需在终端运行 `claude mcp add <name> <command> [args...]` 。
- 要把本地 MCP 服务端或 DXT 扩展包接入 Claude 桌面端，可以依次进入 `Settings > Developer` （设置 > 开发者）或 `Settings > Extensions` （设置 > 扩展）进行配置。
- 此外，你也可以通过代码直接把工具定义传入 [Anthropic API](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) 调用中，方便做自动化脚本测试。

搭好原型后，先自己亲手测几轮，把明显硌手、跑不通的粗糙边角磨平；同时收集真实用户的试用反馈，摸清大家平时到底会用什么样的提问方式、在哪些业务场景下调用你的工具。

### 2\. 运行系统化评测（Running an evaluation）

接下来，你需要通过运行自动化评测，客观衡量 Claude 使用这套工具的真实水平。首先围绕真实业务场景生成大批量的评测任务；我们非常建议让 Agent 参与进来，帮你一起分析评测结果、找出工具的改进方向。你可以在我们的 [工具评测实战手册（Tool Evaluation Cookbook）](https://platform.claude.com/cookbook/tool-evaluation-tool-evaluation) 中查看这套端到端流程的完整代码实现。

#### 生成贴近实战的评测任务（Generating evaluation tasks）

有了早期工具原型后，你可以让 Claude Code 快速浏览你的工具源码，一口气生成几十组贴近实战的「提问与预期结果（Prompt and response pairs）」。评测题目应当脱胎于真实的使用场景，并连接接近真实业务复杂度的数据源与服务（例如真实的内部知识库或微服务接口）。我们强烈建议避开那些过于简陋、浮于表面的「玩具级沙盒（sandbox）」环境——它们根本无法用足够的复杂度去压测出工具的潜在缺陷。一道高质量的评测任务，往往需要 Agent 连续执行多次（甚至几十次）工具调用才能完成。

来看看什么是 **高质量的评测任务（Strong tasks）** ：

- 下周帮我和 Jane 约个会，讨论最新的 Acme Corp 项目进展。把我们上次项目规划会的会议纪要作为附件带上，并顺便订一间会议室。
- 客户 ID `9182` 反映自己买一次东西被扣了三次款。请找出所有相关的日志记录，并排查一下还有没有其他客户也碰到了同样的问题。
- 客户 Sarah Chen 刚刚提交了退订申请。请帮我准备一份挽留方案，需要查清：（1）她为什么要退订；（2）什么样的挽留优惠最能打动她；（3）在发出挽留方案前，我们需要注意哪些潜在风险因素。

再对比一下什么是 **过于单薄的弱评测任务（Weaker tasks）** ：

- 下周帮我和 `jane@acme.corp` 约个会。
- 在支付日志里搜索 `purchase_complete` 且 `customer_id=9182` 的记录。
- 查找客户 ID `45892` 提交的退订申请。

每一道评测题目都应该配有一个可验证的预期结果（Verifiable response or outcome）。你的验证器（Verifier）可以很简单，比如直接拿采样输出和标准答案（Ground truth）做精确字符串比对；也可以更灵活，比如请 Claude 充当裁判模型来评判回答是否达标。注意避免使用过于死板的验证器——不要因为排版格式、标点符号或完全合理的同义换句话说，就把原本正确的回答误判为失败。

对于每一组「提问—结果」测试对，你还可以选填「预期 Agent 在解题过程中应该调用哪些工具」，用来统计 Agent 在评测中是否准确理解了每个工具的用途。不过要注意，完成同一个任务往往不止一条正确路径，因此尽量不要把调用路径规定得太死，以免对特定解题套路产生过拟合（Overfitting）。

#### 执行评测循环（Running the evaluation）

我们建议通过代码脚本直接调用大模型 API 来批量跑评测。架构上只需要用最简单的 Agent 循环（即在 `while` 循环里交替执行大模型 API 调用与工具调用）：每一道评测任务独立跑一个循环，给每个评测 Agent 传入一道任务题目和你的待测工具集。

在评测 Agent 的系统提示词（System Prompt）里，我们建议要求 Agent 在输出供验证器检查的「结构化最终回答块」之前，先输出专门的 **「推理分析块（Reasoning block）」** 和 **「工具使用反馈块（Feedback block）」** 。让模型在发起工具调用和给出回答前先把思考过程写出来，能够自然触发思维链（Chain-of-Thought，简称 CoT），让大模型发挥出更高的有效智力水平。

如果你是用 Claude 跑评测，可以直接开启官方原生的 [交错思考（Interleaved thinking）](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#interleaved-thinking) ，开箱即用地获得同样效果。这能帮你看清 Agent「为什么调某个工具」或「为什么漏调某个工具」，一眼定位工具描述和参数规范里哪句话写得不够清楚。

除了最核心的任务最终准确率（Top-level accuracy），我们还建议一并采集其他关键运行指标：单次工具调用与整道任务的总耗时、工具调用总次数、累计消耗的 Token 总量，以及工具报错次数。追踪工具调用链条不仅能帮你看清 Agent 最常走的工作流路径，往往还会提示你：「哪几个经常被绑在一起连调的工具，其实可以直接合并成一个」。

#### 深入分析评测结果（Analyzing results）

从揪出前后矛盾的工具描述、低效的底层实现，到指出让人摸不着头脑的参数结构（Schema），Agent 都是帮你挑刺和提供反馈的得力搭档。但有一点务必留心： **Agent 在反馈和回答里「没说出口的内容」，往往比它明确写出来的内容更重要。** 大语言模型并不总是 [嘴上说的和实际内部想的完全一致](https://www.anthropic.com/research/tracing-thoughts-language-model) 。

仔细观察你的 Agent 在哪个地方卡住了、或者开始犯迷糊。通读评测 Agent 的推理过程与反馈记录（CoT），找出那些硌手的粗糙细节；同时务必去翻看原始的完整运行记录（Raw transcripts，包含每一次工具调用的入参和原始返回文本），抓出那些模型在思考块里压根没提、但实际操作已经变形的异常行为。学会从字里行间读懂弦外之音；记住，跑评测的 Agent 自己也未必知道标准答案和最优策略是什么。

同时，认真分析你的工具调用统计指标：

- **如果出现大量重复、冗余的工具调用** ：往往说明分页大小（Pagination）或 Token 截断上限参数设得不合理，逼着模型一遍遍翻页；
- **如果频繁出现「参数无效」类的工具报错** ：则明确提示你需要把工具描述写得更清楚，或者补上几个直观的参数格式示例。举个真实案例：当我们最初上线 Claude 的 [网页搜索工具（Web search tool）](https://www.anthropic.com/news/web-search) 时，通过看日志发现 Claude 老是画蛇添足地在搜索词参数 `query` 后面硬塞一个 `2025` ，结果导致搜出来的结果严重偏科、质量下滑——后来我们只需在工具描述里把这一条边界讲清楚，就立刻把 Claude 引回了正确方向。

### 3\. 与 Agent 结对优化工具（Collaborating with agents）

你甚至可以把「分析评测结果并动手改工具」这件事也直接交给 Agent 来干。做法非常简单：把评测 Agent 跑出来的完整运行记录（Transcripts）拼接到一起，直接粘贴给 Claude Code。Claude 非常擅长阅读大段运行日志，并且能够一次性对十几个工具进行全局重构——比如当你修改了某个工具的逻辑或参数名时，它能自动检查并同步更新其余所有关联工具的实现代码与说明文档，确保整套工具集前后高度一致、不打架。

事实上，本文总结的绝大部分实战建议，正是我们用 Claude Code 反复迭代优化 Anthropic 内部工具集时沉淀下来的。我们的评测集直接建立在内部真实工作区之上，原汁原味地还原了内部业务流程的复杂度——涵盖真实的项目、文档与消息记录。

为了防止工具改着改着只对训练评测集产生过拟合（Overfit），我们专门划分了独立的 **留出测试集（Held-out test sets）** 。正如前文图解右侧的柱状图所示，留出测试集的结果有力地证明：即便对比我们内部研究员亲手编写的「专家级」工具实现（以及 Claude 初次生成的版本），通过这套「评测日志反哺重构」流程，依然能进一步榨取出可观的性能提升——内部 Slack MCP 工具集的测试准确率从 `67.4%` 跃升至 `80.1%` ，内部 Asana MCP 工具集也从 `79.6%` 进一步提升到了 `85.7%` 。

接下来，我们就把这一路打磨沉淀下来的核心收获，提炼为编写好用工具的五大工程原则。

## 编写好用工具的五大核心原则

在这一节中，我们将实战经验浓缩为五条最核心的指导原则，帮你写出让 Agent 一用就顺的高质量工具。

### 1\. 为 Agent 挑准真正合适的工具（Choosing the right tools for agents）

**工具绝不是越多越好。** 我们在实践中最常看到的踩坑误区，就是开发者把现有软件的功能函数或 REST API 接口直接一对一原样套壳（Wrap）成工具丢给 Agent——却压根没考虑这种粒度对 Agent 到底合不合适。之所以会踩这个坑，是因为 Agent 与传统软件有着截然不同的 **交互感知方式与能力边界（Affordances）** ——换句话说，它们理解「手头这个工具能拿来干什么」以及处理返回数据的方式，跟传统代码完全不是一回事。

大语言模型 Agent 的「上下文窗口」是极其有限的（单次能同时看清和处理的信息量存在明显上限），而传统计算机的内存既便宜又充裕。不妨想想「在通讯录里找一个联系人」这个简单任务：传统软件程序可以毫不费力地把整本通讯录的几千个联系人全读进内存，再用 `for` 循环从头到尾逐个比对一遍。

但如果一个大语言模型 Agent 调用了某个返回 **全部** 联系人的工具，接着不得不逐个 Token 地从头读到尾，那它就把极其宝贵的上下文空间全浪费在了无关信息上（这就好比人类查纸质电话簿时，不看字母索引，非要从第一页第一行开始逐字往下硬读，做全量暴力搜索）。无论是对人类还是对 Agent，更自然、更聪明的做法都是先按字母或关键词直接跳到相关的那一页。

因此，我们建议： **先针对最高频、最核心的业务工作流，精心打磨少数几个真正好用的工具（与你的评测任务直接对齐），跑顺之后再按需扩展。** 在刚才的通讯录例子里，你应该实现的是 `search_contacts` （搜索联系人）或 `message_contact` （给联系人发消息）工具，而不是一个把全量数据倒出来的 `list_contacts` （列出所有联系人）工具。

优秀的工具懂得在底层 **把多个零碎操作聚合成一步（Consolidate functionality）** ，在工具内部默默消化掉原本需要多次 API 调用才能完成的逻辑。比如，工具可以在返回结果里自动附带关联的上下文元数据，或者把平时经常被串在一起连调的多步任务合成一次工具调用。

![直接搬移底层 API 与面向 Agent 聚合工作流工具的设计对比](https://book.oiloil.org/assets/articles/writing-tools-for-agents/fig-api-vs-agent-tools.svg)

直接搬移底层 API 与面向 Agent 聚合工作流工具的设计对比

如上图所示，这里有几组非常典型的聚合改造示例：

- **预约会议日程** ：与其分别实现 `list_users` （列出用户）、 `list_events` （列出日程）和 `create_event` （创建日程）三个细碎工具，不如直接实现一个 `schedule_event` （安排会议）工具，在内部自动查好各方空闲时间并完成日程创建。
- **排查系统日志** ：与其实现一个把整个文件倒出来的 `read_logs` （读取日志）工具，不如实现一个 `search_logs` （搜索日志）工具，只返回命中的关键日志行以及前后几行必要的上下文。
- **汇总客户背景** ：与其让模型分别调用 `get_customer_by_id` （按 ID 查客户）、 `list_transactions` （列出交易）和 `list_notes` （列出备注），不如直接提供一个 `get_customer_context` （获取客户完整背景）工具，一次性把该客户近期所有关键信息整齐汇总返回。

请确保你编写的每一个工具都有清晰、独特且互不重叠的职责。好的工具应当让 Agent 能够像人类工程师一样自然地拆解并解决任务，同时把原本会产生在上下文窗口里的大量中间过程数据（Intermediate outputs）直接在工具内部消化掉。

过多或功能重叠的工具，反而会分散 Agent 的注意力，让它在挑工具时犹豫不决、偏离高效策略。在动工写代码前，认真规划并克制地挑选「到底该做哪些工具、坚决不做哪些工具」，往往能带来事半功倍的回报。

### 2\. 用命名空间划清工具边界（Namespacing your tools）

在实际生产环境中，你的 AI Agent 很可能会同时接入几十个 MCP 服务端、面对成百上千个不同工具——其中很多还是其他团队或第三方开发者写的。一旦不同工具之间功能有所重叠，或者名字起得含糊不清，Agent 就会在「这一步到底该调谁」上犯迷糊。

通过 **命名空间（Namespacing，即把相关联的工具统一归拢在共同的前缀或后缀名下）** ，可以在成百上千个工具之间划出清晰的职责分界线；不少 MCP 客户端默认也会做类似的归类处理。举个例子：

- **按所属服务划分命名空间** ：如 `asana_search` （在 Asana 中搜索）、 `jira_search` （在 Jira 中搜索）；
- **按所属服务 + 操作资源划分命名空间** ：如 `asana_projects_search` （搜索 Asana 项目）、 `asana_users_search` （搜索 Asana 用户）。

这样一眼就能看清归属的命名方式，能帮 Agent 在恰当的时机准确挑中对的工具。

我们在工具调用评测中发现， **选择前缀命名法（Prefix-based，如 `asana_search` ）还是后缀命名法（Suffix-based，如 `search_asana` ），会对准确率产生不可忽视的影响** 。具体哪种更好会因底层大模型而异，因此我们建议你结合自己的评测集实测对比，选出最适合当前模型的命名方案。

当工具名混乱时，Agent 可能会调错工具、调对了工具却传错参数、漏调必要的工具，或者曲解工具返回的结果。通过有选择地实现那些「名字本身就自然反映任务拆解逻辑」的工具，你既减少了塞进上下文窗口的工具数量与描述长度，又把原本压在模型上下文里的计算负担卸载回了工具代码本身，从而大幅降低了 Agent 犯错的整体风险。

### 3\. 让工具返回真正有价值的上下文信息（Returning meaningful context from your tools）

顺着同样的思路，工具在实现返回值时，应当只向 Agent 交回 **真正高价值、高相关的信息（High-signal information）** 。工具返回值应当把「对当前任务语境有没有用」放在第一位，而不是一味追求大而全的灵活性；尽量剔除那些面向底层机器的技术标识符——比如 `uuid` 、 `256px_image_url` 或 `mime_type` 。相比之下，像 `name` （名称）、 `image_url` （图片链接）和 `file_type` （文件类型）这样贴近自然语义的字段，才真正有助于直接指导 Agent 做出下一步动作与回复。

不仅如此，相比于晦涩难懂的乱码 ID，Agent 在处理自然语言名称、术语或直观编号时的表现要稳定得多。我们在实验中发现： **仅仅是把杂乱无章的字母数字混合 UUID 解析替换成更有语义、更好理解的自然语言名称（哪怕只是换成从 `0` 开始递增的简单数字编号 `0, 1, 2...`），就能显著减少模型在检索任务中抄错 ID 的幻觉，大幅提升 Claude 的检索准确率。**

当然，在某些场景下，Agent 确实需要同时拿到「自然语言名称」和「底层技术 ID」——因为后续连调下游工具时往往必须传入精确的 ID（例如先调 `search_user(name='jane')` 找到人，再调 `send_message(id=12345)` 发消息）。要想兼顾这两种需求，一个非常干净的做法是在工具里暴露一个简单的 `response_format` （返回格式）枚举参数，让 Agent 自己按需控制工具是返回 `"concise"` （精简版）还是 `"detailed"` （详细版）：

```
enum ResponseFormat {
   DETAILED = "detailed",
   CONCISE = "concise"
}
```

如果业务需要更细粒度的控制，你还可以扩展更多格式档位（思路类似于 GraphQL，让调用方按需指定只想接收哪几类字段）。下面我们来看一组 Slack 消息搜索工具在两种模式下的真实返回对比。

首先是 **`responseFormat: "detailed"` （详细模式，共消耗 206 个 Token）** ：

```
● I'll search slack for recent bug reports and use the detailed format to see which channel IDs and threads to investigate further.

● slack - search (MCP)(query: "bug", sort: "timestamp", sortDir: "desc", limit: 100, responseFormat: "detailed")
  └ Search results for: "bug"

    === Result 1 of 89 ===
    Channel: #dev (C1234567890)
    From: @jane.doe (U123456789)
    Time: 2024-01-15 10:30:45 UTC
    TS: 1705316445.123456
    Text: Found a critical bug in the login flow.

    === Result 2 of 89 ===
    Channel: DM with @john.smith
    From: @john.smith (U987654321)
    Time: 2024-01-14 15:22:18 UTC
    TS: 1705247738.234567
    Text: The bug report for issue #123 is ready for review
    Files: bug-report-123.pdf
    ...
```

再对比 **`responseFormat: "concise"` （精简模式，仅消耗 72 个 Token）** ：

```
● I'll search slack for recent bug reports and use the concise format to read as many messages as possible.

● slack - search (MCP)(query: "bug", sort: "timestamp", sortDir: "desc", limit: 100, responseFormat: "concise")
  └ Search: "bug" (89 results)

    1. #dev - @jane.doe: Found a critical bug in the login flow. [Jan 15]
    2. DM - @john.smith: The bug report for issue #123 is ready for review [Jan 14]
    ...
```

在 Slack 中，每条讨论串（Thread）及其回复都由唯一的 `thread_ts` 时间戳标识，后续如果想调工具拉取整串回复，就必须传入这个 `thread_ts` 以及对应的 `channel_id` 、 `user_id` 。当 Agent 需要继续深挖某个讨论串时，它可以主动选择 `"detailed"` 模式拿全这些底层 ID；而当它只是想快速扫一眼近期有哪些 Bug 报告时，选择 `"concise"` 模式只拿消息正文， **直接省下了约三分之二的 Token 消耗** 。

甚至连工具返回数据的排版结构——比如用 XML、JSON 还是 Markdown——都会对评测表现产生实实在在的影响；这里同样没有放之四海而皆准的唯一标准答案。因为大语言模型是基于「预测下一个 Token」训练出来的，当返回格式与它在训练语料里最熟悉的分布相契合时，解析准确率往往最高。最佳的返回结构会随具体任务与底层模型而变化，我们建议你根据自己的评测结果择优选用。

### 4\. 极致优化工具返回值的 Token 效率（Optimizing tool responses for token efficiency）

提升返回上下文的 **质量（Quality）** 很重要，但控制返回给 Agent 的上下文 **数量（Quantity）** 同样关键。

对于任何可能一次性吐出海量数据的工具，我们都强烈建议组合实现 **分页（Pagination）、范围选择（Range selection）、条件过滤（Filtering）和/或自动截断（Truncation）** 机制，并为参数设置合理的默认值。以 [Claude Code](https://www.anthropic.com/claude-code) 为例，我们在默认情况下会将单次工具返回结果严格限制在 **25,000 个 Token** 以内。尽管未来 Agent 的有效上下文窗口肯定会越扩越大，但对「省 Token 的高效率工具」的需求永远不会过时。

如果你选择对超长返回结果做截断处理， **请务必在截断提示里用清晰的说明引导 Agent 下一步该怎么做** 。你可以直接在返回信息里鼓励 Agent 采取更省 Token 的查找策略——比如在知识检索任务中，引导它用多次小范围的精准搜索，替代一次笼统宽泛的全量搜索。

同理，当工具调用触发异常报错时（比如输入参数未通过校验），你也应该用写提示词的思路去精心设计报错文本（Prompt-engineer your error responses）：直接向 Agent 交代清楚、可立即照着改的具体修复方法，而不是甩出一串冷冰冰的错误状态码或底层堆栈追踪（Traceback）。

下面来看一个 **带有建设性引导的超长结果截断示例** （Stripe 交易搜索工具）：

```
● I'll find all of your transactions on Stripe and provide a summary for you.

● stripe - transactions_search (MCP)(limit: 5000, responseFormat: "concise")
  └ ## Transaction Search Results

    Found **2,847 transactions** matching your query.

    The results are truncated. Showing first 3 results:

    | Date       | Description            | Amount     | Category |
    |------------|------------------------|------------|----------|
    | 2024-01-15 | Payment from Acme Corp | +$5,200.00 | Revenue  |
    | 2024-01-14 | Payment from TechStart | +$3,100.00 | Revenue  |
    | 2024-01-13 | Payment from Cloud Co. | +$3,100.00 | Revenue  |

    **Summary of all 2,847 results:**
    - Total Revenue: $458,291.00
    - Date Range: Jan 1 - Jan 15, 2024

    ## To refine these results, you can:
    - **Search for specific vendors**: Use \`transactions_search(payee: "Acme Corp")\` to see only Acme Corp charges
    - **Filter by amount range**: Use \`transactions_search(minAmount: 1000, maxAmount: 5000)\`
    - **Get next page**: Use \`transactions_search(query: <query>, page: 2)\`
```

再对比一下，当 Agent 误把邮箱地址当成 `userId` 传给 Asana 用户查询工具时， **毫无帮助的原始报错** 与 **自带修复路径的清晰报错** 有多大差距：

```
# ❌ 反例：晦涩的原始报错（只抛状态码，不讲原因与解法）
● asana - user_info (MCP)(userId: "john.doe@acme.corp")
  └ {
      "error": {
        "code": "RESOURCE_NOT_FOUND",
        "status": 422,
        "message": "Invalid value",
        "details": {
          "field": "userId",
          "value": "john.doe@acme.corp",
          "type": "invalid_value"
        }
      }
    }

# ✅ 正例：经过提示词工程打磨的清晰报错（明确指出格式错误、给出正确示例并提示先调哪个工具）
● asana - user_info (MCP)(userId: "john.doe@acme.corp")
  └ Tool Response:

    # Resource Not Found: Invalid \`userId\`

    ## Error Summary
    Your request to \`/api/user/info\` failed because the \`userId\` \`john.doe@acme.corp\` does not exist or is in the wrong format.

    ## Valid User IDs
    Examples:
    - \`1928298149291729\`
    - \`9381719375914731\`

    ## Resolving a User ID
    - Call \`user_search()\`
```

可以看到，无论是超长截断还是参数报错，只要在返回文本里顺手给出一两句明确的引导（告诉它怎样加过滤参数、怎样翻页、正确参数长什么样、该先调哪个前置工具），就能立刻把 Agent 引导到高效、正确的调用轨道上来。

### 5\. 用提示词工程打磨工具描述与规范（Prompt-engineering your tool descriptions）

最后，我们来到改进工具最立竿见影的一招： **用写提示词的功夫，精心打磨你的工具描述（Descriptions）与参数规范（Specs）。** 因为所有工具的描述和参数定义都会被直接加载进 Agent 的上下文窗口里，它们组合在一起，实际上就构成了引导 Agent 如何正确调用工具的核心指令集。

在编写工具描述和参数说明时，不妨想一想： **如果你今天要把这个工具交接给团队里刚入职的一位新同事，你会怎么向他介绍它的用法？** 把那些你平时觉得理所当然、默认大家心里都懂的隐性背景知识——比如特定的查询语法格式、业务内部专有术语的定义、底层不同数据资源之间的从属关系——全部摊开来写清楚。通过明确描述（并配合严格的数据类型校验模型强制约束）预期的输入与输出格式，彻底消除模棱两可的空间。特别是输入参数的命名，一定要直观、毫无歧义：比如不要起一个含糊的 `user` 参数名，而要明确命名为 `user_id` （用户 ID）或 `user_email` （用户邮箱）。

有了前面搭建的自动化评测集，你就可以非常有底气地量化每一次提示词微调带来的真实收益。哪怕只是对工具描述做几处看似微小的精准润色，也往往能带来惊人的性能跃升——当年 Claude Sonnet 3.5 在权威软件工程评测集 [SWE-bench Verified](https://www.anthropic.com/engineering/swe-bench-sonnet) 上之所以能一举刷新业界最高纪录（SOTA），背后最关键的一步，正是我们对工具描述做了细致入微的校准，从而大幅压低了工具调用报错率、显著提升了任务完成率。

你可以在我们的 [官方开发者指南（Developer Guide）](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#best-practices-for-tool-definitions) 中查阅更多关于工具定义的最佳实践。如果你正在为 Claude 开发工具，我们也强烈建议读一读文档中关于 [工具是如何被动态组装进 Claude 系统提示词](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#tool-use-system-prompt) 的原理解析。最后，如果你正在为 MCP 服务端编写工具，别忘了善用 [MCP 工具注解（Tool annotations）](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) ——它能帮你清晰声明哪些工具需要访问外部开放网络，或者哪些工具会执行具有破坏性的写操作（如删除数据）。

## 展望未来

要想为 Agent 打造出真正趁手好用的工具，我们必须把软件开发的思维习惯，从过去那种「完全可预测、确定性的调用模式」转向「面向非确定性智能体的协作模式」。

通过本文介绍的这套「评测驱动、与 Agent 结对迭代」的闭环流程，我们摸清了优秀工具背后的共性规律： **好用的工具总是目标明确、边界清晰；它们对 Agent 宝贵的上下文空间精打细算；它们能够灵活组合进多样的业务工作流；并且能让 Agent 凭直觉就顺畅地解决真实世界里的复杂任务。**

展望未来，Agent 与外部世界打交道的具体协议与机制还会不断演进——从 MCP 协议的持续升级，到底层大语言模型自身的迭代换代。但只要掌握了这套系统化、由评测驱动的工具打磨方法，我们就能确保：随着 AI Agent 的能力越来越强，它们手头的工具也会同步进化、越来越趁手。

## 作者与致谢

本文由 **Ken Aizawa** 撰写，并得到了 Anthropic 多个团队同事的宝贵贡献：研究团队（Barry Zhang、Zachary Witten、Daniel Jiang、Sami Al-Sheikh、Matt Bell、Maggie Vo）、MCP 团队（Theodora Chu、John Welsh、David Soria Parra、Adam Jones）、产品工程团队（Santiago Seira）、市场团队（Molly Vorwerck）、设计团队（Drew Roper）以及应用 AI 团队（Christian Ryan、Alexander Bricken）。

Oil Book · AI 时代最好的实战指南