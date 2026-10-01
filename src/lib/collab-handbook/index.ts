// AI 协作手册的数据入口。handbook.json 由 scripts/sync-collab-handbook.mjs 从母源同步生成，不要手改。
// 一张卡 = 一个坑的一整套内容：案例 + 主原理 + 沟通范式，页面按「先讲事，再讲理」排。
import handbook from "./handbook.json";

export type CollabPrinciple = {
  id: string;
  name: string;
  headline: string;
  summary: string;
  status: string;
  caseCount: number;
};

// 详情页的部件。同步脚本把母源里的表格、列表、范式认出来，排成下面这些块；
// 带 html 的字段是脚本渲染并校验过的行内 HTML（只有粗体、引号这类），文字都来自母源。
type Html = string;
type StorySide = { label: string; tag: string; tone: "good" | "bad"; items: { k: string; html: Html }[] };
type ListItem = { title: Html | null; html: Html };

export type CollabBlock =
  | { type: "chat"; items: { who: "me" | "ai"; label: string; html: Html }[] }
  | { type: "versus"; left: StorySide; right: StorySide }
  | { type: "takeaway"; label: string; html: Html }
  | { type: "analogy"; html: Html }
  | { type: "details"; summary: string; html: Html }
  | { type: "contrast"; title: string; rows: { head: Html; before: Html; after: Html; term: Html }[] }
  | { type: "summary"; label: string; html: Html }
  | ({ type: "principle" } & CollabPrinciple)
  | { type: "myths"; title: string; items: { myth: Html; fact: Html; term: Html }[] }
  | { type: "cards"; title: string; items: { title: Html; html: Html }[] }
  | { type: "checklist"; title: string; lead?: Html[]; items: ListItem[]; notes?: Html[] }
  | { type: "lead" | "note"; html: Html }
  | {
      type: "steps";
      title: string;
      lead: Html[];
      items: { step: Html; what: Html; say: Html }[];
      notes: Html[];
    }
  | {
      type: "paradigm";
      title: string;
      when: Html;
      short: { note: Html; html: Html; text: string };
      full: { note: Html; text: string };
      diff: Html[];
      notes: Html[];
    }
  | { type: "quiz"; question: Html; answer: Html };

export type CollabSection = { id: string; title: string; blocks: CollabBlock[] };

export type CollabTopic = {
  slug: string;
  caseId: string;
  /** 卡片标题 = 沟通范式名 */
  title: string;
  /** 详情页大标题 = 案例标题 */
  headline: string;
  summary: string;
  /** 范式简版：一句可以直接发给 AI 的话 */
  sayShort: string;
  principle: CollabPrinciple;
  related: CollabPrinciple[];
  published: boolean;
  sections?: CollabSection[];
};

export const COLLAB_TOPICS = handbook.topics as unknown as CollabTopic[];
export const COLLAB_SYNCED_AT: string = handbook.syncedAt;

export function getCollabTopic(slug: string): CollabTopic | undefined {
  return COLLAB_TOPICS.find((t) => t.slug === slug);
}

export function getPublishedCollabTopics(): CollabTopic[] {
  return COLLAB_TOPICS.filter((t) => t.published && t.sections?.length);
}

export function collabHref(topic: CollabTopic): string | null {
  return topic.published ? `/ai-collab/${topic.slug}` : null;
}
