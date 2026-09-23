"""Copy approved case mother source without running frozen course generators."""
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
source = Path('/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/practice/cases.json')
data = json.loads(source.read_text())
assert len({c['id'] for c in data['cases']}) == len(data['cases'])
(root/'src/lib/ai-learning/practice-cases.json').write_bytes(source.read_bytes())
for case in data['cases']:
    if case['status'] == 'pilot':
        assert case['materials'] and case['tests'] and case['reference']
        (root/'public/practice-materials'/f"{case['id']}.txt").write_text(case['materials']+'\n')
