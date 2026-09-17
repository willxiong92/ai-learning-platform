import type { Metadata } from "next";
import { PRACTICE_QUESTIONS } from "@/lib/vibehub/data";
import { PracticeView } from "@/components/sites/vibe-hub-org-e37cedf6/practice/practice-view";

export const metadata: Metadata = {
  title: "Vibe Coding 术语判断练习｜VibeHub",
  description: "通过真实场景练习前端、后端、产品等术语：先观察场景、作出判断，再用即时反馈理解对应概念。",
};

export default function PracticePage() {
  return <PracticeView questions={PRACTICE_QUESTIONS} />;
}
