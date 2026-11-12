---
title: "AI Agent 的上下文工程：构建 Manus 的六个实战经验"
source: "https://book.oiloil.org/articles/manus-context-engineering"
author:
  - "[[季逸超 (Yichao 'Peak' Ji)]]"
published: 2025-07-18
created: 2026-11-11
description: "Manus 团队将 Agent 框架推倒重写四次后总结出的六条实战经验：如何靠保护缓存把推理成本和延迟降下 10 倍、工具太多时如何限制模型选择而不破坏缓存、如何用本地文件突破上下文容量限制、靠读写 todo.md 防止长任务跑偏，以及保留报错记录让 Agent 自己学会排错。"
tags:
  - "clippings"
---
[![AI Agent 的上下文工程：构建 Manus 的六个实战经验 封面](https://book.oiloil.org/assets/course-art/manus-context-engineering.webp)](https://book.oiloil.org/assets/course-art/manus-context-engineering.png)

本篇目录 7 个小节

在 [Manus](https://manus.im/app) 项目刚起步时，我和团队面临一个决定生死的路线抉择：我们到底应该基于开源基础模型自己训练一个端到端的 Agent 模型，还是直接建立在前沿大模型的 [上下文学习（In-Context Learning）](https://arxiv.org/abs/2301.00234) 能力之上？

回想我做自然语言处理（NLP）的前十年，我们根本没有这样选择的福气。在遥远的 [BERT](https://arxiv.org/abs/1810.04805) 时代（没错，已经过去七年了），模型必须先经过微调（Fine-tuning）——还有更早的预训练——才能迁移到新任务上。哪怕当时的模型体积跟今天的大语言模型相比小得可怜，每跑完一轮迭代也动辄需要好几个星期。

对于需要快速迭代的应用来说——尤其是在产品还没找到真实市场需求（PMF，Product-Market Fit）之前——几周才能迭代一次是致命的。这是我在上一段创业经历中买来的惨痛教训：当时我为了做 [开放信息抽取（Open Information Extraction）](https://en.wikipedia.org/abs/Open_information_extraction) 和语义搜索，从头训练了一套内部模型。结果没过多久， [GPT-3](https://arxiv.org/abs/2005.14165) 和 [Flan-T5](https://arxiv.org/abs/2210.11416) 横空出世，我苦心训练的内部模型一夜之间沦为了废铁。但颇具戏剧性的是，正是这批淘汰了旧做法的模型，也为我们指明了一条全新的出路。

这段来之不易的教训，让我们毫不犹豫地做出了选择： **Manus 将全仓押注上下文工程（Context Engineering）。** 这让我们能够以「小时」而非「周」为单位上线改进，并且让我们的产品架构与底层模型保持正交解耦： **如果模型能力的演进是一场不断上涨的潮水，我们希望 Manus 是水面上借着潮水往上漂的船，而不是死死钉在海床上的石柱。**

![微调专属小模型与押注上下文工程的路线对比](https://book.oiloil.org/assets/articles/manus-context-engineering/01-model-pillar-vs-context-boat-v1.svg)

微调专属小模型与押注上下文工程的路线对比

不过，真正动手做起来就会发现，上下文工程远没有听上去那么简单。它是一门实验科学——在做 Manus 的过程中，我们已经推倒重写了四次 Agent 框架，每一次重写，都是因为摸索出了更好的上下文塑造方式。

在机器学习里，算法自动寻找最优参数的过程叫「随机梯度下降（Stochastic Gradient Descent，简称 SGD）」；而我们把这种靠人工摸索架构、反复调整提示词、凭经验试错的过程，半开玩笑地称为 **「随机研究生下降（Stochastic Graduate Descent，同样简称 SGD）」** 。这个办法虽然不够优雅，但确实管用。

这篇文章分享的就是我们通过自己的「人肉 SGD」摸索出的六条局部最优解。如果你也在构建自己的 AI Agent，希望这些原则能帮你少走弯路。

![Manus 上下文工程核心运行机制总览](https://book.oiloil.org/assets/articles/manus-context-engineering/02-manus-six-context-principles-v1.svg)

Manus 上下文工程核心运行机制总览

---

## 1\. 围绕 KV 缓存进行设计

如果非要我在生产级 AI Agent 中只挑一个最重要的核心指标，我会毫不犹豫地选择 **KV 缓存命中率（KV-cache hit rate）** 。因为它直接影响延迟（Latency）和成本（Cost）。为了理解为什么，我们先看看一个 [典型的 Agent](https://arxiv.org/abs/2210.03629) 是怎么运转的：

Agent 接收用户输入后，会通过一连串的工具调用循环来推进任务： `动作（Action） → 观察结果（Observation） → 动作 → 观察结果……` 在每一轮循环中：

1. 模型根据当前上下文，从动作空间（Action Space，即全部可用工具）里挑出一个动作；
2. 该动作在运行环境（例如 Manus 的虚拟机沙盒）中执行，产生一段观察结果；
3. 系统把这一轮的「动作」和「观察结果」追加拼到原有上下文的末尾，作为下一轮循环的输入。

你可以想象，随着步数不断推进，上下文会像滚雪球一样越来越长，但模型每一步生成的输出（通常只是一条结构化的工具调用指令）却始终很短。与普通聊天机器人相比，Agent 的输入与输出 Token 比例极度悬殊；在 Manus 中，平均输入与输出 Token 的比例高达 **100:1** 左右。

好消息是，只要上下文拥有完全一致的前缀（Prefix），就能利用 **[KV 缓存（KV-Cache）](https://medium.com/@joaolages/kv-caching-explained-276520203249)** ——无论你是自己部署模型还是调用商业 API，它都能大幅降低首字等待时间（TTFT，Time-to-First-Token）和推理成本。而且省下的绝不是小钱：以 Claude Sonnet 为例，命中缓存的输入 Token 只要 `0.30 美元 / 百万 Token` ，而未命中的输入 Token 则要 `3 美元 / 百万 Token` —— **价格相差整整 10 倍** ！

![围绕 KV 缓存进行设计](https://book.oiloil.org/assets/articles/manus-context-engineering/fig-1.webp)

围绕 KV 缓存进行设计

从上下文工程的角度来看，想要提高 KV 缓存命中率，有几条关键做法：

1. **保持提示词前缀稳定** 。由于大语言模型的自回归特性，哪怕只有单个 Token 的差异，也会导致从该 Token 往后的所有缓存全部失效。一个常见的失误是在系统提示词（System Prompt）的开头放入精确到秒的时间戳——这固然能让模型知道当前时间，但也会把你的缓存命中率彻底毁掉。
2. **让上下文严格保持「只往后追加（Append-only）」** 。避免回头修改之前的动作或观察结果。同时，还要确保数据在序列化（Serialization）时是确定性的（Deterministic）：很多编程语言和库在将 JSON 对象转为字符串时，默认并不保证键名（Key）的排列顺序固定，这往往会在不知不觉中破坏缓存。
3. **在需要时显式标记缓存断点** 。部分模型服务商或推理框架不支持自动增量前缀缓存，而是需要在上下文中手动插入缓存断点（Cache Breakpoints）。在设置断点时，你需要算好缓存的过期时间（Expiration），并且至少要保证断点覆盖系统提示词的末尾。

此外，如果你使用 [vLLM](https://github.com/vllm-project/vllm) 等框架自己部署模型，请务必确认开启了 [前缀缓存（Prefix Caching）](https://docs.vllm.ai/en/stable/design/v1/prefix_caching.html) （或称 KV 缓存），并通过会话 ID（Session ID）把同一个任务的请求稳定路由到同一台工作节点上，以确保缓存真正生效。

---

## 2\. 遮蔽，而非移除

随着你的 Agent 功能越来越多，它的动作空间自然会变得越来越复杂——简单来说，就是 **工具（Tools）数量爆炸了** 。最近大火的 [MCP（模型上下文协议）](https://modelcontextprotocol.io/introduction) 更是火上浇油。如果你允许用户自带工具配置，请相信我：一定会有用户把成百上千个意义不明的工具一股脑塞进你原本精心调好的动作空间里。结果就是，模型更容易选错动作，或者采取低效的路线。简而言之， **挂载过多工具后的 Agent，反而会变蠢。**

很自然地，大家会想到设计动态动作空间——比如用类似 [RAG（检索增强生成）](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) 的方式，按需加载工具。我们在 Manus 中也尝试过这条路。但实验结果总结出了一条明确的原则： **除非万不得已，否则不要在循环中途动态添加或移除工具。** 主要原因有两点：

1. 在绝大多数大模型中，工具定义在序列化后都排在上下文的最前面（通常在系统提示词之前或紧随其后）。因此，任何工具的增删都会导致后续所有动作和观察结果的 KV 缓存全部失效。
2. 当先前的动作和观察结果里依然引用着当前上下文中已经不再定义的工具时，模型会陷入困惑。如果没有 [结构化约束解码（Constrained Decoding）](https://platform.openai.com/docs/guides/structured-outputs) ，这往往会导致参数格式违规（Schema Violations），甚至凭空捏造不存在的幻觉动作。
![遮蔽，而非移除（Mask, Don't Remove）](https://book.oiloil.org/assets/articles/manus-context-engineering/fig-2.webp)

遮蔽，而非移除（Mask, Don't Remove）

为了解决这个问题，Manus 使用了一个感知上下文的 **[有限状态机（State Machine）](https://en.wikipedia.org/wiki/Finite-state_machine)** 来管理工具的可用性。它不会去删改工具定义，而是在解码生成阶段直接 **遮蔽 Token 的候选打分（Mask Token Logits）** ，根据当前上下文状态禁止（或强制）模型选择特定动作。

在实际工程中，绝大多数模型平台和推理框架都支持某种形式的 **响应预填充（Response Prefill）** ，让你完全不用改动开头的工具定义，就能直接约束模型的动作空间。我们以 [NousResearch 的 Hermes 格式](https://github.com/NousResearch/Hermes-Function-Calling) 为例，通常有三种函数调用模式：

- **自动模式（Auto）** ：模型可以选择调用工具，也可以选择不调工具。实现方式是只预填回复前缀： `<|im_start|>assistant`
- **强制模式（Required）** ：模型必须调用一个工具，但具体选哪个不受限制。实现方式是直接预填到工具调用标签： `<|im_start|>assistant<tool_call>`
- **指定模式（Specified）** ：模型必须从指定的工具子集中挑选工具。实现方式是预填到工具名称的开头： `<|im_start|>assistant<tool_call>{"name": "browser_`

通过这种方式，我们通过直接遮蔽 Token Logits 来约束动作选择。例如，当用户刚发来一条新输入时，Manus 必须立刻开口回复用户，而不是去调一个动作。我们在设计工具名称时，也特意加上了一致的分类前缀——比如所有浏览器相关工具都以 `browser_` 开头，所有命令行工具都以 `shell_` 开头。这样一来，无需使用有状态的分词器，就能轻松强制 Agent 在给定状态下只能从特定一组工具中做出选择。

这些设计共同保证了 Manus 的 Agent 循环即便在模型驱动的架构下也能保持稳定。

---

## 3\. 将文件系统作为上下文

现代前沿大模型已经提供了 128K 甚至更长的上下文窗口。但在真实的 Agent 场景中，这往往还是不够用，有时甚至反而成了一种负担。痛点主要来自三个方面：

1. **观察结果可能极其庞大** ，尤其是当 Agent 需要与网页或 PDF 等非结构化数据打交道时，随手几步操作就很容易撑爆上下文上限。
2. **超过一定上下文长度后，模型性能会明显退化** ，哪怕窗口在技术上完全装得下。
3. **长输入极其昂贵** ，哪怕有前缀缓存兜底，你依然要为每一轮传输和预填充的每一个 Token 买单。

为了应对这个问题，许多 Agent 系统实现了上下文截断或压缩策略。然而，过度激进的压缩不可避免地会导致信息丢失。这个问题是本质性的：Agent 天生就需要基于此前所有状态来预测下一步动作——而你根本无法可靠地预知，哪一条眼下看似无关紧要的观察结果，会在十步之后突然变成关键线索。从逻辑上讲，任何不可逆的压缩都伴随着风险。

正因为如此，在 Manus 中，我们把 **文件系统（File System）视为终极上下文** ：它容量不限、天生持久化，并且可以由 Agent 自己直接操作。模型学会了按需读写文件——不仅把文件系统当成存储空间，更将其作为结构化的外置记忆（Externalized Memory）。

![将文件系统作为上下文](https://book.oiloil.org/assets/articles/manus-context-engineering/fig-3.webp)

将文件系统作为上下文

相应地，我们的压缩策略始终设计为 **可恢复的（Restorable）** 。例如，只要保留了网页的 URL，就可以把网页正文从上下文里拿掉；只要沙盒里还留着文档的路径，就可以把文档内容从上下文里省略。这让 Manus 能够在不永久丢失信息的前提下缩短上下文长度。

在开发这个功能的时候，我常在想：如果要让 **状态空间模型（State Space Model，简称 SSM）** 在 Agent 场景下有效工作，需要什么条件？不同于 Transformer，SSM 没有完整的注意力机制，因而在处理长距离向后回查（Long-range Backward Dependencies）时比较吃力。但如果它们能熟练掌握基于文件的外部记忆——把长期状态卸载到文件系统里，而不是硬扛在模型内部状态中——那么 SSM 的速度与效率优势，很可能会开启一类全新的 Agent。从这个意义上说，具备代理能力的 SSM，或许才是 **[神经图灵机（Neural Turing Machines）](https://arxiv.org/abs/1410.5401)** 真正的现代继承者。

---

## 4\. 通过「复述」操控注意力

如果你用过 Manus，大概率注意过一个很有意思的现象：在处理复杂任务时，它习惯先创建一个 `todo.md` 文件，并在任务推进过程中一步步更新这个文件、给已完成的事项打上勾。

这并不仅仅是为了讨好用户的交互小设计——这是我们用来 **操控注意力（Manipulate Attention）** 的刻意机制。

![通过「复述」操控注意力（Recitation）](https://book.oiloil.org/assets/articles/manus-context-engineering/fig-4.webp)

通过「复述」操控注意力（Recitation）

在 Manus 中，一个典型任务平均需要大约 **50 次工具调用** 。这是一条相当漫长的循环——由于 Manus 依赖大语言模型做决策，它很容易在长循环中跑偏主线，或者忘掉早期的目标，尤其是在上下文变长或面对复杂任务时。

通过不断重写 `todo.md` ，Manus 正在把它的目标 **复述（Reciting）到上下文的最末尾** 。这会把全局计划推入模型的近期注意力范围内，从而避免「迷失在中间（Lost-in-the-Middle）」的问题，并大幅降低目标偏移（Goal Misalignment）。实际上，它就是在利用自然语言来引导自己的注意力聚焦在任务目标上——而完全不需要对架构做任何特殊的底层改动。

---

## 5\. 保留错误的尝试

Agent 会犯错。这不是偶发 Bug，而是客观现实。语言模型会产生幻觉，运行环境会返回报错，外部工具会出现故障，各种意料之外的边界情况随时都会发生。在多步任务中，失败不是例外，而是循环的一部分。

然而，一种很常见的冲动是把这些错误藏起来：清理报错痕迹、重试刚才的动作，或者重置模型状态并把希望寄托在充满玄学的「 [温度参数（Temperature）](https://arxiv.org/abs/2405.00492) 」上。这种方式看起来似乎更稳妥、更可控，但却是有代价的： **抹去失败就等于移除了证据；而没有了证据，模型就无法调整修正。**

![保留错误的尝试（Keep the Wrong Stuff In）](https://book.oiloil.org/assets/articles/manus-context-engineering/fig-5.webp)

保留错误的尝试（Keep the Wrong Stuff In）

根据我们的经验，提升 Agent 行为表现最有效的方法之一其实简单得惊人： **把错误的尝试留在上下文里。** 当模型看到一个失败的动作——以及由此产生的观察结果或报错堆栈（Stack Trace）——它就会隐式地更新自己的内部判断，这会降低它重犯类似错误的先验概率。

事实上，我们认为 **错误恢复能力（Error Recovery）** 是真正展现 Agent 智能水平的最清晰指标之一。然而在绝大多数学术评测基准（Benchmarks）和研究中，这一块依然处于被严重忽视的状态，因为那些评测往往只关注在理想条件下一次跑通的任务成功率。

---

## 6\. 别掉进「少样本」陷阱

**[少样本提示（Few-Shot Prompting）](https://www.promptingguide.ai/techniques/fewshot)** 是我们改进大模型输出时的常用技巧。但在 Agent 系统中，它却可能反过来用你意想不到的方式坑你一把。

语言模型是极强的模仿者，它们会模仿上下文里的行为模式。如果你的上下文里堆满了相似的历史「动作 - 观察结果」对，模型就会倾向于顺着这个模式一路走下去，哪怕这已经不再是最优解。

在涉及重复性决策或动作的任务中，这会非常危险。例如，当使用 Manus 辅助审核一批共 20 份求职简历时，Agent 经常会陷入某种机械节奏——仅仅因为在上下文里看到了前面一连串相似的操作，就开始机械重复相同的动作。这会导致偏离预期、过度泛化，有时甚至产生幻觉。

![别被「少样本示例」带进死胡同](https://book.oiloil.org/assets/articles/manus-context-engineering/fig-6.webp)

别被「少样本示例」带进死胡同

解法是 **增加多样性（Diversity）** 。Manus 会在动作和观察结果中引入少量的结构化变化——例如使用不同的序列化模板、替换近义措辞，或者在排序与格式上加入微小的噪声。这种受控的随机性（Controlled Randomness）有助于打破固定模式，重新唤醒模型的注意力。

换句话说， **千万别把自己少样本催眠进了死胡同（Don't few-shot yourself into a rut）。** 你的上下文越千篇一律，你的 Agent 就越脆弱。

---

## 结语

上下文工程仍然是一门新兴的科学——但对于 Agent 系统来说，它早已经是必不可少的基本功。模型或许正在变得更强、更快、更便宜，但再强大的原始模型能力，也替代不了对记忆、环境和反馈的需求。 **你如何塑造上下文，最终定义了你的 Agent 会如何行动：它跑得有多快、恢复得有多好，以及到底能走多远。**

在 Manus，我们通过反复重写、死胡同摸索，以及面向数百万用户的真实生产环境检验，才学到了这些经验。我们在这里分享的一切并非放之四海而皆准的绝对真理，但这些确实是对 Manus 最管用的模式。如果它们能帮你避开哪怕一次痛苦的迭代，这篇文章就达到了它的目的。

Agent 的未来，将建立在每一个上下文之上。好好工程化地打磨它们吧。

Oil Book · AI 时代最好的实战指南