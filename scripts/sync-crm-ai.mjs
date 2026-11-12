import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = process.argv[2] ?? '/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/practice/crm-ai-six-lessons/curriculum.json';
const raw = await readFile(source, 'utf8');
const data = JSON.parse(raw);
const ids = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06'];
if (JSON.stringify(data.lessons?.map((lesson) => lesson.id)) !== JSON.stringify(ids)) throw new Error('Expected six ordered CRM practice lessons.');
if (JSON.stringify(data.lessons.map((lesson) => lesson.status)) !== JSON.stringify(['ready','ready','ready','planned','planned','planned'])) throw new Error('Course readiness must remain explicit.');
await writeFile(path.join(root, 'src/lib/crm-ai-practice/curriculum.json'), raw);
console.log('Updated CRM practice derived JSON only from ' + source);
