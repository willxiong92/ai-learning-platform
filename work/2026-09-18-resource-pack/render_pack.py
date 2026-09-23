import json
from pathlib import Path
from collections import Counter

work = Path(__file__).parent
root = Path('/Users/will/Desktop/业务主线/A-部门项目/AI学习站')
envelope = json.loads((work / 'grok-synthesis.json').read_text())
assert envelope['stopReason'] == 'end_turn'
raw = envelope['text'].strip()
if raw.startswith('```'):
    raw = raw.split('\n', 1)[1].rsplit('```', 1)[0]
data = json.loads(raw)
sources = data['sources']
lessons = data['lesson_briefs']
assert {x['id'] for x in lessons} == {f'l{i:02}' for i in range(1,25)}
assert len(lessons) == 24
ids = {s['id'] for s in sources}
assert len(ids) == len(sources)
for lesson in lessons:
    assert set(lesson['source_ids']) <= ids
for s in sources:
    assert s['url'].startswith('https://')
    assert s['read_status'] in ['search_only', 'prior_verified']
(work / 'research-result.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
titles = {}
for line in (work / 'curriculum-brief.txt').read_text().splitlines():
    for item in line.split('：',1)[1].split('；'):
        key,title = item.strip().split(' ',1)
        titles[key] = title
counts = dict(Counter(s['read_status'] for s in sources))
out = ['# AI 学习课程素材包', '', '> 2026-09-18｜Grok 检索与提炼，Codex 结构核验。状态：partial / needs_review。覆盖课程选材，不代表教材已完成。', '',
       '## 编课使用规则', '',
       '- 教学顺序：概念讲解 → 完整示范 → 学员练习 → 测验与纠错 → 项目应用。所有示例为原创模拟，不使用真实客户记录。',
       '- 每次只交接一课：本课简报、对应的 1–3 张来源卡、教材格式与验收要求；不传整个项目历史、其他章节全文或哈希清单。',
       '- 首四课已有初稿，只按既有修订清单局部修复；后 20 课仅备料，本轮未授权扩写。',
       '- search_only 是搜索线索，不能作为已核技术结论；必须先读原文并记录位置再采用。prior_verified 只沿用此前核验过的范围，不代表当前全文重新核验。',
       '- 本轮 web_fetch 被工具取消，未绕过或重试；GitHub 代码未运行、许可未逐文件核验，X 热度不作为准确性证据。',
       '- 素材中的教学建议是 Grok 的编课建议；实际技术主张仍需原文依据。优先使用已核来源，不为凑数量引用候选。',
       '- 本文 R 编号仅在本素材包内有效，不替换现有 reading-list.md 的 G/SRC 编号。',
       '', '## 检索与核验范围', '', f'来源共 {len(sources)} 条；状态计数：{counts}。24 课均有选材简报。Codex 核对了运行回执、课程编号与引用完整性，未独立核完所有候选原文。', '',
       '首四课既有核验范围：[原来源核验包](/Users/will/code/网站克隆工作台/work/2026-09-18-curriculum/verified-sources.md)。', '', '## 24 课编课简报', '']
for l in sorted(lessons,key=lambda x:x['id']):
    out += [f"### {l['id']} {titles[l['id']]}", '', f"来源：{', '.join(l['source_ids'])}（见下方来源卡；采用前检查阅读状态）", '']
    for key,label in [('teach','要教什么'),('example','模拟示范'),('exercise','练习产物'),('acceptance','验收与反例'),('avoid','避免误教')]:
        out.append(f'- **{label}**：{l[key]}')
    out.append('')
out += ['## 来源卡', '']
for s in sources:
    out += [f"### {s['id']} {s['title']}", '', f"原文：[{s['title']}]({s['url']})", '',
            f"- 类型：{s['type']}；作者：{s.get('author','未核')}；阅读状态：**{s['read_status']}**。",
            f"- 阅读位置/检索依据：{s['locator']}",
            f"- 来源日期：{s.get('source_date') or '未核验'}；检索日期：2026-09-18。",
            f"- 选材理由：{s['quality_reason']}",
            '- 提炼要点（候选来源须核原文）：' + '；'.join(s['takeaways']),
            f"- 限制：{s['limits']}",
            f"- 适配课程：{', '.join(s['lessons'])}", '']
out += ['## 待补核验', '']
for gap in data.get('gaps',[]):
    out.append('- ' + (gap if isinstance(gap,str) else json.dumps(gap,ensure_ascii=False)))
out += ['', '## 执行证据', '',
        '[Grok 汇总回执](/Users/will/code/网站克隆工作台/work/2026-09-18-resource-pack/grok-synthesis.json)；[结构化中间结果](/Users/will/code/网站克隆工作台/work/2026-09-18-resource-pack/research-result.json)。', '']
target = root / 'sources/course-materials.md'
assert not target.exists(), 'Do not overwrite an existing source'
target.write_text('\n'.join(out))
print(json.dumps({'path':str(target),'sources':len(sources),'status_counts':counts,'lessons':len(lessons)},ensure_ascii=False))
