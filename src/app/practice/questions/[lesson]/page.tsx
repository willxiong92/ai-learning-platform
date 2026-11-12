import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticeView } from "@/components/sites/vibe-hub-org-e37cedf6/practice/practice-view";
import { PRACTICE_QUESTIONS } from "@/lib/vibehub/data";
import "../../../learning-paths.css";
const lessons = ["l01", "l02", "l03", "l04"];
export const dynamicParams = false;
export function generateStaticParams() { return lessons.map(lesson => ({ lesson })); }
export default async function LessonQuestions({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  if (!lessons.includes(lesson)) notFound();
  const questions = PRACTICE_QUESTIONS.filter(q => q.id.startsWith(`ai-${lesson}-`));
  return <><header className="learning-hub"><h1>{lesson.toUpperCase()} · 本课题目</h1><p>6 道情境判断题，以及动手任务和简答。不计分、不保存；参照用于自查。</p><nav aria-label="题库章节">{lessons.map(id => <Link key={id} href={`/practice/questions/${id}`}>{id.toUpperCase()} 题目　</Link>)}</nav><Link href={`/courses/ai-m1/${lesson}`}>回本课教材 →</Link></header><PracticeView key={lesson} questions={questions} /></>;
}
