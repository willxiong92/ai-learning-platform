import { getGuide } from "@/lib/ai-guide";
import { GuideCollection } from "@/components/ai-guide/collection";
export const metadata = { title: "Oil 原创" };
export default function Page() { return <GuideCollection kind="original" articles={getGuide().articles.filter(a => a.kind === "original")} />; }
