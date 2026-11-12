// AI 学习站正文渲染：把 generated.json 里的教材 Markdown 编译成网页用的 HTML，
// 写到 src/lib/ai-learning/rendered.json，给课程页 /courses/ai-<模块>/<课> 在服务端直接读取（旧 /learning/<课> 会跳转过去）。
// Markdown 用 AI学习站 仓库已安装的 VitePress 渲染器（createMarkdownRenderer），不自己写解析器；
// 这一步在 Next 之外运行，浏览器端不会打包 VitePress / Vue。
// 教材里的组件标签（<LessonIntro> 等）在这里展开成普通 HTML，文字来自 activities 与术语表。
// 只放行这几章实际用到的结构标签，这不是通用的 HTML 净化器：遇到没见过的写法直接失败。
// 全部校验通过才写文件（临时文件 + 改名），失败时保留上一次的输出。
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const RENDER_SCHEMA_VERSION = 1
export const SOURCE_SCHEMA_VERSION = 1
export const DEFAULT_VITEPRESS_DIR = '/Users/will/code/AI学习平台/教材引擎/node_modules/vitepress'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DEFAULT_INPUT = path.join(repoRoot, 'src/lib/ai-learning/generated.json')
export const DEFAULT_OUTPUT = path.join(repoRoot, 'src/lib/ai-learning/rendered.json')
// 术语详情页的长篇讲解单独成文件：术语卡在浏览器端也会用到，不能跟着整份课程正文一起打包
export const DEFAULT_ARTICLES_OUTPUT = path.join(repoRoot, 'src/lib/ai-learning/term-articles.json')

export const KNOWN_COMPONENTS = [
  'LessonIntro', 'TermCards', 'Cite', 'ContrastDemo', 'GuidedPractice',
  'ReadMark', 'SourceList', 'NextStep'
]
const COMPONENT_ATTRS = { Cite: ['lesson', 'ids'] }

// 有正文的章节状态。reading_ready = 正文可读、练习待编：不能出现要用练习数据的组件或评估字段
const READABLE_STATUSES = ['available', 'reading_ready']
const ASSESSMENT_COMPONENTS = new Set(['ContrastDemo', 'GuidedPractice', 'ReadMark'])
const ASSESSMENT_KEYS = ['quiz', 'practice', 'demo']

// 教材正文里允许手写的 HTML：只有这四章图示实际用到的结构标签和属性
const SOURCE_TAGS = new Set(['figure', 'figcaption', 'ol', 'ul', 'li', 'b', 'span', 'small', 'div', 'p'])
const SOURCE_ATTRS = new Set(['class', 'id', 'aria-labelledby'])

// 最终 HTML（VitePress 输出 + 组件展开）允许出现的标签和属性
const OUTPUT_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'b', 'strong', 'em', 'code', 'pre',
  'span', 'div', 'small', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption',
  'details', 'summary', 'blockquote', 'section', 'dl', 'dt', 'dd', 'br', 'hr', 'i', 'button'
])
const OUTPUT_ATTRS = new Set([
  'class', 'id', 'href', 'target', 'rel', 'tabindex', 'aria-label', 'aria-labelledby', 'aria-hidden', 'style',
  'type', 'data-term-id'
])

// 正文里可点开的术语：教材写 [文字](term:词id)，渲染成和 Web Coding 课程一样的 course-term-ref 按钮，
// 课程页点开后在侧栏显示术语图鉴卡片。词id 用教材术语表的 id，这里换成网站卡片 id。
const TERM_LINK = /<a href="term:([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g

/** 教材术语 id → 网站术语卡 id（site_term，或新建卡片时就是自己的 id）；没上图鉴的词返回 null。 */
export function siteTermId(glossary, id) {
  const term = glossary.find(t => t.id === id)
  if (!term) return null
  return term.siteTerm ?? (term.siteCat ? term.id : null)
}

export function renderTermLinks(html, glossary, where) {
  return html.replace(TERM_LINK, (_, id, label) => {
    const siteId = siteTermId(glossary, id)
    if (!siteId) fail(where, `可点开的术语 term:${id} 不在术语表里，或没有上术语图鉴（缺 site_term / site_cat）`)
    return `<button class="course-term-ref" type="button" data-term-id="${siteId}">${label}<span aria-hidden="true">↗</span></button>`
  })
}

// 章节版式模板（照 /courses 里 Web Coding 课程的排版）：每个带 {#id} 的二级标题连同下面的内容
// 包成一个 section；本章总结（#summary）用浅底框。读完标记、来源和下一步放在总结框之后。
const SUMMARY_SECTION_ID = 'summary'
const AFTER_SUMMARY_COMPONENTS = new Set(['ReadMark', 'SourceList', 'NextStep'])
const SECTION_HEADING = /^##\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/

// 通用图示：教材里用 ::: figure <种类> 标题 | 副标题 …… ::: 书写，不用手写 HTML。
// 五种固定写法见课程素材包“章节版式模板”一节；这里只认这五种，写错直接失败。
export const FIGURE_KINDS = ['flow', 'compare', 'before-after', 'chat', 'checklist']

// 本机路径或母源文件名漏进页面，说明注释或内部说明没去干净
const LOCAL_PATH_PATTERN = /\/Users\/|\/home\/|file:\/\/|lesson\.md|activities\.yaml|glossary\.yaml|course\.yaml/

const TAG_PATTERN = /<(\/?)([A-Za-z][A-Za-z0-9-]*)([^<>]*)>/g
const ATTR_PATTERN = /\s+([A-Za-z][\w:-]*)="([^"]*)"/g

export function resolveRenderOptions(env = process.env) {
  const value = env.AI_LEARNING_VITEPRESS_DIR
  if (value && !path.isAbsolute(value)) throw new Error(`AI_LEARNING_VITEPRESS_DIR 必须是绝对路径：${value}`)
  return { vitepressDir: value || DEFAULT_VITEPRESS_DIR, inputPath: DEFAULT_INPUT, outputPath: DEFAULT_OUTPUT, articlesPath: DEFAULT_ARTICLES_OUTPUT }
}

// 复用旧站已安装的 VitePress；这里不安装任何包，找不到就直接报错
export async function loadMarkdownRenderer(vitepressDir) {
  const entry = path.join(vitepressDir, 'dist/node/index.js')
  const vitepress = await import(pathToFileURL(entry).href)
  if (typeof vitepress.createMarkdownRenderer !== 'function') {
    throw new Error(`VitePress 缺少 createMarkdownRenderer：${entry}`)
  }
  const md = await vitepress.createMarkdownRenderer(repoRoot, {}, '/')
  const dispose = () => {
    if (typeof vitepress.disposeMdItInstance === 'function') vitepress.disposeMdItInstance()
  }
  return { md, dispose }
}

const fail = (where, message) => {
  throw new Error(`${where}：${message}`)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/\s+$/, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseAttrs(raw, where) {
  const body = raw.replace(/\/\s*$/, '')
  if (body.replace(ATTR_PATTERN, '').trim() !== '') fail(where, `属性写法无法识别 ${raw.trim()}`)
  return [...body.matchAll(ATTR_PATTERN)].map(m => ({ name: m[1], value: m[2] }))
}

function checkSourceLine(line, where) {
  const withoutCode = line.replace(/`[^`]*`/g, '')
  for (const [, , name, rawAttrs] of withoutCode.matchAll(TAG_PATTERN)) {
    if (!SOURCE_TAGS.has(name)) fail(where, `正文使用了不允许的标签 <${name}>`)
    for (const attr of parseAttrs(rawAttrs, where)) {
      if (/^on/i.test(attr.name)) fail(where, `正文使用了事件属性 ${attr.name}`)
      if (!SOURCE_ATTRS.has(attr.name)) fail(where, `<${name}> 使用了不允许的属性 ${attr.name}`)
    }
  }
  if (/<[/!?A-Za-z]/.test(withoutCode.replace(TAG_PATTERN, ''))) fail(where, `标签写法不完整：${line.trim().slice(0, 40)}`)
}

function parseComponent(name, rawAttrs, lessonId, where) {
  if (!KNOWN_COMPONENTS.includes(name)) fail(where, `正文使用了未知组件 <${name}>`)
  const allowed = COMPONENT_ATTRS[name] ?? ['lesson']
  const attrs = {}
  for (const attr of parseAttrs(rawAttrs, where)) {
    if (!allowed.includes(attr.name)) fail(where, `<${name}> 使用了未知属性 ${attr.name}`)
    attrs[attr.name] = attr.value
  }
  if (attrs.lesson !== lessonId) fail(where, `<${name}> 的 lesson 属性写成了 ${attrs.lesson}`)
  if (name === 'Cite' && !attrs.ids?.trim()) fail(where, '<Cite> 缺少 ids')
  return { name, attrs }
}

// 图示里的文字只允许 **加粗**，其余一律按纯文本转义
function figureText(value) {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
}

function splitPair(value, where) {
  const [title, ...rest] = value.split('|')
  if (!title.trim()) fail(where, `图示里有一行缺少标题：${value.trim().slice(0, 40)}`)
  return { title: title.trim(), sub: rest.join('|').trim() }
}

function listItems(lines, where) {
  return lines.map(line => {
    const m = line.match(/^-\s+(.+)$/)
    if (!m) fail(where, `图示里这一行应以“- ”开头：${line.slice(0, 40)}`)
    return splitPair(m[1], where)
  })
}

// 按 [左]/[右]、[改前]/[改后] 这样的标记把图示内容切成两组
function splitGroups(lines, labels, where) {
  const groups = []
  for (const line of lines) {
    const m = line.match(/^\[(.+?)\]\s*(.*)$/)
    if (m) {
      if (m[1] !== labels[groups.length]) fail(where, `图示分组应依次写 ${labels.map(l => `[${l}]`).join(' 和 ')}，这里写成了 [${m[1]}]`)
      groups.push({ head: m[2].trim(), lines: [] })
    } else if (groups.length === 0) {
      fail(where, `图示内容要先写 [${labels[0]}]：${line.slice(0, 40)}`)
    } else {
      groups[groups.length - 1].lines.push(line)
    }
  }
  if (groups.length !== labels.length) fail(where, `图示需要 ${labels.map(l => `[${l}]`).join(' 和 ')} 两组`)
  return groups
}

function renderFigureBody(kind, lines, where) {
  if (kind === 'flow') {
    const items = listItems(lines, where)
    if (items.length < 2 || items.length > 5) fail(where, '流程图示要 2–5 步')
    return `<ol class="course-inline-flow has-${items.length}">${items
      .map(i => `<li><strong>${figureText(i.title)}</strong>${i.sub ? `<span>${figureText(i.sub)}</span>` : ''}</li>`)
      .join('')}</ol>`
  }
  if (kind === 'checklist') {
    const items = listItems(lines, where)
    if (items.length === 0) fail(where, '检查清单没有条目')
    return `<div class="course-checklist"><ol>${items
      .map((i, n) => `<li><i aria-hidden="true">${n + 1}</i><div><b>${figureText(i.title)}</b>${i.sub ? `<span>${figureText(i.sub)}</span>` : ''}</div></li>`)
      .join('')}</ol></div>`
  }
  if (kind === 'compare') {
    const sides = splitGroups(lines, ['左', '右'], where).map((g, n) => {
      const head = splitPair(g.head, where)
      const items = listItems(g.lines, where)
      if (items.length === 0) fail(where, '左右对比的每一边至少要一条要点')
      return `<section class="${n === 0 ? 'is-left' : 'is-right'}"><div><strong>${figureText(head.title)}</strong>${head.sub ? `<span>${figureText(head.sub)}</span>` : ''}</div><ul>${items
        .map(i => `<li>${figureText(i.sub ? `${i.title}｜${i.sub}` : i.title)}</li>`)
        .join('')}</ul></section>`
    })
    return `<div class="course-inline-compare">${sides.join('')}</div>`
  }
  if (kind === 'before-after') {
    const sides = splitGroups(lines, ['改前', '改后'], where).map((g, n) => {
      const cards = g.lines.filter(l => l.startsWith('- '))
      const says = g.lines.filter(l => l.startsWith('> '))
      if (cards.length !== 1 || cards.length + says.length !== g.lines.length || says.length > 1) {
        fail(where, `改前改后的每一边写一条“- 标题 | 说明”，可再加一条“> 对 AI 说的话”`)
      }
      const card = listItems(cards, where)[0]
      const say = says[0]?.slice(2).trim()
      return [
        '<section>',
        `<small${n === 1 ? ' class="is-after"' : ''}>${figureText(g.head || (n === 0 ? '改前' : '改后'))}</small>`,
        `<div class="course-before-after-card ${n === 0 ? 'is-problem' : 'is-fixed'}"><div class="course-before-after-card-body"><strong>${figureText(card.title)}</strong>${card.sub ? `<span>${figureText(card.sub)}</span>` : ''}</div></div>`,
        say ? `<p class="course-before-after-say">对 AI 说：<strong>${figureText(say)}</strong></p>` : '',
        '</section>'
      ].join('')
    })
    return `<div class="course-before-after">${sides.join('')}<span class="course-before-after-arrow" aria-hidden="true"></span></div>`
  }
  if (kind === 'chat') {
    const turns = lines.map(line => {
      const m = line.match(/^(我|AI)[：:]\s*(.+)$/)
      if (!m) fail(where, `对话图示每行以“我：”或“AI：”开头：${line.slice(0, 40)}`)
      const user = m[1] === '我'
      return `<div class="${user ? 'is-user' : 'is-agent'}"><i aria-hidden="true">${user ? '我' : 'AI'}</i><p>${figureText(m[2])}</p></div>`
    })
    if (turns.length === 0) fail(where, '对话图示没有内容')
    return `<div class="course-chat-flow">${turns.join('')}</div>`
  }
  return fail(where, `未知图示种类 ${kind}`)
}

// ::: figure 块整体换成一段 HTML；“注：”开头的最后一行是图下说明
export function renderFigure(head, bodyLines, where) {
  const m = head.match(/^:::\s*figure\s+([a-z-]+)\s+(.+)$/)
  if (!m) fail(where, '图示第一行写成 ::: figure <种类> 标题 | 副标题')
  const kind = m[1]
  if (!FIGURE_KINDS.includes(kind)) fail(where, `图示种类只能是 ${FIGURE_KINDS.join(' / ')}，这里写成了 ${kind}`)
  const caption = splitPair(m[2], where)
  const lines = bodyLines.map(l => l.trim()).filter(Boolean)
  const note = lines.length && /^注[：:]/.test(lines[lines.length - 1]) ? lines.pop().replace(/^注[：:]\s*/, '') : ''
  for (const line of lines) {
    if (line.includes('<')) fail(where, `图示里不能写 HTML：${line.slice(0, 40)}`)
  }
  return [
    `<figure class="course-inline-visual ai-figure is-${kind}">`,
    `<figcaption><strong>${figureText(caption.title)}</strong>${caption.sub ? `<span>${figureText(caption.sub)}</span>` : ''}</figcaption>`,
    renderFigureBody(kind, lines, where),
    note ? `<p class="ai-figure-note">${figureText(note)}</p>` : '',
    '</figure>'
  ].join('')
}

// 渲染前处理母源：去掉文件头和作者注释，检查手写 HTML，把组件标签和图示换成占位注释，
// 并在每个 {#id} 二级标题前后插入分节标记（渲染后换成 section）
export function prepareSource(markdown, lessonId) {
  const where = lessonId
  let body = String(markdown).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/<!--[\s\S]*?-->/g, '')
  if (body.includes('<!--')) fail(where, '有未闭合的 HTML 注释')
  if (/javascript:/i.test(body)) fail(where, '正文出现 javascript: 链接')
  if (/\{\{|\}\}/.test(body)) fail(where, '正文出现 Vue 插值 {{ }}')
  if (/^\s*<<</m.test(body) || /@include/.test(body)) fail(where, '正文使用了 VitePress 文件引用语法')

  const slots = []
  const out = []
  let fence = null
  let figure = null
  let openSection = null
  const closeSection = () => {
    if (openSection) out.push('', '<!--ai-learning-section-end-->', '')
    openSection = null
  }
  body.split('\n').forEach((line, index) => {
    const at = `${where} 正文第 ${index + 1} 行`
    const trimmed = line.trim()
    if (fence) {
      out.push(line)
      if (trimmed.startsWith(fence) && /^[`~]+$/.test(trimmed)) fence = null
      return
    }
    if (figure) {
      if (trimmed === ':::') {
        slots.push({ name: 'Figure', html: renderFigure(figure.head, figure.lines, figure.at) })
        out.push('', `<!--ai-learning-slot-${slots.length - 1}-->`, '')
        figure = null
      } else {
        if (/^(`{3,}|~{3,}|:::)/.test(trimmed)) fail(at, '图示里不能嵌套代码块或其他容器')
        figure.lines.push(line)
      }
      return
    }
    if (/^:::\s*figure\b/.test(trimmed)) {
      figure = { head: trimmed, lines: [], at }
      return
    }
    const opening = trimmed.match(/^(`{3,}|~{3,})/)
    if (opening) {
      fence = opening[1]
      out.push(line)
      return
    }
    const heading = line.match(SECTION_HEADING)
    if (heading) {
      closeSection()
      openSection = heading[2]
      out.push('', `<!--ai-learning-section-start-${heading[2]}-->`, '', line)
      return
    }
    const component = trimmed.match(/^<([A-Z][A-Za-z]*)((?:\s+[A-Za-z][\w-]*="[^"]*")*)\s*\/>$/)
    if (component) {
      const parsed = parseComponent(component[1], component[2], lessonId, at)
      if (AFTER_SUMMARY_COMPONENTS.has(parsed.name)) closeSection()
      slots.push(parsed)
      out.push('', `<!--ai-learning-slot-${slots.length - 1}-->`, '')
      return
    }
    if (/<\/?[A-Z]/.test(line.replace(/`[^`]*`/g, ''))) fail(at, `未知或写法不对的组件：${trimmed.slice(0, 40)}`)
    checkSourceLine(line, at)
    out.push(line)
  })
  if (fence) fail(where, '代码块没有闭合')
  if (figure) fail(figure.at, '图示没有用 ::: 结束')
  closeSection()
  return { text: out.join('\n'), slots }
}

// 把分节标记换成 section：锚点 id 从 h2 移到 section 上（和模板一致，目录高亮按 section 计算）；
// 第一个小节之前的标题和导语包成章首块。标题里的“第 NN 章 · ”去掉，章号只在页头显示一次。
export function applySectionLayout(html, where) {
  let out = html.replace(/(<h1\b[^>]*>)第\s*\d+\s*章\s*·\s*/, '$1')
  out = out.replace(/<!--ai-learning-section-start-([a-z0-9-]+)-->\n?\s*(<h2\b[^>]*?)\sid="\1"([^>]*>)/g, (_, id, open, rest) => {
    const cls = id === SUMMARY_SECTION_ID ? 'course-lesson-section course-section-summary' : 'course-lesson-section'
    return `<section class="${cls}" id="${id}">\n${open}${rest}`
  })
  if (/<!--ai-learning-section-start-/.test(out)) fail(where, '有小节标记没有对上二级标题')
  out = out.replace(/<!--ai-learning-section-end-->\n?/g, '</section>\n')
  const first = out.indexOf('<section class="course-lesson-section')
  if (first > 0) out = `<div class="ai-course-chapter-head">\n${out.slice(0, first)}</div>\n${out.slice(first)}`
  return out
}

// 去掉 VitePress 为 Vue 站点加的东西：复制按钮、代码块上的 v-pre、代码高亮的主题色变量。
// 只在渲染器输出这一步去掉 <pre> 上的 v-pre（VitePress 会写成 v-pre=""）；
// 正文母源里手写的任何 Vue 指令仍在 prepareSource 阶段被属性白名单拒绝。
export function cleanVitepressHtml(html) {
  return html
    .replace(/<button\b[^>]*\bclass="copy"[^>]*><\/button>/g, '')
    .replace(/(<pre\b[^>]*?)\sv-pre(?:="")?(?=[\s>])/g, '$1')
    .replace(/\sstyle="(?:\s*--shiki-[\w-]+:[^;"]*;?)+"/g, '')
}

export function assertSafeHtml(html, where) {
  if (html.includes('<!--')) fail(where, '输出里残留 HTML 注释')
  if (/<\/?[A-Z]/.test(html)) fail(where, '输出里残留组件标签')
  if (/javascript:/i.test(html)) fail(where, '输出里出现 javascript:')
  if (LOCAL_PATH_PATTERN.test(html)) fail(where, '输出里出现本机路径或母源文件名')
  for (const [, closing, name, rawAttrs] of html.matchAll(TAG_PATTERN)) {
    if (!OUTPUT_TAGS.has(name)) fail(where, `输出里出现不允许的标签 <${name}>`)
    if (name === 'button' && !closing && !/\sclass="course-term-ref"/.test(rawAttrs)) fail(where, '按钮只允许用作可点开的术语')
    for (const { name: attr, value } of parseAttrs(rawAttrs, where)) {
      if (/^on/i.test(attr)) fail(where, `输出里出现事件属性 ${attr}`)
      if (!OUTPUT_ATTRS.has(attr)) fail(where, `<${name}> 带了不允许的属性 ${attr}`)
      if (attr === 'href' && !/^(#|https:\/\/|\/courses(\/|#|$)|\/learning(\/|#|$)|\/practice(\?scope=[a-z-]+)?$|\/practice\/questions\/l0[1-4]$|\/[a-z0-9-]+$)/.test(value)) fail(where, `链接地址不允许：${value}`)
      if (attr === 'type' && (name !== 'button' || value !== 'button')) fail(where, `type 只用于术语按钮：<${name} type="${value}">`)
      if (attr === 'target' && value !== '_blank') fail(where, `target 不允许：${value}`)
      if (attr === 'style' && !/^text-align:\s*(left|center|right);?$/.test(value)) fail(where, `style 不允许：${value}`)
    }
  }
  if (/<[/!?A-Za-z]/.test(html.replace(TAG_PATTERN, ''))) fail(where, '输出里有写法不完整的标签')
}

const pad = n => String(n).padStart(2, '0')
const lessonLabel = summary => `第 ${pad(summary.order)} 课 · ${escapeHtml(summary.title)}`
const reviewLabel = status => (status === 'draft' ? '内容草稿 · 待本人试学' : `审核状态：${escapeHtml(status)}`)

// 章首只留一句导语（课程目录里的“为什么学”，和章节卡片同一句），
// 学完能做到、先修、时长、版本等收进默认折叠的“本章信息”
function renderIntro(ctx) {
  const intro = ctx.activities.intro
  if (!intro) fail(ctx.id, '<LessonIntro> 找不到学前说明 intro')
  const summary = ctx.summaries.find(s => s.id === ctx.id)
  if (!summary?.why) fail(ctx.id, '<LessonIntro> 课程目录里缺少这一章的“为什么学”（why）')
  const rows = []
  if (intro.objectives?.length) {
    rows.push(['学完能做到', `<ul>${intro.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>`])
  }
  if (intro.prerequisite) rows.push(['先修', escapeHtml(intro.prerequisite)])
  if (intro.duration) rows.push(['预计时长', escapeHtml(intro.duration)])
  if (intro.plan) rows.push(['时间安排', escapeHtml(intro.plan)])
  rows.push(['教材状态', `${reviewLabel(ctx.activities.review_status)} · 教材版本 ${escapeHtml(ctx.activities.version)}`])
  const notes = [intro.simulation_note, intro.scope_note].filter(Boolean)
  return [
    `<p class="course-chapter-intro">${escapeHtml(summary.why)}</p>`,
    summary.status === 'reading_ready'
      ? '<p class="ai-learning-note ai-learning-reading-ready"><b>正文可读 · 练习待编</b>：本章正文已经可以阅读，配套的练习、测验和演示还在编写，本页没有作答或得分。</p>'
      : '',
    '<details class="ai-course-chapter-info">',
    '<summary>本章信息</summary>',
    `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`,
    ...notes.map(n => `<p class="ai-learning-note">${escapeHtml(n)}</p>`),
    '</details>'
  ].filter(Boolean).join('\n')
}

// 课文里指向其他课的链接直接写课程页地址（/courses/ai-m1/l01），不绕旧 /learning 跳转，
// 这样锚点（#term-xxx）不会在跳转里丢失。
function lessonHref(ctx, lessonId) {
  const summary = ctx.summaries.find(s => s.id === lessonId)
  if (!summary?.moduleId) fail(ctx.id, `找不到 ${lessonId} 所在的课程模块`)
  return `/courses/ai-${summary.moduleId}/${lessonId}`
}

function renderTermCards(ctx) {
  const terms = ctx.glossary.filter(t => t.lesson === ctx.id)
  if (terms.length === 0) fail(ctx.id, '<TermCards> 在术语表里没有本课的词')
  const byId = new Map(ctx.glossary.map(t => [t.id, t]))
  const cards = terms.map(t => {
    const section = ctx.sections.find(s => s.id === t.section)
    if (!section) fail(ctx.id, `术语 ${t.id} 指向的小节 ${t.section} 不存在`)
    const needs = t.needs.map(id => {
      const need = byId.get(id)
      if (!need) fail(ctx.id, `术语 ${t.id} 的“先懂” ${id} 不存在`)
      const href = need.lesson === ctx.id ? `#term-${need.id}` : `${lessonHref(ctx, need.lesson)}#term-${need.id}`
      return `<a href="${escapeHtml(href)}">${escapeHtml(need.term)}</a>`
    })
    return [
      `<div class="ai-learning-term" id="term-${escapeHtml(t.id)}">`,
      `<p class="ai-learning-term-name"><b>${escapeHtml(t.term)}</b>${t.en ? ` <span class="ai-learning-term-en">${escapeHtml(t.en)}</span>` : ''}</p>`,
      `<p>${escapeHtml(t.definition)}</p>`,
      `<p class="ai-learning-term-example"><b>例子</b> ${escapeHtml(t.example)}</p>`,
      t.aliases.length ? `<p class="ai-learning-term-meta">也叫：${t.aliases.map(escapeHtml).join('、')}</p>` : '',
      needs.length ? `<p class="ai-learning-term-meta">先懂：${needs.join('、')}</p>` : '',
      `<p class="ai-learning-term-meta">正文讲解：<a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></p>`,
      '</div>'
    ].filter(Boolean).join('\n')
  })
  return `<div class="ai-learning-terms">\n${cards.join('\n')}\n</div>`
}

function renderCite(ctx, attrs) {
  const links = attrs.ids.trim().split(/\s+/).map(id => {
    const source = ctx.sources.find(s => s.id === id)
    if (!source) fail(ctx.id, `<Cite> 引用了不存在的来源 ${id}`)
    return `<a href="#source-${escapeHtml(id)}">[${escapeHtml(id)}] ${escapeHtml(source.title)}</a>`
  })
  return `<p class="ai-learning-cite">依据：${links.join('；')}</p>`
}

function renderDemo(ctx) {
  const demo = ctx.activities.demo
  if (!demo?.steps?.length) fail(ctx.id, '<ContrastDemo> 找不到演示步骤')
  const steps = demo.steps.map((step, i) => [
    '<li class="ai-learning-demo-step">',
    `<p class="ai-learning-demo-step-title"><b>第 ${i + 1} 步 · ${escapeHtml(step.title)}</b></p>`,
    '<dl>',
    `<dt>输入</dt><dd class="ai-learning-multiline">${escapeHtml(step.input)}</dd>`,
    `<dt>输出</dt><dd class="ai-learning-multiline ai-learning-output">${escapeHtml(step.output)}</dd>`,
    `<dt>为什么</dt><dd class="ai-learning-multiline">${escapeHtml(step.why)}</dd>`,
    '</dl>',
    '</li>'
  ].join('\n'))
  return [
    '<section class="ai-learning-demo" aria-label="对照演示">',
    `<p class="ai-learning-demo-title"><b>演示：${escapeHtml(demo.title)}</b></p>`,
    demo.note ? `<p class="ai-learning-note">${escapeHtml(demo.note)}</p>` : '',
    '<p class="ai-learning-note">此演示是静态版：每一步的输入、输出和原因都已全部展开，没有切换按钮。</p>',
    `<ol class="ai-learning-demo-steps">\n${steps.join('\n')}\n</ol>`,
    '</section>'
  ].filter(Boolean).join('\n')
}

function renderPractice(ctx) {
  const practice = ctx.activities.practice
  if (!practice?.prompt || !practice.explanation) fail(ctx.id, '<GuidedPractice> 缺少练习题或解析')
  return [
    '<section class="ai-learning-practice" aria-label="练习">',
    `<p class="ai-learning-multiline"><b>练习：</b>${escapeHtml(practice.prompt)}</p>`,
    practice.placeholder ? `<p class="ai-learning-note">作答提示：${escapeHtml(practice.placeholder)}</p>` : '',
    '<p class="ai-learning-note">此练习没有在线作答框，也不会保存你的答案。请先在自己的笔记里写下答案，再展开解析。</p>',
    practice.hint ? `<details class="ai-learning-details"><summary>提示</summary><p>${escapeHtml(practice.hint)}</p></details>` : '',
    practice.checklist?.length
      ? `<p>写完后对照自查：</p>\n<ul class="ai-learning-checklist">${practice.checklist.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`
      : '',
    `<details class="ai-learning-details"><summary>查看解析</summary><p class="ai-learning-multiline">${escapeHtml(practice.explanation)}</p></details>`,
    '</section>'
  ].filter(Boolean).join('\n')
}

// 标记已读和测验是正文之后的交互区（页面上的 #assessment），这里只放一个指过去的静态说明；
// 没有 JavaScript 时交互区不能用，说明里照实写出来
function renderReadMark(ctx) {
  const quiz = ctx.activities.quiz
  const parts = []
  if (quiz?.questions?.length) parts.push(`${quiz.questions.length} 道单选`)
  if (quiz?.short_question) parts.push('1 道简答')
  const quizText = parts.length ? `本章测验（${parts.join('、')}）` : '本章测验'
  return [
    '<section class="ai-learning-status" aria-label="学习进度与测验">',
    `<p>读完后，在正文之后标记已读并完成${quizText}：<a href="#assessment">去标记已读与测验</a>。</p>`,
    '<p class="ai-learning-note">作答和进度只保存在当前浏览器，需要启用 JavaScript；不上传，也不是正式考试。</p>',
    '</section>'
  ].join('\n')
}

function renderSourceList(ctx) {
  if (ctx.sources.length === 0) fail(ctx.id, '<SourceList> 本课没有来源')
  const items = ctx.sources.map(s => {
    if (!/^https:\/\//.test(s.url)) fail(ctx.id, `来源 ${s.id} 不是 https 链接`)
    return [
      `<li id="source-${escapeHtml(s.id)}">`,
      `<p><span class="ai-learning-source-id">[${escapeHtml(s.id)}]</span> <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a></p>`,
      s.supports ? `<p>支撑的内容：${escapeHtml(s.supports)}</p>` : '',
      s.checked ? `<p class="ai-learning-note">教材作者核对日期：${escapeHtml(s.checked)}</p>` : '',
      '</li>'
    ].filter(Boolean).join('\n')
  })
  return [
    '<section class="ai-learning-sources" aria-labelledby="ai-learning-sources-title">',
    '<h2 id="ai-learning-sources-title">本章参考来源</h2>',
    `<ol>\n${items.join('\n')}\n</ol>`,
    '</section>'
  ].join('\n')
}

function renderNextStep(ctx) {
  const index = ctx.summaries.findIndex(s => s.id === ctx.id)
  const next = ctx.summaries[index + 1]
  let line
  if (!next) line = '<p>这是课程的最后一课。</p>'
  else if (next.status === 'available') {
    line = `<p>下一课：<a href="${escapeHtml(lessonHref(ctx, next.id))}">${lessonLabel(next)}</a>（可试读·待本人验收）</p>`
  } else if (next.status === 'reading_ready') {
    line = `<p>下一课：<a href="${escapeHtml(lessonHref(ctx, next.id))}">${lessonLabel(next)}</a>（正文可读·练习待编）</p>`
  } else {
    line = `<p>下一课：${lessonLabel(next)}（待编写，暂无正文）。</p>`
  }
  return [
    '<section class="ai-learning-next" aria-label="下一步">',
    line,
    `<p><a href="/courses">返回课程列表</a>，查看全部 ${ctx.summaries.length} 课。</p>`,
    '</section>'
  ].join('\n')
}

const RENDERERS = {
  LessonIntro: renderIntro,
  TermCards: renderTermCards,
  Cite: renderCite,
  ContrastDemo: renderDemo,
  GuidedPractice: renderPractice,
  ReadMark: renderReadMark,
  SourceList: renderSourceList,
  NextStep: renderNextStep
}

export function renderLesson({ md, lesson, summaries, glossary }) {
  const summary = summaries.find(s => s.id === lesson.id)
  if (!summary || !READABLE_STATUSES.includes(summary.status)) fail(lesson.id, '课程地图里不是可读章节（available / reading_ready）')
  if (lesson.activities?.version !== lesson.version) fail(lesson.id, '正文与 activities 的版本不一致')
  const readingReady = summary.status === 'reading_ready'
  if (readingReady) {
    for (const key of ASSESSMENT_KEYS) {
      if (Object.hasOwn(lesson.activities, key)) fail(lesson.id, `reading_ready 章节练习待编，activities 不能出现 ${key}`)
    }
  }
  const ctx = {
    id: lesson.id,
    activities: lesson.activities,
    sources: lesson.activities.sources ?? [],
    sections: lesson.sections,
    glossary,
    summaries
  }
  const { text, slots } = prepareSource(lesson.markdown, lesson.id)
  if (readingReady) {
    const blocked = slots.find(s => ASSESSMENT_COMPONENTS.has(s.name))
    if (blocked) fail(lesson.id, `reading_ready 章节练习待编，正文不能用 <${blocked.name}>`)
    // 章首说明里有“正文可读 · 练习待编”，没有 <LessonIntro> 读者就看不到这句
    if (!slots.some(s => s.name === 'LessonIntro')) fail(lesson.id, 'reading_ready 章节正文要有 <LessonIntro>，用来显示“正文可读 · 练习待编”')
  }
  let html = cleanVitepressHtml(md.render(text, { relativePath: `learning/${lesson.id}.md`, cleanUrls: true }))
  let used = 0
  html = html.replace(/<!--ai-learning-slot-(\d+)-->\n?/g, (_, n) => {
    const slot = slots[Number(n)]
    if (!slot) fail(lesson.id, `占位符 ${n} 没有对应组件`)
    used += 1
    return `${slot.html ?? RENDERERS[slot.name](ctx, slot.attrs)}\n`
  })
  if (used !== slots.length) fail(lesson.id, `组件没有全部展开（${used}/${slots.length}）`)
  html = renderTermLinks(html, glossary, lesson.id)
  html = applySectionLayout(html, lesson.id)
  assertSafeHtml(html, lesson.id)
  if (readingReady && /\shref="\/practice/.test(html)) fail(lesson.id, 'reading_ready 章节练习待编，正文不能链接练习页')

  const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(m => m[1])
  const duplicate = ids.find((id, i) => ids.indexOf(id) !== i)
  if (duplicate) fail(lesson.id, `页面锚点重复：${duplicate}`)
  for (const section of lesson.sections) {
    if (!ids.includes(section.id)) fail(lesson.id, `小节锚点 #${section.id} 没有出现在页面里`)
  }
  return {
    id: lesson.id,
    version: lesson.version,
    reviewStatus: lesson.activities.review_status ?? null,
    sections: lesson.sections.map(s => ({ id: s.id, title: s.title })),
    html
  }
}

// 术语详情页的长篇讲解：母源 sources/terms/<词id>.md，由生成步骤放进 glossary.terms[].article。
// 写法和课程正文一样（Markdown、表格、[文字](term:词id)），但只讲一个词：不能用课程组件和图示，
// 从二级标题开始写，标题不带 {#id}。里面点到的其他术语直接链到网站的术语页。
export function renderTermArticle({ md, term, glossary }) {
  const where = `术语 ${term.id} 的讲解`
  const siteId = siteTermId(glossary, term.id)
  if (!siteId) fail(where, '这个词没有上术语图鉴（缺 site_term / site_cat），讲解没有地方显示')
  const { text, slots } = prepareSource(term.article, where)
  if (slots.length) fail(where, '术语讲解里不能用课程组件或 ::: figure 图示')
  if (/^#\s/m.test(text)) fail(where, '术语讲解从二级标题（##）开始写，页面标题就是术语名')
  let html = cleanVitepressHtml(md.render(text, { relativePath: `terms/${term.id}.md`, cleanUrls: true }))
  if (html.includes('<!--ai-learning-section')) fail(where, '术语讲解的标题不要带 {#id}')
  html = html.replace(TERM_LINK, (_, id, label) => {
    const target = siteTermId(glossary, id)
    if (!target) fail(where, `链接的术语 term:${id} 不在术语表里，或没有上术语图鉴`)
    return `<a class="term-article-link" href="/${target}">${label}</a>`
  })
  assertSafeHtml(html, where)
  return { siteId, termId: term.id, html }
}

export function renderTermArticles({ data, md }) {
  const glossary = data.glossary.terms
  const articles = {}
  for (const term of glossary.filter(t => t.article)) {
    const rendered = renderTermArticle({ md, term, glossary })
    if (articles[rendered.siteId]) fail(`术语 ${term.id} 的讲解`, `网站卡片 ${rendered.siteId} 已经有一篇讲解`)
    articles[rendered.siteId] = { termId: rendered.termId, html: rendered.html }
  }
  return { schemaVersion: RENDER_SCHEMA_VERSION, glossaryVersion: data.glossary.version ?? null, articles }
}

// 读取 + 校验 + 渲染，不写任何文件
export function renderLearningData({ data, md }) {
  if (data?.schemaVersion !== SOURCE_SCHEMA_VERSION) fail('generated.json', `schemaVersion 不是 ${SOURCE_SCHEMA_VERSION}`)
  const summaries = data.modules.flatMap(m => m.lessons)
  const glossary = data.glossary.terms
  const order = new Map(summaries.map((s, i) => [s.id, i]))
  const lessons = [...data.lessons]
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map(lesson => renderLesson({ md, lesson, summaries, glossary }))
  return {
    schemaVersion: RENDER_SCHEMA_VERSION,
    courseVersion: data.courseVersion,
    renderer: 'vitepress createMarkdownRenderer',
    lessons
  }
}

export function serialize(rendered) {
  return `${JSON.stringify(rendered, null, 2)}\n`
}

// 全部校验通过后才写：先写同目录临时文件，再改名替换，失败时清掉自己的临时文件
export async function writeRendered({ data, md, outputPath, articlesPath }) {
  const rendered = renderLearningData({ data, md })
  const articles = articlesPath ? renderTermArticles({ data, md }) : null
  await writeAtomic(outputPath, serialize(rendered))
  if (articles) await writeAtomic(articlesPath, serialize(articles))
  return { rendered, articles, text: serialize(rendered) }
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

async function main() {
  const options = resolveRenderOptions()
  const data = JSON.parse(await readFile(options.inputPath, 'utf8'))
  const { md, dispose } = await loadMarkdownRenderer(options.vitepressDir)
  try {
    const { rendered, articles } = await writeRendered({ data, md, outputPath: options.outputPath, articlesPath: options.articlesPath })
    const articleIds = Object.keys(articles.articles)
    console.log(
      `已生成 ${path.relative(repoRoot, options.outputPath)}：课程版本 ${rendered.courseVersion}，` +
        `渲染 ${rendered.lessons.length} 课（${rendered.lessons.map(l => l.id).join('、')}）；` +
        `术语讲解 ${articleIds.length} 篇（${articleIds.join('、') || '无'}）`
    )
  } finally {
    dispose()
  }
}

// 只有直接用 node 运行本文件时才写文件；测试 import 时不会触发
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
