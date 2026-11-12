---
title: "为什么我们删掉了 Agent 80% 的工具"
source: "https://book.oiloil.org/articles/we-removed-80-percent-of-our-agents-tools"
author:
  - "[[Andrew Qu]]"
published: 2025-12-22
created: 2026-11-11
description: "Vercel 团队花了几个月为内部数据分析 Agent d0 搭建了 17 个专用工具、繁重的提示词工程与手写检索逻辑，结果系统既脆弱又缓慢。当他们砍掉 80% 的定制工具、只留下文件系统与 Bash 命令让 Claude 直接读取语义层文档后，查询耗时缩短为原来的 1/3.5，Token 消耗减少 37%，成功率从 80% 跃升至 100%。"
tags:
  - "clippings"
---
[![为什么我们删掉了 Agent 80% 的工具 封面](https://book.oiloil.org/assets/course-art/we-removed-80-percent-of-our-agents-tools.webp)](https://book.oiloil.org/assets/course-art/we-removed-80-percent-of-our-agents-tools.png)

本篇目录 4 个小节

删掉绝大多数工具之后，我们的 Agent 反而变强了。

我们曾花了几个月时间，打造了一款相当复杂的内部 Text-to-SQL Agent—— `d0` 。当时我们为它配备了一大堆专用工具、厚重的提示词工程（Prompt Engineering）以及精细的上下文管理机制。它确实能跑起来……但也仅仅是“勉强能用”：系统很脆弱、响应慢，还得靠工程师连轴转地打补丁维护。

后来我们决定换个活法：把原先写好的绝大部分逻辑直接删掉，将 Agent 精简到只剩一项核心能力—— **执行任意 Bash 命令** 。我们把这种架构称为 **「文件系统 Agent（File System Agent）」** ：让 Claude 直接访问文件目录，自己用 `grep` 、 `cat` 和 `ls` 去翻文件、摸清结构。

结果，Agent 架构变简单的同时，表现反而全面提升：查询成功率从 80% 直接拉满到 100%，执行步数更少、Token 消耗更低、响应速度更快。而这一切，全靠做减法。

## d0 是什么？

如果说 [v0](https://v0.app/) 是我们用来构建 UI 界面的 AI，那么 `d0` 就是我们用来理解业务数据的 AI。

![d0 让团队成员在 Slack 中用自然语言提问即可获取数据支持](https://book.oiloil.org/assets/articles/we-removed-80-percent-of-our-agents-tools/fig-1-d0-slack-workflow.svg)

d0 让团队成员在 Slack 中用自然语言提问即可获取数据支持

`d0` 能把团队成员用日常语言提的问题，直接转换成针对公司分析基础设施的 SQL 查询。任何同事只要在 Slack 里提问，就能直接拿到数据答案，既不用自己写代码，也不用排队等数据团队排期。

当 `d0` 稳定好用时，它能把数据查询能力普及给全公司每个人；可一旦它出故障或查错数，大家就会迅速失去信任，退回到老办法——去 Slack 里挨个敲数据分析师。因此，我们需要 `d0` 做到响应快、结果准、运行稳。

## 别挡模型的路

现在回看，我们当初花了大量精力去替模型解决那些 **它自己本来就能搞定的问题** 。

我们预设模型会在复杂的数据库表结构（Schema）里迷路、会写出错误的表关联（Join），或者会凭空编造根本不存在的表名。为了防住这些问题，我们砌起了一道道护栏：提前过滤上下文、限制模型的可选操作，并把每一次交互都包裹在校验逻辑里。换句话说，我们一直在替模型思考：

- **开发了一大堆专用工具** ：比如查表结构、校验查询语句、错误恢复、寻找关联路径等；
- **堆砌繁重的提示词工程** ：强行约束模型的推理步骤与思考方向；
- **精细控制上下文** ：生怕塞进去的信息太多把模型搞晕；
- **手写检索逻辑** ：试图先由代码筛出所谓的“相关”表结构信息和维度属性，再喂给模型。

每冒出一个新的边缘情况（Edge Case），我们就得再打一个补丁；每次底层模型版本升级，我们又得重新校准一遍所有的约束条件。到最后，我们花在维护这套脚手架（Scaffolding）上的时间，远远超过了改进 Agent 本身的时间。

```
// ai-sdk@6.0.0-beta.160 ToolLoopAgent（旧版多工具架构）
import { ToolLoopAgent } from 'ai';
import { GetEntityJoins, LoadCatalog, /*...*/ } from '@/lib/tools'

const agent = new ToolLoopAgent({
  model: "anthropic/claude-opus-4.5",
  instructions: "",
  tools: {
    GetEntityJoins, LoadCatalog, RecallContext, LoadEntityDetails, 
    SearchCatalog, ClarifyIntent, SearchSchema, GenerateAnalysisPlan, 
    FinalizeQueryPlan, FinalizeNoData, JoinPathFinder, SyntaxValidator, 
    FinalizeBuild, ExecuteSQL, FormatResults, VisualizeData, ExplainResults
  },
});
```

## 一个新念头：如果干脆停手不干了呢？

我们意识到自己其实一直在跟重力较劲：人为限制模型的推理空间，费力把模型自己就能读懂的资料浓缩成摘要，又造出一堆工具去“保护”模型免受复杂度的冲击——而实际上，模型完全有能力直接应对这些复杂度。

于是我们决定停手。我们的新假设非常直接： **如果干脆让 Claude 直接读取原始的 Cube DSL 文件，放手让它自己发挥呢？如果一个 Bash 工具就已经够用了呢？** 模型正在变得越来越聪明，上下文窗口也越来越大，也许最好的 Agent 架构，恰恰是“几乎没有架构”。

### v2：文件系统本身就是 Agent

**新版技术栈：**

- **模型** ：通过 [AI SDK](https://ai-sdk.dev/) 调用 Claude Opus 4.5（ `anthropic/claude-opus-4.5` ）
- **执行环境** ：使用 [Vercel Sandbox](https://vercel.com/sandbox) （隔离的云端沙盒环境）探索上下文
- **请求路由** ：使用 [Vercel Gateway](https://vercel.com/ai-gateway) 处理请求转发与可观测性监控
- **服务端** ：基于 [Vercel Slack Bolt](https://vercel.com/academy/slack-agents) 构建的 Next.js API Route
- **数据层** ：将 Cube 语义层（Semantic Layer）存放在包含 YAML、Markdown 和 JSON 文件的目录中
![d0 架构演进对比：从 17 个定制工具退回文件系统与 Bash](https://book.oiloil.org/assets/articles/we-removed-80-percent-of-our-agents-tools/fig-2-architecture-comparison.svg)

d0 架构演进对比：从 17 个定制工具退回文件系统与 Bash

现在，这个文件系统 Agent 浏览语义层的方式，跟真正的人类数据分析师一模一样。它会自己用 `grep` 、 `cat` 、 `find` 和 `ls` 等标准 Unix 工具去读文件、按正则搜索字段模式、在脑子里建立数据表之间的关联模型，最后写出 SQL。

这套做法之所以能跑通，是因为 **语义层文件本身就是极佳的文档** 。这些文件里原本就清晰写明了维度（Dimension）定义、指标（Measure）计算口径以及表间关联（Join）关系。过去我们费尽心思写工具，只是为了把那些本来就清晰易读的文件再总结一遍；而实际上，Claude 只需要直接读取这些文件的权限就够了。

```
// ai-sdk@6.0.0 ToolLoopAgent（新版文件系统架构）
import { Sandbox } from "@vercel/sandbox";
import { files } from './semantic-catalog'
import { tool, ToolLoopAgent } from "ai";
import { ExecuteSQL } from "@/lib/tools";

const sandbox = await Sandbox.create();
await sandbox.writeFiles(files);

const executeCommandTool(sandbox: Sandbox) {
  return tool({
    /* ... */
    execute: async ({ command }) => {
      const result = await sandbox.exec(command);
      return { /* */ };
    }
  })
}

const agent = new ToolLoopAgent({
  model: "anthropic/claude-opus-4.5",
  instructions: "",
  tools: {
    ExecuteCommand: executeCommandTool(sandbox),
    ExecuteSQL,
  },
})
```

## 快了 3.5 倍，省下 37% Token，成功率 100%

我们挑选了 5 个具有代表性的真实业务查询，对旧版复杂架构与新版文件系统架构进行了基准测试对比（Benchmark）：

| 评估指标 | 旧版高级架构（Advanced） | 新版文件系统架构（File system） | 变化幅度 |
| --- | --- | --- | --- |
| **平均执行耗时** | 274.8 秒 | 77.4 秒 | **快了 3.5 倍** |
| **查询成功率** | 4/5（80%） | 5/5（100%） | **+20%** |
| **平均 Token 消耗** | 约 102k Tokens | 约 61k Tokens | **减少 37%** |
| **平均执行步数** | 约 12 步 | 约 7 步 | **减少 42%** |

![5 个代表性查询基准评测对比](https://book.oiloil.org/assets/articles/we-removed-80-percent-of-our-agents-tools/fig-3-benchmark-comparison.svg)

5 个代表性查询基准评测对比

文件系统 Agent 在每一项对比中都赢了。在最棘手的一条极端查询（Worst Case）中，旧版架构足足跑了 **724 秒** 、折腾了 **100 步** 、烧掉 **145,463 个 Token** ，最后还是以失败告终；而文件系统 Agent 面对同一条查询，只用了 **141 秒** 、 **19 步** 和 **67,483 个 Token** ，并且一次就给出了正确结果。

除了硬指标，定性体验上的跃升也同样明显：新版 Agent 能够自己捕捉到我们当初写规则时根本没预料到的边界情况，而且能用人类完全看得懂的逻辑把它的推理过程解释清楚。

### 我们的实战收获

**别跟重力较劲。** 文件系统是一层极其强大的抽象。 `grep` 已经诞生 50 年了，直到今天依然能精准完成我们所需要的检索工作。我们过去一直忙着为 Unix 早已解决的问题重复造定制工具。

**我们之所以限制模型的推理，是因为不敢相信模型真的会推理。** 到了 Claude Opus 4.5 这一代，当初那些人为限制反而成了拖后腿的累赘。当我们不再替模型做选择时，模型自己做出的选择反而聪明得多。

**这套方案能成，前提是我们的语义层本来就是一份好文档。** 那些 YAML 文件结构规整、命名一致，并且写清楚了每一项指标的明确定义。如果你的底层数据层是一团乱麻——到处是历史遗留的怪异命名和毫无文档记录的表关联——那么就算把原始文件直接塞给 Claude 也救不了你，你只会更快地得到错误的查询语句。

**“以减为加（Addition by subtraction）”是真实存在的。** 最好的 Agent，很可能正是工具最少的那一个。你每多加一个专用工具，本质上就是在替模型多做一次预设选择；而很多时候，模型自己选的路比你替它选的更好。

### 这对 Agent 开发者意味着什么？

开发 Agent 时，人们总是忍不住想把每一种可能出现的情况都提前防住。请克制住这种冲动，从最精简的架构开始： **模型 + 文件系统 + 明确目标** 。只有当你用事实证明某项复杂度确实不可或缺时，再把它加进来。

但光有极简的架构还不够，模型需要高质量的上下文才能干好活。把精力花在打磨文档、统一清晰的命名以及梳理规整的数据结构上——这层地基，比任何花哨的工具封装都重要得多。

底层模型的进化速度，远比你维护外围工具链的速度要快。 **请面向六个月后你将拥有的模型去设计系统，而不是死盯着今天手头的模型打补丁。**

如果你也在构建 Agent，非常欢迎和我们交流你的实战心得。你也可以进一步阅读 [《如何基于文件系统构建知识型 Agent（无需向量 Embedding）》](https://vercel.com/blog/build-knowledge-agents-without-embeddings) ，或直接查看我们的开源模板：

- **[eve 数据分析师模板（eve Data Analyst Template）](https://vercel.com/templates/eve/eve-data-analyst)** ：基于 `eve` 快速部署你自己的 Slack 数据分析师 Agent，直接连接 PostgreSQL 回答关于业务数据的各类问题。

Oil Book · AI 时代最好的实战指南