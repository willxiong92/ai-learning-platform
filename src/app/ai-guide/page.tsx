import { getGuide } from "@/lib/ai-guide";
import { ArticleLibrary } from "@/components/ai-guide/article-library";
import "./library.css";

export default function GuidePage() {
  const articles = getGuide().articles.map(({ slug, title, excerpt, cover }) => ({ slug, title, excerpt, cover }));
  return <ArticleLibrary articles={articles} />;
}
