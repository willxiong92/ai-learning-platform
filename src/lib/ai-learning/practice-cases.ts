import data from './practice-cases.json';
export const practiceCases = data.cases;
export const practiceCaseAliases: Record<string, string> = { 'inquiry-reply': 'customer-research' };
export const getPracticeCase = (id: string) => practiceCases.find(item => item.id === (practiceCaseAliases[id] ?? id));
export const practiceCaseForLesson = (lessonId: string) => practiceCases.find(item => (item.lessons as string[]).includes(lessonId));
export function practiceCaseHref(lessonId: string) {
 const item = practiceCaseForLesson(lessonId);
 return item ? `/practice/cases/${item.id}` : '/practice';
}
