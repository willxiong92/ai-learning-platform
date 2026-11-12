import type { Metadata } from "next";
import AIF_SECTIONS from "@/lib/vibehub/aif-data.json";
import { AifView } from "@/components/sites/vibe-hub-org-e37cedf6/anti-ai-flavor/aif-view";

export const metadata: Metadata = {
  title: "防止 AI 味儿｜AI 学习站",
  description: "AI 味儿图鉴：把常见的 AI 口癖、套模板的页面和不好用的交互当成词条来认。",
};

export default function AntiAiFlavorPage() {
  return <AifView sections={AIF_SECTIONS} />;
}
