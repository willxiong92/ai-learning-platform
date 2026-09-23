// 术语 / 练习接入测试：模拟教材测转换和查错；最后一组读真实 site-catalog.json，只断言结构和编号。
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { buildSiteCatalog, buildTermMap, renderCardDemo } from './ai-site-catalog.mjs'

const demo = { query: ['你问', '一句场景'], steps: [['输入', 'a'], ['模型', 'b'], ['输出', 'c']], foot: '提示' }
const topics = [{ slug: 'ai', sections: [{ cat: 'AI 基础', ids: [] }, { cat: '上下文', ids: [] }] }]
const catalogTerms = [{ id: 'token' }, { id: 'tool-calling' }]
const summaries = [{ id: 'l01', moduleId: 'm1', order: 1, title: '第一课' }]
const glossaryTerms = [
  { id: 'llm', term: '大语言模型', en: 'LLM', definition: '定义', example: '例子', lesson: 'l01', section: 'model', needs: ['token'], siteCat: 'AI 基础', siteDemo: demo },
  { id: 'token', term: 'Token', lesson: 'l01', section: 'model', siteTerm: 'token' },
  { id: 'tool', term: '工具', lesson: 'l01', section: 'tools', siteTerm: 'tool-calling' },
  { id: 'offsite', term: '只在教材里', lesson: 'l01', section: 'map' }
]
const option = (text, feedback) => ({ text, feedback })
const lesson = (overrides = {}) => ({
  id: 'l01',
  activities: {
    quiz: {
      questions: [
        { id: 'q1', term: 'llm', prompt: '题一', answer: 1, reason: '解析一', options: [option('A', '错A'), option('B', '对B')] },
        { id: 'q2', term: 'tool', prompt: '题二', answer: 0, reason: '解析二', options: [option('A', '对A'), option('B', '错B')] }
      ],
      short_question: { term: 'token', prompt: '简答', placeholder: '写这里', rubric: ['要点1', '要点2'] }
    },
    practice: { term: 'llm', prompt: '练一练', steps: ['第一步'], hint: '提示', explanation: '参考', checklist: ['清单1'] },
    ...overrides
  }
})
const build = lessons => buildSiteCatalog({ glossaryTerms, lessons, summaries, catalogTerms, topics })

describe('renderCardDemo', () => {
  test('三格小图，中间一格高亮，文字转义', () => {
    const html = renderCardDemo({ ...demo, foot: '<b>' })
    assert.equal((html.match(/<span/g) ?? []).length, 3)
    assert.equal((html.match(/class="model"/g) ?? []).length, 1)
    assert.ok(html.includes('&lt;b&gt;'))
  })
})

describe('buildTermMap', () => {
  const ctx = { catalogIds: new Set(['token', 'llm-old']), aiCats: new Set(['AI 基础']) }
  test('site_term 与 site_cat 只能填一个', () => {
    const { errors } = buildTermMap([{ id: 'x', siteTerm: 'token', siteCat: 'AI 基础' }], ctx)
    assert.match(errors.join('\n'), /只能填一个/)
  })
  test('未知卡片、非 AI 分类、同名卡片、缺小图都报错', () => {
    const { map, errors } = buildTermMap([
      { id: 'a', siteTerm: 'nope' },
      { id: 'b', siteCat: '前端', siteDemo: demo },
      { id: 'token', siteCat: 'AI 基础', siteDemo: demo },
      { id: 'c', siteCat: 'AI 基础' }
    ], ctx)
    const text = errors.join('\n')
    assert.match(text, /不是术语图鉴里已有的卡片/)
    assert.match(text, /不是术语图鉴 AI 组的分类/)
    assert.match(text, /图鉴里已有同名卡片/)
    assert.match(text, /site_demo 缺失/)
    assert.deepEqual(map, { c: 'c' })
  })
})

describe('buildSiteCatalog（模拟教材）', () => {
  test('新卡、分类、回链与术语映射', () => {
    const { errors, catalog } = build([lesson()])
    assert.deepEqual(errors, [])
    assert.deepEqual(catalog.terms.map(t => t.id), ['llm'])
    const card = catalog.terms[0]
    assert.equal(card.cat, 'AI 基础')
    assert.deepEqual(card.prerequisites, ['token'])
    assert.equal(card.desc, '定义例如：例子')
    assert.equal(card.references[0].href, '/courses/ai-m1/l01#model')
    assert.deepEqual(catalog.sections, [{ cat: 'AI 基础', ids: ['llm'] }])
    assert.deepEqual(catalog.termMap, { llm: 'llm', token: 'token', tool: 'tool-calling' })
  })
  test('选择题和两张「写一写」卡，编号固定', () => {
    const { catalog } = build([lesson()])
    assert.deepEqual(catalog.splitLessons, ['l01'])
    assert.deepEqual(catalog.practice.map(q => q.id), ['ai-l01-q1', 'ai-l01-q2', 'ai-l01-practice', 'ai-l01-short'])
    const [q1, q2, practice, short] = catalog.practice
    assert.deepEqual(q1.options.map(o => [o.id, o.correct, o.feedback]), [['ai-l01-q1-o1', false, '错A'], ['ai-l01-q1-o2', true, '解析一']])
    assert.equal(q2.termId, 'tool-calling')
    assert.equal(practice.kind, 'write')
    assert.deepEqual(practice.write, { steps: ['第一步'], placeholder: null, hint: '提示', answer: '参考', points: ['清单1'] })
    assert.deepEqual(short.write, { steps: [], placeholder: '写这里', hint: null, answer: null, points: ['要点1', '要点2'] })
    assert.equal(short.termId, 'token')
  })
  test('题目都不带 term 的章节不拆分', () => {
    const plain = lesson()
    for (const q of plain.activities.quiz.questions) delete q.term
    const { errors, catalog } = build([plain])
    assert.deepEqual(errors, [])
    assert.deepEqual(catalog.splitLessons, [])
    assert.deepEqual(catalog.practice, [])
  })
  test('只有部分题带 term 报错', () => {
    const partial = lesson()
    delete partial.activities.quiz.questions[1].term
    assert.match(build([partial]).errors.join('\n'), /只有部分带 term（1\/2）/)
  })
  test('已拆分章节缺 practice / short_question 的 term 报错', () => {
    const l = lesson()
    delete l.activities.practice.term
    delete l.activities.quiz.short_question.term
    const text = build([l]).errors.join('\n')
    assert.match(text, /practice 也要带 term/)
    assert.match(text, /short_question 也要带 term/)
  })
  test('学习路线：模块 → 课 → 本课已上图鉴的卡片', () => {
    const { catalog } = buildSiteCatalog({ glossaryTerms, lessons: [lesson()], summaries, catalogTerms, topics, modules: [{ id: 'm1', title: '模块一' }] })
    assert.equal(catalog.path.length, 1)
    assert.equal(catalog.path[0].title, '模块一')
    assert.deepEqual(catalog.path[0].lessons.map(l => l.id), ['l01'])
    assert.ok(catalog.path[0].lessons[0].terms.every(id => Object.values(catalog.termMap).includes(id)))
  })
  test('题目指向没上图鉴的词报错', () => {
    const l = lesson()
    l.activities.quiz.questions[0].term = 'offsite'
    assert.match(build([l]).errors.join('\n'), /l01 测验 q1：term offsite/)
  })
})

const CATALOG = new URL('../src/lib/ai-learning/site-catalog.json', import.meta.url)
const hasCatalog = await access(CATALOG).then(() => true, () => false)

describe('真实 site-catalog.json', { skip: hasCatalog ? false : '缺少 site-catalog.json，先运行 npm run content:ai' }, () => {
  test('l01–l04 已拆分：16 张新卡、32 道练习，编号稳定', async () => {
    const data = JSON.parse(await readFile(CATALOG, 'utf8'))
    assert.deepEqual(data.splitLessons, ['l01', 'l02', 'l03', 'l04'])
    assert.deepEqual(data.terms.map(t => t.id).sort(), [
      'baseline', 'context', 'context-pack', 'example', 'fresh-sample', 'inference', 'llm', 'material-conflict',
      'memory', 'single-variable', 'source-label', 'stale-material', 'success-criteria', 'task-brief', 'training',
      'verification-table'
    ])
    const suffixes = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'practice', 'short']
    assert.deepEqual(data.practice.map(q => q.id), ['l01', 'l02', 'l03', 'l04'].flatMap(l => suffixes.map(x => `ai-${l}-${x}`)))
    assert.deepEqual(data.path.map(m => m.id), ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'])
    assert.equal(data.path.flatMap(m => m.lessons).length, 24)
    // l01 比原来的 10 张多出 3 张：AI Agent / Agent 循环 / 运行框架工程三词复用图鉴里已有的旧卡，不新建卡片
    assert.deepEqual(data.path[0].lessons.map(l => l.terms.length), [13, 4, 4, 4])
    const l01Terms = data.path[0].lessons[0].terms
    for (const id of ['ai-agent', 'agent-loop', 'harness-engineering']) assert.ok(l01Terms.includes(id), `l01 缺少复用旧卡 ${id}`)
    assert.equal(new Set(l01Terms).size, l01Terms.length, 'l01 terms 有重复')
    for (const q of data.practice) {
      if (q.id === 'ai-l01-practice') assert.ok(q.write.steps.length > 0, '动手任务缺少操作步骤')
      if (q.kind === 'write') assert.ok(q.write.points.length > 0, `${q.id} 没有对照要点`)
      else assert.equal(q.options.filter(o => o.correct).length, 1, `${q.id} 正确答案不是恰好一个`)
    }
  })
})
