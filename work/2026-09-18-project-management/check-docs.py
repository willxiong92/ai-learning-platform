from pathlib import Path
import hashlib,json,re,sys
root=Path('/Users/will/code/网站克隆工作台')
w=root/'work/2026-09-18-project-management'
biz=Path('/Users/will/Desktop/业务主线/A-部门项目/AI学习站/PROJECT.md')
base=json.loads((w/'baseline.json').read_text())
targets=[root/'README.md',root/'docs/AI学习项目-底层方案.md',biz]
allowed=set(map(str,targets))
violations=[]
for name,expected in base['files'].items():
 if name in allowed: continue
 p=Path(name)
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:violations.append(name)
def missing_links(text,owner):
 missing=[]
 for link in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)',text):
  link=link.strip().strip('<>')
  if link.startswith(('http:','https:','mailto:','#','codex:')):continue
  path=link.split('#')[0]
  path=re.sub(r':\d+$','',path)
  if not path:continue
  p=Path(path).expanduser()
  if not p.is_absolute():p=owner.parent/p
  if not p.exists():missing.append(link)
 return sorted(set(missing))
links={}
for p in targets:
 before=w/(('business-PROJECT' if p==biz else p.stem)+'.before.md')
 prior=set(missing_links(before.read_text(),p))
 current=set(missing_links(p.read_text(),p))
 links[str(p)]={'new_missing':sorted(current-prior),'preexisting_missing':sorted(current&prior)}
required={
 'project_has_next_action':'next_action:' in biz.read_text(),
 'project_preserves_id':'project_id: ai-learning-site' in biz.read_text(),
 'no_invented_active_status':'status: active' not in biz.read_text(),
 'readme_links_control':str(biz) in targets[0].read_text(),
 'receipt_exists':(w/'claude-receipt.md').is_file(),
}
result={'protected_file_drift':violations,'links':links,'required':required,'target_hashes':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in targets}}
print(json.dumps(result,ensure_ascii=False,indent=2))
(w/'checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
sys.exit(0 if not violations and all(required.values()) and all(not x['new_missing'] for x in links.values()) else 1)
