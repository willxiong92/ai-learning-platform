"""Generate only the approved practice map; never promote frozen course drafts."""
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
source = Path('/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/practice/curriculum.json')
data = json.loads(source.read_text())
ids = [lesson['id'] for lesson in data['lessons']]
assert len(ids) == len(set(ids)) == 27
assert set(ids) == {f'l{i:02}' for i in range(1,25)} | {'W01','W02','W03'}
for lesson in data['lessons']:
    assert lesson['core'] and lesson['quality']
    assert (lesson['status'] == 'pilot') == ('pilot' in lesson)
(root/'src/lib/ai-learning/practice-curriculum.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Generated 27 curriculum units; 4 synthetic practice pilots. Existing course data untouched.')
