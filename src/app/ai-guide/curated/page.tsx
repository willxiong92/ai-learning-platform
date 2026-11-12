import { getGuide } from "@/lib/ai-guide";
import { GuideCollection } from "@/components/ai-guide/collection";
export const metadata = { title: "精选收录" };
export default function Page() { return <GuideCollection kind="curated" articles={getGuide().articles.filter(a => a.kind === "curated")} />; }
