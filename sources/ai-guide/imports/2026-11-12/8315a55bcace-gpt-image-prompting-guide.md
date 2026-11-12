---
title: "GPT Image 生图与修图提示词指南"
source: "https://book.oiloil.org/articles/gpt-image-prompting-guide"
author:
  - "[[OpenAI Docs]]"
published: 2026-04-21
created: 2026-11-11
description: "OpenAI 官方出品的 GPT Image 生图与修图实战指南：如何像写产品规格书一样按主体、构图、光线与材质分层描述画面，如何精准渲染图中文字与排版，如何用多参考图锁住人物身份与品牌风格，以及多轮修图时如何遵循「只改一处、显式锁死保留项」防止画面漂移。"
tags:
  - "clippings"
---
[![GPT Image 生图与修图提示词指南 封面](https://book.oiloil.org/assets/course-art/gpt-image-prompting-guide.webp)](https://book.oiloil.org/assets/course-art/gpt-image-prompting-guide.png)

本篇目录 8 个小节

无论是从零生成一张商业海报、产品 UI 界面稿、教学信息图，还是基于现有图片做局部换装、换家具、抠透明底，写出清晰可控的提示词（Prompt）都是决定出图质量最关键的一步。

开始动笔前，先想清楚你最终需要的画面长什么样，再依次描述 **主体（Subject）、构图（Composition）、风格材质（Style）与边界约束（Constraints）** 。如果是在现有图片上修改，则要把 **“需要改什么”** 和 **“必须保留什么”** 彻底拆开——每次只改一处，看清结果后再推进下一步。

---

## 一、模型选型与核心参数配置

在 GPT Image 2.5 系列中，OpenAI 提供了两款定位互补的模型：

- **`gpt-image-2.5-flare` （轻量极速款）** ：专为生成速度与低延迟优化，画面质量与上一代 `GPT Image 2` 相当，适合高频交互或对响应速度敏感的业务。
- **`gpt-image-2.5-sunburst` （旗舰画质款）** ：专为高要求场景打造的基础模型，画面质感、复杂排版与细节表现全面超越 `GPT Image 2` 。

两款模型都原生支持文生图、多参考图编辑以及透明背景导出，并且在 **局部精准修改** 与 **主体特征保留（Subject Preservation）** 上都有明显提升。关于底层接口初始化与鉴权方式，可参阅官方文档中的 [图像生成 API 指南](https://developers.openai.com/api/docs/guides/image-generation) 。

### 1\. 怎么选模型与规划测试顺序？

如果你正在搭建一条全新的生图工作流：优先追求响应速度时直接从 `GPT Image 2.5 Flare` 起步；优先追求极致画质、密集文字排版或复杂修图一致性时，先从 `GPT Image 2.5 Sunburst` 起步。等画面质量稳定达标后，再去寻找降低延迟的空间。

如果你正在把已有工作流迁移到新模型，可以按当前业务的质量现状来选起点：

| 你当前的工作流现状 | 推荐测试起点与推进策略 |
| --- | --- |
| **现有的 `GPT Image 2` 工作流画质已经够用** | 先测 **`GPT Image 2.5 Flare`** ，看能否在维持同等可用画质的前提下直接把耗时降下来。 |
| **场景复杂， `GPT Image 2` 的画质或控图还不达标** | 先测 **`GPT Image 2.5 Sunburst`** ，第一步先确认它的画质上限能否真正解决你的业务痛点。 |

当 `GPT Image 2.5 Sunburst` 的产出质量通过验收后，建议拿 **完全相同的提示词、参考图和尺寸参数** 去跑一遍 `GPT Image 2.5 Flare` ：如果 `Flare` 也能达到你的质量底线且速度更快，就切到 `Flare` ；如果业务确实依赖 `Sunburst` 的画质优势，就继续保留 `Sunburst` 。

请在自己的真实业务样本上实测响应耗时与成片通过率。不同提示词长度、参考图数量、输出分辨率和 `quality` 档位都会影响最终耗时，单一场景下的提速幅度不能直接套用到其他工作流上。

### 2\. API 参数与提示词各司其职

画幅尺寸、渲染档位与背景透明通道应当通过 API 参数独立设置，不要光靠提示词去描述：

| 参数名 | GPT Image 2.5 支持的配置值 |
| --- | --- |
| `model` | `gpt-image-2.5-flare` （轻量速度款）或 `gpt-image-2.5-sunburst` （主力高画质款） |
| `quality` | `auto` （默认）、 `low` 、 `medium` 、 `high` 、 `xhigh` 或 `max` |
| `size` | `auto` 或自定义分辨率。常用预设包括： `1024x1024` （方图）、 `1536x1024` （横图）、 `1024x1536` （竖图）、 `2048x2048` （2K 方图）、 `2048x1152` （2K 横图）、 `3840x2160` （4K 横图）及 `2160x3840` （4K 竖图） |
| `background` | `auto` 、 `opaque` （不透明）或 `transparent` （透明底） |

当你需要传入自定义分辨率（格式为 `宽x高` ）时，必须同时满足以下 4 条硬性规则：

1. **单边上限** ：宽或高均不得超过 `3,840` 像素；
2. **步长对齐** ：宽和高都必须是 `16` 像素的整数倍；
3. **长宽比限制** ：长边与短边的比例不得超过 `3:1` ；
4. **总像素区间** ：总像素数（宽 × 高）必须落在 `655,360` 到 `8,294,400` 之间（其中超过 `3,686,400` 像素、即大于 `2560x1440` 的超高分辨率目前属于实验性特性）。

**调参顺序建议：** 先按前文流程选定模型，再去调 `quality` （质量档位）。做第一轮模型横向对比时，只要两款模型都支持当前档位，请保持 `quality` 、提示词、参考图和输出尺寸完全一致。注意：同一个 `quality` 标签在不同模型上并不代表相同的绝对画质或相同的响应耗时。

如果首轮出图细节不够扎实，可以往上测一档 `quality` （例如信息图、小字海报从 `medium` 升到 `high` ）；一旦效果达标，再往下测低一档设置，看能否在不损失可用性的前提下进一步省时省钱。只有当常规档位确实满足不了硬性画质要求、且延迟预算允许时，才动用 `xhigh` 或 `max` ——并不是每一条提示词开高档位都会变好看。

**透明底素材特别提醒：** 生成透明背景素材时，必须在 API 中显式传入 `background="transparent"` ，并将输出格式设为 `png` 或 `webp` 。拿到返回图片后，务必检查解码后的 Alpha 透明通道（重点看发丝、玻璃、阴影和物体边缘是否干净）。另外， `output_compression` （输出压缩率）参数仅适用于 JPEG 或 WebP，输出 PNG 时切勿传入该参数。

### 3\. 生产工作流平滑迁移六步法

如果你正准备把线上生产环境的生图/修图接口迁移到新一代模型，建议按以下六个步骤稳妥推进：

1. **保存现有基线（Save a baseline）** ：收集线上有代表性的真实提示词与参考图——特别是高难度局部修改、精确文字渲染、人脸一致性、商品几何结构以及透明底抠图场景，完整记录当前模型、请求参数与生成结果。
2. **选定首个候选模型（Choose the first candidate）** ：现有 `GPT Image 2` 质量够用就先测 `Flare` 找速度收益；现有质量不够用就先测 `Sunburst` 攻克质量难关。首轮对比保持提示词、参考图、分辨率与输出格式完全不变。
3. **全方位核对成片（Check the complete result）** ：逐项对比指令遵循度、人物身份与商品外观保留度、文字拼写准确率、是否出现多余改动以及透明通道纯度。同一请求重复跑多次以检验稳定性；对于多步修图工作流，不仅要测单步效果，还要跑通完整的连续多轮链路。
4. **画质过关后再测延迟收益（Test for a latency gain）** ：如果先用 `Sunburst` 跑通了质量标准，接着用同一批样本测试 `Flare` 。只有当 `Flare` 画质同样达标且延迟确实更低时才切换，否则继续使用 `Sunburst` 。
5. **每次只改一个变量（Tune one setting at a time）** ：先对比不同 `quality` 档位，再动手改写提示词。同时统计常规响应耗时、长尾慢请求、失败重试率以及“每张合格成片的综合成本”，务必核对最新官方定价，不要想当然地认为快模型一定更便宜。
6. **按业务流小步灰度（Roll out by workflow）** ：新模型通过验收标准后，先切一小部分线上流量并持续监控上述指标，稳定后再逐步放量。在旧模型停服前保留回滚开关。

> **防漂移底线提示：** 即便模型控图能力大幅增强，连续多轮编辑依然可能改变你原本想保留的细节。每轮都要重申核心约束并检查结果； **如果画面中某块区域要求 100% 像素级一字不差（Pixel-identical），最稳妥的工程做法是只让模型生成局部修改，再用代码或图像处理工具把确认无误的局部画面合成（Composite）回原图** ，而不是完全指望提示词。

---

## 二、提示词编写八大基本功

在进入具体场景配方前，先把 OpenAI 官方提炼的 8 条提示词底层原则装进脑子里。绝大多数“出图不像样”或“修图越改越乱”，都是因为漏掉了其中某一环：

![GPT Image 结构化提示词五要素拆解框架](https://book.oiloil.org/assets/articles/gpt-image-prompting-guide/01-prompt-anatomy.svg)

GPT Image 结构化提示词五要素拆解框架

### 1\. 先定义最终交付物与构图（Define the result）

开篇第一句直接点明画面主体和实际用途——到底是一张商业产品摄影、街头潮牌海报、课堂教学图解，还是一页融资 PPT？紧接着明确构图方式、画幅比例和核心元素的位置关系。遇到复杂需求时，直接用带标签的分段结构（如 `Scene / Subject / Style / Constraints` ）把要求拆开写。

### 2\. 选择好读、好改的维护格式（Choose a maintainable format）

无论是简短自然段、详细描述段落、类 JSON 键值结构，还是分点指令与标签，模型都能很好地理解。不用迷信某种神秘的“特殊语法符号”，哪种格式让你和团队最容易看清需求、最方便后续增删修改，就用哪种。

### 3\. 描述肉眼可见的材质、光线与媒介（Describe visible details）

明确写出物体的表面材质、光源特征、色彩倾向和视觉媒介。如果想要真实照片质感，直接写明 `"photorealistic"` 或 `"real photograph"` ，并交代取景范围与皮肤/器物肌理。

需要注意的是，提示词里写的相机型号与镜头参数（如 `35mm film, 50mm lens` ）主要是给模型提供 **视觉审美与景深外观线索** ，并不等同于物理光学引擎的严格仿真。而在处理大场景、电影感、暗光、雨夜或霓虹灯画面时，请具体写出空间尺度、空气氛围和冷暖色调，不要只丢几个空洞的情绪词。

### 4\. 写清人物入镜范围与交互动作（Specify people and actions）

涉及人物时，交代清楚身体取景范围（全身、半身还是特写）、相对大小、视线方向，以及手脚与周围道具的具体交互关系。像 `"full body visible, feet included"` （全身入镜、包含双脚）、 `"looking down at the open book"` （低头看着摊开的书）或 `"hands naturally gripping the handlebars"` （双手自然握住车把）这类具体到动作细节的描述，能大幅减少肢体悬空或姿态僵硬的问题。

### 5\. 用引号锁定精确文字与排版（Specify exact text）

只要画面里需要出现特定文字，一律 **用双引号 `"..."` 把逐字原文括起来** ，并交代文字摆放位置与字体风格。遇到生僻词、自造词或特殊品牌名时，可以在提示词里逐字母拼写出来。

同时务必加上一句 **“只渲染一次、不要添加任何额外文字（render exactly once, no extra text）”** ，生成后仔细核对字母拼写与字迹清晰度。如果图中包含小字号文本、高密度信息标签或多套字体，建议直接对比测试 `quality="medium"` 与 `quality="high"` 。

### 6\. 把“改什么”与“留什么”彻底分开（Separate changes from constraints）

做图像编辑时，明确写出 **“只改 X（change only X）”** ，然后把必须原样保留的要素逐一列出来——例如人物长相身份、商品几何形状、版式布局、光线方向或文字标签，并声明排除项（不要新增文字、Logo 或水印）。如果是极精细的局部修改，还要点名锁死饱和度、对比度、指示箭头、机位角度以及周围参照物。

### 7\. 给每张参考图编号并指派角色（Assign roles to references）

传入多张参考图时，按顺序给每张图编号并说明它的用途：哪张是主体底图、哪张提供画风、哪张提供服装单品、哪张提供背景环境。写清楚这几张图应该怎样组合、哪个元素应该搬到哪个位置。

### 8\. 跨轮次小步迭代，一次只改一处（Iterate deliberately）

多轮修图时，把上一轮的成片作为下一轮编辑的输入图， **每次只提一个修改要求，并重复写出需要保留的关键细节** 。虽然写一句 `"same style as before"` （保持之前的风格）能带上一定上下文，但一旦发现画面开始偏移，就要立刻把核心保留约束完整重申一遍。每改完一步先对比效果，确认变好了再加下一条指令。

---

## 三、从零生图：九大高频场景与中英提示词配方

下面这 9 个官方示例分别对应一种典型的生成技巧。你可以直接复制对应的英文或中文提示词作为起点，再替换成自己的业务素材与需求：

![GPT Image 2.5 四大典型文生图场景实测对比](https://book.oiloil.org/assets/articles/gpt-image-prompting-guide/fig-generation-showcase.webp)

GPT Image 2.5 四大典型文生图场景实测对比

### 1\. 控制摄影风格、光线与真实肌理（Control style and lighting）

想要拍出不假、没有“AI 塑料磨皮感”的写实人像，关键是通过 **主体特征、取景焦段、自然光线和表面磨损质感** 来立住画面，并在结尾显式排除过度美化与重度修图。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a photorealistic candid photograph of an elderly sailor standing on a small fishing boat.
He has weathered skin with visible wrinkles, pores, and sun texture, and a few faded traditional sailor tattoos on his arms.
He is calmly adjusting a net while his dog sits nearby on the deck. Shot like a 35mm film photograph, medium close-up at eye level, using a 50mm lens.
Soft coastal daylight, shallow depth of field, subtle film grain, natural color balance.
The image should feel honest and unposed, with real skin texture, worn materials, and everyday detail. No glamorization, no heavy retouching.

# 中文对应写法：
生成一张极具真实感的抓拍照片：一位年迈的水手站在小渔船上。
他饱经风霜的皮肤上有清晰可见的皱纹、毛孔与日晒肌理，手臂上有几处褪色的传统水手纹身。
他正平静地整理渔网，他的狗坐在旁边的甲板上。画面质感如同用 50mm 镜头在平视角度拍摄的 35mm 胶片近景照片。
柔和的海岸日光、浅景深、细腻的胶片颗粒感、自然的色彩平衡。
整张照片应当真实自然、毫无摆拍痕迹，展现出真实的皮肤纹理、磨损的衣物材质与日常细节。不要过度美化，不要重度磨皮修图。
```

### 2\. 用视觉信息图讲清复杂流程（Explain a process visually）

生成技术原理图或流程信息图时，直接点明 **要拆解的设备/流程名称、目标受众，以及图中必须交代清楚的核心节点** 。出图后除了看视觉美观度，还要重点核对文字标签与上下游逻辑关系是否准确。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a detailed Infographic of the functioning and flow of an automatic coffee machine like a Jura.
From bean basket, to grinding, to scale, water tank, boiler, etc.
I'd like to understand technically and visually the flow.

# 中文对应写法：
生成一张详细的信息图，展示像 Jura 这类全自动咖啡机的内部工作原理与完整流程。
涵盖从咖啡豆仓、研磨器、称重计量、水箱到锅炉萃取等各个核心环节。
我希望能够从技术结构和视觉流向上直观看懂它的工作全过程。
```

### 3\. 在海报中精准渲染指定文案（Render exact text）

需要把品牌标语或标题直接印在画面里时， **把要求出现的文案放进双引号里，并明确告诉模型这句话只允许出现几次** 。同时交代清楚目标受众与视觉调性，不要掺杂无关指令。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Give me a cool in culture ad / fashion shot for a brand called Thread.
It's a hip young street brand. The ad shows a group of friends hanging out together with the tagline "Yours to Create."
Make it feel like a polished campaign image for a youth streetwear audience: stylish, contemporary, energetic, and tasteful.
Use clean composition, strong color direction, natural poses, and premium fashion photography cues.
Render the tagline exactly once, clearly and legibly, integrated into the ad layout.
No extra text, no watermarks, no unrelated logos.

# 中文对应写法：
为年轻街头潮流品牌 Thread 生成一张充满青年文化气息的时尚广告大片。
画面展示一群朋友聚在一起自在玩乐，并印有品牌标语 "Yours to Create."。
整体质感要像面向年轻街头服饰受众的成熟商业广告大片：时髦、现代、充满活力且品味在线。
采用干净的构图、鲜明的色彩导向、自然的肢体姿态以及高级时尚摄影的灯光质感。
将标语清晰、易读地融入广告版式中，且严格只渲染一次。
不要出现任何额外文字、不要水印、不要无关 Logo。
```

### 4\. 设计可复用的透明底品牌 Logo（Design a reusable logo）

设计图标或品牌 Logo 时，重点描述品牌调性以及构成图形的 **几何形态、剪影轮廓与正负空间（Negative Space）** 。强调“少即是多”，确保 Logo 缩到很小或放到很大时都依然清晰易认。可以通过设置参数 `n` 一次性生成多个方案变体供挑选。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`, `background="transparent"`, `output_format="png"`, `n=4`

```
Create an original, non-infringing logo for a company called Field & Flour, a local bakery.
The logo should feel warm, simple, and timeless. Use clean, vector-like shapes, a strong silhouette, and balanced negative space.
Favor simplicity over detail so it reads clearly at small and large sizes. Flat design, minimal strokes, no gradients unless essential.
Fully transparent background. Deliver a single centered logo with generous padding, clean alpha edges, and no solid backdrop, scenery, checkerboard, or watermark.

# 中文对应写法：
为一家名为 Field & Flour 的本地烘焙坊设计一款原创、无侵权风险的品牌 Logo。
Logo 整体感觉应当温暖、简洁且经典耐看。使用干净的类矢量几何图形、鲜明的剪影轮廓以及均衡的正负空间。
优先追求简洁而非繁琐细节，确保在小尺寸和大尺寸下都清晰易读。采用扁平化设计、极简线条，非必要不使用渐变。
全透明背景。输出单个居中的 Logo，四周留出充足边距，保持干净的 Alpha 透明边缘，严禁添加纯色底板、背景景物、灰白棋盘格或水印。
```

### 5\. 调用真实世界与历史背景知识（Use historical and real-world context）

只需点明具体的 **历史地点与精确日期** ，模型就能自动调动内置的世界知识，推演出符合当时年代特征的服饰、舞台搭景与环境氛围。出图后建议人工检查一下服装细节、道具陈设与周围环境是否符合史实。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a realistic outdoor crowd scene in Bethel, New York on August 16, 1969.
Photorealistic, period-accurate clothing, staging, and environment.

# 中文对应写法：
生成一张 1969 年 8 月 16 日美国纽约州伯特利（Bethel, New York，即伍德斯托克音乐节现场）的写实户外人群场景。
要求真实照片质感，人物服饰、舞台搭景与现场环境均需严格符合当时的年代特征。
```

### 6\. 把故事拆成多格条漫分镜（Turn a story into a comic strip）

想要把一段故事画成连环画或条漫，最管用的做法是 **把叙事拆解成一格一个清晰的“视觉节拍（Visual Beat）”** 。按 `Panel 1 / Panel 2 / Panel 3 / Panel 4` 逐格写清具体的动作、神态变化和光影反差，少写抽象心理活动，模型就能生成节奏流畅、镜头感极强的分镜漫画。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a short vertical comic-style reel with 4 panels.
Panel 1: The owner leaves through the front door. The pet is framed in the window behind them, small against the glass, eyes wide, paws pressed high, the house suddenly quiet.
Panel 2: The door clicks shut. Silence breaks. The pet slowly turns toward the empty house, posture shifting, eyes sharp with possibility.
Panel 3: The house transformed. The pet sprawls across the couch like it owns the place, crumbs nearby, sunlight cutting across the room like a spotlight.
Panel 4: The door opens. The pet is seated perfectly by the entrance, alert and composed, as if nothing happened.

# 中文对应写法：
生成一幅包含 4 个分镜的竖版四格条漫。
第 1 格：主人走出前门离开。宠物被框在身后的窗户里，小小的身躯贴着玻璃，瞪大双眼，前爪高高扒在窗上，屋里瞬间安静下来。
第 2 格：门咔哒一声关上。寂静被打破。宠物缓缓转身面向空无一人的屋子，姿态突变，眼神里闪烁着蠢蠢欲动的光芒。
第 3 格：屋子彻底变了样。宠物像大爷一样四仰八叉地瘫在沙发上，旁边散落着零食碎屑，阳光像聚光灯一样斜射进房间。
第 4 格：门开了。宠物端端正正地坐在玄关门口，神情警觉又乖巧淡定，仿佛什么都没发生过一样。
```

### 7\. 生成像真实上线产品的 UI 界面预览（Create an interface preview）

生成 App 或网页 UI 界面视觉稿时，核心诀窍是 **“把产品当成已经正式上线的真实应用来描述”** 。重点交代页面布局结构、信息层级、留白间距以及具体的真实界面组件（如顶部栏、商家列表、今日特惠卡片、营业时间）， **避开“概念设计图、未来感草图”这类词汇** ，这样生成的界面才会像真正能落地好用的产品，而不是华而不实的概念手稿。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a realistic mobile app UI mockup for a local farmers market.
Show today’s market with a simple header, a short list of vendors with small photos and categories, a small “Today’s specials” section, and basic information for location and hours.
Design it to be practical, and easy to use. White background, subtle natural accent colors, clear typography, and minimal decoration.
It should look like a real, well-designed, beautiful app for a small local market.
Place the UI mockup in an iPhone frame.

# 中文对应写法：
为一家本地农贸市场生成一张真实的移动端 App 界面视觉稿（UI Mockup）。
展示今日集市页面：包含简洁的顶部导航栏、带有缩略图和分类标签的摊主列表、小巧的“今日特惠（Today’s specials）”板块，以及集市地点与营业时间等基础信息。
整体设计注重实用性与易用性：纯白背景、柔和自然的点缀色、清晰的字体层级与极简装饰。
它看起来应该像一款真正已经上线、设计考究、美观好用的本地小集市 App。
将界面视觉稿放置在 iPhone 手机外框中展示。
```

### 8\. 制作科学图解与课堂教学挂图（Create scientific and educational visuals）

生物、化学反应流程、课堂原理讲解与扁平化科学图标系统，非常适合按 **“教学设计需求单（Instructional Design Brief）”** 的格式来写提示词：先定义目标学生群体、教学目标、视觉呈现形式，再明确列出必须出现的科学标签与严谨性约束。

为了让图解一目了然，建议要求采用 **干净的扁平化视觉系统、统一的图标风格、指向清晰的连接箭头和充足的白底留白** 。当科学准确性要求较高时，把所有必选分子/步骤名称逐一列出来，并声明禁止添加无关装饰；遇到标签密集或准备放进课件幻灯片里的教学图，请将质量档位设为 `quality="high"` 。

- **推荐生成参数** ： `size="1536x1024"`, `quality="high"`

```
Create a simple biology diagram titled "Cellular Respiration at a Glance" for high school students.

Show how glucose turns into energy inside a cell. Include glycolysis, the Krebs cycle, and the electron transport chain.
Use arrows to connect the steps, and label the main molecules: glucose, pyruvate, ATP, NADH, FADH2, CO2, O2, and H2O.
Make it look like a clean classroom handout or slide, with a white background, simple icons, clear labels, and easy-to-read text.

Avoid tiny text, extra decoration, or anything that makes the diagram hard to understand.

# 中文对应写法：
面向高中生生成一张简洁的生物教学原理图，标题为 "Cellular Respiration at a Glance"（细胞呼吸速览）。

展示葡萄糖如何在细胞内转化为能量。必须包含糖酵解（glycolysis）、克雷布斯循环/柠檬酸循环（the Krebs cycle）和电子传递链（the electron transport chain）三个阶段。
使用箭头连接各个步骤，并准确标注主要分子名称：glucose、pyruvate、ATP、NADH、FADH2、CO2、O2 和 H2O。
整体视觉效果要像一份干净的课堂讲义或教学幻灯片：纯白背景、简洁图标、清晰标签与易读文字。

避免使用过小的字号、多余的装饰，或任何会让原理图变得难以理解的杂乱元素。
```

### 9\. 生成路演 PPT、架构图与数据图表（Build slides, diagrams, and charts）

制作商业路演幻灯片（Pitch Deck）、工作流图表或数据看板时，不要把它当成“画插画”，而要 **当成一份严谨的交付物规格书（Artifact Spec）来写** ：直接点明交付物形态（如 A 轮融资 Slide）、定义画布布局与视觉层级、 **直接在提示词里给出真实的文本标题与具体数字** ，并规定干净的现代无衬线字体与留白规范。

对于包含数据图表、图例、坐标轴或底部脚注（Footnotes）的演示文稿，建议使用横向宽幅尺寸（如 `1536x864` ）并开启 `quality="high"` ，确保每一处小字都锐利可读（注：下方模板中的市场规模数字与研究机构引文仅为排版占位示例，正式使用前请替换为真实核实后的数据）。

- **推荐生成参数** ： `size="1536x864"`, `quality="high"`

```
Create one pitch-deck slide titled **"Market Opportunity"** that feels like a real Series A fundraising slide from a YC-backed startup.

Use a clean white background, modern sans-serif typography like Inter, and a crisp, minimal layout. The slide should include:

* A TAM/SAM/SOM concentric-circle diagram in muted blues and grays
* Specific, believable market sizing numbers:
  * **TAM:** $42B
  * **SAM:** $8.7B
  * **SOM:** $340M
* A clean bar chart below showing market growth from **2021 to 2026**, with a subtle upward trend
* Small footnotes: **"AGI Research, 2024"** and **"Internal analysis"**
* A company logo placeholder in the bottom-right corner

The design should look like it belongs in a deck that actually raised money: highly readable text, clear data hierarchy, polished spacing, and professional startup-style visual language.

Avoid clip art, stock photography, gradients, shadows, decorative elements, or anything that feels generic or overdesigned.

# 中文对应写法：
生成一页标题为 **"Market Opportunity"** 的融资路演幻灯片（Pitch-deck Slide），整体质感要像硅谷 YC 孵化初创公司真实的 A 轮融资 PPT。

使用干净的纯白背景、类似 Inter 的现代无衬线字体，以及利落极简的排版布局。该页幻灯片需包含：

* 采用低饱和灰蓝色调绘制的 TAM/SAM/SOM 同心圆市场规模图
* 具体、可信的市场规模数值标注：
  * **TAM:** $42B
  * **SAM:** $8.7B
  * **SOM:** $340M
* 下方配一张干净的柱状图，展示 **2021 至 2026 年**稳步增长的市场趋势
* 底部小字脚注：**"AGI Research, 2024"** 与 **"Internal analysis"**
* 右下角预留一个公司 Logo 占位符

整体设计应当具备真正拿到融资的顶级路演 PPT 水准：文字极易阅读、数据层级分明、间距考究、视觉语言专业克制。

严禁出现剪贴画（Clip art）、廉价图库照片、花哨渐变、阴影、多余装饰元素，或任何显得俗套、过度设计的痕迹。
```

---

## 四、图像编辑与合成：八大局部修图与多图联动配方

调用图像编辑接口（ `client.images.edit` ）时，我们可以传入一张或多张参考图（如需使用遮罩指定局部涂抹区域，可参阅官方文档的 [遮罩编辑指南](https://developers.openai.com/api/docs/guides/images-vision#edit-an-image-with-a-mask) ）。

图像编辑最核心的心法，就是 **把“要改的变量”与“必须锁死的不变量”彻底拆开** ——永远不要只写一句模糊的修改要求，而让模型自己去猜剩下的背景、人脸和光线该怎么处理：

![多轮修图防漂移公式：明确唯一改项与显式锁死保留项对比](https://book.oiloil.org/assets/articles/gpt-image-prompting-guide/02-edit-anti-drift.svg)

多轮修图防漂移公式：明确唯一改项与显式锁死保留项对比

下面我们结合 OpenAI 官方的实测案例，逐一拆解 8 种最常用的修图与多图合成配方：

![GPT Image 2.5 修图与多轮迭代四大实战场景前后对比](https://book.oiloil.org/assets/articles/gpt-image-prompting-guide/fig-editing-showcase.webp)

GPT Image 2.5 修图与多轮迭代四大实战场景前后对比

### 1\. 翻译图中文字并 100% 锁死原版式（Translate while preserving layout）

把前面生成的“全自动咖啡机原理信息图”作为输入图，要求模型将图中的英文说明翻译为目标语言，同时显式声明 **“不得改变画面的任何其他部分”** 。生成后请重点检查译文准确性，以及是否有个别单词被遗漏未翻。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="high"`

```
Translate the text in the infographic to Spanish. Do not change any other aspect of the image.

# 中文对应写法：
将这张信息图中的所有文字翻译为西班牙语（或简体中文）。不要改变画面的任何其他部分。
```

### 2\. 提取参考图画风生成新主体（Transfer a visual style）

把参考图（如一张复古像素风游戏画面）作为输入，在提示词中明确把参考图的角色限定为 **“提供色彩调色板、纹理质感与视觉媒介风格”** ，然后单独描述全新的画面主体与背景。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Use the same style from the input image and generate a man riding a motorcycle on a white background.

# 中文对应写法：
严格沿用输入图片的视觉画风，在纯白背景上生成一名骑着摩托车的男子。
```

### 3\. 锁死人物身份与体态、仅替换服装单品（Preserve identity and change clothing）

这是电商换装、虚拟试衣与产品定妆照最核心的高频场景。同时传入 **1 张人物原图 + 3 张服装单品图（外套、内搭背心、短靴）** ，在提示词中 **穷举锁死人物不可改变的特征** （脸型、五官、肤色、身材比例、姿势、神态与发型），只允许替换身上的衣物，并要求新衣服的布料褶皱、色温与环境阴影自然贴合原图光线，拒绝“剪纸贴图感”。

这套写法同样适用于“固定商品外观、仅更换包装局部或周边配饰”的商业修图场景。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Edit the image to dress the woman using the provided clothing images. Do not change her face, facial features, skin tone, body shape, pose, or identity in any way. Preserve her exact likeness, expression, hairstyle, and proportions. Replace only the clothing, fitting the garments naturally to her existing pose and body geometry with realistic fabric behavior. Match lighting, shadows, and color temperature to the original photo so the outfit integrates photorealistically, without looking pasted on. Do not change the background, camera angle, framing, or image quality, and do not add accessories, text, logos, or watermarks.

# 中文对应写法：
使用提供的服装参考图，为原图中的女性换上这套穿搭。严禁以任何方式改变她的脸部、五官特征、肤色、身形、姿势或个人身份特征。完整保留她原本的相貌神态、表情、发型与身体比例。仅替换身上的服装，让衣物顺应她现有的姿态与身体结构自然贴合，展现出真实的布料垂坠与褶皱质感。将光线、阴影与色温与原照片严格对齐，使整套穿搭呈现出照片级的自然融合感，绝不能像生硬贴上去的贴纸。不要改变背景、机位角度、取景框范围或画面画质，也不要添加任何额外配饰、文字、Logo 或水印。
```

### 4\. 多参考图跨场景自然合成（Combine references）

将街头人物照作为 **图 1（主场景底图）** ，将带有小狗的照片作为 **图 2（提取素材图）** 。在提示词中按编号点名： **把哪张图里的哪个元素，搬到哪张图的哪个具体位置** ，并要求光线风格、构图与背景与底图完全统一。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Place the dog from the second image into the setting of image 1, right next to the woman, use the same style of lighting, composition and background. Do not change anything else.

# 中文对应写法：
将第 2 张图片中的小狗放置到第 1 张图片的场景里，就安排在那位女性身旁；保持与图 1 完全一致的光线风格、构图与背景。不要改变画面的任何其他内容。
```

### 5\. 提取干净的透明底商品抠图（Create a transparent product cutout）

想要把实拍商品图抠成干净的透明底 PNG 素材，必须做到 **“双保险”** ：既要在 API 参数中设置 `background="transparent"` 和 `output_format="png"` （切勿对 PNG 设置 `output_compression` ），又要在提示词中显式声明 **“严禁画出灰白棋盘格（Checkerboard）、纯色底板或阴影，严禁改变商品造型与标签文字”** ——因为模型画出来的灰白格子只是位图颜色，根本不是真正的 Alpha 透明通道！如果后续还要对这张透明底素材做二次编辑，每一轮都必须重复“保留透明背景”的要求。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`, `background="transparent"`, `output_format="png"`

```
Extract the product from the input image and isolate it on a fully transparent background.
Output: centered product, crisp silhouette, no halos/fringing.
Preserve product geometry and label legibility exactly.
Add only light polishing. Do not add a solid backdrop, checkerboard, scenery, or shadow.
Do not restyle the product; remove the background and preserve clean alpha transparency.

# 中文对应写法：
从输入图片中提取出商品主体，并将其独立放置在完全透明的背景上。
输出要求：商品居中、外轮廓利落清晰、边缘无白边或杂色光晕（No halos/fringing）。
100% 原样保留商品的几何外观结构与瓶身标签文字的清晰度。
仅做轻微的质感润色。严禁添加纯色背景板、灰白假棋盘格、环境景物或投影。
严禁重绘或改变商品设计风格；仅移除背景并保留干净的 Alpha 透明通道。
```

### 6\. 手绘线稿转写实风光渲染（Turn a drawing into a realistic image）

“草图转写实渲染（Sketch-to-Render）”非常适合把设计师或产品经理随手画的粗略线稿，快速变成照片级的概念效果图。写提示词时同样要像写工程规范一样： **先锁死原线稿的布局、比例与透视关系，再赋予符合草图意图的真实物理材质、自然光影与环境细节** ，最后加上一句“不要添加新元素或文字”，防止模型自由发挥改乱构图。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Turn this drawing into a photorealistic image.
Preserve the exact layout, proportions, and perspective.
Choose realistic materials and lighting consistent with the sketch intent.
Do not add new elements or text.

# 中文对应写法：
将这幅手绘线稿转化为照片级写实图像。
严格保留原稿的构图布局、比例关系与空间透视。
选用符合线稿原本意图的真实自然材质与光影效果。
不要添加任何多余的新元素或文字。
```

### 7\. 无痕移除画面中的单个物体（Remove an object）

想要干净地抹掉画面里的某件物品，只需 **直接点名要移除的物体，同时声明保留它周围的一切要素** （人物、姿态、光线与构图），把修改范围牢牢锁死在局部。

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Remove the flower from man's hand. Do not change anything else.

# 中文对应写法：
移除男子手中的花朵。不要改变画面的任何其他部分。
```

### 8\. 保留人物身份并置入全新动态场景（Insert a person into a scene）

当我们想把照片里的真人置入一个全新的戏剧性场景（例如用前面博物馆女性的照片作为输入，生成她在优胜美地露营地躲避棕熊袭击的画面）时，提示词需要同时兼顾两件事： **一是交代清楚人物在新场景里的身体取景、视线方向、服装磨损细节与恐惧逃跑的互动状态；二是明确要求呈现出“抓拍真照片的朴实质感”，拒绝电影海报式的夸张调色与摆拍滤镜** 。

（注：在使用 `gpt-image-2` 及更新模型时，无需传入旧版的 `input_fidelity` 参数，系统默认始终以最高保真度处理所有输入参考图。）

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Generate a highly realistic action scene where this person is running away from a large, realistic brown bear attacking a campsite. The image should look like a real photograph someone could have taken, not an overly enhanced or cinematic movie-poster image.
She is centered in the image but looking away from the camera, wearing outdoorsy camping attire, with dirt on her face and tears in her clothing. She is clearly afraid but focused on escaping, running away from the bear as it destroys the campsite behind her.
The campsite is in Yosemite National Park, with believable natural details. The time of day is dusk, with natural lighting and realistic colors. Everything should feel grounded, authentic, and unstyled, as if captured in a real moment. Avoid cinematic lighting, dramatic color grading, or stylized composition.

# 中文对应写法：
生成一张高度写实的动态抓拍场景：图中的这位人物正在逃离一头袭击露营地的巨大真实棕熊。整张图片看起来应当像有人在现场随手拍下的真实照片，而不是过度修饰或像电影海报那样的渲染图。
她位于画面中央但视线看向镜头之外，身穿户外露营服装，脸上有泥土痕迹，衣服上有撕裂破损。她神情明显惊恐但正全神贯注地逃生，在棕熊摧毁身后营地时奋力奔跑。
露营地位于优胜美地国家公园（Yosemite National Park），具备可信的自然环境细节。时间是黄昏时分，采用自然光线与真实色彩。一切都应当显得真实接地气、毫无刻意摆拍或美化痕迹，就像在真实瞬间抓拍到的一样。避免使用电影感布光、戏剧化调色或风格化构图。
```

---

## 五、跨轮次迭代精修与多场景角色一致性

在实际生产中，我们很少一锤子买卖只生成一张图，往往需要顺着第一版成片继续微调，或者围绕同一个主角连续画出一整本绘本。多轮迭代的黄金准则是： **先拿稳第一张图 → 仔细检查 → 把它作为下一轮的输入图 → 每次跟进只改一个极窄的变量** ，这样你才能清楚判断刚才那句指令到底有没有帮上忙。

### 1\. 第一步：基于实拍图生成初始基准场景（Create the starting image）

我们拿前面抠图用过的“洗发水实拍图”作为输入，先把它生成一张日落时分高速公路旁的户外广告牌视觉稿，并用引号严格锁死广告词与字体排版：

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a realistic billboard mockup of the shampoo on a highway scene during sunset.
Billboard text (EXACT, verbatim, no extra characters):
"Fresh and clean"
Typography: bold sans-serif, high contrast, centered, clean kerning.
Ensure text appears once and is perfectly legible.
No watermarks, no logos.

# 中文对应写法：
生成一张写实的户外广告牌视觉稿（Billboard Mockup），展示这款洗发水矗立在日落时分的高速公路场景中。
广告牌文字（严格逐字匹配，不得增删任何字符）：
"Fresh and clean"
字体排版：粗体无衬线字、高对比度、居中对齐、字距干净整洁。
确保该文字仅出现一次且清晰易读。
不要水印，不要多余 Logo。
```

### 2\. 第二步：单步微调，一次只改一个环境条件（Change one condition）

拿到满意的日落广告牌成片后， **把这张输出图直接作为下一轮 `edit` 请求的输入图** 。这时只需要发一句极简的跟进指令，把天气改为冬夜下雪，原有的广告牌构图、洗发水瓶身与标语就会完好无损地保留下来：

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Make it look like a winter evening with snowfall.

# 中文对应写法：
把画面改成正在下雪的冬日夜晚。
```

### 3\. 第三步：在系列插画中保持角色跨场景一致（Keep a character consistent）

如果你要创作一本包含多幅插画的儿童绘本或连载故事，最稳的做法是： **先生成一张干净的“角色设定基准图（Character Reference）”** ，把主角的长相比例、标志性穿搭和画风立住；随后在画后续每一页新场景时， **把这张角色基准图作为输入图传进去，并在提示词里显式重申角色的核心外观特征** 。

#### 第一阶段：建立角色设定基准图（Establish the character）

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a children’s book illustration introducing a main character.

Character:
A young, storybook-style hero inspired by a little forest outlaw,
wearing a simple green hooded tunic, soft brown boots, and a small belt pouch.
The character has a kind expression, gentle eyes, and a brave but warm demeanor.
Carries a small wooden bow used only for helping, never harming.

Theme:
The character protects and rescues small forest animals like squirrels, birds, and rabbits.

Style:
Children’s book illustration, hand-painted watercolor look,
soft outlines, warm earthy colors, whimsical and friendly.
Proportions suitable for picture books (slightly oversized head, expressive face).

Constraints:
- Original character (no copyrighted characters)
- No text
- No watermarks
- Plain forest background to clearly showcase the character

# 中文对应写法：
生成一幅介绍主角登场的儿童绘本插画。

角色设定（Character）：
一位充满童话故事感的森林小侠客主角，身穿简洁的绿色连帽短袍、柔软的棕色短靴，腰间系着一个小皮袋。
角色神情友善、眼神温和，气质勇敢而又温暖。
背着一把只用来提供帮助、绝不伤害生灵的小木弓。

主题（Theme）：
这位主角专门在森林里保护和救助松鼠、小鸟和兔子等小动物。

画风（Style）：
儿童绘本插画风格，手绘水彩质感，柔和的轮廓线，温暖的大地色系，充满童趣且亲切友好。
采用适合图画书的头身比例（头部略微偏大，面部表情生动传神）。

约束条件（Constraints）：
- 100% 原创角色（严禁借用受版权保护的现成动漫角色）
- 画面中不出现任何文字
- 不要水印
- 使用简洁的森林背景，以便清晰突出主角形象
```

#### 第二阶段：复用角色基准图，跨场景续写故事（Continue the story）

把上一阶段生成的森林小主角插画作为输入图传入，描述暴风雪过后救助小松鼠的新场景，同时在 `Character Consistency` 小节里再次锁死绿色连帽短袍、面部比例与水彩画风：

- **推荐编辑参数** ： `size="1024x1536"`, `quality="medium"`

```
Continue the children’s book story using the same character.

Scene:
The same young forest hero is gently helping a frightened squirrel
out of a fallen tree after a winter storm.
The character kneels beside the squirrel, offering reassurance.

Character Consistency:
- Same green hooded tunic
- Same facial features, proportions, and color palette
- Same gentle, heroic personality

Style:
Children’s book watercolor illustration,
soft lighting, snowy forest environment,
warm and comforting mood.

Constraints:
- Do not redesign the character
- No text
- No watermarks

# 中文对应写法：
沿用同一个主角形象，继续绘制儿童绘本的下一幕故事。

场景（Scene）：
同一位年轻的森林小英雄，在一场冬季暴风雪过后，正温柔地帮助一只受惊的小松鼠从倒下的树干里脱困。
主角单膝跪在松鼠身旁，轻声安抚它。

角色一致性要求（Character Consistency）：
- 保持完全相同的绿色连帽短袍
- 保持完全相同的五官特征、头身比例与色彩搭配
- 保持同样温和、勇敢的气质

画风（Style）：
儿童绘本水彩插画风格，柔和的光线，白雪皑皑的森林环境，温暖治愈的氛围。

约束条件（Constraints）：
- 严禁重新设计或改动主角形象
- 画面中不出现任何文字
- 不要水印
```

---

## 六、更多行业实战工作流配方

除了上述基础场景，OpenAI 还在指南中给出了室内家装局部替换、商业印品贺卡与实体潮玩包装三套可直接抄作业的行业配方：

### 1\. 室内家装：外科手术式局部换家具（Change furniture in a room）

在真实房间照片里预览更换家具或软装的效果时，追求的是 **“外科手术式的真实感（Surgical Realism）”** ：只把目标家具替换掉，同时 100% 锁死相机机位、房间环境光、地板接触阴影（Contact Shadows）以及周围所有陈设，让结果看起来像在原房间里真拍的照片，而不是把整个厨房推倒重装修了一遍。

- **推荐编辑参数** ： `size="1536x1024"`, `quality="medium"`

```
In this room photo, replace ONLY the white chairs with chairs made of wood.
Preserve camera angle, room lighting, floor shadows, and surrounding objects.
Keep all other aspects of the image unchanged.
Photorealistic contact shadows and fabric texture.

# 中文对应写法：
在这张房间照片中，仅将白色餐椅替换为木质餐椅。
完整保留原有的相机机位角度、房间光线、地板投影以及周围的所有物品。
保持画面的所有其他部分完全不变。
呈现出照片级真实的地面接触阴影与材质肌理。
```

### 2\. 节日贺卡与精装印品摄影设计（Design a holiday card）

设计节日贺卡或情感向海报时，依次写清场景故事、情绪基调、纸张/毛绒材质、散景光斑（Bokeh）以及逐字锁定的祝福文案。如果想要立体贺卡（3D Pop-up）或实拍纸品效果，还可以进一步指定纸张叠层、纸张纤维、折痕与柔光棚拍质感。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a Christmas holiday card illustration.

Scene:
a cozy Christmas scene with an old teddy bear sitting inside a keepsake box, slightly worn fur, soft stitching repairs, placed near a window with falling snow outside. The scene suggests the child has grown up, but the memories remain.

Mood:
Warm, nostalgic, gentle, emotional.

Style:
Premium holiday card photography, soft cinematic lighting,
realistic textures, shallow depth of field,
tasteful bokeh lights, high print-quality composition.

Constraints:
- Original artwork only
- No trademarks
- No watermarks
- No logos

Include ONLY this card text (verbatim):
"Merry Christmas — some memories never fade."

# 中文对应写法：
生成一张圣诞节日贺卡画面。

场景（Scene）：
温馨的圣诞一角：一只旧泰迪熊坐在纪念品木盒里，绒毛微微磨损，带着温柔的缝补针脚，木盒摆在窗边，窗外正飘着雪花。画面暗示当年的孩子已经长大，但温暖的记忆依然留存。

情绪（Mood）：
温暖、怀旧、轻柔、触动人心。

风格（Style）：
高档节日贺卡商业摄影质感，柔和的电影感布光，真实的毛绒与木盒肌理，浅景深，雅致的暖光背景光斑（Bokeh），符合高规格印刷品的考究构图。

约束条件（Constraints）：
- 仅限原创画面
- 不得包含任何受保护商标
- 不要水印
- 不要 Logo

画面中仅包含以下贺卡文字（严格逐字匹配）：
"Merry Christmas — some memories never fade."
```

### 3\. 复古潮玩周边与吸塑包装概念设计（Design collectible merchandise）

在探索潮玩手办、文创周边与零售包装方案时，重点运用 **商业产品摄影提示词线索** ：写清塑料与烤漆金属的材质反光、吸塑包装壳（Blister Packaging）的透明质感、棚拍布光以及锐利的包装印刷文字。

- **推荐生成参数** ： `size="1024x1536"`, `quality="medium"`

```
Create a collectible action figure of a vintage-style toy propeller airplane with rounded wings, a front-mounted spinning propeller, slightly worn paint edges, classic childhood proportions, designed as a nostalgic holiday collectible, in blister packaging.

Concept:
A nostalgic holiday collectible inspired by the simple toy airplanes
children used to play with during winter holidays.
Evokes warmth, imagination, and childhood wonder.

Style:
Premium toy photography, realistic plastic and painted metal textures,
studio lighting, shallow depth of field,
sharp label printing, high-end retail presentation.

Constraints:
- Original design only
- No trademarks
- No watermarks
- No logos

Include ONLY this packaging text (verbatim):
"Christmas Memories Edition"

# 中文对应写法：
生成一款装在透明吸塑包装盒（Blister Packaging）里的复古风螺旋桨玩具飞机收藏手办：圆润的机翼、前置旋转螺旋桨、边缘带有轻微做旧磨损的漆面、经典的童年玩具比例，整体定位为怀旧节日限定收藏品。

概念定位（Concept）：
灵感源自过去孩子们在冬日假期常玩的简单玩具小飞机，唤起温暖、想象力与童年惊喜感。

视觉风格（Style）：
高档潮玩商业摄影质感，逼真的塑料与涂装金属表面肌理，专业摄影棚布光，浅景深，锐利清晰的包装卡纸印刷，高端零售陈列质感。

约束条件（Constraints）：
- 仅限原创设计
- 不得包含任何商标
- 不要水印
- 不要 Logo

包装上仅包含以下文字（严格逐字匹配）：
"Christmas Memories Edition"
```

---

## 七、端到端代码实战与成片验收清单

下面给出完整的 Python 与 Ruby SDK 调用代码，演示如何一次性跑通 **“批量生成 4 版透明底烘焙坊 Logo”** 与 **“从实拍图中抠取透明底洗发水商品图”** 两大高频任务。

运行前请先安装官方 SDK（Python 运行 `pip install openai` ，Ruby 运行 `gem install openai` ），配置好 `OPENAI_API_KEY` 环境变量，并将待抠图的商品原图保存在 `input_images/shampoo.webp` 。

### 1\. Python 完整调用示例（保留 PNG Alpha 透明通道）

```
import base64
from pathlib import Path
from openai import OpenAI

client = OpenAI()

# 任务 1：批量生成 4 个版本的透明底品牌 Logo
logo_prompt = """
Create an original, non-infringing logo for a company called Field & Flour, a local bakery.
The logo should feel warm, simple, and timeless. Use clean, vector-like shapes, a strong silhouette, and balanced negative space.
Favor simplicity over detail so it reads clearly at small and large sizes. Flat design, minimal strokes, no gradients unless essential.
Fully transparent background. Deliver a single centered logo with generous padding, clean alpha edges, and no solid backdrop, scenery, checkerboard, or watermark.
"""

result = client.images.generate(
    model="gpt-image-2.5-sunburst",  # 也可切换为 gpt-image-2.5-flare 或 gpt-image-2
    prompt=logo_prompt,
    size="1024x1536",
    quality="medium",
    background="transparent",
    output_format="png",
    n=4,  # 一次生成 4 个变体方案
)

# 直接解码写入原始 PNG 字节流，完整保留 Alpha 透明通道
for index, item in enumerate(result.data, start=1):
    Path(f"logo-generation-{index}.png").write_bytes(
        base64.b64decode(item.b64_json)
    )

# 任务 2：从实拍参考图中提取透明底商品素材
cutout_prompt = """
Extract the product from the input image and isolate it on a fully transparent background.
Output: centered product, crisp silhouette, no halos/fringing.
Preserve product geometry and label legibility exactly.
Add only light polishing. Do not add a solid backdrop, checkerboard, scenery, or shadow.
Do not restyle the product; remove the background and preserve clean alpha transparency.
"""

edit_result = client.images.edit(
    model="gpt-image-2.5-sunburst",
    image=[
        Path("input_images/shampoo.webp"),
    ],
    prompt=cutout_prompt,
    size="1024x1536",
    quality="medium",
    background="transparent",
    output_format="png",
)

Path("extract-product.png").write_bytes(
    base64.b64decode(edit_result.data[0].b64_json)
)
```

### 2\. Ruby 完整调用示例

```
require "base64"
require "openai"
require "pathname"

client = OpenAI::Client.new

result = client.images.generate(
  model: "gpt-image-2.5-sunburst",
  prompt: "Create an original logo for Field & Flour, a local bakery. Use warm, simple shapes on a fully transparent background, with clean alpha edges and no shadow or checkerboard.",
  size: "1024x1536",
  quality: :medium,
  background: :transparent,
  output_format: :png,
  n: 4
)

Array(result.data).each_with_index do |item, index|
  File.binwrite(
    "logo-generation-#{index + 1}-gpt-image-2.5-sunburst.png",
    Base64.strict_decode64(item.b64_json || raise("No PNG returned"))
  )
end

edit_result = client.images.edit(
  model: "gpt-image-2.5-sunburst",
  image: OpenAI::FilePart.new(Pathname("input_images/shampoo.webp"), content_type: "image/webp"),
  prompt: "Extract the product onto a fully transparent background. Preserve its geometry and label, with clean edges and no shadow or restyling.",
  size: "1024x1536",
  quality: :medium,
  background: :transparent,
  output_format: :png
)

File.binwrite(
  "extract-product-gpt-image-2.5-sunburst.png",
  Base64.strict_decode64(Array(edit_result.data).fetch(0).b64_json || raise("No PNG returned"))
)
```

如果你想查看更多提示词模板与端到端 Notebook 案例，可以直接访问 OpenAI 官方提供的 [GPT Image 实战 Cookbook Notebook](https://cookbook.openai.com/examples/multimodal/image-gen-2-prompting-guide) 。

### 3\. 成片交付前的四项必查清单（Check the result）

在把生成的图片正式放进产品页面、课件或交付给客户之前，请养成对照以下 4 个问题逐一核验的习惯：

1. **文字与逻辑是否准确？** 要求渲染的文字拼写是否一字不差、清晰可读？信息图里的标签名称与箭头指向的因果关系是否正确？
2. **核心身份与几何外观是否守住？** 人物的五官神态、商品的瓶身几何结构、包装标签以及参考图里的关键细节是否完好保留？
3. **修改边界是否干净？** 修图操作是否严格只改了你要求修改的那一处，而没有顺手改乱背景、机位或光影？
4. **透明通道是真透明还是假格子？** 当需求要求透明背景时，解码后的文件是否真正包含干净的 Alpha 透明通道，而不是被模型画上了一层灰白相间的假棋盘格背景？

---

## 附：历代 GPT Image 模型参数对照与迁移备忘

如果你手头仍在维护基于 `GPT Image 2` 、 `GPT Image 1.5` 或 `GPT Image 1` 的存量项目，可以参考下表核对各代模型的参数差异与停服时间表：

| 特性 / 参数 | GPT Image 2.5 (`flare` / `sunburst`) | GPT Image 2 (`gpt-image-2`) | GPT Image 1.5 (`gpt-image-1.5`) | GPT Image 1 (`gpt-image-1`) |
| --- | --- | --- | --- | --- |
| **当前状态** | **主力推荐（最新一代）** | 正常维护（存量项目可用） | **已标记废弃** （计划于 2026-12-01 停服） | **已退役停服** （已于 2026-10-23 关停） |
| **`quality` 档位** | `auto`, `low`, `medium`, `high`, `xhigh`, `max` | `low`, `medium`, `high`, `auto` | `low`, `medium`, `high`, `auto` | `low`, `medium`, `high`, `auto` |
| **`size` 尺寸支持** | `auto` 或自定义分辨率（单边 ≤ 3840、16 的倍数、比例 ≤ 3:1） | `auto` 或符合约束的自定义分辨率 | 仅限 `1024x1024`, `1024x1536`, `1536x1024`, `auto` | 仅限 `1024x1024`, `1024x1536`, `1536x1024`, `auto` |
| **`input_fidelity`** | **无需传入** （默认始终高保真读取输入图） | **无需传入** （默认始终高保真读取输入图） | 支持 `low` 或 `high` （迁移至新模型时请移除该参数） | 支持 `low` 或 `high` （ `high` 消耗更多输入图像 Token，迁移时移除） |
| **`background`** | `auto`, `opaque`, `transparent` （需配 PNG/WebP） | 透明底支持处于 Preview 阶段（需显式设 `transparent` ） | 显式设 `transparent` 并使用 PNG/WebP | 显式设 `transparent` 并使用 PNG/WebP |
| **`output_compression`** | 仅适用于 `jpeg` / `webp` ，PNG 禁用 | 仅适用于 `jpeg` / `webp` ，PNG 禁用 | `0` – `100` ，仅适用于 `jpeg` / `webp` | `0` – `100` ，仅适用于 `jpeg` / `webp` |

从 `GPT Image 1` 或 `GPT Image 1.5` 往新模型迁移时，切记 **先删除旧代码里的 `input_fidelity` 参数** ，并结合前文的“平滑迁移六步法”在 `gpt-image-2.5-sunburst` 与 `gpt-image-2.5-flare` 上实测验证。

Oil Book · AI 时代最好的实战指南