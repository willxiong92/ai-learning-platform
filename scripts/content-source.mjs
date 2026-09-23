// 教材母源的读取与校验（生成器默认用这一份）。
// 迁入来源：/Users/will/code/AI学习站/scripts/content-lib.mjs 的 loadContent / validateContent /
// splitSections / toPlainText，原规则逐条保留；旧站文件不改，旧站自己的构建仍用它自己那份。
// 本站新增一个整课状态 reading_ready：正文已写好可以读，但练习、测验、演示还没编。
// 它不是“免评估”：只是暂时没有评估内容，所以评估字段必须完全不出现（空的也不行），
// 等练习编好后，作者把状态改成 available，就要通过原来完整的校验。这里不会自动改状态。
// YAML 解析复用旧站仓库已安装的 yaml 包（createRequire），本仓库不新增依赖。
import { access, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

export const KNOWN_COMPONENTS = [
  'LessonIntro', 'TermCards', 'Cite', 'ContrastDemo', 'GuidedPractice',
  'ReadMark', 'SourceList', 'NextStep'
]

export const LESSON_STATUSES = ['available', 'reading_ready', 'planned']
// 有正文、会被读进来的状态；planned 不读正文
export const READABLE_STATUSES = ['available', 'reading_ready']

// reading_ready 章节不允许出现的评估内容：activities 里的字段，以及正文里依赖这些字段的组件
const ASSESSMENT_KEYS = ['quiz', 'practice', 'demo']
const ASSESSMENT_COMPONENTS = ['ContrastDemo', 'GuidedPractice', 'ReadMark']
// 正文里指向练习页的链接（Markdown 链接或手写 href）
const PRACTICE_LINK = /\]\(\s*\/practice(?![\w-])|href="\/practice(?![\w-])/
const SECTION_LINE = /^##\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/

export const YAML_FROM = '/Users/will/code/AI学习站/package.json'
let yaml
// 只在真正读文件时才加载 yaml，单测只用校验函数时不依赖旧站仓库
function parseYaml(text) {
  yaml ??= createRequire(YAML_FROM)('yaml')
  return yaml.parse(text)
}

const exists = p => access(p).then(() => true, () => false)

export async function loadContent(srcDir) {
  const course = parseYaml(await readFile(path.join(srcDir, 'course.yaml'), 'utf8'))
  const glossary = parseYaml(await readFile(path.join(srcDir, 'glossary.yaml'), 'utf8'))
  const lessons = {}
  for (const mod of course.modules ?? []) {
    for (const lesson of mod.lessons ?? []) {
      if (!READABLE_STATUSES.includes(lesson.status)) continue
      const dir = path.join(srcDir, 'lessons', lesson.id)
      const mdPath = path.join(dir, 'lesson.md')
      const actPath = path.join(dir, 'activities.yaml')
      lessons[lesson.id] = {
        markdown: (await exists(mdPath)) ? await readFile(mdPath, 'utf8') : null,
        activities: (await exists(actPath)) ? parseYaml(await readFile(actPath, 'utf8')) : null
      }
    }
  }
  return { course, glossary, lessons }
}

function stripFrontMatter(markdown) {
  return markdown.replace(/^---[\s\S]*?\n---\n/, '').replace(/<!--[\s\S]*?-->/g, '')
}

// 把正文按“## 标题 {#id}”切成小节，供测验回看链接和知识点查询使用。
export function splitSections(markdown) {
  const body = stripFrontMatter(markdown)
  const sections = []
  let current = null
  for (const line of body.split('\n')) {
    const m = line.match(SECTION_LINE)
    if (m) {
      current = { id: m[2], title: m[1].trim(), lines: [] }
      sections.push(current)
    } else if (current) {
      current.lines.push(line)
    }
  }
  return sections.map(s => ({ id: s.id, title: s.title, text: toPlainText(s.lines.join('\n')) }))
}

export function toPlainText(md) {
  return md
    .replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g, '$1。')
    .replace(/<[A-Z][A-Za-z]*[^>]*\/>/g, '')          // 组件标签
    .replace(/<\/?(small|b|span|li|ul|ol|div|p|figure)[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^:::\s*\w*\s*/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[-]{3,}/g, ' ')
    .replace(/\*\*|__|`/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// reading_ready 章节在通用检查之外的规则：正文能独立读，且不带任何评估内容
function readingReadyErrors(id, lesson, act, sections) {
  const errors = []
  const err = msg => errors.push(msg)
  for (const key of ASSESSMENT_KEYS) {
    if (Object.hasOwn(act, key)) err(`${id}：reading_ready 章节练习待编，activities 不能出现 ${key}（空值也不行）`)
  }
  if (!act.intro || typeof act.intro !== 'object' || Array.isArray(act.intro)) err(`${id}：reading_ready 章节缺少学前说明 intro`)
  if (!['draft', 'reviewed'].includes(act.review_status)) err(`${id}：review_status 只能是 draft 或 reviewed，实际 ${act.review_status}`)
  if (!Array.isArray(act.sources) || act.sources.length === 0) err(`${id}：reading_ready 章节至少要有一条来源 sources`)
  else for (const [i, s] of act.sources.entries()) if (!s?.id) err(`${id}：第 ${i + 1} 条来源缺少 id`)

  const seen = new Set()
  for (const s of sections) {
    if (seen.has(s.id)) err(`${id}：小节锚点重复 #${s.id}`)
    seen.add(s.id)
  }
  for (const line of stripFrontMatter(lesson.markdown).split('\n')) {
    if (/^##\s/.test(line) && line.includes('{#') && !SECTION_LINE.test(line)) {
      err(`${id}：小节锚点写法不合法（只能用小写字母、数字和 -）：${line.trim().slice(0, 40)}`)
    }
  }
  const blocked = new Set([...lesson.markdown.matchAll(/<([A-Z][A-Za-z]+)[\s/>]/g)].map(m => m[1]).filter(n => ASSESSMENT_COMPONENTS.includes(n)))
  for (const name of blocked) err(`${id}：reading_ready 正文不能用需要练习数据的组件 <${name}>`)
  if (PRACTICE_LINK.test(lesson.markdown)) err(`${id}：reading_ready 正文不能链接练习页（练习还没编）`)
  return errors
}

export function validateContent({ course, glossary, lessons }) {
  const errors = []
  const err = msg => errors.push(msg)
  const allLessons = (course.modules ?? []).flatMap(m => m.lessons ?? [])
  const ids = new Set()
  for (const l of allLessons) {
    if (ids.has(l.id)) err(`课程地图：章节 id 重复 ${l.id}`)
    ids.add(l.id)
    for (const field of ['title', 'outcome', 'why', 'verify', 'estimate']) {
      if (!l[field]) err(`课程地图：${l.id} 缺少 ${field}`)
    }
    if (!LESSON_STATUSES.includes(l.status)) err(`课程地图：${l.id} 状态无效 ${l.status}`)
    if (!Array.isArray(l.prerequisites)) err(`课程地图：${l.id} prerequisites 必须是列表`)
  }
  if (allLessons.length !== 24) err(`课程地图：应有 24 章，实际 ${allLessons.length}`)
  // 先修关系：必须存在、不能指向自己之后的章节（保证目录顺序能学下去，也排除循环）
  const order = new Map(allLessons.map((l, i) => [l.id, i]))
  for (const l of allLessons) {
    for (const p of l.prerequisites ?? []) {
      if (!order.has(p)) err(`课程地图：${l.id} 的先修 ${p} 不存在`)
      else if (order.get(p) >= order.get(l.id)) err(`课程地图：${l.id} 的先修 ${p} 排在它之后或就是它自己`)
    }
  }
  if (!allLessons.some(l => l.status === 'available')) err('课程地图：没有任何可学习章节')
  const statusOf = new Map(allLessons.map(l => [l.id, l.status]))

  const terms = glossary.terms ?? []
  const termIds = new Set()
  for (const t of terms) {
    if (termIds.has(t.id)) err(`术语：id 重复 ${t.id}`)
    termIds.add(t.id)
    for (const field of ['term', 'definition', 'example', 'lesson', 'section']) {
      if (!t[field]) err(`术语：${t.id} 缺少 ${field}`)
    }
  }
  for (const t of terms) {
    for (const n of t.needs ?? []) if (!termIds.has(n)) err(`术语：${t.id} 的“先懂” ${n} 不存在`)
    if (t.lesson && !lessons[t.lesson]) err(`术语：${t.id} 指向的章节 ${t.lesson} 不可学习或不存在`)
  }

  for (const [id, lesson] of Object.entries(lessons)) {
    const act = lesson.activities
    if (!lesson.markdown) { err(`${id}：缺少 lesson.md`); continue }
    if (!act) { err(`${id}：缺少 activities.yaml`); continue }
    const sections = splitSections(lesson.markdown)
    const sectionIds = new Set(sections.map(s => s.id))
    if (sections.length === 0) err(`${id}：正文没有带 {#id} 的二级标题`)
    const fm = lesson.markdown.match(/^---[\s\S]*?version:\s*"?([^"\n]+)"?[\s\S]*?\n---/)
    if (!fm || fm[1] !== act.version) err(`${id}：lesson.md 与 activities.yaml 的 version 不一致`)

    for (const t of terms.filter(t => t.lesson === id)) {
      if (!sectionIds.has(t.section)) err(`术语：${t.id} 指向的小节 ${t.section} 在 ${id} 正文中不存在`)
    }
    const sourceIds = new Set((act.sources ?? []).map(s => s.id))
    for (const s of act.sources ?? []) if (!/^https:\/\//.test(s.url)) err(`${id}：来源 ${s.id} 不是 https 链接`)
    for (const m of lesson.markdown.matchAll(/<Cite[^>]*ids="([^"]+)"/g)) {
      for (const sid of m[1].split(/\s+/)) if (!sourceIds.has(sid)) err(`${id}：正文引用了不存在的来源 ${sid}`)
    }
    for (const m of lesson.markdown.matchAll(/<([A-Z][A-Za-z]+)[\s/>]/g)) {
      if (!KNOWN_COMPONENTS.includes(m[1])) err(`${id}：正文使用了未知组件 <${m[1]}>`)
    }
    for (const m of lesson.markdown.matchAll(/<[A-Z][A-Za-z]+[^>]*lesson="([^"]+)"/g)) {
      if (m[1] !== id) err(`${id}：组件的 lesson 属性写成了 ${m[1]}`)
    }

    // reading_ready 只查正文可读性，不查评估；available 走下面原来的完整评估校验
    if (statusOf.get(id) === 'reading_ready') {
      errors.push(...readingReadyErrors(id, lesson, act, sections))
      continue
    }

    const questions = act.quiz?.questions ?? []
    if (questions.length === 0) err(`${id}：没有测验题`)
    const qids = new Set()
    for (const q of questions) {
      if (qids.has(q.id)) err(`${id}：题目 id 重复 ${q.id}`)
      qids.add(q.id)
      if (!sectionIds.has(q.section)) err(`${id}：${q.id} 的回看小节 ${q.section} 不存在`)
      if (!Array.isArray(q.options) || q.options.length < 2) err(`${id}：${q.id} 选项不足`)
      else {
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(`${id}：${q.id} 的答案序号越界`)
        q.options.forEach((o, i) => {
          if (!o.text) err(`${id}：${q.id} 第 ${i + 1} 个选项缺少文字`)
          if (i !== q.answer && !o.feedback) err(`${id}：${q.id} 的错误选项 ${i + 1} 缺少错因说明`)
        })
      }
      if (!q.reason) err(`${id}：${q.id} 缺少解析`)
    }
    const rule = act.quiz?.rule
    if (!rule || !Number.isInteger(rule.min_correct) || rule.min_correct < 1 || rule.min_correct > questions.length) {
      err(`${id}：测验规则 min_correct 无效`)
    }
    if (questions.filter(q => q.critical).length === 0 && rule?.critical_required) err(`${id}：要求关键题但没有标记关键题`)
    if (!act.quiz?.short_question?.rubric?.length) err(`${id}：简答缺少自查要点`)
    if (!act.demo?.steps?.length) err(`${id}：缺少演示步骤`)
    if (!act.practice?.explanation) err(`${id}：练习缺少解析`)
    if (!act.feedback?.checks?.length) err(`${id}：缺少教材反馈检查项`)
  }
  return errors
}
