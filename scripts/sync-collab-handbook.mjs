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
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertSafeHtml, cleanVitepressHtml, DEFAULT_VITEPRESS_DIR, loadMarkdownRenderer } from './render-ai-learning.mjs'

export const SCHEMA_VERSION = 2
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
    return { ...section, to: rule.to, heading: rule.title ? rule.title(section.title) : section.title }
  })
}

// 小节内部的标题往下降：小节标题本身是 h3（原理里的是 h4），里面原有的四级标题跟着降
const shift = (body, levels) => body.replace(/^(#{4,5})\s/gm, (_, h) => `${'#'.repeat(Math.min(h.length + levels, 6))} `)

/** 一张卡的四块 Markdown：先讲事，再讲理 */
export function composeTopic(caseEntry, principle) {
  const where = `${caseEntry.id} + ${principle.id}`
  const caseParts = place(caseEntry.sections, CASE_PLACEMENT, caseEntry.id)
  const principleParts = place(principle.sections, PRINCIPLE_PLACEMENT, principle.id)
  const block = (part, level) => [part.heading ? `${'#'.repeat(level)} ${part.heading}` : '', shift(part.body, level - 3)].filter(Boolean).join('\n\n')
  const pick = (parts, to, title) => parts.filter(p => p.to === to && (!title || p.title === title))

  const why = [
    ...pick(caseParts, 'why', '事实和理论对照').map(p => block(p, 3)),
    `### 背后的原理：${principle.name}\n\n**${principle.headline}**\n\n${principle.summary}`,
    ...pick(principleParts, 'why').map(p => block(p, 4)),
    ...pick(caseParts, 'why').filter(p => p.title !== '事实和理论对照').map(p => block(p, 3))
  ]
  const markdown = {
    story: pick(caseParts, 'story').map(p => block(p, 3)),
    why,
    say: [...pick(principleParts, 'say').map(p => block(p, 3)), ...pick(caseParts, 'say').map(p => block(p, 3))],
    practice: pick(caseParts, 'practice').map(p => block(p, 3))
  }
  for (const { id, title } of SECTIONS) {
    if (!markdown[id].length) fail(where, `「${title}」这一块没有内容`)
  }
  return markdown
}

// 正文不允许出现任何链接；VitePress 自带的标题锚点（#）去掉
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
    const base = {
      slug: c.id.toLowerCase(),
      caseId: c.id,
      title: c.paradigm,
      headline: c.headline,
      summary: c.summary,
      sayShort: c.sayShort,
      principle: principleInfo(topic.principleId),
      related: topic.relatedPrincipleIds.map(principleInfo),
      published
    }
    const markdown = composeTopic(c, parsed.get(topic.principleId))
    if (!published) return base
    const sections = SECTIONS.map(({ id, title }) => ({ id, title, html: renderBody(md, markdown[id].join('\n\n'), `${c.id}「${title}」`) }))
    return { ...base, sections }
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
