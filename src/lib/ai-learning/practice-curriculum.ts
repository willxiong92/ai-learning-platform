import data from './practice-curriculum.json';
export const curriculum = data;
export const learningUnit = (id: string) => data.lessons.find(unit => unit.id === id);
export function curriculumLessonHref(id: string) {
  if (id.startsWith('W')) return '/courses#web-resources';
  const n = Number(id.slice(1));
  return `/courses/ai-m${Math.ceil(n / 4)}/${id}`;
}
