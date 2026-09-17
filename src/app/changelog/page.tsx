import type { Metadata } from "next";
import { CHANGELOG } from "@/lib/vibehub/data";
import { ChangelogView } from "@/components/sites/vibe-hub-org-e37cedf6/changelog/changelog-view";

export const metadata: Metadata = {
  title: "更新日志｜Web Coding 学习站",
  description: "看看新增了哪些词条、学习路线和实用功能。",
};

export default function ChangelogPage() {
  return <ChangelogView data={CHANGELOG} />;
}
