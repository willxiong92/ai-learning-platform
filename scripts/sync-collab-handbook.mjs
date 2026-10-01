// AI 协作手册：把本机母源「学习案例」的上半正文同步成网站副本 src/lib/collab-handbook/handbook.json。
// 正文只在母源改，网站不手改副本。母源改了以后跑 `npm run content:collab`，网站跟着更新；
// `npm run content:collab -- --check` 只比对、不写文件，母源和副本不一致时退出码为 1。
// 构建和 dev 都不自动跑：母源在本机桌面，发布环境读不到。
//
// 为什么这样做：
// - 只取「# 上半｜正文（可发布）」到「# 下半」之间的内容，下半内部档案一行都不读进来。
// - 网站是公开的：先按下面的脱敏规则替换，再扫一遍禁用词（人名、工具名、本机路径、链接、卡号），
//   任何一处命中都直接失败、不写文件。精确替换规则在母源里找不到时也失败，提醒人重新过一遍脱敏。
// - 只同步下面点名的文件。母源新增案例不会自动上站，要先在这里登记、过脱敏。
// - 网站上一张卡是「一个坑」的一整套内容：一个案例 + 它的主原理 + 案例自带的沟通范式（Will 2026-10-01 定）。
//   页面按「先讲事，再讲理」重排：事情经过 → 为什么会这样 → 下次怎么说 → 换个场景练一练。
//   母源每个小节放进哪一块由 CASE_PLACEMENT / PRINCIPLE_PLACEMENT 决定；母源新增了没登记的小节就失败，避免悄悄丢内容。
// - 排版参考课程页（Will 2026-10-01：结构化、评述短、多用左右结构）。脚本不输出整段 HTML，而是把母源里
//   本来就有的结构认出来，输出成一块块「部件」：对照表 → 左右对照行，误区表 → 以为 / 其实卡，
//   要点列表 → 编号清单，步骤表 → 横向步骤条，范式 → 简版和完整版左右并排。文字一字不改。
//   母源格式变了（表头改名、多出一张表）就失败，不猜。
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertSafeHtml, cleanVitepressHtml, DEFAULT_VITEPRESS_DIR, loadMarkdownRenderer } from './render-ai-learning.mjs'

export const SCHEMA_VERSION = 3
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DEFAULT_SOURCE_DIR = path.join(os.homedir(), 'Desktop/AI学习/E-工具与环境/Codex协作复盘/学习案例')
export const DEFAULT_OUTPUT = path.join(repoRoot, 'src/lib/collab-handbook/handbook.json')

// 要读的母源文件
export const ENTRIES = [
  { id: 'P-01', file: 'P-01-共同基础.md', kind: 'principle' },
  { id: 'P-02', file: 'P-02-反馈回路.md', kind: 'principle' },
  { id: 'P-03', file: 'P-03-原型先行.md', kind: 'principle' },
  { id: 'C-001', file: 'C-001-改旧东西先划线.md', kind: 'case' },
  { id: 'C-002', file: 'C-002-先看样再开工.md', kind: 'case' }
]

// 网站上的卡片，按这个顺序出现在栏目入口页。一张卡 = 一个案例 + 主原理（principleId）+ 案例自带的范式；
// relatedPrincipleIds 是这件事还碰到、但没有自己主案例的原理，在「为什么会这样」末尾简短提一句。
// 每条原理至少要在一张卡里出现（主原理或相关原理），否则失败。
export const TOPICS = [
  { caseId: 'C-002', principleId: 'P-03', relatedPrincipleIds: ['P-02'] },
  { caseId: 'C-001', principleId: 'P-01', relatedPrincipleIds: [] }
]

// 已开详情页的卡片（按案例编号）。其余卡片只在入口页露标题和一句话，正文不进副本。
// 小样阶段（2026-10-01）只开「先看样，再开工」；Will 看过小样后再决定其余。
export const PUBLISHED = new Set(['C-002'])

// 页面上的四块，顺序即页面顺序
export const SECTIONS = [
  { id: 'story', title: '事情经过' },
  { id: 'why', title: '为什么会这样' },
  { id: 'say', title: '下次怎么说' },
  { id: 'practice', title: '换个场景练一练' }
]

// 「事情经过」的左右排版：从母源故事里摘原句，排成「同一句话 → 两边结果」的对照。
// 每一句 text 都必须能在母源故事原文里原样找到，找不到就失败；网站自己只写短标签（label / k / tag）。
// 完整经过折叠在对照下面，原文一字不删。卡片要开放详情页，必须先在这里配好。
export const STORY_LAYOUT = {
  'C-002': {
    said: [{ who: 'me', label: '同一句话，发给两个网站', text: '我准备睡觉，需要一个长任务来跑完额度，并且推进网站界面升级。' }],
    left: {
      label: '团队学习站',
      tag: '基本满意',
      tone: 'good',
      items: [
        { k: 'AI 交的定位', text: '从「设计感强的课程站」换成「团队内部工作手册」，追求清楚、可信、读起来不累。' },
        { k: '我的反馈', text: '这一版基本满意' }
      ]
    },
    right: {
      label: '个人网站',
      tag: '三轮都没用上',
      tone: 'bad',
      items: [
        { k: '第一版后', text: '这版不如之前复刻的好，界面太简约没有任何设计感。' },
        { k: '第三轮后', text: '这次改版不满意。主要是主题风格和内容匹配度不高。' },
        { k: '结果', text: '前后九个多小时，三轮改版一轮都没用上。' }
      ]
    },
    takeaway: { label: '差别在哪', text: '差别不在 AI，在我：团队站是干什么用的，我很清楚；个人网站想给人什么感觉，我自己当时也不知道。' }
  },
  'C-001': {
    said: [
      { who: 'me', label: '我交代的', text: '按照审查过的最新版本，开始对网站进行对应的优化。' },
      { who: 'ai', label: 'AI 的回答', text: '我会沿用现有视觉风格。' }
    ],
    left: {
      label: 'AI 报告的',
      tag: '全部通过',
      tone: 'good',
      items: [
        { k: '检查', text: '138 项测试全过，电脑和手机都看过，另一个 AI 做的独立审查也通过了。' },
        { k: '然后', text: '直接上线' }
      ]
    },
    right: {
      label: '我打开看到的',
      tag: '界面变了',
      tone: 'bad',
      items: [
        { k: '页面', text: '「课程」和「实践」两个页面跟其他页面不像一家的：多了独立的大标题，原来的卡片变成了竖排列表。' },
        { k: '返工', text: '前后 33 分钟，我反馈了 2 轮，线上多更新了 2 次。' }
      ]
    }
  }
}

// 母源小节标题 → 放进哪一块；skip 表示网站不用（合成一页后重复）
const CASE_PLACEMENT = [
  { match: t => t.startsWith('案例：'), to: 'story', title: t => t.replace(/^案例：/, '') },
  { match: t => t === '事实和理论对照', to: 'why' },
  { match: t => t === '三个关键点', to: 'why' },
  { match: t => t.startsWith('沟通范式：'), to: 'say' },
  { match: t => t === '换个场景想一想', to: 'practice', title: () => null }
]
const PRINCIPLE_PLACEMENT = [
  { match: t => t.endsWith('误区'), to: 'why' },
  { match: t => t.startsWith('为什么'), to: 'why' },
  { match: t => t.startsWith('怎么做'), to: 'say' },
  { match: t => t === '记忆给什么', to: 'say' },
  { match: t => t === '这条原理下的案例和范式', to: 'skip' }
]

// 原理的状态。母源里原理都是「假设」，网站上统一标「试行」（Will 2026-10-01 指定）。
// 有原理被母源改成「已立住」时，在这里改，不从下半档案读。
export const PRINCIPLE_STATUS = { 'P-01': '试行', 'P-02': '试行', 'P-03': '试行' }

// 精确替换：每条都必须在对应文件的上半正文里找到，找不到就失败
export const EXACT_RULES = [
  { id: 'P-01', from: '正文还在自媒体线，待并入', to: '正文待补', reason: '内部项目线名称' }
]

// 母源里互相引用写的是文件名（如 `P-03-原型先行.md`），网站上换成站内名称「P-03 原型先行」，不带链接
const FILE_REF = /\s*`?([PC]-\d{2,3})-([^`\s/]+?)\.md`?/g

// 禁用词：脱敏之后还出现就失败。拉丁字母不分大小写。
export const FORBIDDEN = [
  { pattern: /\/Users\/|\/home\/|~\/|file:\/\/|Desktop|iCloud/i, reason: '本机路径' },
  { pattern: /\.md\b/i, reason: '母源文件名' },
  { pattern: /https?:\/\/|www\.|\]\(/i, reason: '链接' },
  { pattern: /[\w.+-]+@[\w-]+\.\w+|\b1\d{10}\b/, reason: '邮箱或手机号' },
  { pattern: /\bwill\b|威尔/i, reason: '人名' },
  { pattern: /claude|codex|grok|gpt|openai|anthropic|herdr|obsidian|飞书|钉钉|accio|vibehub|sites/i, reason: '工具或平台名' },
  { pattern: /okki|小满|阿里|alibaba/i, reason: '公司或产品名' },
  { pattern: /总控|个人机|公司机|业务主线|自媒体线|写入方|内部档案|下半/, reason: '内部称呼或下半档案' },
  { pattern: /\b(?:[AB]-\d{4}|CC-[a-z])\b/, reason: '内部卡号' },
  { pattern: /\b[0-9a-f]{8}\b/, reason: '会话或提交编号' }
]

const fail = (where, message) => {
  throw new Error(`${where}：${message}`)
}

export const sha256 = text => createHash('sha256').update(text).digest('hex')

/** 从母源全文里切出上半正文；标题行给出编号和名字 */
export function splitSource(markdown, entry) {
  const where = entry.file
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const head = lines.find(l => /^#\s/.test(l))
  const m = head?.match(/^#\s+(?:原理|学习案例)\s+([PC]-\d{2,3})｜(.+)$/)
  if (!m) fail(where, '第一行标题不是「# 原理 P-xx｜名字」或「# 学习案例 C-xxx｜名字」')
  if (m[1] !== entry.id) fail(where, `标题编号 ${m[1]} 和登记的 ${entry.id} 对不上`)
  const start = lines.findIndex(l => /^#\s+上半｜正文/.test(l))
  const end = lines.findIndex(l => /^#\s+下半/.test(l))
  if (start < 0) fail(where, '找不到「# 上半｜正文」')
  if (end < 0 || end < start) fail(where, '找不到上半之后的「# 下半」，不知道正文在哪里结束')
  const upper = lines.slice(start + 1, end).join('\n').replace(/\n-{3,}\s*$/, '').trim()
  return { name: m[2].trim(), upper }
}

/** 脱敏：文件名换成站内名称、精确替换、再扫禁用词。返回替换后的正文和改动记录 */
export function redact(text, entry, rules = EXACT_RULES) {
  const where = `${entry.id} 上半正文`
  const changes = []
  let out = text.replace(FILE_REF, (match, id, name) => {
    changes.push({ from: match.trim(), to: `「${id} ${name}」`, reason: '母源文件名，改成站内名称（不带链接）' })
    return `「${id} ${name}」`
  })
  for (const rule of rules.filter(r => r.id === entry.id)) {
    if (!out.includes(rule.from)) fail(where, `脱敏规则找不到原文「${rule.from}」，母源可能改过，请重新过一遍脱敏`)
    out = out.split(rule.from).join(rule.to)
    changes.push({ from: rule.from, to: rule.to, reason: rule.reason })
  }
  assertClean(out, where)
  return { text: out, changes }
}

export function assertClean(text, where) {
  for (const { pattern, reason } of FORBIDDEN) {
    const hit = text.match(pattern)
    if (hit) fail(where, `脱敏后仍有${reason}：「${hit[0]}」`)
  }
}

/** 把上半正文拆成：大标题、一句话、（案例）所属原理、范式名和简版、各小节 */
export function parseUpper(text, entry) {
  const where = `${entry.id} 上半正文`
  const lines = text.split('\n')
  const titleAt = lines.findIndex(l => /^##\s/.test(l))
  if (titleAt < 0) fail(where, '缺少二级标题（页面大标题）')
  const headline = lines[titleAt].replace(/^##\s+/, '').trim()
  let rest = lines.slice(titleAt + 1).join('\n')

  const summaryMatch = rest.match(/^\*\*一句话：(.+?)\*\*\s*$/m)
  if (!summaryMatch) fail(where, '缺少「**一句话：……**」')
  const summary = summaryMatch[1].trim()
  rest = rest.replace(summaryMatch[0], '')

  let principleIds = []
  if (entry.kind === 'case') {
    const noteMatch = rest.match(/^\*\*这是哪条原理的实例：\*\*\s*(.+)$/m)
    if (!noteMatch) fail(where, '缺少「**这是哪条原理的实例：**」')
    principleIds = [...new Set([...noteMatch[1].matchAll(/「(P-\d{2})\s/g)].map(x => x[1]))]
    if (!principleIds.length) fail(where, '「这是哪条原理的实例」里没有指到任何原理')
    // 合成一页后，主原理就在同一页里讲，这句指路的话不再需要
    rest = rest.replace(noteMatch[0], '')
  }

  const parts = rest.split(/^###\s+/m)
  if (parts[0].trim()) fail(where, '第一个三级标题之前还有正文，网站不知道放哪里')
  const sections = parts.slice(1).map(part => {
    const [title, ...body] = part.split('\n')
    return { title: title.trim(), body: body.join('\n').trim() }
  })

  let paradigm = null
  let sayShort = null
  if (entry.kind === 'case') {
    const say = sections.find(s => s.title.startsWith('沟通范式：'))
    if (!say) fail(where, '缺少「### 沟通范式：名字」')
    paradigm = say.title.replace(/^沟通范式：/, '').trim()
    const short = say.body.match(/^\*\*简版\*\*.*\n+((?:>.*\n?)+)/m)
    if (!short) fail(where, '沟通范式里缺少「**简版**」后面的引用句')
    sayShort = short[1].split('\n').map(l => l.replace(/^>\s?/, '')).join('').trim()
  }
  return { headline, summary, principleIds, paradigm, sayShort, sections }
}

function place(sections, rules, where) {
  return sections.map(section => {
    const rule = rules.find(r => r.match(section.title))
    if (!rule) fail(where, `小节「${section.title}」没有登记放在页面哪一块（CASE_PLACEMENT / PRINCIPLE_PLACEMENT）`)
    return { ...section, to: rule.to }
  })
}

const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())

/** 把一个小节的 Markdown 拆成块：段落、引用、有序 / 无序列表、表格、代码框 */
export function parseBlocks(body, where) {
  const lines = body.split('\n')
  const blocks = []
  let i = 0
  const take = re => {
    const out = []
    while (i < lines.length && re.test(lines[i])) out.push(lines[i++])
    return out
  }
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
    } else if (line.startsWith('```')) {
      const start = ++i
      while (i < lines.length && !lines[i].startsWith('```')) i++
      if (i >= lines.length) fail(where, '代码框没有结束')
      blocks.push({ kind: 'code', text: lines.slice(start, i).join('\n') })
      i++
    } else if (line.startsWith('|')) {
      const rows = take(/^\|/).map(cells)
      if (rows.length < 3 || !rows[1].every(c => /^:?-+:?$/.test(c))) fail(where, '表格格式不对')
      blocks.push({ kind: 'table', header: rows[0], rows: rows.slice(2) })
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push({ kind: 'ol', items: take(/^\d+\.\s/).map(l => l.replace(/^\d+\.\s+/, '')) })
    } else if (/^-\s/.test(line)) {
      blocks.push({ kind: 'ul', items: take(/^-\s/).map(l => l.replace(/^-\s+/, '')) })
    } else if (line.startsWith('>')) {
      blocks.push({ kind: 'quote', text: take(/^>/).map(l => l.replace(/^>\s?/, '')).join('') })
    } else if (line.startsWith('#')) {
      fail(where, `小节里还有下一级标题「${line}」，网站不知道怎么排`)
    } else {
      blocks.push({ kind: 'p', text: take(/^(?!\s*$|```|\||\d+\.\s|-\s|>|#)/).join('') })
    }
  }
  return blocks
}

// 「**粗体开头。** 后面的解释」拆成标题和正文
const boldLead = text => {
  const m = text.match(/^\*\*(.+?)\*\*[:：]?\s*(.*)$/)
  return m ? { title: m[1].replace(/[:：]$/, ''), rest: m[2] } : { title: null, rest: text }
}

function tableRows(block, header, where) {
  if (block.header.join('|') !== header.join('|')) {
    fail(where, `表头变了：网站按「${header.join(' | ')}」排版，母源现在是「${block.header.join(' | ')}」`)
  }
  return block.rows
}

/** 按页面四块输出部件。所有文字都来自母源；网站自己只加短标签 */
export function composeTopic({ caseEntry, principle, principleInfo, md }) {
  const where = `${caseEntry.id} + ${principle.id}`
  const inline = text => {
    const html = md.renderInline(text).trim()
    assertSafeHtml(html, where)
    if (/<a\b/.test(html)) fail(where, '正文里出现链接')
    assertClean(html.replace(/<[^>]+>/g, ''), where)
    return html
  }
  const label = text => {
    assertClean(text, `${where} 网站标签`)
    return text
  }
  const caseParts = place(caseEntry.sections, CASE_PLACEMENT, caseEntry.id)
  const principleParts = place(principle.sections, PRINCIPLE_PLACEMENT, principle.id)
  const part = (parts, test, what) => {
    const found = parts.find(test)
    if (!found) fail(where, `缺少小节「${what}」`)
    return found
  }
  // 段落里的评述：在结构化部件前面的当引子，后面的当小注
  const notes = (blocks, mainIndex) =>
    blocks.flatMap((b, i) => {
      if (i === mainIndex) return []
      if (b.kind !== 'p') fail(where, `有一块${b.kind}没有排进页面`)
      return [{ type: i < mainIndex ? 'lead' : 'note', html: inline(b.text) }]
    })
  const single = (blocks, kind, what) => {
    const idx = blocks.map((b, i) => (b.kind === kind ? i : -1)).filter(i => i >= 0)
    if (idx.length !== 1) fail(where, `「${what}」里应该正好有一个${kind}，现在有 ${idx.length} 个`)
    return idx[0]
  }

  // ---------- 事情经过 ----------
  const storyPart = part(caseParts, p => p.to === 'story', '案例：…')
  const layout = STORY_LAYOUT[caseEntry.id]
  if (!layout) fail(where, '要在 STORY_LAYOUT 里配好「事情经过」的左右排版')
  const storyPlain = storyPart.body.replace(/\*\*/g, '').replace(/^>\s?/gm, '')
  const quoteOf = text => {
    if (!storyPlain.includes(text)) fail(where, `STORY_LAYOUT 摘的这句在母源故事里找不到：「${text}」`)
    return inline(text)
  }
  const side = s => ({
    label: label(s.label),
    tag: label(s.tag),
    tone: s.tone,
    items: s.items.map(item => ({ k: label(item.k), html: quoteOf(item.text) }))
  })
  const storyBlocks = parseBlocks(storyPart.body, `${caseEntry.id} 事情经过`)
  const analogyAt = storyBlocks.findIndex(b => b.kind === 'p' && b.text.startsWith('**这像什么：**'))
  if (analogyAt < 0) fail(where, '故事里缺少「**这像什么：**」')
  const fullStory = storyBlocks.filter((_, i) => i !== analogyAt)
  const story = [
    { type: 'chat', items: layout.said.map(s => ({ who: s.who, label: label(s.label), html: quoteOf(s.text) })) },
    { type: 'versus', left: side(layout.left), right: side(layout.right) },
    ...(layout.takeaway ? [{ type: 'takeaway', label: label(layout.takeaway.label), html: quoteOf(layout.takeaway.text) }] : []),
    { type: 'analogy', html: inline(boldLead(storyBlocks[analogyAt].text).rest) },
    {
      type: 'details',
      summary: `看完整经过：${storyPart.title.replace(/^案例：/, '')}`,
      html: renderBody(md, fullStory.map(blockMarkdown).join('\n\n'), `${caseEntry.id} 完整经过`)
    }
  ]

  // ---------- 为什么会这样 ----------
  const why = []
  {
    const blocks = parseBlocks(part(caseParts, p => p.title === '事实和理论对照', '事实和理论对照').body, where)
    const at = single(blocks, 'table', '事实和理论对照')
    const rows = tableRows(blocks[at], ['发生了什么', '当时看起来', '实际缺了什么', '这叫什么'], where)
    why.push({
      type: 'contrast',
      title: '事实和理论对照',
      rows: rows.map(([head, before, after, term]) => ({ head: inline(head), before: inline(before), after: inline(after), term: inline(term) }))
    })
    why.push(...notes(blocks, at).map(n => ({ ...n, type: 'summary', label: '连起来看' })))
  }
  why.push({ type: 'principle', ...principleInfo })
  for (const p of principleParts.filter(p => p.to === 'why')) {
    const blocks = parseBlocks(p.body, `${principle.id} ${p.title}`)
    if (p.title.endsWith('误区')) {
      const at = single(blocks, 'table', p.title)
      const rows = tableRows(blocks[at], ['误区', '实际情况', '学名'], where)
      why.push({ type: 'myths', title: p.title, items: rows.map(([myth, fact, term]) => ({ myth: inline(myth), fact: inline(fact), term: inline(term) })) })
      why.push(...notes(blocks, at))
    } else {
      const at = single(blocks, 'ul', p.title)
      why.push({
        type: 'cards',
        title: p.title,
        items: blocks[at].items.map(item => {
          const { title, rest } = boldLead(item)
          if (!title) fail(where, `「${p.title}」的每一条要用粗体开头`)
          return { title: inline(title), html: inline(rest) }
        })
      })
      why.push(...notes(blocks, at))
    }
  }
  {
    const blocks = parseBlocks(part(caseParts, p => p.title === '三个关键点', '三个关键点').body, where)
    const at = single(blocks, 'ol', '三个关键点')
    why.push({
      type: 'checklist',
      title: '三个关键点',
      items: blocks[at].items.map(item => {
        const { title, rest } = boldLead(item)
        return { title: title ? inline(title) : null, html: inline(rest) }
      })
    })
    why.push(...notes(blocks, at))
  }

  // ---------- 下次怎么说 ----------
  const say = []
  for (const p of principleParts.filter(p => p.to === 'say')) {
    const blocks = parseBlocks(p.body, `${principle.id} ${p.title}`)
    if (p.title.startsWith('怎么做')) {
      const at = single(blocks, 'table', p.title)
      const rows = tableRows(blocks[at], ['步', '做什么', '可以直接说的话'], where)
      const lead = notes(blocks, at)
      say.push({
        type: 'steps',
        title: p.title.replace(/^怎么做[:：]\s*/, ''),
        lead: lead.filter(n => n.type === 'lead').map(n => n.html),
        items: rows.map(([step, what, words]) => ({ step: inline(step), what: inline(what), say: inline(words) })),
        notes: lead.filter(n => n.type === 'note').map(n => n.html)
      })
    } else {
      const at = single(blocks, 'ol', p.title)
      const lead = notes(blocks, at)
      say.push({
        type: 'checklist',
        title: p.title,
        lead: lead.filter(n => n.type === 'lead').map(n => n.html),
        items: blocks[at].items.map(item => {
          const { title, rest } = boldLead(item)
          return { title: title ? inline(title) : null, html: inline(rest) }
        }),
        notes: lead.filter(n => n.type === 'note').map(n => n.html)
      })
    }
  }
  say.push(paradigmBlock(part(caseParts, p => p.to === 'say', '沟通范式'), caseEntry, inline, where))

  // ---------- 换个场景练一练 ----------
  const practiceBlocks = parseBlocks(part(caseParts, p => p.to === 'practice', '换个场景想一想').body, where)
  const answerAt = practiceBlocks.findIndex(b => b.kind === 'p' && /^（参考答案：.+）$/.test(b.text))
  if (answerAt < 0) fail(where, '练一练里缺少「（参考答案：……）」')
  const questions = practiceBlocks.filter((_, i) => i !== answerAt)
  if (questions.length !== 1 || questions[0].kind !== 'p') fail(where, '练一练应该是一段题目加一段参考答案')
  const practice = [{
    type: 'quiz',
    question: inline(questions[0].text),
    answer: inline(practiceBlocks[answerAt].text.replace(/^（参考答案：/, '').replace(/）$/, ''))
  }]

  return { story, why, say, practice }
}

// 块还原成 Markdown（只给折叠的完整经过用）
function blockMarkdown(b) {
  if (b.kind === 'p') return b.text
  if (b.kind === 'quote') return `> ${b.text}`
  if (b.kind === 'ul') return b.items.map(t => `- ${t}`).join('\n')
  if (b.kind === 'ol') return b.items.map((t, i) => `${i + 1}. ${t}`).join('\n')
  fail('事情经过', `故事里不应该有${b.kind}`)
}

function paradigmBlock(p, caseEntry, inline, where) {
  const blocks = parseBlocks(p.body, `${caseEntry.id} ${p.title}`)
  const used = new Set()
  const find = (prefix, what) => {
    const i = blocks.findIndex(b => b.kind === 'p' && b.text.startsWith(prefix))
    if (i < 0) fail(where, `沟通范式里缺少「${what}」`)
    used.add(i)
    return i
  }
  const next = (i, kind, what) => {
    if (blocks[i + 1]?.kind !== kind) fail(where, `「${what}」后面应该紧跟一个${kind}`)
    used.add(i + 1)
    return blocks[i + 1]
  }
  const noteOf = text => (text.match(/（(.+?)）/) || [])[1] || ''
  const when = blocks[find('**什么时候用：**', '什么时候用')].text.replace(/^\*\*什么时候用：\*\*\s*/, '')
  const shortAt = find('**简版**', '简版')
  const short = next(shortAt, 'quote', '简版')
  if (short.text !== caseEntry.sayShort) fail(where, '简版和入口页卡片上的那句话对不上')
  const fullAt = find('**完整版**', '完整版')
  const full = next(fullAt, 'code', '完整版')
  assertClean(full.text, `${caseEntry.id} 完整版模板`)
  const diffAt = find('**两个版本差在哪：**', '两个版本差在哪')
  const diff = next(diffAt, 'ul', '两个版本差在哪')
  const rest = blocks.filter((b, i) => !used.has(i))
  if (rest.some(b => b.kind !== 'p')) fail(where, '沟通范式里有没排进页面的表格或列表')
  return {
    type: 'paradigm',
    title: p.title.replace(/^沟通范式[:：]\s*/, ''),
    when: inline(when),
    short: { note: inline(noteOf(blocks[shortAt].text)), html: inline(short.text), text: short.text },
    full: { note: inline(noteOf(blocks[fullAt].text)), text: full.text },
    diff: diff.items.map(inline),
    notes: rest.map(b => inline(b.text))
  }
}

// 折叠的完整经过：整段渲染。不允许任何链接；VitePress 自带的标题锚点（#）去掉
function renderBody(md, markdown, where) {
  let html = cleanVitepressHtml(md.render(markdown, { relativePath: 'collab-handbook.md', cleanUrls: true }))
  html = html.replace(/\s*<a class="header-anchor"[^>]*>[\s\S]*?<\/a>/g, '')
  assertSafeHtml(html, where)
  if (/<a\b/.test(html)) fail(where, '正文里出现链接')
  assertClean(html.replace(/<[^>]+>/g, ''), where)
  return html
}

/** 读取 + 脱敏 + 合成 + 渲染，不写任何文件 */
export function buildHandbook({ sources, md, syncedAt }) {
  const parsed = new Map()
  const redactions = []
  const sourceHashes = {}
  for (const entry of ENTRIES) {
    const raw = sources[entry.id]
    if (typeof raw !== 'string') fail(entry.file, '母源文件没读到')
    const { name, upper } = splitSource(raw, entry)
    const { text, changes } = redact(upper, entry)
    redactions.push(...changes.map(c => ({ id: entry.id, ...c })))
    sourceHashes[entry.id] = sha256(upper)
    parsed.set(entry.id, { ...entry, name, ...parseUpper(text, entry) })
  }

  const cases = [...parsed.values()].filter(e => e.kind === 'case')
  const principleInfo = id => {
    const p = parsed.get(id)
    if (!p || p.kind !== 'principle') fail('TOPICS', `${id} 不是登记过的原理`)
    const status = PRINCIPLE_STATUS[id]
    if (!status) fail(id, '没有在 PRINCIPLE_STATUS 里登记状态')
    // 支撑案例数：母源里有几个案例写了「这是哪条原理的实例」指到它
    const caseCount = cases.filter(c => c.principleIds.includes(id)).length
    return { id, name: p.name, headline: p.headline, summary: p.summary, status, caseCount }
  }

  const covered = new Set()
  const topics = TOPICS.map(topic => {
    const c = parsed.get(topic.caseId)
    if (!c || c.kind !== 'case') fail('TOPICS', `${topic.caseId} 不是登记过的案例`)
    for (const id of [topic.principleId, ...topic.relatedPrincipleIds]) {
      if (!c.principleIds.includes(id)) fail(c.id, `母源没写它是 ${id} 的实例，不能放进同一张卡`)
      covered.add(id)
    }
    const published = PUBLISHED.has(c.id)
    const principle = principleInfo(topic.principleId)
    const base = {
      slug: c.id.toLowerCase(),
      caseId: c.id,
      title: c.paradigm,
      headline: c.headline,
      summary: c.summary,
      sayShort: c.sayShort,
      principle,
      related: topic.relatedPrincipleIds.map(principleInfo),
      published
    }
    // 没开放的卡也排一遍版：母源格式不对时现在就失败，开放时只需改 PUBLISHED 一行
    const blocks = composeTopic({ caseEntry: c, principle: parsed.get(topic.principleId), principleInfo: principle, md })
    if (!published) return base
    return { ...base, sections: SECTIONS.map(({ id, title }) => ({ id, title, blocks: blocks[id] })) }
  })
  for (const entry of ENTRIES.filter(e => e.kind === 'principle')) {
    if (!covered.has(entry.id)) fail('TOPICS', `原理 ${entry.id} 没有出现在任何一张卡里`)
  }

  // 脱敏前后的对照只打印给维护的人看，不写进副本：原文里有母源文件名
  return { handbook: { schemaVersion: SCHEMA_VERSION, syncedAt, sourceHashes, topics }, redactions }
}

export function serialize(handbook) {
  return `${JSON.stringify(handbook, null, 2)}\n`
}

async function readSources(sourceDir) {
  const sources = {}
  for (const entry of ENTRIES) sources[entry.id] = await readFile(path.join(sourceDir, entry.file), 'utf8')
  return sources
}

async function writeAtomic(outputPath, text) {
  const dir = path.dirname(outputPath)
  await mkdir(dir, { recursive: true })
  const tmpPath = path.join(dir, `.${path.basename(outputPath)}.${process.pid}.tmp`)
  try {
    await writeFile(tmpPath, text, 'utf8')
    await rename(tmpPath, outputPath)
  } catch (error) {
    await rm(tmpPath, { force: true })
    throw error
  }
}

/** --check：只比较母源上半正文的指纹，不渲染、不写文件 */
async function check(sourceDir, outputPath) {
  const sources = await readSources(sourceDir)
  const current = JSON.parse(await readFile(outputPath, 'utf8'))
  const stale = ENTRIES.filter(entry => {
    const { upper } = splitSource(sources[entry.id], entry)
    return current.sourceHashes?.[entry.id] !== sha256(upper)
  }).map(e => e.id)
  if (stale.length) {
    console.error(`母源已改、网站副本未更新：${stale.join('、')}。运行 npm run content:collab`)
    process.exitCode = 1
  } else {
    console.log(`网站副本和母源一致（同步于 ${current.syncedAt}）`)
  }
}

async function main() {
  const sourceDir = process.env.COLLAB_HANDBOOK_SOURCE_DIR || DEFAULT_SOURCE_DIR
  const vitepressDir = process.env.AI_LEARNING_VITEPRESS_DIR || DEFAULT_VITEPRESS_DIR
  if (process.argv.includes('--check')) return check(sourceDir, DEFAULT_OUTPUT)

  const sources = await readSources(sourceDir)
  const { md, dispose } = await loadMarkdownRenderer(vitepressDir)
  try {
    const syncedAt = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })
    const { handbook, redactions } = buildHandbook({ sources, md, syncedAt })
    await writeAtomic(DEFAULT_OUTPUT, serialize(handbook))
    console.log(`已生成 ${path.relative(repoRoot, DEFAULT_OUTPUT)}：${handbook.topics.length} 张卡（已开放 ${[...PUBLISHED].join('、')}）`)
    for (const c of redactions) console.log(`  脱敏 ${c.id}：${c.from} → ${c.to}（${c.reason}）`)
  } finally {
    dispose()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
