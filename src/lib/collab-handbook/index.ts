// AI 协作手册的数据入口。handbook.json 由 scripts/sync-collab-handbook.mjs 从母源同步生成，不要手改。
import handbook from "./handbook.json";

export type CollabTocItem = { id: string; label: string };

type CollabBase = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  summary: string;
  published: boolean;
  sourceHash: string;
  html?: string;
  toc?: CollabTocItem[];
};

export type CollabPrinciple = CollabBase & { kind: "principle"; status: string; caseIds: string[] };
export type CollabCase = CollabBase & {
  kind: "case";
  principleIds: string[];
  paradigm: string;
  principleNoteHtml?: string;
};
export type CollabEntry = CollabPrinciple | CollabCase;

const entries = handbook.entries as CollabEntry[];

export const COLLAB_SYNCED_AT: string = handbook.syncedAt;
export const COLLAB_PRINCIPLES = entries.filter((e): e is CollabPrinciple => e.kind === "principle");
export const COLLAB_CASES = entries.filter((e): e is CollabCase => e.kind === "case");

export function getCollabEntry(slug: string): CollabEntry | undefined {
  return entries.find((e) => e.slug === slug);
}

export function getCollabById(id: string): CollabEntry | undefined {
  return entries.find((e) => e.id === id);
}

export function getPublishedCollabEntries(): CollabEntry[] {
  return entries.filter((e) => e.published && e.html);
}

export function collabHref(entry: CollabEntry): string | null {
  return entry.published ? `/ai-collab/${entry.slug}` : null;
}
