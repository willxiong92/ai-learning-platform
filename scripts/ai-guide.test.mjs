import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const data=JSON.parse(fs.readFileSync('src/data/ai-guide.json','utf8'));
test('frozen catalog has unique complete metadata and authorized content boundaries',()=>{
 assert.equal(data.articles.filter(a=>a.kind==='original').length,18);
 assert.equal(data.articles.filter(a=>a.kind==='curated').length,18);
 assert.equal(new Set(data.articles.map(a=>a.slug)).size,36);
 for(const a of data.articles){
  assert.ok(a.title&&a.author&&a.sourceUrl.startsWith('https://book.oiloil.org/articles/'));
  assert.ok(a.html.length>100,a.slug);
  assert.ok(['public_complete','authorized_complete'].includes(a.status));
  assert.doesNotMatch(a.html,/<(?:script|iframe|form|button)\b|\son\w+=|javascript:|article-paywall|升级 Oil Book Pro/i);
  for(const h of a.headings)assert.ok(a.html.includes(`id="${h.id}"`));
  assert.equal(new Set(a.headings.map(h=>h.id)).size,a.headings.length,a.slug);
  assert.ok(fs.existsSync(path.join('public',a.cover)),a.cover);
  for(const m of a.html.matchAll(/(?:src|poster)="([^"]+)"/g))assert.ok(fs.existsSync(path.join('public',m[1])),m[1]);
  for(const image of a.html.matchAll(/<img\b[^>]+>/g))assert.ok(/width="[1-9]\d*"/.test(image[0])&&/height="[1-9]\d*"/.test(image[0]),'Intrinsic dimensions required for stable TOC: '+a.slug);
 }
 const first=data.articles.find(a=>a.slug==='ai-agent-common-operations');
 assert.equal(first.status,'public_complete');
 assert.ok(first.headings.some(h=>h.title==='联网调研与生成图片'));
});
test('local source snapshots match hashes and retain all declared sections',()=>{
 const mother='sources/ai-guide';
 assert.equal(data.articles.filter(a=>a.status==='authorized_complete').length,11);
 for(const a of data.articles){
  assert.match(a.sourceSnapshot,/^imports\/2026-11-12\/[a-f0-9]{12}-[a-z0-9-]+\.md$/);
  const raw=fs.readFileSync(path.join(mother,a.sourceSnapshot));
  assert.equal(createHash('sha256').update(raw).digest('hex'),a.sourceSha256,a.slug);
  const source=raw.toString('utf8');
  assert.doesNotMatch(source,/升级 Oil Book Pro 继续阅读余下内容/);
  const declared=source.match(/本篇目录\s*(\d+)\s*个小节/);
  if(declared)assert.equal(a.headings.filter(h=>h.level===2).length,Number(declared[1]),a.slug);
 }
 for(const [slug,sections] of [['ai-agent-principles-and-ecosystem',8],['how-to-start-self-media',9]]){
  const a=data.articles.find(a=>a.slug===slug);
  assert.equal(a.status,'authorized_complete');
  assert.equal(a.headings.filter(h=>h.level===2).length,sections);
  assert.equal(a.headings.at(-1).title,'总结');
  assert.ok(/<h2 id="article-section-\d+">总结\s*<\/h2>/.test(a.html),a.slug);
 }
});
test('nine observed model dossiers retain author evidence',()=>{
 assert.equal(data.models.length,9);assert.equal(new Set(data.models.map(m=>m.category)).size,4);
 for(const m of data.models)assert.ok(m.name&&m.description&&m.strengths&&m.limitations&&m.scenarios);
});
test('sanitizer drops executable elements and unsafe links while preserving text',()=>{
 const code=`import runpy\nx=runpy.run_path('scripts/import-ai-guide.py')\nn=x['Parser']('<div><p>Hello</p><script>alert(1)</script><a href="javascript:evil()" onclick="evil()">Label</a><p hidden>hidden secret</p><pre>&lt;script&gt;example&lt;/script&gt;</pre></div>').root\ns=x['clean'](n)\nassert 'alert(1)' not in s and 'javascript:' not in s and 'onclick' not in s and 'hidden secret' not in s\nassert 'Hello' in s and 'Label' in s and '&lt;script&gt;example' in s\nprint('PASS')`;
 assert.match(execFileSync('python3',['-c',code],{encoding:'utf8'}),/PASS/);
});
test('guide generation does not modify course or terminology content',()=>{
 const files=execFileSync('git',['ls-files','src/lib/ai-learning/*.json','src/lib/vibehub/*.json'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const before=new Map(files.map(f=>[f,fs.readFileSync(f)]));
 execFileSync('python3',['scripts/import-ai-guide.py','--generate-only'],{maxBuffer:32*1024*1024});
 for(const f of files)assert.deepEqual(fs.readFileSync(f),before.get(f),f);
});
test('source placeholders and non-web protocols never produce executable or false links',()=>{
 const script=`import runpy\nx=runpy.run_path('scripts/import-ai-guide.py')\np=x['Parser']('<div><source><a href="mailto:a@b.com">Mail</a><a href="tel:123">Call</a><img loading="lazy"></div>').root\ns=x['clean'](p)\nassert '<source' not in s and 'href=' not in s and 'Mail' in s and 'Call' in s\nprint('PASS')`;
 assert.match(execFileSync('python3',['-c',script],{encoding:'utf8'}),/PASS/);
});
test('model dossiers match names rather than list positions and reject missing evidence',()=>{
 const script=`import runpy,json,tempfile\nfrom pathlib import Path\nx=runpy.run_path('scripts/import-ai-guide.py');f=x['models'];g=f.__globals__\ng['page']=lambda p:x['Parser']('<div class="dispatch-slot"><h2>Task</h2><button class="model-bookmark" title="B"><span><strong>Beta</strong><span>b</span></span></button><button class="model-bookmark" title="A"><span><strong>Alpha</strong><span>a</span></span></button></div>').root\nwith tempfile.TemporaryDirectory() as temp:\n g['MOTHER']=Path(temp);p=Path(temp)/'models-visible.json'\n rows=[dict(name=n,strengths=n,limitations='limit',scenarios='use') for n in ['Alpha','Beta']]\n p.write_text(json.dumps(dict(rows=rows)))\n assert f()[0]['strengths']=='Beta'\n p.write_text(json.dumps(dict(rows=rows[:1])))\n try:f();raise AssertionError('missing dossier accepted')\n except ValueError:pass\n rows[0]['strengths']='';p.write_text(json.dumps(dict(rows=rows)))\n try:f();raise AssertionError('empty evidence accepted')\n except ValueError:pass\nprint('PASS')`;
 assert.match(execFileSync('python3',['-c',script],{encoding:'utf8'}),/PASS/);
});

test('anonymous refresh refuses to overwrite authorized mother source before network access',()=>{
 const script=`import runpy,sys,tempfile,json
from pathlib import Path
x=runpy.run_path('scripts/import-ai-guide.py');f=x['main'];g=f.__globals__
with tempfile.TemporaryDirectory() as temp:
 g['MOTHER']=Path(temp);p=Path(temp)/'catalog.json';raw=json.dumps({'articles':[{'status':'authorized_complete'}]});p.write_text(raw)
 g['collect_catalog']=lambda:(_ for _ in ()).throw(AssertionError('network must not run'))
 sys.argv=['import-ai-guide.py']
 try:f();raise AssertionError('anonymous overwrite accepted')
 except ValueError as e:assert 'Authorized full text exists' in str(e)
 assert p.read_text()==raw
print('PASS')`;
 assert.match(execFileSync('python3',['-c',script],{encoding:'utf8'}),/PASS/);
});

 test('learning categories cover every article once',()=>{
 const paths=JSON.parse(fs.readFileSync('src/data/ai-guide-learning-path.json','utf8'));
 const slugs=paths.phases.flatMap(p=>p.groups.flatMap(g=>g.slugs));
 assert.equal(slugs.length,data.articles.length);
 assert.equal(new Set(slugs).size,slugs.length);
 assert.deepEqual([...slugs].sort(),data.articles.map(a=>a.slug).sort());
 assert.deepEqual(JSON.parse(fs.readFileSync('sources/ai-guide/catalog.json','utf8')),data);
 });
