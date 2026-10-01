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

export type CollabSection = { id: string; title: string; html: string };

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

export const COLLAB_TOPICS = handbook.topics as CollabTopic[];
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
