<!-- Grok 第一轮复核回执原文。来源：Grok 会话 01a0b8ea-8310-7e53-b30f-a25ed89725b8（chat_history 最后一条回复），由 Claude Code 于 2026-09-19 原样转存，未改动内容。 -->

**总结论：REVISE**

冻结版本哈希与 `baseline.sha256` 一致，可以审这一版。模板、四段术语结构、模拟标注、练习挂靠和产品能力核对里，没有阻断项。不能独立复核通过，是因为第 3 课同一个术语在图鉴、正文、详解、练习解析里用了两个名字。

---

## 阻断

无。

---

## 应改

| 文件:行 | 问题 | 触发依据 | 影响 | 最小修改 |
|---|---|---|---|---|
| `glossary.yaml:210`；`lessons/l03/lesson.md:79,81,223`；`terms/stale-material.md:2,7`；`lessons/l03/activities.yaml:97,99` | 图鉴正式名是「过时材料」，正文和详解写成「过期材料」，练习解析又用回「过时材料」 | C 术语 id 与 glossary 对应；F 正文 `term:` 与 glossary 一致；样板反馈 5（详情页讲的就是图鉴上那个词） | 点「过期材料」会打开标题为「过时材料」的卡，试学时会对不上 | 统一成一个正式名。推荐以 glossary 为准：正文链接、图题、详解全文改成「过时材料」；或反过来改 glossary 的 `term` 并同步练习解析。另一个写法放进 `aliases` |

---

## 建议

| 文件:行 | 问题 | 触发依据 | 影响 | 最小修改 |
|---|---|---|---|---|
| `glossary.yaml:41` | `app` 的 `section` 是 `model`，第 1 课真正讲这个词是 `{#tools}` | 素材包「改版提醒」：术语 `section` 应对讲解位置 | 图鉴回链会跳到「大模型是什么」，不是「模型是脑子，工具是手」 | 把 `section` 改成 `tools` |
| `lessons/l02/lesson.md:164`、`l03:222`、`l04:247` | 「想弄懂底层」放在章末误区节；样板章放在第一次出现术语的地方 | 样板章 `l01/lesson.md:65`；B 要求有这个提示框，未规定位置 | 读者要读完全章才看到四个词的入口 | 挪到本课第一次集中出现术语的小节（l02 `{#parts}`，l03 `{#package}`，l04 `{#verify}`） |
| `terms/fresh-sample.md:15-20`、`baseline.md:21`、`single-variable.md:15-19` | 「底层怎么运作」整表搬了课文 S1–S3 的 2/5、3/5 分数 | C：讲机制，不复述正文 | 点开词条几乎是把第 4 课实验再读一遍 | 留下「为什么要有没见过的样例 / 为什么要有起点」，例子改成一句，不要整表 |
| `lessons/l03/lesson.md:36` | 「本书叫材料包」 | 样板反馈 1：读者视角 | 这是网页课，不是书 | 改成「本课叫材料包」 |
| `terms/memory.md:25` | 写「绝对不做」靠权限设置；官方该页写的是 PreToolUse hook，deny 规则也能挡 | D 产品能力与所引文档一致 | 不完全错，但和所引文档的原句不完全一样 | 补半句：权限禁止规则或 hook |

---

## 可撤回决定（意见，不阻断）

| 决定 | 判断 |
|---|---|
| 新增图鉴分类「验证与改进」 | **合理。** 现有「上下文」「请求与输出」装不下核验/实验这组方法词；`topics.json` 里是空分类，删掉就能回滚。 |
| 第 3、4 课标题沿用 `course.yaml` | **合理。** 标题本身已经是读者能看懂的主题；第 1 课改标题是单独拍过板的，这两课没新指令。 |
| 第 4 课演示挪到「新样例」之后 | **合理。** 五步讲完再串成一轮演示，比插在中间更顺。 |
| l04 q5、q6 挂「基线」 | **可接受，不是最优。** q5 是实验记录，算基线流程的一部分；q6 真正考的是「标准事先定好」，在本课四个词里基线最接近。不必为这次改题（练习本就不动）。 |

---

## 未核范围（`missing_input` / `unverified`）

- **练习是否只加了 `term`、改了时间安排和「正文第 N 节」**：改前版本不在批准阅读范围，不能证明题干、选项、答案、解析没动。现稿内部自洽，每题 `term` 都属于本课 4 个词。
- **第 5–24 课未动**：不在批准阅读范围，不能证明。目录测试仍按 24 课编排，只能说明没删课。
- **部分官方页正文打不开**（`platform.claude.com`、`developers.openai.com`、`github.com`、`code.claude.com` 被解析到内网地址）。用公开检索摘要核过：Claude Code 权限表（读文件不问、Bash 除只读命令要问、改文件要问；禁止→询问→允许）、记忆索引前 200 行或 25KB、Codex 沙箱三档、function calling 流程、Accio Work「技能」栏、Anthropic「先定成功标准再改提示词」、OpenAI eval 流程。这些**不当作错误**。`codex-cli 0.149.1` 未在本机复跑 `--help`，保持 unverified。

---

## 已核对通过的部分

- 哈希：被审 25 个文件与 `baseline.sha256` 一致。
- 模板：三课 h1 无「第 NN 课」；小节短标题+`{#id}`；节首读者提问；每节有图和 `<Cite>`；有本课 4 词提示框；总结 = 一段 + 3 条 + 练习入口 + 「下一章，我们……」；无 TermCards / GuidedPractice / ReadMark。
- 16 篇术语：是什么 / 底层 / 避坑（≤3，均以「不要」开头）/ 建议（≤3）/ 出处。`prompt` 走已有卡，其余有 `site_cat` + `site_demo`；「验证与改进」已在 `topics.json` 的 AI 组。
- 下一章预告与 `course.yaml` 的 l03 / l04 / l05 主题一致（写法跟第 1 课一样，不抄标题原文）。
- 合规：模拟已标明；未见客户数据、密钥、本机绝对路径、付费课原文。
- `ai-site-catalog.test.mjs` 对 l01–l04 已拆分、16 张新卡、32 道练习编号的断言，与当前 glossary / 练习结构一致。

---

```yaml
status: REVISE
files_changed: []
actions_executed:
  - 只读核对 baseline.sha256
  - 对照 PROJECT.md §5.20、course-materials 模板与样板反馈 1–7、l01 样板章审 l02–l04 与 16 篇术语
checks_passed:
  - 被审文件哈希与冻结版本一致
  - 模板结构、术语四段、模拟标注、term 挂靠、下一章预告
evidence_refs:
  - glossary.yaml:210
  - sources/lessons/l03/lesson.md:79
  - sources/terms/stale-material.md:7
  - sources/lessons/l03/activities.yaml:97
exceptions:
  - missing_input: 练习改前版本不在批准阅读范围
  - missing_input: 第 5–24 课不在批准阅读范围
  - unverified: 部分官方页正文未能打开，改用公开检索摘要
remaining_risks:
  - 过时/过期双名会在 Will 试学时直接露出来
rollback_available: 只读，无改动
needs_human_review: true  # Will 试学与业务验收不在本次范围；ACCEPT 只代表独立复核通过，本次未给 ACCEPT
```

修完「过时 / 过期」这一处后，按同一哈希冻结再交一次复核即可，不必整包重写。
