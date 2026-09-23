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
  KNOWN_COMPONENTS,
  loadMarkdownRenderer,
  renderLearningData,
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
    for (const cls of ['ai-learning-intro', 'ai-learning-terms', 'ai-learning-cite', 'ai-learning-demo', 'ai-learning-practice', 'ai-learning-status', 'ai-learning-sources', 'ai-learning-next']) {
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
    assert.ok(!html.includes('尚未接入') && !html.includes('本页是只读版'), '残留过时的只读说明')
    assert.match(html, /第 02 课 · 模拟课 l02（待编写，暂无正文）/)
    assert.match(html, /<details class="ai-learning-details"><summary>查看解析<\/summary><p class="ai-learning-multiline">模拟解析<\/p><\/details>/)
    assert.match(html, /第一行\n第二行/)
    assert.ok(!html.includes('/Users/') && !html.includes('lesson.md'), '作者注释漏进页面')
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
  test('四章全部渲染，小节锚点齐全，没有残留组件', async () => {
    const data = JSON.parse(await readFile(DEFAULT_INPUT, 'utf8'))
    const rendered = renderLearningData({ data, md })
    assert.deepEqual(rendered.lessons.map(l => l.id), ['l01', 'l02', 'l03', 'l04'])
    for (const [i, lesson] of rendered.lessons.entries()) {
      const source = data.lessons.find(l => l.id === lesson.id)
      assert.equal(lesson.sections.length, source.sections.length)
      for (const s of lesson.sections) assert.ok(lesson.html.includes(`id="${s.id}"`), `${lesson.id} 缺少 #${s.id}`)
      for (const name of KNOWN_COMPONENTS) assert.ok(!lesson.html.includes(`<${name}`), `${lesson.id} 残留 ${name}`)
      assert.ok(lesson.html.includes('<table'), `${lesson.id} 没有表格`)
      assert.ok(lesson.html.includes('class="ai-learning-sources"'), `${lesson.id} 没有来源列表`)
      assert.ok(i === 1 || i === 2 || lesson.html.includes('<figure'), `${lesson.id} 没有图示`)
    }
    assert.equal(serialize(rendered), serialize(renderLearningData({ data, md })))
  })
})
