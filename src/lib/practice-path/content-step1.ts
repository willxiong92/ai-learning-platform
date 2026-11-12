// 第 1 步「跟 AI 沟通」正文。主线：一封德国零售商的询盘，从读懂到回复，最后存成能反复用的提示词。
// 材料全部是教学模拟：公司、人名、邮箱、地址都是虚构的，域名用 .example（专门留给示例用的后缀，不会指向真实网站）。
// 产品资料故意留了几个「资料里没有」的点（LFGB 认证、保温时长、到汉堡的海运时间），用来练 AI 不许自己补。
import type { PracticeLessonContent, PracticeMaterial } from "./content";

export const STEP1_MATERIALS: PracticeMaterial[] = [
  {
    id: "M1",
    title: "我方产品资料卡",
    note: "回复里的价格、交期、认证只能从这里来",
    body: `【教学模拟】明川不锈钢制品有限公司（虚构），浙江宁波，自有工厂

主推产品：MC-500 500ml 双层真空保温杯
- 材质：内外胆 304 不锈钢
- 颜色：黑、白、海军蓝三色常备；其他颜色按潘通色号定制，另行报价
- Logo：激光雕刻或丝印，一个位置免费
- 起订量：每款每色 300 个
- 价格（FOB 宁波，报价单 v3，有效期到 2026-12-31）
    300–999 个：4.20 美元/个
    1,000–2,999 个：3.80 美元/个
    3,000 个以上：业务经理单独报价
- 交期：常备色大货 25–30 天，从确认样品、收到定金起算；定制颜色加 7 天
- 样品：标准样品 80 美元/个（含国际快递）；带客户 Logo 的样品单独评估
- 付款：30% 定金，70% 见提单副本付清（T/T）
- 包装：单个白盒，48 个一箱；彩盒、礼盒可做，另行报价
- 检测和认证：有 FDA 食品接触检测报告（2025 年）
    没有 LFGB 报告，可以安排送检，费用和周期待确认
- 资料里没有的：保温时长测试数据、到各港口的海运运费和船期`,
  },
  {
    id: "M2",
    title: "询盘 A · 德国家居零售商",
    note: "主线这封：需求具体，问了五个问题",
    body: `【教学模拟】收到时间：2026-09-28，来自官网询盘表单

From: Martina Becker <m.becker@lindenhaus.example>
Subject: Inquiry – 500ml insulated tumbler with logo, 1,000 pcs

Dear Sales Team,

We are Lindenhaus GmbH, a home and kitchen retailer with 12 stores in Northern Germany. We found your MC-500 tumbler on your website and are planning a winter promotion.

Our requirement:
- 500ml vacuum tumbler, 1,000 pcs
- 2 colours: black and navy (500 pcs each)
- Our logo, laser engraved
- Individual gift box

Questions:
1. Your price CIF Hamburg
2. Lead time – the goods must arrive in Hamburg by 20 November
3. Do you have an LFGB certificate? It is required for the German market.
4. How many hours does it keep drinks hot?
5. Can we get a sample first?

Best regards,
Martina Becker
Purchasing Manager, Lindenhaus GmbH
Hafenstrasse 8, Hamburg, Germany
www.lindenhaus.example`,
  },
  {
    id: "M3",
    title: "询盘 B · 只要目录和最低价",
    note: "信息很少，可能是真买家，也可能是来套价",
    body: `【教学模拟】收到时间：2026-09-29，来自官网询盘表单

From: Ahmed <ahmed.trading2020@freemail.example>
Subject: price

Hello,
I am interested in your products. Please send me your catalog and best price list.
Thanks
Ahmed`,
  },
  {
    id: "M4",
    title: "询盘 C · 「紧急订单」",
    note: "带登录链接，催 24 小时内确认",
    body: `【教学模拟】收到时间：2026-09-29，直接发到业务邮箱

From: Purchase Dept <purchase@globaI-sourcing.example>
Subject: URGENT: New Purchase Order #PO-88213

Dear Supplier,

Please find our new order attached. Kindly log in with your email account to view the PO document:
[ View PO Document ]  ← 这是一个链接按钮

We need your confirmation within 24 hours, otherwise the order will go to another supplier.

Regards,
Purchase Department

（注意发件域名：globaI 里的「I」是大写 i，不是小写 L）`,
  },
  {
    id: "M5",
    title: "询盘 D · 要全线报价和工厂资料",
    note: "1.4 换人试用模板时用",
    body: `【教学模拟】收到时间：2026-09-30，来自官网询盘表单

From: Kevin Tan <kevin@brightsource.example>
Subject: RFQ – full tumbler range

Hi,

We are a sourcing company in Singapore. Please quote all your tumbler models for 5,000 / 10,000 / 20,000 pcs with price breakdown (material, labour, packing). Please also send your factory audit report and your stainless steel supplier list.

Kevin Tan
Bright Source Trading`,
  },
  {
    id: "M6",
    title: "一封满意的旧回复",
    note: "1.2 当样例用：学结构和语气，不抄内容",
    body: `【教学模拟】业务员小周 2026-06 写给英国买家的首次回复，那次买家回了信并下了样品单

Dear Mr. Clarke,

Thank you for your inquiry about our 750ml sports bottle for your gym chain.

To your questions:
1. Price: USD 3.10/pc FOB Ningbo for 2,000 pcs (quotation valid until 31 Aug).
2. Lead time: 30 days after sample approval and deposit.
3. Custom colour: yes, by Pantone code; we will confirm the extra cost once you send the code.

One thing we need to check with our lab: the leak test report for the new lid. We will send it to you by Friday.

To prepare an accurate offer, could you tell us your target delivery date and whether you need individual retail boxes?

If helpful, we can send a standard sample this week so your team can check the quality.

Best regards,
Lily Zhou`,
  },
  {
    id: "M7",
    title: "AI 写的回复初稿（有错）",
    note: "1.3 拿来核对：照着资料逐句查",
    body: `【教学模拟】假设只用一句「帮我回复这封询盘」让 AI 回复询盘 A。这份初稿是按这种问法常见的出错方式编写的，不是实跑结果

Dear Martina,

Thank you so much for your kind inquiry! We are a leading manufacturer with over 20 years of experience and we are very happy to work with Lindenhaus GmbH.

1. Price: USD 4.10/pc CIF Hamburg.
2. Lead time: 15 days, so arrival before 20 November is no problem.
3. Yes, our tumblers are LFGB certified.
4. It keeps drinks hot for 12 hours.
5. Sure, we can send you a free sample.

We look forward to your order!

Best regards`,
  },
];

const STEP_REFS_NONE = "这一课用不上，可以跳过";

export const STEP1_CONTENT: Record<string, PracticeLessonContent> = {
  "1-1": {
    oneLiner: "别只说「帮我回一下」。把要什么、给什么、不许干什么交代清楚，AI 和同事都能照着做。",
    outcome: "你会留下一段交代清楚的询盘提示词，外加一张三封询盘的分类表。",
    why: "你跟 AI 说一句「帮我回一下」，它不会反问你，直接把价格、交期、认证都替你填上——填的多半是编的。所以动手前，先把要什么、不许干什么讲明白，跟带新人第一天一样。",
    principles: [
      {
        point: "把 AI 当新来的同事",
        explain: "它不认识你的产品，不知道报价单是哪版，也不知道这封信给谁看。你会跟新人交代的话，全写进提示词。",
      },
      {
        point: "一件事交代清五样",
        explain: "要做成什么（目标）、给它什么（材料）、交回来什么（成果）、哪些不能碰（边界）、怎么算干得好（标准）。写给客户看的，再告诉它读信的是谁。",
      },
      {
        point: "先让它读懂，再让它动笔",
        explain: "读询盘和写回复拆成两步。它读错了你一眼就能看出来，比等它写完一整封再挑错省事。",
      },
      {
        point: "先分清是哪种询盘，再决定回不回",
        explain: "这是业内常用的分法，不是哪家定的标准。需求具体的认真回；信息太少的先问清楚；带登录链接或附件、催你限时确认、域名看着不对的，先当钓鱼：链接不点、附件不开，打官网电话核实。光凭对方用免费邮箱，不能断定是假的。",
      },
    ],
    exercises: [
      {
        title: "把一句话任务改写清楚",
        materials: ["M1", "M2"],
        materialNote: "产品资料卡和询盘 A",
        task: [
          "先只写一句「帮我回复这封询盘」，然后想想：你心里其实还指望它做到哪些事？记下来。",
          "把这些按目标、材料、成果、边界、标准五样，再加上读信的人，改写成一段完整的提示词。",
          "把询盘 A 和产品资料卡贴在后面，跑一次，结果存下来。",
        ],
        criteria: [
          "五样都有，「怎么算干得好」能一条条打勾——不是「写专业点」这种话",
          "讲明了价格、交期、认证只能用资料里的",
          "资料里没有的怎么办，也交代了（比如写成待确认）",
        ],
        reference: {
          kind: "prompt",
          note: "这是一种写法。五样都在就行，话可以换成你自己的。",
          text: `你是我们公司的外贸业务助理，帮我处理一封买家询盘。

【这次要做什么】
先读懂这封询盘，再起草第一封回复邮件。今天只出草稿，我审过再发。

【读者】
买家是德国一家家居零售商的采购经理，用英文沟通。

【成果】
1. 用中文列出：买家要什么、提了几个问题、哪些我们资料里能回答、哪些回答不了。
2. 一封英文回复草稿，150–250 词。

【边界】
- 价格、交期、认证、样品政策只能用下面的产品资料。资料里没有的，写成 [待确认：具体是什么]，不要自己补。
- 不承诺资料里没有的东西，不写「行业领先」这类没有依据的话。

【怎样算好】
- 买家的每个问题都有回应；当场答不了的，告诉买家什么时候给答复。
- 至少问买家一个能帮我们准确报价的问题。
- 结尾有一个明确的下一步。

【材料】
询盘原文：
（贴询盘 A）

产品资料：
（贴产品资料卡）`,
        },
      },
      {
        title: "先别回，把三封询盘分个类",
        materials: ["M2", "M3", "M4"],
        materialNote: "三封询盘，先别让 AI 写回复",
        task: [
          "写一段只让它分析的提示词：每封判断是哪种、凭什么、还缺什么、建议怎么办。",
          "要它用表格交，理由要引用询盘原文。",
          "三封一起跑，再和你自己的判断对一对。",
        ],
        criteria: [
          "C 被标成可疑，建议是「链接不点、不回复、交给负责人核实」",
          "B 没被直接打成假询盘，而是「信息不全，先问清楚」",
          "每个判断都能在原文里找到理由，不是凭感觉",
        ],
        reference: {
          kind: "prompt",
          note: "询盘 C 里的链接别点，也别让 AI 去打开。分类只看邮件本身。",
          text: `下面有三封买家询盘。先不要写回复，只做分析。

每封询盘按这几列填一张表：
| 询盘 | 类型 | 依据（引用原文） | 还缺什么信息 | 建议动作 |

类型只能从三种里选：
- 需求具体：产品、数量、要求、联系人和公司信息基本齐全
- 信息不全：看不出是谁、要什么、要多少
- 可疑：要求点链接登录、催促限时确认、发件域名和公司对不上，等等

建议动作只能从三种里选：认真回复 / 先补问再报价 / 不回复，交给负责人核实。

判断拿不准的，写「拿不准」和原因，不要硬选。

<inquiry id="A">（贴询盘 A）</inquiry>
<inquiry id="B">（贴询盘 B）</inquiry>
<inquiry id="C">（贴询盘 C）</inquiry>`,
        },
      },
      {
        title: "两个版本放一起比",
        materials: ["M1", "M2"],
        materialNote: "和练习 1 用同一份材料",
        task: [
          "开个新对话，只贴询盘 A 和产品资料，就写一句「帮我回复这封询盘」。",
          "把这次的结果和练习 1 的放在一起。",
          "按参照里的四项一条条比，差在哪记下来。",
        ],
        criteria: [
          "两次材料一模一样，只换了提示词",
          "四项都比了，每项写出具体差在哪句",
          "最后写一句结论：一句话版本缺的，是完整版里哪一样补上的",
        ],
        reference: {
          kind: "text",
          note: "比的时候看这四项。你跑出来的可能不一样，照实记。",
          text: `1. 有没有编资料里没有的东西
   查：CIF 价格、到汉堡的时间、LFGB 认证、保温时长、免费样品
2. 买家五个问题是不是都回应了
   查：礼盒有没有被漏掉；答不了的有没有说什么时候答复
3. 有没有反问买家
   比如礼盒的具体要求、Logo 文件、目的港是否只有汉堡
4. 结尾有没有下一步
   比如先寄标准样品，或者等对方确认颜色和包装后正式报价`,
        },
      },
    ],
    refNotes: {
      l02: "看「任务书说清目标、材料、成果、边界与成功标准」那段，跟这课的五样是一回事。",
      l03: STEP_REFS_NONE,
      l04: STEP_REFS_NONE,
      "/ai-collab": "看手册「改旧东西，先划线」：你没写进提示词的要求，没人替你守着。「边界」那一样就是干这个的。",
    },
    tools: {
      recommend: "能贴长文本的对话式 AI 都行，公司已经开通的优先，比如 Claude、ChatGPT、通义千问、豆包。这课用不着联网和插件。",
      entry: "每个练习开一个新对话，别接着旧的做，免得前面的内容串进来。真实询盘里客户的姓名、邮箱、电话，先确认公司允许再贴。",
    },
    sources: ["claude-prompting", "claude-blog", "openai-api", "tradegov-scam", "alibaba-phishing", "sinosure-risk", "singlewindow-fraud", "practitioner-first-reply"],
  },

  "1-2": {
    oneLiner: "资料管事实，样例管口气。给对了，AI 写的回复句句有出处，读着也像你们公司的人写的。",
    outcome: "你会留下一段把询盘、产品资料、样例分开放的提示词，用它跑出的回复草稿，每个数字都能在资料里找到。",
    why: "AI 回复里最要命的，是听着挺对、其实是错的话：价格、认证、交期。把能用的资料给它，说清只准用这些，再拿一封你满意的旧回复给它照着学，写出来才又准又像你们的口气。",
    principles: [
      {
        point: "事实只能从资料里来",
        explain: "直接告诉它：价格、交期、认证只能用你给的资料，没有就写待确认。让它敢说「不知道」，比让它猜安全得多。",
      },
      {
        point: "资料先自己过一遍",
        explain: "给之前先标好：哪些能直接写、哪些有条件、哪些不能写。过期报价、没批下来的承诺别放进去，AI 分不清哪份算数。",
      },
      {
        point: "样例是教它怎么写，不是让它抄",
        explain: "给一封满意的旧回复，讲明「学它的段落顺序和口气，产品和数字别抄」。官方建议样例要贴题、彼此有差别，攒够了给 3–5 封；这课先用 1 封练手，第 2 步再补齐。",
      },
      {
        point: "不同材料用标签隔开",
        explain: "询盘、产品资料、样例各包一层标签，比如 <inquiry>。这样它不容易把样例里的价格当成这次的价格。",
      },
      {
        point: "看询盘类型选回法，别一个套路用到底",
        explain: "先报价还是先问，老业务们说法不一，所以按类型来：需求具体的直接答、直接报价，答不了的说清什么时候给；信息不全的先问规格、数量、目标市场；只要全套目录和最低价的，先请对方说说公司再给价；可疑的不回。",
      },
    ],
    exercises: [
      {
        title: "给产品资料标三种颜色",
        materials: ["M1", "M2"],
        materialNote: "对照询盘 A 的五个问题看资料",
        task: [
          "把资料卡一行行过一遍，分成三类：能直接写进回复 / 有条件才能写 / 不能写。",
          "对着询盘 A 的五个问题，写出每个问题用资料哪一行来答；找不到的，标「资料里没有」。",
        ],
        criteria: [
          "LFGB、保温时长、到汉堡的运费和船期，都标成了「资料里没有」",
          "价格标成有条件：资料只有 FOB 宁波价，买家要的是 CIF 汉堡",
          "礼盒标成有条件：能做，但要另外报价",
        ],
        reference: {
          kind: "text",
          text: `问题 1 CIF 汉堡价格 → 有条件。资料只有 FOB 宁波 1,000 个 3.80 美元；运费、保险资料里没有，需问货代
问题 2 11 月 20 日前到汉堡 → 有条件。大货 25–30 天（从确认样品、收定金起算）；海运时间资料里没有
问题 3 LFGB → 不能写「有」。资料里只有 FDA；LFGB 可以送检，费用和周期待确认
问题 4 保温时长 → 资料里没有，不能写具体小时数
问题 5 样品 → 有条件。标准样品 80 美元；带 Logo 的样品单独评估
礼盒 → 有条件。能做，另报价`,
        },
      },
      {
        title: "拿旧回复当样例",
        materials: ["M6", "M2"],
        materialNote: "M6 是写给别的买家、别的产品的",
        task: [
          "在 1.1 那段提示词里加一段：附上 M6，告诉它这是一封效果不错的旧回复。",
          "讲清楚学什么（段落顺序、口气、答不了的问题怎么交代），不学什么（产品、价格、日期）。",
          "跑一次，看新回复的结构有没有跟上。",
        ],
        criteria: [
          "段落顺序跟样例一致：感谢并复述需求、逐条回答、答不了的给时间、反问、下一步",
          "没出现样例里的东西：750ml、3.10 美元、Mr. Clarke、leak test",
          "口气接近样例：直接、具体，没有一大串客套",
        ],
        reference: {
          kind: "prompt",
          text: `下面附了一封我们以前写的回复，买家看完回了信、下了样品单。
请学它的：段落顺序、语气、怎么交代暂时答不了的问题。
不要学它的：产品、价格、日期、人名。这些只用这次的询盘和产品资料。

<example_reply>
（贴 M6）
</example_reply>`,
        },
      },
      {
        title: "材料分开放，再跑一次",
        materials: ["M1", "M2", "M6"],
        task: [
          "把询盘、产品资料、样例各自包进标签：<inquiry>、<product_sheet>、<example_reply>。",
          "任务和规则写在标签外面，规则里直接点标签名，比如「价格只能来自 <product_sheet>」。",
          "跑一次，回复里的每个数字都拿去和资料对一遍。",
        ],
        criteria: [
          "回复里的每个数字，都能在 <product_sheet> 里找到原话",
          "LFGB、保温时长、运费这几处写的是待确认或答复时间，不是编出来的",
          "五个问题加礼盒，全都有回应",
        ],
        reference: {
          kind: "prompt",
          text: `你是明川不锈钢的外贸业务助理，帮我起草对下面这封询盘的第一封英文回复。今天只出草稿，我审过再发。

规则：
1. 价格、交期、认证、样品、包装只能来自 <product_sheet>。里面没有的，写成 [待确认：具体是什么]。
2. 买家要的是 CIF 汉堡价，资料里只有 FOB 宁波价。报 FOB 价并说明 CIF 价确认运费后给。
3. 结构和语气参照 <example_reply>，但不要用它的任何产品、数字和人名。
4. 买家每个问题都要回应，礼盒也要回应。
5. 反问一到两个影响报价的问题。
6. 结尾给一个明确的下一步。

先用中文列出你打算怎么回答每个问题、各用了资料哪一行，再写英文回复。

<inquiry>
（贴询盘 A）
</inquiry>

<product_sheet>
（贴产品资料卡）
</product_sheet>

<example_reply>
（贴 M6）
</example_reply>`,
        },
      },
    ],
    refNotes: {
      l02: STEP_REFS_NONE,
      l03: "看「材料目录、版本和适用范围」：过期报价、没批的承诺怎么挑出来，练习 1 用得上。",
      l04: STEP_REFS_NONE,
      "/ai-collab": STEP_REFS_NONE,
    },
    tools: {
      recommend: "跟 1.1 一样。资料多的话，用能上传文件的工具，把资料卡当文件传上去，比粘贴更不容易漏行。",
      entry: "资料卡存成一个固定文件，文件名带版本和日期（如「MC-500 资料卡 v3 2026-09」），每次都用这份，别从聊天记录里翻旧版本复制。",
    },
    sources: ["claude-prompting", "claude-blog", "openai-api", "tradegov-scam", "practitioner-first-reply"],
  },

  "1-3": {
    oneLiner: "AI 写完别急着发。对着资料一句句查，一次只改一处，再换几封询盘试试这段提示词靠不靠得住。",
    outcome: "你会留下一张回复核对表、一份修改记录，还有一版在询盘 B、C 上试过的新提示词。",
    why: "AI 写得通顺，不等于写得对。发出去的每句话都是公司的承诺，所以一定先查再发。查出来的毛病要改回提示词里，下一封询盘才不会再犯。",
    principles: [
      {
        point: "先定标准，再看结果",
        explain: "看之前先把「怎么算好」写下来，再一条条打勾。没标准，看完只会觉得「好像还行」。",
      },
      {
        point: "事实一句句对资料",
        explain: "价格、交期、认证、承诺，每句都要在资料里找得到出处。找不到的，要么删，要么改成待确认。",
      },
      {
        point: "追问要具体，一次只改一处",
        explain: "说「第 3 条 LFGB 改成我们没有、可以送检」，别说「再改好一点」。一次只动一个地方，才知道是哪句话起了作用。",
      },
      {
        point: "可以让 AI 先自查，但最后一道是你",
        explain: "可以让它写完后对着标准自己查一遍再改，能少很多低级错误，但替代不了你的核对。发给客户之前，最后过目的一定是人。",
      },
      {
        point: "换几封询盘再试",
        explain: "提示词在询盘 A 上好用，不等于在别的询盘上也好用。信息不全的、可疑的都拿去跑一遍，才知道它会在哪儿翻车。",
      },
    ],
    exercises: [
      {
        title: "核对一封有错的回复",
        materials: ["M7", "M1", "M2"],
        materialNote: "M7 是 AI 初稿，M1 是唯一的事实依据",
        task: [
          "把 M7 一句句拆开，每句填一行：说了什么 / 资料里的依据 / 对、错还是没依据 / 怎么改。",
          "再对着询盘 A 看一遍，有没有哪个问题漏答了。",
        ],
        criteria: [
          "至少揪出五处：CIF 价、15 天交期、LFGB、12 小时、免费样品",
          "揪出「20 年经验」「行业领先」这类没依据的话",
          "发现礼盒漏答了，也没反问买家",
        ],
        reference: {
          kind: "text",
          text: `"leading manufacturer, over 20 years" → 资料里没有 → 删
"USD 4.10/pc CIF Hamburg" → 错。资料只有 FOB，1,000 个是 3.80；CIF 价不该编，而且比 FOB 还低 → 改成 FOB 3.80，CIF 待确认运费后给
"Lead time: 15 days, arrival before 20 Nov no problem" → 错。大货 25–30 天，海运时间没有资料 → 改成 25–30 天，到港时间和货代确认后答复
"Yes, LFGB certified" → 错，风险最大。资料写明没有 LFGB → 改成目前有 FDA，LFGB 可安排送检，费用和周期待确认
"keeps hot for 12 hours" → 没依据 → 改成会提供测试数据，或先寄样品让对方自测
"free sample" → 错。标准样品 80 美元，带 Logo 样品单独评估
漏了：礼盒（能做，另报价）、反问（礼盒要求、Logo 文件）、下一步`,
        },
      },
      {
        title: "追问修正，一次一处",
        materials: ["M7"],
        materialNote: "接着练习 1 的核对表",
        task: [
          "照核对表，先挑最要命的一处（LFGB），写一句具体的追问，让 AI 只改这一处。",
          "看看别的句子有没有被它顺手改了。",
          "再一处处改别的问题，每改一次记一行：改了什么，结果有没有变好。",
        ],
        criteria: [
          "每条追问都点明改哪句、改成什么、依据哪条资料",
          "加了「其他部分保持不变」这类话，而且查过确实没变",
          "修改记录看得出每一步改了什么",
        ],
        reference: {
          kind: "prompt",
          note: "几条追问的写法示范，一次只发一条。",
          text: `只改第 3 条：我们没有 LFGB 报告，只有 2025 年的 FDA 食品接触检测报告。改成说明这一点，并告诉买家可以安排 LFGB 送检，费用和周期我们确认后答复。其他部分保持不变。

只改第 1 条：资料里只有 FOB 宁波价，1,000 个是 3.80 美元/个。改成报这个价格，并说明 CIF 汉堡价要等运费确认后给。其他部分保持不变。

删掉第一段里的「leading manufacturer」和「over 20 years」，换成一句复述买家需求的话。其他部分保持不变。`,
        },
      },
      {
        title: "换两封询盘试提示词",
        materials: ["M3", "M4"],
        materialNote: "用 1.2 练习 3 的提示词，把询盘换成 B 和 C",
        task: [
          "把 1.2 最后那段提示词里的询盘换成 B 跑一次，再换成 C 跑一次。",
          "看它有没有对着 C 认真写回复，有没有替 B 编出一整套报价。",
          "有问题的话，在提示词开头加一条规则，B 和 C 再各跑一次，前后差别记下来。",
        ],
        criteria: [
          "改完后，C 只给出可疑的地方和处理建议，不写回复",
          "改完后，B 的回复以补问为主，先请对方说说公司和需求，不发完整价目表",
          "加的那条规则和前后结果，记进了修改记录",
        ],
        reference: {
          kind: "prompt",
          note: "可以加在提示词最前面的一条规则。",
          text: `写回复之前，先判断这封询盘的类型：需求具体 / 信息不全 / 可疑。
- 可疑（要点链接登录、催限时确认、发件域名和公司对不上等）：不写回复，只列出可疑的地方，并提醒「不要点链接，交给负责人核实」。
- 信息不全：回复以补问为主，问清公司、国家、产品、数量和目标市场；不发完整价目表，对方补充后再按资料报价。
- 需求具体：按下面的规则写回复。`,
        },
      },
    ],
    refNotes: {
      l02: STEP_REFS_NONE,
      l03: STEP_REFS_NONE,
      l04: "这课的方法 l04 里都有：核验表、基线、一次只改一个因素、换新样例检查。",
      "/ai-collab": "让它改一处、它动了一大片时，看手册「改旧东西，先划线」：先讲清哪些不许动，再让它改。",
    },
    tools: {
      recommend: "跟 1.1 一样。核对表用表格或公司的共享文档做，方便以后接着记。",
      entry: "追问就在同一个对话里接着问；换询盘测试时开新对话，免得前面的修改干扰判断。",
    },
    sources: ["claude-success", "claude-prompting", "claude-blog", "openai-chatgpt"],
  },

  "1-4": {
    oneLiner: "调好的提示词别留在聊天记录里。存成带空位的模板，写上怎么用，同事拿去也能用。",
    outcome: "你会留下一份询盘分析和回复模板（v1）加一张使用说明卡：换封新询盘、换个人，照样跑出合格结果。到第 2 步做 Skill，用的就是它。",
    why: "调好的提示词只躺在聊天记录里，下回又得从头来，同事也用不上。存成模板、写清什么时候用，团队里每个人回询盘的水平才拉得齐。",
    principles: [
      {
        point: "不变的和每次要换的分开放",
        explain: "角色、规则、输出格式每次都一样；询盘原文、产品资料、样例每次可能不同。要换的做成 {{空位}}，不变的指令放前面，跟材料隔开。",
      },
      {
        point: "写清什么时候用、什么时候别用",
        explain: "比如：适合官网和邮件来的首次询盘；不适合老客户返单、投诉、已经在谈价的邮件。可疑询盘先交给人处理。",
      },
      {
        point: "有版本号，改了就记",
        explain: "模板每改一次升一版，记下改了什么、为什么改。出了问题能退回上一版，也知道是哪次改出来的。",
      },
      {
        point: "够用就停，别越改越长",
        explain: "能稳定跑出合格结果就定版。为了少见的情况一条条往里加规则，模板会越来越难维护，同事也看不懂。",
      },
      {
        point: "换个人、换封询盘试过才算存好",
        explain: "让没参与过的同事拿一封新询盘跑一遍。他不用问你就能跑出合格结果，这模板才算能用。",
      },
    ],
    exercises: [
      {
        title: "把提示词改成带空位的模板",
        materials: ["M1", "M6"],
        materialNote: "以 1.3 改好的那版提示词为底",
        task: [
          "把提示词里会跟着询盘变的内容挑出来，换成 {{空位}}。",
          "固定的规则、类型判断、输出格式原样留着。",
          "模板最上面写上版本号和日期。",
        ],
        criteria: [
          "至少有询盘原文、产品资料、样例回复三个空位",
          "模板里不再出现询盘 A 的具体内容（Lindenhaus、汉堡、11 月 20 日）",
          "类型判断和「只用资料」的规则都还在",
        ],
        reference: {
          kind: "prompt",
          text: `询盘分析与回复模板 v1（2026-10）

你是{{公司名}}的外贸业务助理，帮我处理下面这封询盘。今天只出草稿，我审过再发。

第一步：判断类型
需求具体 / 信息不全 / 可疑。可疑的不写回复，只列出可疑的地方，并提醒「不要点链接，交给负责人核实」。

第二步：分析（中文）
买家要什么；提了哪些问题；每个问题用 <product_sheet> 哪一行回答，没有的标「资料里没有」。

第三步：写回复（{{回复语言}}，150–250 词）
1. 价格、交期、认证、样品、包装只能来自 <product_sheet>。没有的写 [待确认：具体是什么]。
2. 结构和语气参照 <example_reply>，不用它的任何产品、数字和人名。
3. 每个问题都回应；反问一到两个影响报价的问题；结尾给一个明确的下一步。

<inquiry>
{{询盘原文}}
</inquiry>

<product_sheet>
{{产品资料}}
</product_sheet>

<example_reply>
{{样例回复}}
</example_reply>`,
        },
      },
      {
        title: "写一张使用说明卡",
        materials: [],
        materialNote: "不需要新材料",
        task: [
          "写清楚：这个模板干什么用、适合哪类邮件、不适合哪类、用之前要准备什么、谁负责维护。",
          "写一行更新记录：v1 比 1.1 的第一版改了哪几处。",
        ],
        criteria: [
          "同事看完说明卡，不用问你，就知道手上这封邮件该不该用这个模板",
          "写明了可疑询盘、老客户、投诉不走这个模板",
          "写明了产品资料要用最新版，以及去哪儿找",
        ],
        reference: {
          kind: "text",
          text: `用途：新询盘的类型判断、分析和第一封回复草稿
适合：官网表单和邮件来的首次询盘
不适合：老客户返单、投诉、已经在谈价的往来邮件
可疑询盘：模板会标出来，按公司规定交给负责人，不回复、不点链接
用之前准备：最新版产品资料卡（共享盘「产品资料」文件夹）、一封满意的旧回复
发之前：用 1.3 的核对表过一遍，草稿不能直接发
维护人：（填名字）　当前版本：v1（2026-10）
更新记录：v1 相比第一版，加了先判断类型的一步、材料分标签放、样例只学结构`,
        },
      },
      {
        title: "换个人、换封询盘试用",
        materials: ["M5", "M1"],
        materialNote: "询盘 D，交给没参与过的同事（或者你换个身份当新人）",
        task: [
          "把模板和说明卡交给同事，一句都别解释，让他用询盘 D 跑一次。",
          "记下他卡在哪儿、问了你什么。",
          "把他问到的补进说明卡或模板，升成 v1.1。",
        ],
        criteria: [
          "询盘 D 被判成「信息不全」，回复以补问为主",
          "没报 5,000 个以上的价（资料写明 3,000 个以上要单独报价）",
          "没答应发审厂报告和供应商清单，而是先弄清对方是谁",
        ],
        reference: {
          kind: "text",
          note: "D 的一种合格处理。关键是先弄清对方是谁，再决定给多少信息。",
          text: `类型：信息不全
依据：只说是新加坡采购公司，没有官网、目标市场和实际采购数量；要全线报价、成本拆分、审厂报告和原料供应商，超出首次询盘常见范围
回复要点：
- 感谢询价，说明主推 MC-500
- 3,000 个以上需单独报价，请对方告知目标市场、实际数量和使用场景
- 请对方提供公司官网
- 审厂报告和供应商信息在确认合作意向后按流程提供
下一步：对方补充信息后，由业务经理报大货价`,
        },
      },
    ],
    refNotes: {
      l02: "回看「任务书让另一人也能判断」：说明卡就是写给另一个人看的。",
      l03: STEP_REFS_NONE,
      l04: "看「新样例检查方法能否迁移」，练习 3 干的就是这件事。",
      "/ai-collab": STEP_REFS_NONE,
    },
    tools: {
      recommend: "模板放在团队共享文档里。你用的 AI 要是有「项目」「自定义指令」「智能体」这类功能，可以把不变的部分存进去，每次只贴空位里的内容。",
      entry: "模板文件名带版本号，旧版别删，挪进「历史版本」文件夹。到第 2 步，这份模板会做成 Skill。",
    },
    sources: ["openai-api", "claude-prompting", "claude-blog", "claude-success"],
  },
};
