// Practice draft for /learning/practice: one local draft, the fixed synthetic
// exercise it belongs to, and the plain-Markdown copy format. Pure functions
// only — no window, no localStorage — so it runs in the browser and in
// node:test. Storage is always passed in by the caller.
//
// Principles:
// - Exactly one storage key, never the progress key.
// - A stored value this code cannot read is backed up before anything
//   overwrites it; when the backup fails, nothing is written.
// - Saving compares the stored value with the one this page loaded. If another
//   tab saved in between, the save is refused (conflict) and nothing is written;
//   there is no automatic merge.
// - The copy format is deterministic and always says it is a synthetic,
//   unaccepted, unsubmitted draft. Empty fields read "待补充".

export const DRAFT_KEY = "ai-learning-next:v1:practice-draft";
export const DRAFT_BACKUP_PREFIX = "ai-learning-next:v1:practice-draft-backup:";
export const DRAFT_SCHEMA_VERSION = 1;
export const MISSING_TEXT = "待补充";
export const SC_GAP_PENDING_TEXT = "待业务项目确定";

// Order here is the order on the page and in the copied Markdown.
export const DRAFT_FIELDS = Object.freeze([
  {
    id: "problem",
    label: "我的业务问题与目标",
    hint: "用自己的话写：想解决什么问题，做到什么程度算达成。只写模拟或已去掉客户信息的情况。",
    optional: false,
  },
  {
    id: "inputs",
    label: "输入材料与来源边界",
    hint: "要用哪些材料、各自从哪里来；哪些不能交给 AI，哪些内容 AI 不能自己补。",
    optional: false,
  },
  {
    id: "steps",
    label: "步骤与人工确认点",
    hint: "按顺序写步骤，并标出哪一步必须由人确认后才能继续。",
    optional: false,
  },
  {
    id: "output",
    label: "计划产出",
    hint: "最后要交出什么：格式、给谁看、多长。",
    optional: false,
  },
  {
    id: "checks",
    label: "验收检查",
    hint: "拿什么核对产出是对的，例如逐条对照原始记录。",
    optional: false,
  },
  {
    id: "result",
    label: "实际结果 / 证据",
    hint: "还没做或还没核对，就写“待验证”。不要写没有记录支撑的数字。",
    optional: false,
  },
  {
    id: "limits",
    label: "局限与下一步",
    hint: "这次做法哪里不可靠、下一步准备怎么改。",
    optional: false,
  },
  {
    id: "scGap",
    label: "对应 SC / 差距（可选）",
    hint: "不确定就留空，复制时会显示“待业务项目确定”。不要自己编号。",
    optional: true,
  },
]);

export const DRAFT_FIELD_IDS = Object.freeze(DRAFT_FIELDS.map((f) => f.id));

// The fixed synthetic exercise. Original and made up: no brands, people,
// customers or results. Shown next to the draft, never copied into its fields.
export const PRACTICE_EXERCISE = Object.freeze({
  id: "weekly-report-v1",
  title: "用 AI 把本周任务记录整理成周报",
  scenario:
    "你手上有一张本周任务记录表和一句同事的口头补充，想让 AI 帮你写一段三五行的周报初稿，发出前由你自己核对。",
  sources: Object.freeze([
    Object.freeze({
      label: "材料 1：任务记录表（模拟）",
      lines: Object.freeze([
        "任务 A：整理新人培训资料目录｜状态：待处理｜备注：等负责人确认目录范围",
        "任务 B：更新常见问题清单第 3 版｜状态：已完成｜完成日：周三",
        "任务 C：准备下周内部分享提纲｜状态：进行中｜备注：初稿已写，未评审",
      ]),
    }),
    Object.freeze({
      label: "材料 2：同事口头补充（模拟，未记录在表里）",
      lines: Object.freeze(["“任务 A 应该这周能搞定吧。”"]),
    }),
  ]),
  facts: Object.freeze([
    "记录表显示：任务 B 状态为已完成，完成日周三。",
    "记录表显示：任务 A 状态为待处理，备注为等负责人确认目录范围。",
    "记录表显示：任务 C 状态为进行中，备注为初稿已写、未评审。",
    "同事口头补充：预计任务 A 这周能完成（这是一句预计，不是完成确认）。",
  ]),
  missing: Object.freeze([
    "任务 A 是否已完成：口头补充只是预计，不能证明已完成；周报里不能写成“本周完成”。",
    "任务 C 的评审结论：材料里没有提供，不代表一定没有评审；不能写“已定稿”，也不能写“没人评审”。",
    "任何效果数字（节省多少时间、提升多少比例）：材料里没有提供，不能让 AI 补。",
  ]),
  humanCheck: Object.freeze([
    "AI 容易把“应该能搞定”这样的预计写成“已完成”，或把“进行中”顺手写成“已完成”。预计只说明有人这样估计，不能证明事情已经完成。",
    "记录表和口头说法都不一定等于实际情况：发出前逐条核对每条说法的来源、记录或说出的时间、指的是哪项任务，并回看原话；不因为是表格或是口头，就默认哪一方更可信。",
    "核对后仍对不上的，周报里同时保留两种说法（例如“记录表为待处理；同事预计本周完成”），并找任务负责人确认；缺的信息写“待确认”，而不是让 AI 猜。",
  ]),
  related: Object.freeze([
    Object.freeze({ lessonId: "l02", focus: "把任务要求说清楚：目标、读者、格式、哪些不能写。" }),
    Object.freeze({ lessonId: "l03", focus: "只给需要的材料，并说明每份材料的来源和可信程度。" }),
    Object.freeze({ lessonId: "l04", focus: "拿原始记录逐条核对 AI 的输出，缺的标出来。" }),
  ]),
});

// ---------- small helpers ----------

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const nonEmpty = (v) => typeof v === "string" && v !== "";

export function emptyFields() {
  const out = {};
  for (const id of DRAFT_FIELD_IDS) out[id] = "";
  return out;
}

/** Known fields only; anything that is not a string becomes "". */
export function normalizeFields(v) {
  const out = emptyFields();
  if (!isObj(v)) return out;
  for (const id of DRAFT_FIELD_IDS) if (own(v, id) && typeof v[id] === "string") out[id] = v[id];
  return out;
}

export function isDraftDirty(fields, savedFields) {
  const a = normalizeFields(fields);
  const b = normalizeFields(savedFields);
  return DRAFT_FIELD_IDS.some((id) => a[id] !== b[id]);
}

export function hasAnyText(fields) {
  const f = normalizeFields(fields);
  return DRAFT_FIELD_IDS.some((id) => f[id].trim() !== "");
}

// ---------- stored format ----------

export function emptyDraft() {
  return { schemaVersion: DRAFT_SCHEMA_VERSION, exerciseId: PRACTICE_EXERCISE.id, savedAt: null, fields: emptyFields() };
}

// Returns { draft, notice }. notice: null | "corrupt" | "unsupported".
// Never modifies the raw string; the caller decides whether to back it up.
export function parseDraft(raw) {
  if (raw === null || raw === undefined || raw === "") return { draft: emptyDraft(), notice: null };
  if (typeof raw !== "string") return { draft: emptyDraft(), notice: "corrupt" };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { draft: emptyDraft(), notice: "corrupt" };
  }
  if (!isObj(parsed)) return { draft: emptyDraft(), notice: "corrupt" };
  if (own(parsed, "schemaVersion") && parsed.schemaVersion !== DRAFT_SCHEMA_VERSION) {
    return { draft: emptyDraft(), notice: "unsupported" };
  }
  if (parsed.schemaVersion !== DRAFT_SCHEMA_VERSION || !isObj(parsed.fields)) {
    return { draft: emptyDraft(), notice: "corrupt" };
  }
  if (own(parsed, "exerciseId") && parsed.exerciseId !== PRACTICE_EXERCISE.id) {
    return { draft: emptyDraft(), notice: "unsupported" };
  }
  // A known field holding something other than text means we cannot trust the record.
  for (const id of DRAFT_FIELD_IDS) {
    if (own(parsed.fields, id) && typeof parsed.fields[id] !== "string") return { draft: emptyDraft(), notice: "corrupt" };
  }
  return {
    draft: {
      schemaVersion: DRAFT_SCHEMA_VERSION,
      exerciseId: PRACTICE_EXERCISE.id,
      savedAt: nonEmpty(parsed.savedAt) ? parsed.savedAt : null,
      fields: normalizeFields(parsed.fields),
    },
    notice: null,
  };
}

export function serializeDraft(fields, savedAt) {
  return JSON.stringify({
    schemaVersion: DRAFT_SCHEMA_VERSION,
    exerciseId: PRACTICE_EXERCISE.id,
    savedAt,
    fields: normalizeFields(fields),
  });
}

// ---------- storage (injected, Storage-like) ----------

const defaultNow = () => new Date().toISOString();
const hasStorage = (s) => !!s && typeof s.getItem === "function" && typeof s.setItem === "function";

// Accepts a storage object or a function returning one. Reaching
// window.localStorage can itself throw (blocked storage), so a getter is
// called here inside try/catch.
function resolveStorage(source) {
  let s = source;
  if (typeof source === "function") {
    try {
      s = source();
    } catch {
      return null;
    }
  }
  return hasStorage(s) ? s : null;
}

function findBackup(storage, raw) {
  try {
    const n = typeof storage.length === "number" ? storage.length : 0;
    if (typeof storage.key !== "function") return null;
    for (let i = 0; i < n; i++) {
      const k = storage.key(i);
      if (typeof k === "string" && k.startsWith(DRAFT_BACKUP_PREFIX) && storage.getItem(k) === raw) return k;
    }
  } catch {
    // Cannot enumerate: fall through and write a new backup.
  }
  return null;
}

// The same unreadable value is backed up only once, so reloads do not pile up copies.
function ensureBackup(storage, raw, now) {
  const existing = findBackup(storage, raw);
  if (existing) return existing;
  try {
    const base = DRAFT_BACKUP_PREFIX + now();
    let key = base;
    for (let i = 1; storage.getItem(key) !== null && storage.getItem(key) !== raw; i++) key = `${base}#${i}`;
    storage.setItem(key, raw);
    return storage.getItem(key) === raw ? key : null;
  } catch {
    return null;
  }
}

// Returns { draft, notice, warning, backupKey, baseRaw }.
// notice: null | "corrupt" | "unsupported" | "unavailable"; warning: null | "backup_failed".
// baseRaw is the stored value exactly as read; pass it back to saveDraft.
// Never throws and never overwrites the stored value.
export function loadDraft(source, options = {}) {
  const now = options.now ?? defaultNow;
  const storage = resolveStorage(source);
  const unavailable = { draft: emptyDraft(), notice: "unavailable", warning: null, backupKey: null, baseRaw: null };
  if (!storage) return unavailable;
  let raw;
  try {
    raw = storage.getItem(DRAFT_KEY);
  } catch {
    return unavailable;
  }
  const { draft, notice } = parseDraft(raw);
  if (!notice) return { draft, notice, warning: null, backupKey: null, baseRaw: raw };
  const backupKey = ensureBackup(storage, raw, now);
  return { draft, notice, warning: backupKey ? null : "backup_failed", backupKey, baseRaw: raw };
}

// Returns { ok, warning, backupKey, raw, savedAt }.
// warning: null | "unavailable" | "conflict" | "backup_failed" | "write_failed".
// On success raw is the new stored value (the next baseRaw). On any failure
// nothing is written and the caller keeps its text in memory.
export function saveDraft(source, fields, baseRaw, options = {}) {
  const now = options.now ?? defaultNow;
  const fail = (warning, backupKey = null) => ({ ok: false, warning, backupKey, raw: null, savedAt: null });
  const storage = resolveStorage(source);
  if (!storage) return fail("unavailable");
  let current;
  try {
    current = storage.getItem(DRAFT_KEY);
  } catch {
    return fail("unavailable");
  }
  // Another tab (or anything else) changed the stored draft since this page loaded it.
  if (current !== (baseRaw ?? null)) return fail("conflict");
  let backupKey = null;
  if (parseDraft(current).notice) {
    backupKey = ensureBackup(storage, current, now);
    if (!backupKey) return fail("backup_failed");
  }
  const savedAt = now();
  const raw = serializeDraft(fields, savedAt);
  try {
    storage.setItem(DRAFT_KEY, raw);
  } catch {
    return fail("write_failed", backupKey);
  }
  return { ok: true, warning: null, backupKey, raw, savedAt };
}

// ---------- copy format ----------

const clean = (s) => (typeof s === "string" ? s.replace(/\r\n?/g, "\n").trim() : "");

/** Plain Markdown for the clipboard. Same fields in, same text out. */
export function draftToMarkdown(fields) {
  const f = normalizeFields(fields);
  const lines = [
    "# 模拟练习草稿（未验收 · 未提交）",
    "",
    "> 模拟练习草稿 / 未验收 / 未提交。仅供本人练习，不是客户案例，也不是业务成果；复制不等于提交。",
    "",
    `练习情境（模拟）：${PRACTICE_EXERCISE.title}`,
  ];
  DRAFT_FIELDS.forEach((field, i) => {
    const text = clean(f[field.id]);
    const fallback = field.id === "scGap" ? SC_GAP_PENDING_TEXT : MISSING_TEXT;
    lines.push("", `## ${i + 1}. ${field.label}`, "", text === "" ? fallback : text);
  });
  return `${lines.join("\n")}\n`;
}
