// Type declarations for practice-draft.mjs, for TypeScript consumers (UI components).

export type DraftFieldId = "problem" | "inputs" | "steps" | "output" | "checks" | "result" | "limits" | "scGap";

export type DraftFields = Record<DraftFieldId, string>;

export interface DraftFieldDef {
  id: DraftFieldId;
  label: string;
  hint: string;
  optional: boolean;
}

export interface PracticeSource {
  label: string;
  lines: readonly string[];
}

export interface PracticeExercise {
  id: string;
  title: string;
  scenario: string;
  sources: readonly PracticeSource[];
  facts: readonly string[];
  missing: readonly string[];
  humanCheck: readonly string[];
  related: readonly { lessonId: string; focus: string }[];
}

export interface PracticeDraft {
  schemaVersion: 1;
  exerciseId: string;
  /** ISO timestamp of the last successful save, or null. */
  savedAt: string | null;
  fields: DraftFields;
}

export type DraftNotice = "corrupt" | "unsupported" | "unavailable";

/** Subset of the Web Storage API; pass window.localStorage (or a getter for it) from the UI. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  key?(index: number): string | null;
  readonly length?: number;
}

export type StorageSource = StorageLike | null | undefined | (() => StorageLike | null | undefined);

export interface DraftStorageOptions {
  now?: () => string;
}

export interface DraftLoadResult {
  draft: PracticeDraft;
  notice: DraftNotice | null;
  warning: "backup_failed" | null;
  backupKey: string | null;
  /** Stored value exactly as read; pass it back to saveDraft. */
  baseRaw: string | null;
}

export interface DraftSaveResult {
  ok: boolean;
  warning: "unavailable" | "conflict" | "backup_failed" | "write_failed" | null;
  backupKey: string | null;
  /** New stored value on success (the next baseRaw), otherwise null. */
  raw: string | null;
  savedAt: string | null;
}

export const DRAFT_KEY: "ai-learning-next:v1:practice-draft";
export const DRAFT_BACKUP_PREFIX: "ai-learning-next:v1:practice-draft-backup:";
export const DRAFT_SCHEMA_VERSION: 1;
export const MISSING_TEXT: "待补充";
export const SC_GAP_PENDING_TEXT: "待业务项目确定";
export const DRAFT_FIELDS: readonly DraftFieldDef[];
export const DRAFT_FIELD_IDS: readonly DraftFieldId[];
export const PRACTICE_EXERCISE: PracticeExercise;

export function emptyFields(): DraftFields;
export function normalizeFields(value: unknown): DraftFields;
export function isDraftDirty(fields: unknown, savedFields: unknown): boolean;
export function hasAnyText(fields: unknown): boolean;

export function emptyDraft(): PracticeDraft;
export function parseDraft(raw: unknown): { draft: PracticeDraft; notice: "corrupt" | "unsupported" | null };
export function serializeDraft(fields: unknown, savedAt: string | null): string;

export function loadDraft(source: StorageSource, options?: DraftStorageOptions): DraftLoadResult;
export function saveDraft(
  source: StorageSource,
  fields: unknown,
  baseRaw: string | null,
  options?: DraftStorageOptions,
): DraftSaveResult;

export function draftToMarkdown(fields: unknown): string;
