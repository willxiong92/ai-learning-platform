import fs from 'node:fs/promises'
import path from 'node:path'
import { loadContent, validateContent } from '/Users/will/code/AI学习站/scripts/content-lib.mjs'

const product = '/Users/will/Desktop/业务主线/A-部门项目/AI学习站'
const content = await loadContent(path.join(product, 'sources'))
const errors = validateContent(content)
if (errors.length) throw new Error(errors.join('\n'))
const { course, glossary, lessons } = content
const all = course.modules.flatMap(m => m.lessons)
for (const [id, {activities:a}] of Object.entries(lessons)) {
  const required = ['intro.duration','intro.prerequisite','intro.plan','intro.simulation_note','intro.scope_note','demo.title','demo.note','practice.prompt','practice.hint','practice.explanation','quiz.notice','quiz.rule.text','quiz.short_question.prompt','quiz.short_question.rubric_note','feedback.intro']
  for (const field of required) {
    const value = field.split('.').reduce((v,k)=>v?.[k],a)
    if (typeof value !== 'string' || !value.trim()) throw new Error(id + ': missing ' + field)
  }
  for (const field of ['sources','intro.objectives','demo.steps','practice.checklist','quiz.questions','quiz.short_question.rubric','feedback.checks']) {
    const value=field.split('.').reduce((v,k)=>v?.[k],a)
    if (!Array.isArray(value) || !value.length) throw new Error(id + ': missing list ' + field)
  }
  for (const s of a.sources) for (const key of ['title','url','supports','checked']) if (!s[key]) throw new Error(id + ': source missing ' + key)
  for (const s of a.demo.steps) for (const key of ['title','input','output','why']) if (!s[key]) throw new Error(id + ': demo missing ' + key)
  for (const q of a.quiz.questions) if (!q.prompt) throw new Error(id + ': missing question prompt')
}
const bullets = xs => (xs ?? []).map(x => '- ' + x).join('\n')
const details = (label, body) => '<details>\n<summary>' + label + '</summary>\n\n' + body + '\n\n</details>'
const links = sources => sources.map(s => '[' + s.title + '](' + s.url + ')').join('；')
const parts = [
  '# AI 使用基本功 · 试学稿',
  '> ' + all.length + ' 课大纲＋' + Object.keys(lessons).length + ' 课正文。版本：' + course.version + '。内容为草稿；2026-09-19结构检查与Grok内容复核通过，待本人试学。范围与证据见 [项目入口](' + product + '/PROJECT.md)；测验用于学习自查，不作正式考试或岗位认证；尚未向团队开放。',
  '本阅读稿由教材母源自动汇编。修改请回到 [sources/course.yaml](' + product + '/sources/course.yaml) 和各课的 lesson.md / activities.yaml；不要直接改本稿。',
  '## 怎么学',
  '按顺序读讲解与示范，先独立练习再展开答案。测验用于自查，不是岗位认证。每课预计时间见目录；每周 10 小时包括实践、笔记与复盘，不能把它理解为 10 小时连续授课。所有教学案例均为模拟。',
  '## 半年课程大纲',
  '| 模块 | 课号与主题 | 学完能做什么 | 先修 | 预计课时 | 本轮状态 |',
  '|---|---|---|---|---|---|'
]
for (const m of course.modules) {
  for (const l of m.lessons) {
    parts.push('| ' + m.title + ' | ' + l.id + ' · ' + (lessons[l.id] ? '[' + l.title + '](#' + l.id + ')' : l.title) + ' | ' + l.outcome + ' | ' + (l.prerequisites.join('、') || '无') + ' | ' + l.estimate + ' | ' + (lessons[l.id] ? '正文可试读，待本人试学' : '目录，正文待编写') + ' |')
  }
}
parts.push('\n完整课目标、先修关系与预计用时见课程母目录；外部选材见 [阅读来源清单](' + product + '/sources/reading-list.md)。')
for (const l of all.filter(l => lessons[l.id])) {
  const { markdown, activities: a } = lessons[l.id]
  const sourceMap = new Map((a.sources ?? []).map(s => [s.id, s]))
  let body = markdown.replace(/^---[\s\S]*?\n---\n/, '').replace(/<!--[\s\S]*?-->/g, '')
  body = body.replace(/^# .+$/m, '')
  body = body.replace(/^## (.+?)\s*\{#([a-z0-9-]+)\}\s*$/gm, (_, title, id) => '<a id="' + l.id + '-' + id + '"></a>\n\n### ' + title)
  body = body.replace(/^### /gm, '### ')
  body = body.replace(/<LessonIntro[^>]*\/>/g, '预计用时：' + a.intro.duration + '\n\n先修：' + a.intro.prerequisite + '\n\n学完应能：\n\n' + bullets(a.intro.objectives) + '\n\n学习安排：' + a.intro.plan + '\n\n' + a.intro.simulation_note + '\n\n适用范围：' + a.intro.scope_note + '\n\n岗位用途：' + l.why + '\n\n验收产物：' + l.verify)
  body = body.replace(/<TermCards[^>]*\/>/g, '| 术语 | 通俗解释 | 模拟例子 |\n|---|---|---|\n' + glossary.terms.filter(t => t.lesson === l.id).map(t => '| ' + t.term + ' | ' + t.definition + ' | ' + t.example + ' |').join('\n'))
  body = body.replace(/<Cite[^>]*ids="([^"]+)"[^>]*\/>/g, (_, ids) => '参考：' + links(ids.split(/\s+/).map(id => sourceMap.get(id))))
  body = body.replace(/<ContrastDemo[^>]*\/>/g, '**' + a.demo.title + '**\n\n' + a.demo.note + '\n\n' + a.demo.steps.map((s, i) => '#### ' + (i + 1) + '. ' + s.title + '\n\n输入：' + s.input + '\n\n示范输出：' + s.output + '\n\n为什么：' + s.why).join('\n\n'))
  body = body.replace(/<GuidedPractice[^>]*\/>/g, a.practice.prompt + '\n\n作答提示：' + (a.practice.placeholder || a.practice.hint) + '\n\n提示：' + a.practice.hint + '\n\n' + details('先作答，再看解析与自查', a.practice.explanation + '\n\n' + bullets(a.practice.checklist)))
  body = body.replace(/<ReadMark[^>]*\/>/g, '')
  body = body.replace(/<NextStep[^>]*\/>/g, '')
  body = body.replace(/<SourceList[^>]*\/>/g, '### 本课来源\n\n' + bullets(a.sources.map(s => '[' + s.title + '](' + s.url + ') — 支持：' + s.supports + '；核验标记：' + s.checked)))
  body = body.replace(/^::: (?:info|tip|warning|details)\s*(.*)$/gm, '**$1**').replace(/^:::\s*$/gm, '')
  parts.push('\n---\n\n<a id="' + l.id + '"></a>\n\n## ' + l.id + ' · ' + l.title + '\n\n' + body.trim())
  parts.push('### 本课测验\n\n' + a.quiz.notice + '\n\n' + a.quiz.rule.text)
  for (const [i, q] of a.quiz.questions.entries()) {
    const choices = q.options.map((o, j) => String.fromCharCode(65 + j) + '. ' + o.text).join('\n\n')
    const wrong = q.options.map((o, j) => j === q.answer ? '' : String.fromCharCode(65 + j) + ' 为什么不对：' + o.feedback).filter(Boolean).join('\n\n')
    parts.push('#### 第 ' + (i + 1) + ' 题' + (q.critical ? '（关键题）' : '') + '\n\n' + q.prompt + '\n\n' + choices + '\n\n' + details('作答后查看答案', '**答案：' + String.fromCharCode(65 + q.answer) + '**。' + q.reason + '\n\n' + wrong + '\n\n[回看讲解](#' + l.id + '-' + q.section + ')'))
  }
  const sq = a.quiz.short_question
  parts.push('### 简答与迁移练习\n\n' + sq.prompt + '\n\n作答提示：' + (sq.placeholder || '请用自己的话回答。') + '\n\n' + details('作答后查看自查要点', bullets(sq.rubric) + '\n\n' + sq.rubric_note))
  parts.push('### 给教材的反馈\n\n' + a.feedback.intro + '\n\n' + bullets(a.feedback.checks) + '\n\n反馈选择：' + (a.feedback.verdicts ?? []).map(v=>v.label).join(' / ') + '\n\n' + (a.feedback.ready_requires || '') + '\n\n记录一处不懂、一处可改进、一个你愿意继续实践的问题。')
}
const result = parts.join('\n\n') + '\n'
if (/<(?:LessonIntro|TermCards|Cite|ContrastDemo|GuidedPractice|ReadMark|SourceList|NextStep)\b/.test(result)) throw new Error('Unexpanded textbook component')
const out = path.join(product, 'outputs', 'AI使用基本功-试学稿.md')
await fs.mkdir(path.dirname(out), { recursive: true })
await fs.writeFile(out, result)
console.log(JSON.stringify({ output: out, lessons: Object.keys(lessons), bytes: Buffer.byteLength(result) }))
