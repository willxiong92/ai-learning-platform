// 正文渲染测试。用本机已安装的 VitePress 渲染器（和正式渲染同一个），
// 大部分用模拟教材；最后一组读已生成的 generated.json，只断言数量和结构，不打印正文。
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  assertSafeHtml,
  cleanVitepressHtml,
  DEFAULT_INPUT,
  FIGURE_KINDS,
  KNOWN_COMPONENTS,
  loadMarkdownRenderer,
  renderLearningData,
  renderTermArticle,
  renderTermLinks,
  resolveRenderOptions,
  serialize,
  writeRendered
} from './render-ai-learning.mjs'

const MARKDOWN = `---
lesson: l01
version: "t1"
---

<!-- 作者注释：/Users/someone/lesson.md 不应出现在页面里 -->

# 第 01 课 · 模拟课

<LessonIntro lesson="l01" />

## 00 先认识这些词 {#terms}

<TermCards lesson="l01" />

## 01 第一节 {#one}

::: info 你可能会问
“模拟问题？”
:::

| 说法 | 判断 |
|---|---|
| 模拟说法 | 正确 |

<figure class="lesson-figure" aria-labelledby="fig-a">
  <figcaption id="fig-a">图 1 · 模拟图</figcaption>
  <ol class="flow">
    <li><b>第一步</b><span>说明</span></li>
  </ol>
  <div class="box-part">部件<small>小字</small></div>
</figure>

\`\`\`text
【目标】模拟代码块内容
\`\`\`

::: details 模拟例子
折叠内容。
:::

<Cite lesson="l01" ids="s1 s2" />

## 02 演示 {#demo}

<ContrastDemo lesson="l01" />

## 03 练习 {#practice}

<GuidedPractice lesson="l01" />

<ReadMark lesson="l01" />

<SourceList lesson="l01" />

<NextStep lesson="l01" />
`

function syntheticData(markdown = MARKDOWN) {
  const summary = (id, order, status) => ({
    id,
    moduleId: 'm1',
    order,
    title: `模拟课 ${id}`,
    status,
    topics: null,
    outcome: '模拟目标',
    why: '模拟原因',
    verify: '模拟验证',
    prerequisites: [],
    estimate: '45 分钟（模拟）'
  })
  return {
    schemaVersion: 1,
    courseVersion: 'test-1',
    modules: [{ id: 'm1', title: '模块一', purpose: null, lessons: [summary('l01', 1, 'available'), summary('l02', 2, 'planned')] }],
    glossary: {
      version: 't',
      terms: [
        { id: 'model', term: '模型', en: 'Model', aliases: [], definition: '模拟定义', example: '模拟例子', needs: [], lesson: 'l01', section: 'one' },
        { id: 'app', term: '应用', en: null, aliases: ['软件'], definition: '模拟定义', example: '模拟例子', needs: ['model'], lesson: 'l01', section: 'one' }
      ]
    },
    lessons: [
      {
        id: 'l01',
        moduleId: 'm1',
        version: 't1',
        markdown,
        sections: [
          { id: 'terms', title: '00 先认识这些词', text: '' },
          { id: 'one', title: '01 第一节', text: '' },
          { id: 'demo', title: '02 演示', text: '' },
          { id: 'practice', title: '03 练习', text: '' }
        ],
        activities: {
          version: 't1',
          review_status: 'draft',
          intro: { objectives: ['模拟目标一'], prerequisite: '无', duration: '45 分钟', plan: '模拟安排', simulation_note: '模拟说明' },
          sources: [
            { id: 's1', title: '来源一', url: 'https://example.com/a', supports: '支撑一', checked: '2026-09-18' },
            { id: 's2', title: '来源二', url: 'https://example.com/b', supports: '支撑二', checked: '2026-09-18' }
          ],
          demo: { title: '模拟演示', note: '模拟提示', steps: [{ title: '第一步', input: '模拟输入', output: '第一行\n第二行\n', why: '模拟原因' }] },
          practice: { prompt: '模拟练习题', placeholder: '模拟占位', hint: '模拟提示', explanation: '模拟解析', checklist: ['自查一'] },
          quiz: { questions: [{ id: 'q1' }, { id: 'q2' }], short_question: { prompt: '模拟简答' } }
        }
      }
    ]
  }
}

const withBody = body => syntheticData(MARKDOWN.replace('## 02 演示 {#demo}', `${body}\n\n## 02 演示 {#demo}`))

const READING_MARKDOWN = `---
lesson: l02
version: "r1"
---

# 第 02 课 · 模拟可读课

<LessonIntro lesson="l02" />

## 01 可读一节 {#read-one}

模拟正文。

::: figure flow 模拟流程 | 解释用
- 第一步 | 说明
- 第二步 | 说明
:::

<Cite lesson="l02" ids="r1" />

<SourceList lesson="l02" />

<NextStep lesson="l02" />
`

// l01 仍是完整 available；l02 改成 reading_ready，带正文但没有任何评估字段
function readingData(markdown = READING_MARKDOWN, activities = {}) {
  const data = syntheticData()
  data.modules[0].lessons[1].status = 'reading_ready'
  data.lessons.push({
    id: 'l02',
    moduleId: 'm1',
    version: 'r1',
    markdown,
    sections: [{ id: 'read-one', title: '01 可读一节', text: '' }],
    activities: {
      version: 'r1',
      review_status: 'draft',
      intro: { objectives: ['模拟目标'] },
      sources: [{ id: 'r1', title: '可读来源', url: 'https://example.com/r' }],
      ...activities
    }
  })
  return data
}
const readingBody = body => readingData(READING_MARKDOWN.replace('<SourceList lesson="l02" />', `${body}\n\n<SourceList lesson="l02" />`))

let md
let dispose

before(async () => {
  ;({ md, dispose } = await loadMarkdownRenderer(resolveRenderOptions().vitepressDir))
})

after(() => dispose?.())

describe('resolveRenderOptions', () => {
  test('只接受绝对路径', () => {
    assert.throws(() => resolveRenderOptions({ AI_LEARNING_VITEPRESS_DIR: 'relative/vitepress' }), /绝对路径/)
    assert.equal(resolveRenderOptions({ AI_LEARNING_VITEPRESS_DIR: '/tmp/vp' }).vitepressDir, '/tmp/vp')
  })
})

describe('renderLearningData（模拟教材）', () => {
  test('保留表格、图示、代码块和提示框，展开全部组件', () => {
    const { html } = renderLearningData({ data: syntheticData(), md }).lessons[0]
    assert.match(html, /<table/)
    assert.match(html, /<figure class="lesson-figure" aria-labelledby="fig-a">/)
    assert.match(html, /<figcaption id="fig-a">图 1 · 模拟图<\/figcaption>/)
    assert.match(html, /<pre[^>]*>[\s\S]*模拟代码块内容/)
    assert.match(html, /你可能会问/)
    assert.match(html, /<details[^>]*>\s*<summary>模拟例子<\/summary>/)
    for (const name of KNOWN_COMPONENTS) assert.ok(!html.includes(`<${name}`), `${name} 没有展开`)
    assert.ok(!html.includes('ai-learning-slot'))
    for (const cls of ['ai-course-chapter-info', 'ai-learning-terms', 'ai-learning-cite', 'ai-learning-demo', 'ai-learning-practice', 'ai-learning-status', 'ai-learning-sources', 'ai-learning-next']) {
      assert.ok(html.includes(`class="${cls}"`), `缺少 ${cls}`)
    }
  })

  test('引用、术语、锚点和状态说明照实输出', () => {
    const { html, sections, reviewStatus } = renderLearningData({ data: syntheticData(), md }).lessons[0]
    assert.equal(reviewStatus, 'draft')
    assert.deepEqual(sections.map(s => s.id), ['terms', 'one', 'demo', 'practice'])
    for (const id of ['terms', 'one', 'demo', 'practice', 'source-s1', 'source-s2', 'term-model', 'term-app']) {
      assert.ok(html.includes(`id="${id}"`), `缺少锚点 ${id}`)
    }
    assert.match(html, /href="#source-s1">\[s1\] 来源一<\/a>；<a href="#source-s2">/)
    assert.match(html, /<a href="https:\/\/example\.com\/a" target="_blank" rel="noopener noreferrer">来源一<\/a>/)
    assert.match(html, /<a href="#term-model">模型<\/a>/)
    assert.match(html, /内容草稿 · 待本人试学/)
    assert.match(html, /完成本章测验（2 道单选、1 道简答）：<a href="#assessment">去标记已读与测验<\/a>/)
    assert.match(html, /只保存在当前浏览器，需要启用 JavaScript/)
    assert.match(html, /此练习没有在线作答框/)
    // 课内链接直接指向 /courses 课程页，不再依赖旧 /learning 跳转
    assert.match(html, /<a href="\/courses">返回课程列表<\/a>/)
    assert.ok(!html.includes('href="/learning'), '残留旧 /learning 链接')
    assert.ok(!html.includes('尚未接入') && !html.includes('本页是只读版'), '残留过时的只读说明')
    assert.match(html, /第 02 课 · 模拟课 l02（待编写，暂无正文）/)
    assert.match(html, /<details class="ai-learning-details"><summary>查看解析<\/summary><p class="ai-learning-multiline">模拟解析<\/p><\/details>/)
    assert.match(html, /第一行\n第二行/)
    assert.ok(!html.includes('/Users/') && !html.includes('lesson.md'), '作者注释漏进页面')
  })

  test('章节版式：小节包成 section，锚点在 section 上，导语和本章信息在章首', () => {
    const body = MARKDOWN.replace('<ReadMark lesson="l01" />', '## 本章总结 {#summary}\n\n- 模拟总结\n\n<ReadMark lesson="l01" />')
    const data = syntheticData(body)
    data.lessons[0].sections.push({ id: 'summary', title: '本章总结', text: '' })
    const { html } = renderLearningData({ data, md }).lessons[0]
    assert.match(html, /<h1[^>]*>第 01 课 · 模拟课/, '只去掉“第 NN 章 · ”，别的写法不动')
    assert.match(html, /^<div class="ai-course-chapter-head">\n<h1/)
    assert.match(html, /<p class="course-chapter-intro">模拟原因<\/p>\n<details class="ai-course-chapter-info">\n<summary>本章信息<\/summary>/)
    assert.match(html, /<dt>教材状态<\/dt><dd>内容草稿 · 待本人试学 · 教材版本 t1<\/dd>/)
    for (const id of ['terms', 'one', 'demo', 'practice']) {
      assert.match(html, new RegExp(`<section class="course-lesson-section" id="${id}">\\n<h2 tabindex="-1">`), `小节 ${id} 没有包好`)
    }
    assert.match(html, /<section class="course-lesson-section course-section-summary" id="summary">/)
    // 读完标记、来源、下一步在总结框之后
    const summaryEnd = html.indexOf('</section>', html.indexOf('id="summary"'))
    assert.ok(summaryEnd < html.indexOf('class="ai-learning-status"'), '读完标记被包进了总结框')
    assert.equal((html.match(/<section class="course-lesson-section/g) ?? []).length, 5)
  })

  test('标题里的“第 NN 章 · ”前缀去掉，章号只在页头显示', () => {
    const { html } = renderLearningData({ data: syntheticData(MARKDOWN.replace('# 第 01 课 · 模拟课', '# 第 01 章 · 模拟章')), md }).lessons[0]
    assert.match(html, /<h1 id="[^"]*" tabindex="-1">模拟章 /)
  })

  test('同样输入两次渲染结果完全一致', () => {
    const a = serialize(renderLearningData({ data: syntheticData(), md }))
    const b = serialize(renderLearningData({ data: syntheticData(), md }))
    assert.equal(a, b)
  })

  const malicious = [
    ['script 标签', '<script>alert(1)</script>', /不允许的标签 <script>/],
    ['iframe', '<iframe class="x"></iframe>', /不允许的标签 <iframe>/],
    ['事件属性', '<div class="a" onclick="alert(1)">x</div>', /事件属性 onclick/],
    ['javascript 链接', '[点我](javascript:alert(1))', /javascript:/],
    ['img 标签', '<img class="x">', /不允许的标签 <img>/],
    ['无引号属性', '<div class=x>y</div>', /属性写法无法识别/],
    ['Vue 插值', '{{ secret }}', /Vue 插值/],
    ['style 属性', '<div style="color:red">x</div>', /不允许的属性 style/]
  ]
  for (const [name, body, pattern] of malicious) {
    test(`拒绝恶意或不认识的正文：${name}`, () => {
      assert.throws(() => renderLearningData({ data: withBody(body), md }), pattern)
    })
  }

  test('拒绝未知组件、写错的 lesson 属性和不存在的来源', () => {
    assert.throws(() => renderLearningData({ data: withBody('<QuizBox lesson="l01" />'), md }), /未知组件 <QuizBox>/)
    assert.throws(() => renderLearningData({ data: withBody('<ReadMark lesson="l09" />'), md }), /lesson 属性写成了 l09/)
    assert.throws(() => renderLearningData({ data: withBody('<Cite lesson="l01" ids="s9" />'), md }), /不存在的来源 s9/)
    assert.throws(() => renderLearningData({ data: withBody('行内 <TermCards lesson="l01" /> 组件'), md }), /未知或写法不对的组件/)
  })

  test('回归：代码块上的 v-pre 只在渲染器输出阶段去掉，正文里的 Vue 指令仍被拒绝', () => {
    const { html } = renderLearningData({ data: syntheticData(), md }).lessons[0]
    assert.match(html, /<pre[^>]*>/)
    assert.ok(!/v-pre/.test(html), '输出里残留 v-pre')
    assert.equal(cleanVitepressHtml('<pre class="shiki" tabindex="0" v-pre=""><code>x</code></pre>'), '<pre class="shiki" tabindex="0"><code>x</code></pre>')
    assert.equal(cleanVitepressHtml('<pre class="shiki" v-pre><code>x</code></pre>'), '<pre class="shiki"><code>x</code></pre>')
    // 只处理 <pre>：其他元素上的 v-pre 不被清掉，会被输出白名单拦下
    assert.throws(() => assertSafeHtml(cleanVitepressHtml('<div v-pre="">x</div>'), 't'), /不允许的属性 v-pre/)
    assert.throws(() => renderLearningData({ data: withBody('<div v-pre="">x</div>'), md }), /不允许的属性 v-pre/)
    assert.throws(() => renderLearningData({ data: withBody('<div v-html="x">y</div>'), md }), /不允许的属性 v-html/)
  })

  test('小节锚点缺失时失败', () => {
    const data = syntheticData()
    data.lessons[0].sections.push({ id: 'missing', title: '不存在', text: '' })
    assert.throws(() => renderLearningData({ data, md }), /#missing/)
  })
})

describe('reading_ready：正文可读，练习待编', () => {
  test('渲染正文和醒目说明，没有练习、演示、测验和读完标记', () => {
    const { html, sections } = renderLearningData({ data: readingData(), md }).lessons.find(l => l.id === 'l02')
    assert.deepEqual(sections.map(s => s.id), ['read-one'])
    assert.match(html, /<p class="ai-learning-note ai-learning-reading-ready"><b>正文可读 · 练习待编<\/b>/)
    assert.match(html, /class="course-inline-visual ai-figure is-flow"/)
    assert.match(html, /<li id="source-r1">/)
    for (const cls of ['ai-learning-practice', 'ai-learning-demo', 'ai-learning-status']) assert.ok(!html.includes(cls), `残留 ${cls}`)
    assert.ok(!html.includes('#assessment') && !html.includes('href="/practice'), '出现了测验或练习入口')
    assert.match(html, /这是课程的最后一课/)
  })

  test('上一课的下一步能跳到 reading_ready 课，标签照实写“正文可读·练习待编”', () => {
    const l01 = renderLearningData({ data: readingData(), md }).lessons.find(l => l.id === 'l01')
    assert.match(l01.html, /下一课：<a href="\/courses\/ai-m1\/l02">第 02 课 · 模拟课 l02<\/a>（正文可读·练习待编）/)
    assert.ok(!l01.html.includes('l02（待编写'))
  })

  test('available 课不出现 reading_ready 说明', () => {
    const l01 = renderLearningData({ data: readingData(), md }).lessons.find(l => l.id === 'l01')
    assert.ok(!l01.html.includes('ai-learning-reading-ready'))
  })

  for (const name of ['GuidedPractice', 'ContrastDemo', 'ReadMark']) {
    test(`正文用 <${name}> 失败`, () => {
      assert.throws(() => renderLearningData({ data: readingBody(`<${name} lesson="l02" />`), md }), new RegExp(`l02：reading_ready 章节练习待编，正文不能用 <${name}>`))
    })
  }

  for (const [key, value] of [['quiz', {}], ['practice', null], ['demo', { steps: [] }]]) {
    test(`activities 带 ${key}（即使为空）失败`, () => {
      assert.throws(() => renderLearningData({ data: readingData(READING_MARKDOWN, { [key]: value }), md }), new RegExp(`activities 不能出现 ${key}`))
    })
  }

  test('链接练习页、缺 <LessonIntro> 都失败', () => {
    assert.throws(() => renderLearningData({ data: readingBody('去[练习](/practice?scope=ai)'), md }), /正文不能链接练习页/)
    assert.throws(() => renderLearningData({ data: readingData(READING_MARKDOWN.replace('<LessonIntro lesson="l02" />', '')), md }), /要有 <LessonIntro>/)
  })

  test('planned 章节带正文仍失败', () => {
    const data = readingData()
    data.modules[0].lessons[1].status = 'planned'
    assert.throws(() => renderLearningData({ data, md }), /l02：课程地图里不是可读章节/)
  })

  test('reading_ready 输入不合格时保留上一次输出', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ai-learning-render-rr-'))
    try {
      const outputPath = path.join(dir, 'rendered.json')
      await writeFile(outputPath, 'previous\n', 'utf8')
      await assert.rejects(writeRendered({ data: readingData(READING_MARKDOWN, { quiz: {} }), md, outputPath }))
      assert.equal(await readFile(outputPath, 'utf8'), 'previous\n')
      assert.deepEqual(await readdir(dir), ['rendered.json'])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('通用图示 ::: figure', () => {
  const figureBody = {
    flow: '::: figure flow 流程标题 | 副标题\n- 第一步 | 说明一\n- 第二步 | 说明二\n- **第三步**\n注：图下说明\n:::',
    compare: '::: figure compare 对比标题\n[左] 左边 | 小字\n- 左要点\n[右] 右边\n- 右要点一\n- 右要点二\n:::',
    'before-after': '::: figure before-after 改前改后 | 副标题\n[改前] 原来\n- 旧写法 | 太笼统\n> 帮我改一下\n[改后] 现在\n- 新写法 | 说清对象和范围\n:::',
    chat: '::: figure chat 对话标题\n我：帮我总结本周进展\nAI：请先提供本周记录\n:::',
    checklist: '::: figure checklist 检查清单\n- 给了什么材料 | 列出来\n- 调用了什么工具\n:::'
  }

  test('五种图示都输出模板的结构和样式类', () => {
    assert.deepEqual(Object.keys(figureBody).sort(), [...FIGURE_KINDS].sort())
    const body = Object.values(figureBody).join('\n\n')
    const { html } = renderLearningData({ data: withBody(body), md }).lessons[0]
    assert.match(html, /<figure class="course-inline-visual ai-figure is-flow"><figcaption><strong>流程标题<\/strong><span>副标题<\/span><\/figcaption><ol class="course-inline-flow has-3"><li><strong>第一步<\/strong><span>说明一<\/span><\/li>/)
    assert.match(html, /<li><strong><b>第三步<\/b><\/strong><\/li><\/ol><p class="ai-figure-note">图下说明<\/p><\/figure>/)
    assert.match(html, /<div class="course-inline-compare"><section class="is-left"><div><strong>左边<\/strong><span>小字<\/span><\/div><ul><li>左要点<\/li><\/ul><\/section><section class="is-right"><div><strong>右边<\/strong><\/div>/)
    assert.match(html, /<small>原来<\/small><div class="course-before-after-card is-problem">[\s\S]*?<p class="course-before-after-say">对 AI 说：<strong>帮我改一下<\/strong><\/p>/)
    assert.match(html, /<small class="is-after">现在<\/small><div class="course-before-after-card is-fixed">/)
    assert.match(html, /<div class="course-chat-flow"><div class="is-user"><i aria-hidden="true">我<\/i><p>帮我总结本周进展<\/p><\/div><div class="is-agent"><i aria-hidden="true">AI<\/i>/)
    assert.match(html, /<div class="course-checklist"><ol><li><i aria-hidden="true">1<\/i><div><b>给了什么材料<\/b><span>列出来<\/span><\/div><\/li>/)
    assert.ok(!html.includes(':::'), '图示语法漏进页面')
  })

  test('图示里的文字按纯文本转义', () => {
    const { html } = renderLearningData({ data: withBody('::: figure checklist A & B\n- "引号" & 符号\n:::'), md }).lessons[0]
    assert.match(html, /<strong>A &amp; B<\/strong>/)
    assert.match(html, /<b>&quot;引号&quot; &amp; 符号<\/b>/)
  })

  const broken = [
    ['未知种类', '::: figure pie 标题\n- a\n:::', /图示种类只能是/],
    ['没有结束', '::: figure flow 标题\n- a\n- b', /没有用 ::: 结束/],
    ['流程只有一步', '::: figure flow 标题\n- a\n:::', /2–5 步/],
    ['条目没写横杠', '::: figure checklist 标题\n随便写\n:::', /应以“- ”开头/],
    ['对比缺右边', '::: figure compare 标题\n[左] 左\n- a\n:::', /两组/],
    ['对比分组写错', '::: figure compare 标题\n[右] 右\n- a\n:::', /这里写成了 \[右\]/],
    ['对话说话人写错', '::: figure chat 标题\n客户：你好\n:::', /“我：”或“AI：”/],
    ['图示里写 HTML', '::: figure checklist 标题\n- <b>x</b>\n:::', /不能写 HTML/],
    ['图示里嵌套容器', '::: figure checklist 标题\n::: tip\n:::', /不能嵌套/]
  ]
  for (const [name, body, pattern] of broken) {
    test(`写错的图示直接失败：${name}`, () => {
      assert.throws(() => renderLearningData({ data: withBody(body), md }), pattern)
    })
  }
})

describe('writeRendered', () => {
  test('输入不合格时保留上一次的输出，不留临时文件', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'ai-learning-render-'))
    try {
      const outputPath = path.join(dir, 'rendered.json')
      await writeFile(outputPath, 'previous\n', 'utf8')
      await assert.rejects(writeRendered({ data: withBody('<script>x</script>'), md, outputPath }))
      assert.equal(await readFile(outputPath, 'utf8'), 'previous\n')
      assert.deepEqual(await readdir(dir), ['rendered.json'])

      const { text } = await writeRendered({ data: syntheticData(), md, outputPath })
      assert.equal(await readFile(outputPath, 'utf8'), text)
      assert.deepEqual(await readdir(dir), ['rendered.json'])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

// 真实教材：需要先跑 generate-ai-learning.mjs 生成 generated.json
const hasGenerated = await access(DEFAULT_INPUT).then(() => true, () => false)

describe('真实教材（只读 generated.json，不写文件）', { skip: hasGenerated ? false : '缺少 generated.json，先运行 npm run content:ai' }, () => {
  test('有正文的章节全部渲染（前四章 + 可能的 reading_ready），小节锚点齐全，没有残留组件', async () => {
    const data = JSON.parse(await readFile(DEFAULT_INPUT, 'utf8'))
    const rendered = renderLearningData({ data, md })
    assert.deepEqual(rendered.lessons.slice(0, 4).map(l => l.id), ['l01', 'l02', 'l03', 'l04'])
    assert.deepEqual(rendered.lessons.map(l => l.id), data.lessons.map(l => l.id))
    for (const [i, lesson] of rendered.lessons.entries()) {
      const source = data.lessons.find(l => l.id === lesson.id)
      assert.equal(lesson.sections.length, source.sections.length)
      for (const s of lesson.sections) assert.ok(lesson.html.includes(`id="${s.id}"`), `${lesson.id} 缺少 #${s.id}`)
      for (const name of KNOWN_COMPONENTS) assert.ok(!lesson.html.includes(`<${name}`), `${lesson.id} 残留 ${name}`)
      // 表格 / 图示是前四章的既有内容，后续章节不强求
      assert.ok(i >= 4 || lesson.html.includes('<table') || lesson.html.includes('class="course-inline-visual'), `${lesson.id} 没有表格或图示`)
      assert.ok(lesson.html.startsWith('<div class="ai-course-chapter-head">'), `${lesson.id} 章首没有包好`)
      for (const s of lesson.sections) assert.ok(lesson.html.includes(`<section class="course-lesson-section${s.id === 'summary' ? ' course-section-summary' : ''}" id="${s.id}">`), `${lesson.id} 小节 #${s.id} 没有包成 section`)
      assert.ok(lesson.html.includes('class="ai-learning-sources"'), `${lesson.id} 没有来源列表`)
      assert.ok(i === 1 || i === 2 || i >= 4 || lesson.html.includes('<figure'), `${lesson.id} 没有图示`)
    }
    assert.equal(serialize(rendered), serialize(renderLearningData({ data, md })))
  })
})

describe('术语链接 [文字](term:id)', () => {
  const glossary = [
    { id: 'llm', siteCat: 'AI 基础' },
    { id: 'app', siteTerm: 'ai-basics' },
    { id: 'offsite' }
  ]
  test('换成点开侧栏的按钮，用网站卡片 id', () => {
    const html = renderTermLinks('<p><strong><a href="term:app">AI 应用</a></strong> 和 <a href="term:llm">LLM</a></p>', glossary, 't')
    assert.ok(html.includes('<button class="course-term-ref" type="button" data-term-id="ai-basics">AI 应用<span aria-hidden="true">↗</span></button>'))
    assert.ok(html.includes('data-term-id="llm"'))
    assert.doesNotThrow(() => assertSafeHtml(html, 't'))
  })
  test('没上图鉴的词报错', () => {
    assert.throws(() => renderTermLinks('<a href="term:offsite">x</a>', glossary, 't'), /term:offsite/)
    assert.throws(() => renderTermLinks('<a href="term:nope">x</a>', glossary, 't'), /term:nope/)
  })
  test('安全检查：只放行术语按钮和练习页链接', () => {
    assert.throws(() => assertSafeHtml('<button type="button">x</button>', 't'))
    assert.throws(() => assertSafeHtml('<button class="course-term-ref" type="submit">x</button>', 't'))
    assert.throws(() => assertSafeHtml('<a href="term:llm">x</a>', 't'))
    assert.doesNotThrow(() => assertSafeHtml('<a href="/practice?scope=ai">练习</a>', 't'))
    assert.throws(() => assertSafeHtml('<a href="/practice?scope=ai&x=1">练习</a>', 't'))
  })
})

describe('真实教材 l01 已拆分', { skip: hasGenerated ? false : '缺少 generated.json，先运行 npm run content:ai' }, () => {
  test('正文里没有术语卡、练习块和读完标记，术语可点开，指向练习页', async () => {
    const data = JSON.parse(await readFile(DEFAULT_INPUT, 'utf8'))
    const sourceVersion = data.lessons.find(l => l.id === 'l01')?.version
    assert.ok(typeof sourceVersion === 'string' && sourceVersion.trim(), 'generated.json 里 l01 缺少 version')
    const l01 = renderLearningData({ data, md }).lessons.find(l => l.id === 'l01')
    assert.equal(l01.version, sourceVersion)
    assert.ok(!l01.sections.some(s => s.id === 'terms' || s.id === 'practice'))
    for (const cls of ['ai-learning-term', 'ai-learning-practice', 'ai-learning-status']) assert.ok(!l01.html.includes(cls), `l01 残留 ${cls}`)
    assert.equal((l01.html.match(/class="course-term-ref"/g) ?? []).length, 10)
    assert.ok(l01.html.includes('href="/practice"'))
    assert.ok(l01.html.includes('给新客户做一次背调'))
    assert.ok(!l01.html.includes('做本章的 6 道情境判断题'))
  })
})

describe('术语讲解 renderTermArticle', () => {
  const glossary = [
    { id: 'llm', siteTerm: null, siteCat: 'AI 基础' },
    { id: 'token', siteTerm: 'token', siteCat: null },
    { id: 'offsite', siteTerm: null, siteCat: null }
  ]
  const article = body => ({ ...glossary[1], article: body })

  test('渲染成网站卡片 id 下的 HTML，术语链接指向术语页', () => {
    const out = renderTermArticle({ md, term: article('## 是什么\n\n按 [大模型](term:llm) 计数。\n\n| a | b |\n|---|---|\n| 1 | 2 |\n'), glossary })
    assert.equal(out.siteId, 'token')
    assert.match(out.html, /<a class="term-article-link" href="\/llm">大模型<\/a>/)
    assert.match(out.html, /<table\b/)
  })

  test('没上图鉴的词、一级标题、课程组件、图示、{#id} 都直接失败', () => {
    assert.throws(() => renderTermArticle({ md, term: { ...glossary[2], article: '## x' }, glossary }), /没有上术语图鉴/)
    assert.throws(() => renderTermArticle({ md, term: article('# 标题'), glossary }), /二级标题/)
    assert.throws(() => renderTermArticle({ md, term: article('<ReadMark lesson="l01" />'), glossary }), /术语 token 的讲解/)
    assert.throws(() => renderTermArticle({ md, term: article('::: figure flow a | b\n- x | y\n- z | w\n:::'), glossary }), /课程组件/)
    assert.throws(() => renderTermArticle({ md, term: article('## 小节 {#one}\n\n文字'), glossary }), /\{#id\}/)
    assert.throws(() => renderTermArticle({ md, term: article('见 [x](term:offsite)'), glossary }), /term:offsite/)
  })
})
