import { notFound } from "next/navigation";
import { getGuide, externalGuideUrl } from "@/lib/ai-guide";
import { GuideReader } from "@/components/ai-guide/reader";
import readingData from "@/data/ai-guide-reading.json";
import learningPath from "@/data/ai-guide-learning-path.json";
import "../../source-reading.css";

export function generateStaticParams() { return getGuide().articles.map(article => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getGuide().articles.find(article => article.slug === slug)?.title ?? "文章未找到" };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getGuide();
  const article = data.articles.find(item => item.slug === slug);
  const phase = learningPath.phases.find(item => item.groups.some(group => group.slugs.includes(slug)));
  if (!article || !phase) notFound();
  const html = (readingData.articles as Record<string, string>)[slug];
  if (!html) throw new Error(`Missing reading body for ${slug}; run python3 scripts/prepare-guide-reading.py.`);
  const sequence = phase.groups.flatMap(group => group.slugs);
  const position = sequence.indexOf(slug);
  const neighbor = (id?: string) => {
    const item = data.articles.find(entry => entry.slug === id);
    return item ? { slug: item.slug, title: item.title } : undefined;
  };
  const sources = [{ label: "原始文章 ↗", url: article.sourceUrl }, ...article.sources].flatMap(source => {
    const url = externalGuideUrl(source.url);
    return url ? [{ label: source.label, url }] : [];
  });
  return <GuideReader article={article} html={html} sources={sources}
    category={{ id: phase.id, name: phase.name, count: sequence.length }}
    authorIcon={readingData.icons["/articles/ai-agent-common-operations"]}
    previous={neighbor(sequence[position - 1])} next={neighbor(sequence[position + 1])} />;
}
