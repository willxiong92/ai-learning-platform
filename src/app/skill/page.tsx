import type { Metadata } from "next";
import "./skills.css";
import { SkillView } from "@/components/sites/vibe-hub-org-e37cedf6/skill/skill-view";

export const metadata: Metadata = {
  title: "Skill｜AI 学习站",
  description: "本机 Codex Skill 首轮精选：用途、依赖、版本快照及可下载文件。",
};

export default function SkillPage() {
  return <SkillView />;
}
