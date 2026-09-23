import type { Metadata } from "next";
import { CHANGELOG } from "@/lib/vibehub/data";
import { ChangelogView } from "@/components/sites/vibe-hub-org-e37cedf6/changelog/changelog-view";

export const metadata: Metadata = {
  title: "更新日志｜AI 学习站",
  description: "AI 学习站每次更新了什么：课程、术语、练习和 Skill。",
};

export default function ChangelogPage() {
  return <ChangelogView data={CHANGELOG} />;
}
