import type { Metadata } from "next";
import { SkillView } from "@/components/sites/vibe-hub-org-e37cedf6/vibehub-skill/skill-view";

export const metadata: Metadata = {
  title: "VibeHub Skill｜Web Coding 学习站",
  description: "让 Vibe Coding 表达更准确：把模糊描述改写成可以直接发给 Agent 的技术术语。",
};

export default function VibehubSkillPage() {
  return <SkillView />;
}
