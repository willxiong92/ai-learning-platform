import type { Metadata } from "next";
import "./guide.css";
export const metadata: Metadata = { title: { default: "实践指南｜OKKI 团队", template: "%s｜实践指南" }, description: "按主题阅读 AI 基础、模型与工具、方法与协作、设计开发和产品创作文章。" };
export default function GuideLayout({ children }: { children: React.ReactNode }) { return <div className="ai-guide">{children}</div>; }
