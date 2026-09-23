// 内容适配器测试。大部分用临时目录里的模拟教材 + 注入的简化内容工具，
// 不依赖安装任何包；最后一组只读真实母源，确认当前课程规模（不写文件）。
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  buildLearningData,
  generate,
  loadContentLib,
  resolveOptions,
  SCHEMA_VERSION
} from './generate-ai-learning.mjs'

// 模拟内容工具：从 content.json 读入已解析好的母源，规则只保留适配器依赖的部分
const fakeLib = {
  async loadContent(dir) {
    return JSON.parse(await readFile(path.join(dir, 'content.json'), 'utf8'))
  },
  validateContent({ course, lessons }) {
    const errors = []
    if (!course.modules?.length) errors.push('没有模块')
    for (const [id, lesson] of Object.entries(lessons)) {
      if (!lesson.markdown) errors.push(`${id}：缺少 lesson.md`)
      if (!lesson.activities) errors.push(`${id}：缺少 activities.yaml`)
    }
    return errors
  },
  splitSections(markdown) {
    return [...markdown.matchAll(/^## (.+?) \{#([a-z0-9-]+)\}$/gm)].map(m => ({ id: m[2], title: m[1], text: '' }))
  }
}

// 2 个模块共 24 课，前 availableCount 课有正文，其余 planned
function syntheticContent({ availableCount = 4 } = {}) {
  const allIds = Array.from({ length: 24 }, (_, i) => `l${String(i + 1).padStart(2, '0')}`)
  const lessonMeta = (id, i) => ({
    id,
    title: `模拟课 ${id}`,
    status: i < availableCount ? 'available' : 'planned',
    topics: '模拟主题',
    outcome: '模拟目标',
    why: '模拟原因',
    verify: '模拟验证',
    prerequisites: i === 0 ? [] : [allIds[i - 1]],
    estimate: '45 分钟（模拟）'
  })
  const lessons = {}
  for (const id of allIds.slice(0, availableCount)) {
    lessons[id] = {
      markdown: `---\nversion: "t1"\n---\n\n## 第一节 {#one}\n\n模拟正文。\n`,
      activities: { version: 't1', quiz: { questions: [] } }
    }
  }
  return {
    course: {
      version: 'test-1',
      title: '模拟课程',
      review: { content: 'draft', team_access: 'not_open' },
      modules: [
        { id: 'm1', title: '模块一', lessons: allIds.slice(0, 12).map(lessonMeta) },
        { id: 'm2', title: '模块二', lessons: allIds.slice(12).map((id, i) => lessonMeta(id, i + 12)) }
      ]
    },
    glossary: { version: 'test-1', terms: [{ id: 'x', term: '模拟术语', definition: 'd', example: 'e', lesson: 'l01', section: 'one' }] },
    lessons
  }
}

let root
const fixture = async (name, content) => {
  const dir = path.join(root, name)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  if (content) await writeFile(path.join(dir, 'content.json'), JSON.stringify(content))
  return dir
}

before(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'ai-learning-adapter-test-'))
})

after(async () => {
  if (root) await rm(root, { recursive: true, force: true })
})

describe('generate-ai-learning（模拟教材）', () => {
  test('有效母源生成完整数据，计数从母源推导', async () => {
    const sourceDir = await fixture('valid', syntheticContent())
    const data = await buildLearningData({ sourceDir, lib: fakeLib })
    assert.equal(data.schemaVersion, SCHEMA_VERSION)
    assert.equal(data.courseVersion, 'test-1')
    assert.deepEqual(data.review, { content: 'draft', teamAccess: 'not_open' })
    assert.deepEqual(data.counts, { modules: 2, lessons: 24, available: 4, readingReady: 0, planned: 20 })
    assert.deepEqual(data.lessons.map(l => l.id), ['l01', 'l02', 'l03', 'l04'])
    assert.equal(data.lessons[0].sections[0].id, 'one')
    assert.match(data.lessons[0].markdown, /^---\nversion: "t1"/)
    assert.equal(data.glossary.terms[0].id, 'x')
  })

  test('计数跟随母源变化，不写死四课', async () => {
    const sourceDir = await fixture('six', syntheticContent({ availableCount: 6 }))
    const data = await buildLearningData({ sourceDir, lib: fakeLib })
    assert.deepEqual(data.counts, { modules: 2, lessons: 24, available: 6, readingReady: 0, planned: 18 })
  })

  test('planned 章节没有正文，也不带审核通过之类的字段', async () => {
    const sourceDir = await fixture('planned', syntheticContent())
    const data = await buildLearningData({ sourceDir, lib: fakeLib })
    const plannedIds = data.modules.flatMap(m => m.lessons).filter(l => l.status === 'planned').map(l => l.id)
    assert.equal(plannedIds.length, 20)
    for (const id of plannedIds) assert.equal(data.lessons.some(l => l.id === id), false)
    for (const summary of data.modules.flatMap(m => m.lessons)) {
      assert.equal('markdown' in summary, false)
      assert.equal('accepted' in summary, false)
    }
  })

  test('重复生成字节完全一致', async () => {
    const sourceDir = await fixture('repeat', syntheticContent())
    const outputPath = path.join(root, 'repeat-out', 'generated.json')
    await generate({ sourceDir, outputPath, lib: fakeLib })
    const first = await readFile(outputPath)
    await generate({ sourceDir, outputPath, lib: fakeLib })
    const second = await readFile(outputPath)
    assert.ok(first.equals(second))
    assert.deepEqual(await readdir(path.dirname(outputPath)), ['generated.json'])
  })

  test('无效母源失败，且不改动已有生成文件', async () => {
    const outputPath = path.join(root, 'invalid-out', 'generated.json')
    await generate({ sourceDir: await fixture('invalid-base', syntheticContent()), outputPath, lib: fakeLib })
    const previous = await readFile(outputPath)

    const broken = syntheticContent()
    broken.lessons.l02.markdown = null
    await assert.rejects(generate({ sourceDir: await fixture('invalid', broken), outputPath, lib: fakeLib }), /校验失败/)

    const noReview = syntheticContent()
    delete noReview.course.review
    await assert.rejects(generate({ sourceDir: await fixture('no-review', noReview), outputPath, lib: fakeLib }), /review/)

    assert.ok(previous.equals(await readFile(outputPath)))
    assert.deepEqual(await readdir(path.dirname(outputPath)), ['generated.json'])
  })

  test('缺少母源时失败，不创建输出文件', async () => {
    const sourceDir = await fixture('missing')
    const outputPath = path.join(root, 'missing-out', 'generated.json')
    await assert.rejects(generate({ sourceDir, outputPath, lib: fakeLib }))
    await assert.rejects(readFile(outputPath), { code: 'ENOENT' })
  })

  test('本机路径漏进数据时失败', async () => {
    const content = syntheticContent()
    content.lessons.l01.markdown += '\n见 /Users/someone/notes.md\n'
    const sourceDir = await fixture('leak', content)
    await assert.rejects(buildLearningData({ sourceDir, lib: fakeLib }), /本机路径/)
  })

  test('环境变量只接受绝对路径', () => {
    assert.throws(() => resolveOptions({ AI_LEARNING_SOURCE_DIR: 'relative/sources' }), /绝对路径/)
    assert.equal(resolveOptions({ AI_LEARNING_SOURCE_DIR: '/tmp/x' }).sourceDir, '/tmp/x')
  })
})

// 用本仓库真实的校验规则（content-source.mjs），只把读取换成 content.json，走完整个适配器
describe('generate-ai-learning（真实校验规则 + reading_ready）', () => {
  const full = () => ({
    markdown: `---\nversion: "t1"\n---\n\n## 第一节 {#one}\n\n模拟正文。\n`,
    activities: {
      version: 't1',
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
  const reading = id => ({
    markdown: `---\nversion: "r1"\n---\n\n<LessonIntro lesson="${id}" />\n\n## 可读一节 {#read-one}\n\n正文。\n`,
    activities: { version: 'r1', review_status: 'draft', intro: { objectives: ['o'] }, sources: [{ id: 'r1', title: '来源', url: 'https://example.com/r' }] }
  })
  // l01–l04 available，l05 reading_ready，其余 planned
  function strictContent() {
    const c = syntheticContent()
    c.course.modules[0].lessons[4].status = 'reading_ready'
    for (const id of ['l01', 'l02', 'l03', 'l04']) c.lessons[id] = full()
    c.lessons.l05 = reading('l05')
    return c
  }
  let rules
  before(async () => {
    const real = await loadContentLib(resolveOptions({}).contentLibPath)
    rules = { ...real, loadContent: fakeLib.loadContent }
  })

  test('默认内容工具是本仓库的 content-source.mjs，不再指向旧站', () => {
    assert.match(resolveOptions({}).contentLibPath, /\/scripts\/content-source\.mjs$/)
    assert.ok(!resolveOptions({}).contentLibPath.includes('/AI学习站/'))
  })

  test('reading_ready 章节带正文进入生成数据，计数分开', async () => {
    const data = await buildLearningData({ sourceDir: await fixture('reading-ok', strictContent()), lib: rules })
    assert.deepEqual(data.counts, { modules: 2, lessons: 24, available: 5, readingReady: 1, planned: 19 })
    assert.deepEqual(data.lessons.map(l => l.id), ['l01', 'l02', 'l03', 'l04', 'l05'])
    assert.equal(data.modules[0].lessons[4].status, 'reading_ready')
    const l05 = data.lessons.find(l => l.id === 'l05')
    assert.deepEqual(l05.sections.map(s => s.id), ['read-one'])
    assert.equal('quiz' in l05.activities, false)
  })

  test('available 缺测验不会被当成 reading_ready 放行', async () => {
    const c = strictContent()
    delete c.lessons.l03.activities.quiz
    await assert.rejects(buildLearningData({ sourceDir: await fixture('available-no-quiz', c), lib: rules }), /l03：没有测验题/)
  })

  test('planned 章节读到正文、reading_ready 章节没有正文都失败', async () => {
    const extra = strictContent()
    extra.lessons.l06 = reading('l06')
    await assert.rejects(buildLearningData({ sourceDir: await fixture('planned-body', extra), lib: rules }), /l06：不是可读章节（planned），却读到了正文/)
    const missing = strictContent()
    delete missing.lessons.l05
    await assert.rejects(buildLearningData({ sourceDir: await fixture('reading-missing', missing), lib: rules }), /l05：reading_ready 章节没有读到正文/)
  })

  test('reading_ready 带空的评估字段失败，且不覆盖已有生成文件', async () => {
    const outputPath = path.join(root, 'reading-out', 'generated.json')
    await generate({ sourceDir: await fixture('reading-base', strictContent()), outputPath, lib: rules })
    const previous = await readFile(outputPath)
    for (const [key, value] of [['quiz', {}], ['practice', []], ['demo', null]]) {
      const bad = strictContent()
      bad.lessons.l05.activities[key] = value
      await assert.rejects(generate({ sourceDir: await fixture(`reading-${key}`, bad), outputPath, lib: rules }), new RegExp(`不能出现 ${key}`))
    }
    assert.ok(previous.equals(await readFile(outputPath)))
    assert.deepEqual(await readdir(path.dirname(outputPath)), ['generated.json'])
  })
})

// 只读真实母源与现有内容工具，不写文件；确认当前课程规模。
// 前四课固定是 available；后面的课可能正在写（reading_ready），所以不写死 reading_ready 数量。
describe('generate-ai-learning（真实母源，只读）', () => {
  test('当前为 6 个模块 / 24 课，l01–l04 为 available，计数自洽，状态为 draft / not_open', async () => {
    const { sourceDir, contentLibPath } = resolveOptions()
    const lib = await loadContentLib(contentLibPath)
    const data = await buildLearningData({ sourceDir, lib })
    const summaries = data.modules.flatMap(m => m.lessons)
    assert.equal(data.counts.modules, 6)
    assert.equal(data.counts.lessons, 24)
    assert.deepEqual(summaries.filter(l => l.status === 'available').map(l => l.id), ['l01', 'l02', 'l03', 'l04'])
    assert.equal(data.counts.available, 4 + data.counts.readingReady)
    assert.equal(data.counts.available + data.counts.planned, 24)
    assert.deepEqual(data.lessons.map(l => l.id), summaries.filter(l => l.status !== 'planned').map(l => l.id))
    assert.deepEqual(data.review, { content: 'draft', teamAccess: 'not_open' })
    for (const lesson of data.lessons) assert.ok(lesson.sections.length > 0)
  })
})
