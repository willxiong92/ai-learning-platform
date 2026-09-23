import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
import {loadContent, validateContent} from '/Users/will/code/AI学习站/scripts/content-lib.mjs'

const work = path.dirname(fileURLToPath(import.meta.url))
const product = '/Users/will/Desktop/业务主线/A-部门项目/AI学习站'
const content = await loadContent(path.join(product, 'sources'))
const outline = JSON.parse(await fs.readFile(path.join(work, 'outline-contract.json'), 'utf8'))
assert.deepEqual(validateContent(content), [])
const lessons = content.course.modules.flatMap(m => m.lessons)
assert.equal(lessons.length, 24)
assert.equal(content.course.modules.length, 6)
assert.equal(content.course.version, outline.version)
assert.deepEqual(Object.keys(content.lessons), ['l01','l02','l03','l04'])
assert.deepEqual(content.course.review, {content:'draft', team_access:'not_open'})
for (const l of outline.modules.flatMap(m => m.lessons)) {
  const actual = lessons.find(x => x.id === l.id)
  assert.equal(actual.title, l.title, `${l.id} title`)
  assert.deepEqual(actual.prerequisites, l.prerequisites, `${l.id} prerequisite`)
}
const stats=[]
for (const [id,l] of Object.entries(content.lessons)) {
  const a=l.activities
  assert.equal(a.version, outline.version)
  assert.equal(a.review_status,'draft')
  assert.equal(a.quiz.questions.length, 6)
  assert.ok(a.quiz.questions.filter(q=>q.critical).length>=2)
  assert.ok(a.intro.objectives.length>0 && a.intro.scope_note && a.intro.plan)
  assert.ok(a.practice.checklist.length>0)
  assert.ok(a.sources.length>0)
  for (const s of a.sources) assert.equal(s.checked,'2026-09-18')
  assert.match(a.intro.simulation_note, /模拟/)
  stats.push({id,characters:l.markdown.length,questions:a.quiz.questions.length,sources:a.sources.length})
}
const baseline=JSON.parse(await fs.readFile(path.join(work,'baseline.json'),'utf8'))
const expected=new Set([product+'/sources/course.yaml',product+'/sources/glossary.yaml',product+'/sources/lessons/l01/lesson.md',product+'/sources/lessons/l01/activities.yaml',product+'/PROJECT.md'])
const changed=[],protectedDrift=[]
for (const [file,hash] of Object.entries(baseline.files)) {
  const now=await fs.readFile(file).then(b=>crypto.createHash('sha256').update(b).digest('hex'),()=>null)
  if(now!==hash) {changed.push(file);if(!expected.has(file)) protectedDrift.push(file)}
}
assert.deepEqual(protectedDrift,[])
const receipt={status:'technically_verified_content_structure_only',version:outline.version,modules:6,lessons:24,available:4,planned:20,stats,changed,protected_files:Object.keys(baseline.files).length-expected.size,protectedDrift,human_accepted:false,team_open:false,website_integrated:false}
await fs.writeFile(path.join(work,'content-check.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt,null,2))
