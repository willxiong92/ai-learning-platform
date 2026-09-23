// AI 学习站内容适配器：读教材母源（course.yaml / glossary.yaml / lessons/），
// 用本仓库 scripts/content-source.mjs 的 loadContent / validateContent / splitSections 读入和查错
// （从 AI学习站 仓库的 content-lib.mjs 迁来，多认一个 reading_ready 状态），
// 再生成网站页面要用的 src/lib/ai-learning/generated.json。
// 这里不维护第二份教材：正文只从母源来，生成文件不要手改。
// 校验不通过时直接失败，不会覆盖已有的生成文件；写入用“临时文件 + 改名”，避免写一半。
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildSiteCatalog } from './ai-site-catalog.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const SCHEMA_VERSION = 1
export const DEFAULT_SOURCE_DIR = '/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources'
// 仍可用 AI_LEARNING_CONTENT_LIB 或测试里显式传 lib 换成别的实现
export const DEFAULT_CONTENT_LIB = path.join(repoRoot, 'scripts/content-source.mjs')

// 有正文的章节：available（正文 + 练习齐全）和 reading_ready（正文可读，练习待编）
const READABLE_STATUSES = ['available', 'reading_ready']

export const DEFAULT_OUTPUT = path.join(repoRoot, 'src/lib/ai-learning/generated.json')
// 术语图鉴和练习页要合并的 AI 课程卡片与题目（体积小，浏览器端也会用到，所以和 generated.json 分开）
export const DEFAULT_CATALOG_OUTPUT = path.join(repoRoot, 'src/lib/ai-learning/site-catalog.json')
const CATALOG_TERMS = path.join(repoRoot, 'src/lib/vibehub/terms.json')
const CATALOG_TOPICS = path.join(repoRoot, 'src/lib/vibehub/topics.json')

// 生成结果里出现这些片段，说明本机路径漏进了页面数据
const LOCAL_PATH_PATTERN = /\/Users\/|\/home\/|file:\/\//

// 环境变量只允许显式的绝对路径，不从任意目录猜内容
export function resolveOptions(env = process.env) {
  const pick = (name, fallback) => {
    const value = env[name]
    if (!value) return fallback
    if (!path.isAbsolute(value)) throw new Error(`${name} 必须是绝对路径：${value}`)
    return value
  }
  return {
    sourceDir: pick('AI_LEARNING_SOURCE_DIR', DEFAULT_SOURCE_DIR),
    contentLibPath: pick('AI_LEARNING_CONTENT_LIB', DEFAULT_CONTENT_LIB),
    outputPath: DEFAULT_OUTPUT,
    catalogOutputPath: DEFAULT_CATALOG_OUTPUT
  }
}

export async function loadContentLib(libPath) {
  const lib = await import(pathToFileURL(libPath).href)
  for (const name of ['loadContent', 'validateContent', 'splitSections']) {
    if (typeof lib[name] !== 'function') throw new Error(`内容工具缺少 ${name}：${libPath}`)
  }
  return { loadContent: lib.loadContent, validateContent: lib.validateContent, splitSections: lib.splitSections }
}

function toLessonSummary(lesson, moduleId, order) {
  return {
    id: lesson.id,
    moduleId,
    order,
    title: lesson.title,
    status: lesson.status,
    topics: lesson.topics ?? null,
    outcome: lesson.outcome,
    why: lesson.why,
    verify: lesson.verify,
    prerequisites: lesson.prerequisites,
    estimate: lesson.estimate
  }
}

function toGlossaryTerm(term, articles = {}) {
  return {
    id: term.id,
    term: term.term,
    en: term.en ?? null,
    aliases: term.aliases ?? [],
    definition: term.definition,
    example: term.example,
    needs: term.needs ?? [],
    lesson: term.lesson,
    section: term.section,
    siteTerm: term.site_term ?? null,
    siteCat: term.site_cat ?? null,
    siteDemo: term.site_demo ?? null,
    article: articles[term.id] ?? null
  }
}

// 术语详情页的长篇讲解：sources/terms/<词id>.md，一个词一篇，文件名就是术语表里的 id。
// 没有这个目录或某个词没写讲解都可以；写了但术语表里没有这个词，直接报错。
export async function loadTermArticles(sourceDir, glossaryTerms) {
  const dir = path.join(sourceDir, 'terms')
  let names
  try {
    names = await readdir(dir)
  } catch (error) {
    if (error.code === 'ENOENT') return { articles: {}, errors: [] }
    throw error
  }
  const ids = new Set(glossaryTerms.map(t => t.id))
  const articles = {}
  const errors = []
  for (const name of names.filter(n => n.endsWith('.md')).sort()) {
    const id = name.slice(0, -3)
    if (!ids.has(id)) errors.push(`术语讲解 terms/${name}：术语表里没有 ${id} 这个词`)
    else articles[id] = await readFile(path.join(dir, name), 'utf8')
  }
  return { articles, errors }
}

// 母源之外的一致性检查：审核状态必须照实带出，只有可读章节（available / reading_ready）才有正文
function adapterErrors({ course, lessons }) {
  const errors = []
  if (typeof course.version !== 'string' || !course.version) errors.push('课程地图：缺少 version')
  if (!['draft', 'reviewed'].includes(course.review?.content)) errors.push(`课程地图：review.content 无效 ${course.review?.content}`)
  if (typeof course.review?.team_access !== 'string' || !course.review.team_access) errors.push('课程地图：缺少 review.team_access')
  const status = new Map((course.modules ?? []).flatMap(m => (m.lessons ?? []).map(l => [l.id, l.status])))
  for (const id of Object.keys(lessons)) {
    if (!READABLE_STATUSES.includes(status.get(id))) errors.push(`${id}：不是可读章节（${status.get(id)}），却读到了正文`)
  }
  for (const [id, s] of status) {
    if (READABLE_STATUSES.includes(s) && !lessons[id]) errors.push(`${id}：${s} 章节没有读到正文`)
  }
  return errors
}

// 读取 + 校验 + 转换，不写任何文件
export async function buildLearningData({ sourceDir, lib }) {
  const content = await lib.loadContent(sourceDir)
  const termArticles = await loadTermArticles(sourceDir, content.glossary?.terms ?? [])
  const errors = [...lib.validateContent(content), ...adapterErrors(content), ...termArticles.errors]
  if (errors.length) throw new Error(`教材母源校验失败（${errors.length} 项）：\n- ${errors.join('\n- ')}`)

  const { course, glossary, lessons } = content
  let order = 0
  const modules = course.modules.map(m => ({
    id: m.id,
    title: m.title,
    purpose: m.purpose ?? null,
    lessons: (m.lessons ?? []).map(l => toLessonSummary(l, m.id, ++order))
  }))
  const summaries = modules.flatMap(m => m.lessons)
  const lessonContents = summaries
    .filter(l => READABLE_STATUSES.includes(l.status))
    .map(l => ({
      id: l.id,
      moduleId: l.moduleId,
      version: lessons[l.id].activities.version,
      markdown: lessons[l.id].markdown,
      activities: lessons[l.id].activities,
      sections: lib.splitSections(lessons[l.id].markdown)
    }))

  const data = {
    schemaVersion: SCHEMA_VERSION,
    courseVersion: course.version,
    title: course.title,
    audience: course.audience ?? null,
    depthNote: course.depth_note ?? null,
    review: { content: course.review.content, teamAccess: course.review.team_access },
    period: course.period
      ? {
          weeks: course.period.weeks ?? null,
          hoursPerWeek: course.period.hours_per_week ?? null,
          totalHours: course.period.total_hours ?? null,
          note: course.period.note ?? null
        }
      : null,
    // available 沿用“有正文可读”的数量（含 reading_ready）；readingReady 是其中练习待编的数量
    counts: {
      modules: modules.length,
      lessons: summaries.length,
      available: lessonContents.length,
      readingReady: summaries.filter(l => l.status === 'reading_ready').length,
      planned: summaries.filter(l => l.status === 'planned').length
    },
    modules,
    glossary: {
      version: glossary.version ?? null,
      terms: (glossary.terms ?? []).map(term => toGlossaryTerm(term, termArticles.articles))
    },
    lessons: lessonContents
  }

  const text = serialize(data)
  if (text.includes(sourceDir) || LOCAL_PATH_PATTERN.test(text)) {
    throw new Error('生成数据中出现了本机路径，已停止')
  }
  return data
}

export function serialize(data) {
  return `${JSON.stringify(data, null, 2)}\n`
}

export async function loadCatalog() {
  const [terms, topics] = await Promise.all([CATALOG_TERMS, CATALOG_TOPICS].map(async p => JSON.parse(await readFile(p, 'utf8'))))
  return { terms, topics }
}

// 由生成数据推出术语图鉴 / 练习页要合并的部分；有错就失败，两个文件都不写
export function buildCatalogData(data, catalog) {
  const { errors, catalog: site } = buildSiteCatalog({
    glossaryTerms: data.glossary.terms,
    lessons: data.lessons,
    summaries: data.modules.flatMap(m => m.lessons),
    modules: data.modules.map(m => ({ id: m.id, title: m.title })),
    catalogTerms: catalog.terms,
    topics: catalog.topics
  })
  if (errors.length) throw new Error(`术语 / 练习接入校验失败（${errors.length} 项）：\n- ${errors.join('\n- ')}`)
  return { schemaVersion: SCHEMA_VERSION, courseVersion: data.courseVersion, glossaryVersion: data.glossary.version, ...site }
}

// 全部校验通过后才写：先写同目录临时文件，再改名替换，失败时清掉自己的临时文件
export async function generate({ sourceDir, outputPath, catalogOutputPath, lib, catalog }) {
  const data = await buildLearningData({ sourceDir, lib })
  const text = serialize(data)
  const siteCatalog = catalogOutputPath ? buildCatalogData(data, catalog ?? (await loadCatalog())) : null
  await writeAtomic(outputPath, text)
  if (siteCatalog) await writeAtomic(catalogOutputPath, serialize(siteCatalog))
  return { data, text, siteCatalog }
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
  const options = resolveOptions()
  const lib = await loadContentLib(options.contentLibPath)
  const { data, siteCatalog } = await generate({ ...options, lib })
  const { counts } = data
  console.log(
    `已生成 ${path.relative(repoRoot, options.outputPath)}：课程版本 ${data.courseVersion}，` +
      `${counts.modules} 个模块 / ${counts.lessons} 课（可读 ${counts.available}，其中练习待编 ${counts.readingReady}，planned ${counts.planned}）；` +
      `图鉴新增 ${siteCatalog.terms.length} 张卡，练习 ${siteCatalog.practice.length} 题（已拆分：${siteCatalog.splitLessons.join('、') || '无'}）`
  )
}

// 只有直接用 node 运行本文件时才写文件；测试 import 时不会触发
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
