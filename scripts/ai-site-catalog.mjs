// 把 AI 课程教材接进网站的“术语 / 练习”两块（和克隆站一样，术语、练习、课程分开）：
// - 术语：glossary.yaml 里填了 site_term 的词直接用术语图鉴已有卡片；填了 site_cat + site_demo 的词
//   新建一张卡，放进图鉴 AI 组对应分类。两者都没填的词只留在教材里。
// - 练习：一课的测验题全部带 term 时，这一课算“已拆分”，选择题转成练习页的判断题（不计分、不记录），
//   practice 和 short_question 转成“写一写”卡（写完看解析、对照要点，不保存）。
// 结果写到 src/lib/ai-learning/site-catalog.json，由 src/lib/vibehub/data.ts 合并进图鉴和练习页。
// 这里只做转换和查错，不改任何教材文字；题目编号（如 ai-l01-q1）固定，以后记录学习情况时沿用。

export const AI_TOPIC_SLUG = 'ai'
const CARD_DEMO_CLASS = 'card-demo preview-animations-paused'

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const isText = value => typeof value === 'string' && value.trim() !== ''
const isPair = value => Array.isArray(value) && value.length === 2 && value.every(isText)

// 卡片小图：沿用图鉴“AI 应用基础”卡的三格样式（ai.css 里的 aic-app-query / aic-basics-map / aic-foot），
// 不另写样式。中间一格高亮，和原卡一致。
export function renderCardDemo(demo) {
  const [label, query] = demo.query
  const cells = demo.steps
    .map(([small, text], i) => `<span${i === 1 ? ' class="model"' : ''}><small>${escapeHtml(small)}</small><b>${escapeHtml(text)}</b></span>`)
    .join('<i>→</i>')
  return [
    '',
    '  <div class="ai-card-visual ai-card-basics">',
    `    <div class="aic-app-query"><small>${escapeHtml(label)}</small><b>${escapeHtml(query)}</b></div>`,
    `    <div class="aic-basics-map">${cells}</div>`,
    `    <div class="aic-foot">${escapeHtml(demo.foot)}</div>`,
    '  </div>'
  ].join('\n')
}

function demoErrors(term) {
  const d = term.siteDemo
  const at = `术语 ${term.id}：site_demo`
  if (!d || typeof d !== 'object') return [`${at} 缺失（新建卡片需要卡片小图）`]
  const errors = []
  if (!isPair(d.query)) errors.push(`${at}.query 要写成 [标签, 一句场景]`)
  if (!Array.isArray(d.steps) || d.steps.length !== 3 || !d.steps.every(isPair)) errors.push(`${at}.steps 要写 3 格，每格 [小字, 大字]`)
  if (!isText(d.foot)) errors.push(`${at}.foot 缺少一句提示`)
  return errors
}

/** 教材术语 id → 网站卡片 id；没上图鉴的词不在表里。 */
export function buildTermMap(glossaryTerms, { catalogIds, aiCats }) {
  const map = {}
  const errors = []
  for (const term of glossaryTerms) {
    if (term.siteTerm && term.siteCat) {
      errors.push(`术语 ${term.id}：site_term 和 site_cat 只能填一个`)
    } else if (term.siteTerm) {
      if (!catalogIds.has(term.siteTerm)) errors.push(`术语 ${term.id}：site_term ${term.siteTerm} 不是术语图鉴里已有的卡片`)
      else map[term.id] = term.siteTerm
    } else if (term.siteCat) {
      if (!aiCats.has(term.siteCat)) errors.push(`术语 ${term.id}：site_cat “${term.siteCat}” 不是术语图鉴 AI 组的分类`)
      else if (catalogIds.has(term.id)) errors.push(`术语 ${term.id}：图鉴里已有同名卡片，请改填 site_term: ${term.id}`)
      else map[term.id] = term.id
      errors.push(...demoErrors(term))
    }
  }
  return { map, errors }
}

function newCard(term, termMap, lessonRef) {
  const demo = renderCardDemo(term.siteDemo)
  return {
    id: term.id,
    name: term.en ?? term.term,
    cn: term.term,
    cat: term.siteCat,
    tagline: term.definition,
    // 详情页只显示 desc（不显示 tagline），所以把定义和例子都放进去，文字原样拼接
    desc: term.example ? `${term.definition}例如：${term.example}` : term.definition,
    demo,
    quote: null,
    aliases: term.aliases ?? [],
    prerequisites: (term.needs ?? []).map(id => termMap[id]).filter(Boolean),
    learning: null,
    detailKind: 'ai-concept',
    demoClass: CARD_DEMO_CLASS,
    demoHTML: `<div class="card-demo-mount">${demo}</div>`,
    anatomy: null,
    variants: null,
    scenarios: null,
    aiPrompt: null,
    quiz: null,
    // 卡片回链到课程里详细讲这个词的小节
    references: lessonRef ? [{ href: `${lessonRef.href}#${term.section}`, title: lessonRef.title, sub: '本站 AI 课程' }] : [],
    distinctionsDetail: null
  }
}

function choiceQuestion(lessonId, q, termId) {
  const id = `ai-${lessonId}-${q.id}`
  return {
    id,
    termId,
    title: q.prompt,
    options: q.options.map((option, i) => ({
      id: `${id}-o${i + 1}`,
      label: option.text,
      // 答对时显示这道题的解析；答错时显示这个选项自己的提示
      feedback: i === q.answer ? q.reason : option.feedback,
      correct: i === q.answer
    }))
  }
}

function writeCard(id, termId, { prompt, steps, placeholder, hint, answer, points }) {
  return {
    id,
    termId,
    kind: 'write',
    title: prompt,
    options: [],
    write: {
      // 动手任务的操作步骤：标题只放一句任务，步骤另列，避免标题过长
      steps: steps ?? [],
      placeholder: placeholder ?? null,
      hint: hint ?? null,
      answer: answer ?? null,
      points: points ?? []
    }
  }
}

/**
 * glossaryTerms：generated.json 里的术语（带 siteTerm / siteCat / siteDemo）；
 * lessons：available 章节（带 activities）；summaries：课程目录，用于回链标题与地址；
 * catalogTerms / topics：术语图鉴现有数据；modules：课程模块（id、title），用于术语页的“学习路线”。
 */
export function buildSiteCatalog({ glossaryTerms, lessons, summaries, catalogTerms, topics, modules = [] }) {
  const aiTopic = topics.find(t => t.slug === AI_TOPIC_SLUG)
  if (!aiTopic) throw new Error('术语图鉴里找不到 AI 组')
  const catalogIds = new Set(catalogTerms.map(t => t.id))
  const aiCats = new Set(aiTopic.sections.map(s => s.cat))
  const { map: termMap, errors } = buildTermMap(glossaryTerms, { catalogIds, aiCats })

  const lessonRef = id => {
    const s = summaries.find(x => x.id === id)
    return s ? { href: `/courses/ai-${s.moduleId}/${s.id}`, title: `第 ${String(s.order).padStart(2, '0')} 课 · ${s.title}` } : null
  }

  const terms = glossaryTerms.filter(t => t.siteCat && termMap[t.id] === t.id).map(t => newCard(t, termMap, lessonRef(t.lesson)))
  const sections = [...aiCats]
    .map(cat => ({ cat, ids: terms.filter(t => t.cat === cat).map(t => t.id) }))
    .filter(s => s.ids.length > 0)

  const practice = []
  const splitLessons = []
  const siteTermOf = (lessonId, where, id) => {
    if (!id) return null
    const mapped = termMap[id]
    if (!mapped) errors.push(`${lessonId} ${where}：term ${id} 不在术语表里，或没有上术语图鉴（缺 site_term / site_cat）`)
    return mapped ?? null
  }
  for (const lesson of lessons) {
    const a = lesson.activities ?? {}
    const questions = a.quiz?.questions ?? []
    const tagged = questions.filter(q => q.term)
    if (tagged.length === 0) continue
    if (tagged.length !== questions.length) {
      errors.push(`${lesson.id}：测验题只有部分带 term（${tagged.length}/${questions.length}），要么全带、要么都不带`)
      continue
    }
    splitLessons.push(lesson.id)
    for (const q of questions) {
      const termId = siteTermOf(lesson.id, `测验 ${q.id}`, q.term)
      if (termId) practice.push(choiceQuestion(lesson.id, q, termId))
    }
    const p = a.practice
    const pTerm = siteTermOf(lesson.id, 'practice', p?.term)
    if (!p?.term) errors.push(`${lesson.id}：已拆分的章节，practice 也要带 term`)
    else if (pTerm) {
      practice.push(writeCard(`ai-${lesson.id}-practice`, pTerm, {
        prompt: p.prompt, steps: p.steps, placeholder: p.placeholder, hint: p.hint, answer: p.explanation, points: p.checklist
      }))
    }
    const sq = a.quiz?.short_question
    const sqTerm = siteTermOf(lesson.id, 'short_question', sq?.term)
    if (sq && !sq.term) errors.push(`${lesson.id}：已拆分的章节，short_question 也要带 term`)
    else if (sqTerm) {
      practice.push(writeCard(`ai-${lesson.id}-short`, sqTerm, {
        prompt: sq.prompt, steps: sq.steps, placeholder: sq.placeholder, hint: null, answer: null, points: sq.rubric
      }))
    }
  }

  // 学习路线：模块 → 课，每课带上教材术语表里属于这一课、已上图鉴的卡片 id（按术语表顺序）。
  // 术语页按它分组，练习页按它筛选；还没写教材术语的课 terms 为空，由网站侧的暂定对应补上。
  const path = modules.map(m => ({
    id: m.id,
    title: m.title,
    lessons: summaries
      .filter(s => s.moduleId === m.id)
      .map(s => ({
        id: s.id,
        order: s.order,
        title: s.title,
        status: s.status ?? null,
        terms: [...new Set(glossaryTerms.filter(t => t.lesson === s.id && termMap[t.id]).map(t => termMap[t.id]))]
      }))
  }))

  // 课程正文里 [文字](term:id) 点开的词，渲染时要能换成网站卡片 id
  return { errors, catalog: { terms, sections, practice, splitLessons, termMap, path } }
}
