// 教材校验测试：原 available 完整校验保持不变；reading_ready 只放行“正文可读、练习待编”，
// 每条门禁都用一份具体的坏数据证明会拦下。只有最后一组读写临时目录（用旧站已安装的 yaml 包）。
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadContent, splitSections, validateContent } from './content-source.mjs'

const ids = Array.from({ length: 24 }, (_, i) => `l${String(i + 1).padStart(2, '0')}`)

const fullLesson = id => ({
  markdown: `---\nlesson: ${id}\nversion: "t1"\n---\n\n## 第一节 {#one}\n\n模拟正文。\n\n<Cite lesson="${id}" ids="s1" />\n`,
  activities: {
    version: 't1',
    review_status: 'draft',
    intro: { objectives: ['模拟目标'] },
    sources: [{ id: 's1', title: '来源', url: 'https://example.com/a' }],
    quiz: {
      rule: { min_correct: 1 },
      questions: [{ id: 'q1', section: 'one', prompt: '题', options: [{ text: '对' }, { text: '错', feedback: '错因' }], answer: 0, reason: '解析' }],
      short_question: { prompt: '简答', rubric: ['要点'] }
    },
    demo: { steps: [{ title: '一步' }] },
    practice: { explanation: '练习解析' },
    feedback: { checks: ['检查'] }
  }
})

const READING_MD = id => `---
lesson: ${id}
version: "r1"
---

# 第 05 课 · 模拟可读课

<LessonIntro lesson="${id}" />

## 可读一节 {#read-one}

模拟正文，[模型](term:y) 可以点开。

::: figure flow 模拟流程 | 解释用
- 第一步 | 说明
- 第二步 | 说明
:::

<Cite lesson="${id}" ids="r1" />

## 可读二节 {#read-two}

更多正文。

<SourceList lesson="${id}" />

<NextStep lesson="${id}" />
`

const readingLesson = id => ({
  markdown: READING_MD(id),
  activities: {
    version: 'r1',
    review_status: 'draft',
    intro: { objectives: ['模拟目标'] },
    sources: [{ id: 'r1', title: '可读来源', url: 'https://example.com/r' }]
  }
})

// 24 课：l01–l04 available（完整练习），reading 里列出的课为 reading_ready，其余 planned
function content({ reading = ['l05'] } = {}) {
  const status = (id, i) => (i < 4 ? 'available' : reading.includes(id) ? 'reading_ready' : 'planned')
  const meta = (id, i) => ({
    id, title: `模拟课 ${id}`, status: status(id, i), outcome: 'o', why: 'w', verify: 'v', estimate: '45 分钟',
    prerequisites: i === 0 ? [] : [ids[i - 1]]
  })
  const lessons = {}
  ids.forEach((id, i) => {
    if (status(id, i) === 'available') lessons[id] = fullLesson(id)
    if (status(id, i) === 'reading_ready') lessons[id] = readingLesson(id)
  })
  return {
    course: { modules: [{ id: 'm1', lessons: ids.slice(0, 12).map(meta) }, { id: 'm2', lessons: ids.slice(12).map((id, i) => meta(id, i + 12)) }] },
    glossary: {
      terms: [
        { id: 'x', term: '术语一', definition: 'd', example: 'e', lesson: 'l01', section: 'one' },
        { id: 'y', term: '术语二', definition: 'd', example: 'e', needs: ['x'], lesson: 'l05', section: 'read-one' }
      ]
    },
    lessons
  }
}

const errorsOf = mutate => {
  const c = content()
  mutate(c)
  return validateContent(c)
}
const assertRejected = (mutate, pattern) => {
  const errors = errorsOf(mutate)
  assert.ok(errors.some(e => pattern.test(e)), `应被拦下（${pattern}），实际错误：${JSON.stringify(errors)}`)
}

describe('available：原完整校验不变', () => {
  test('只有 4 课 available、无 reading_ready 的完整教材通过', () => {
    const c = content({ reading: [] })
    c.glossary.terms.pop()
    assert.deepEqual(validateContent(c), [])
  })

  test('available 缺测验、练习、演示、反馈都失败，不会被当成 reading_ready 放行', () => {
    assertRejected(c => { delete c.lessons.l02.activities.quiz }, /l02：没有测验题/)
    assertRejected(c => { delete c.lessons.l02.activities.practice }, /l02：练习缺少解析/)
    assertRejected(c => { delete c.lessons.l02.activities.demo }, /l02：缺少演示步骤/)
    assertRejected(c => { delete c.lessons.l02.activities.feedback }, /l02：缺少教材反馈检查项/)
  })

  test('没有任何 available 章节时失败（全部 reading_ready 也不行）', () => {
    assertRejected(c => {
      for (const m of c.course.modules) for (const l of m.lessons) if (l.status === 'available') l.status = 'reading_ready'
      for (const id of ['l01', 'l02', 'l03', 'l04']) c.lessons[id] = readingLesson(id)
    }, /没有任何可学习章节/)
  })

  test('未知状态失败', () => {
    assertRejected(c => { c.course.modules[0].lessons[5].status = 'ready' }, /l06 状态无效 ready/)
  })
})

describe('reading_ready：正文可读，练习待编', () => {
  test('合法的 reading_ready 章节通过（含 ::: figure 图示和术语回链）', () => {
    assert.deepEqual(validateContent(content()), [])
  })

  const assessmentValues = [
    ['quiz', {}],
    ['quiz', { questions: [] }],
    ['practice', []],
    ['practice', {}],
    ['demo', null],
    ['demo', { steps: [] }]
  ]
  for (const [key, value] of assessmentValues) {
    test(`评估字段 ${key}=${JSON.stringify(value)} 即使为空也拒绝`, () => {
      assertRejected(c => { c.lessons.l05.activities[key] = value }, new RegExp(`l05：.*不能出现 ${key}`))
    })
  }

  for (const name of ['GuidedPractice', 'ContrastDemo', 'ReadMark']) {
    test(`正文里用 <${name}> 失败`, () => {
      assertRejected(c => { c.lessons.l05.markdown += `\n<${name} lesson="l05" />\n` }, new RegExp(`不能用需要练习数据的组件 <${name}>`))
    })
  }

  test('正文链接练习页失败（Markdown 链接和 href 两种写法）', () => {
    assertRejected(c => { c.lessons.l05.markdown += '\n去[练习](/practice?scope=ai)\n' }, /l05：reading_ready 正文不能链接练习页/)
    assertRejected(c => { c.lessons.l05.markdown += '\n<a href="/practice">练习</a>\n' }, /l05：reading_ready 正文不能链接练习页/)
  })

  test('来源为空、缺失、不是 https、缺 id 都失败', () => {
    assertRejected(c => { c.lessons.l05.activities.sources = [] }, /l05：reading_ready 章节至少要有一条来源/)
    assertRejected(c => { delete c.lessons.l05.activities.sources }, /l05：reading_ready 章节至少要有一条来源/)
    assertRejected(c => { c.lessons.l05.activities.sources[0].url = 'http://example.com/r' }, /l05：来源 r1 不是 https 链接/)
    assertRejected(c => { c.lessons.l05.activities.sources.push({ title: '无 id', url: 'https://example.com/z' }) }, /l05：第 2 条来源缺少 id/)
  })

  test('小节锚点重复或写法不合法失败', () => {
    assertRejected(c => { c.lessons.l05.markdown = c.lessons.l05.markdown.replace('{#read-two}', '{#read-one}') }, /l05：小节锚点重复 #read-one/)
    assertRejected(c => { c.lessons.l05.markdown = c.lessons.l05.markdown.replace('{#read-two}', '{#Read_Two}') }, /l05：小节锚点写法不合法/)
  })

  test('术语回链断开失败：小节不存在、或指向 planned 章节', () => {
    assertRejected(c => { c.glossary.terms[1].section = 'nope' }, /术语：y 指向的小节 nope 在 l05 正文中不存在/)
    assertRejected(c => { c.glossary.terms[1].lesson = 'l06' }, /术语：y 指向的章节 l06 不可学习或不存在/)
  })

  test('缺 intro、review_status 无效、版本不一致、来源引用不存在都失败', () => {
    assertRejected(c => { delete c.lessons.l05.activities.intro }, /l05：reading_ready 章节缺少学前说明 intro/)
    assertRejected(c => { c.lessons.l05.activities.intro = [] }, /缺少学前说明 intro/)
    assertRejected(c => { c.lessons.l05.activities.review_status = 'approved' }, /l05：review_status 只能是 draft 或 reviewed/)
    assertRejected(c => { c.lessons.l05.activities.version = 'r2' }, /l05：lesson\.md 与 activities\.yaml 的 version 不一致/)
    assertRejected(c => { c.lessons.l05.markdown += '\n<Cite lesson="l05" ids="nope" />\n' }, /l05：正文引用了不存在的来源 nope/)
    assertRejected(c => { c.lessons.l05.markdown += '\n<Cite lesson="l09" ids="r1" />\n' }, /l05：组件的 lesson 属性写成了 l09/)
  })

  test('先修关系全局检查照常：指向后面的章节失败', () => {
    assertRejected(c => { c.course.modules[0].lessons[4].prerequisites = ['l06'] }, /l05 的先修 l06 排在它之后/)
  })
})

describe('splitSections', () => {
  test('按 {#id} 切小节，文件头和注释不算正文', () => {
    const sections = splitSections(READING_MD('l05').replace('## 可读二节', '<!-- ## 注释 {#hidden} -->\n## 可读二节'))
    assert.deepEqual(sections.map(s => s.id), ['read-one', 'read-two'])
    assert.ok(!sections[0].text.includes('<Cite'))
  })
})

describe('loadContent（临时目录）', () => {
  let root
  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'ai-content-source-'))
  })
  after(async () => {
    if (root) await rm(root, { recursive: true, force: true })
  })

  test('available 和 reading_ready 读正文，planned 即使有文件也不读', async () => {
    const c = content()
    // JSON 也是合法 YAML，这里直接写 JSON，避免测试依赖 YAML 写法
    await writeFile(path.join(root, 'course.yaml'), JSON.stringify(c.course))
    await writeFile(path.join(root, 'glossary.yaml'), JSON.stringify(c.glossary))
    for (const [id, lesson] of Object.entries({ ...c.lessons, l06: readingLesson('l06') })) {
      await mkdir(path.join(root, 'lessons', id), { recursive: true })
      await writeFile(path.join(root, 'lessons', id, 'lesson.md'), lesson.markdown)
      await writeFile(path.join(root, 'lessons', id, 'activities.yaml'), JSON.stringify(lesson.activities))
    }
    const loaded = await loadContent(root)
    assert.deepEqual(Object.keys(loaded.lessons).sort(), ['l01', 'l02', 'l03', 'l04', 'l05'])
    assert.equal(loaded.lessons.l05.markdown, READING_MD('l05'))
    assert.equal(loaded.lessons.l05.activities.version, 'r1')
    assert.deepEqual(validateContent(loaded), [])
  })
})
