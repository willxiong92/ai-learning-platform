import { readFileSync } from "node:fs";
import path from "node:path";

export interface GuideModel {
  id: string; name: string; category: string; tagline: string; description: string;
  strengths: string | string[]; limitations: string | string[]; scenarios: string | string[];
}
export interface GuideArticle {
  slug: string; title: string; kind: "original" | "curated"; category: string;
  author: string; date: string; sourceUrl: string; sources: { label: string; url: string }[];
  html: string; excerpt: string; cover: string;
  headings: { id: string; title: string; level: number }[];
  status: "public_complete" | "authorized_complete" | "public_excerpt";
}
export interface GuideData { capturedAt: string; models: GuideModel[]; articles: GuideArticle[] }
export function getGuide(): GuideData {
  const data = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/ai-guide.json"), "utf8")) as GuideData;
  if (!data.models.length || data.models.some(m => [m.name, m.description, m.strengths, m.limitations, m.scenarios].some(value => !(Array.isArray(value) ? value.join("") : value)?.trim()))) {
    throw new Error("AI guide model dossier is incomplete; verify the canonical source before building.");
  }
  return data;
}
export const guideHref = (slug: string) => `/ai-guide/articles/${encodeURIComponent(slug)}`;
export const collectionLabel = (kind: GuideArticle["kind"]) => kind === "original" ? "Oil 原创" : "精选收录";

export function externalGuideUrl(value: string): string | undefined {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
