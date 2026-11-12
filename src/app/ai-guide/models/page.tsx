import Link from "next/link";
import { getGuide } from "@/lib/ai-guide";
import { ModelDesk } from "@/components/ai-guide/model-desk";
export const metadata = { title: "模型参考" };
export default function ModelsPage() {
  const data = getGuide();
  return <div className="guide-container"><Link href="/ai-guide/#path-choose">← 返回模型与工具文章</Link><header className="guide-section-heading"><h1>模型参考</h1><span>记录日期 · {data.capturedAt.slice(0,10)}</span></header><ModelDesk models={data.models} /></div>;
}
