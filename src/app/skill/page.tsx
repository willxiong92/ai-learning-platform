import type { Metadata } from "next";
import { SkillView } from "@/components/sites/vibe-hub-org-e37cedf6/skill/skill-view";

export const metadata: Metadata = {
  title: "Skill｜AI 学习站",
  description: "精选团队成熟 Skill，关联来源、适用条件、版本与验证范围。",
};

export default function SkillPage() {
  return <SkillView />;
}
