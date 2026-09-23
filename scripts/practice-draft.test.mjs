// Tests for src/lib/ai-learning/practice-draft.mjs. No dependencies:
// node --test scripts/practice-draft.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_KEY,
  DRAFT_BACKUP_PREFIX,
  DRAFT_FIELD_IDS,
  MISSING_TEXT,
  SC_GAP_PENDING_TEXT,
  emptyFields,
  isDraftDirty,
  hasAnyText,
  parseDraft,
  loadDraft,
  saveDraft,
  draftToMarkdown,
} from "../src/lib/ai-learning/practice-draft.mjs";

const PROGRESS_KEY = "ai-learning-next:v1:progress";

// Minimal in-memory Storage with optional failure switches.
function memoryStorage(initial = {}, { failSet = () => false, failGet = false } = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    get length() {
      return map.size;
    },
    key(i) {
      return [...map.keys()][i] ?? null;
    },
    getItem(k) {
      if (failGet) throw new Error("blocked");
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      if (failSet(k)) throw new Error("quota");
      map.set(k, String(v));
    },
  };
}

let tick = 0;
const now = () => `2026-09-19T00:00:${String(tick++).padStart(2, "0")}.000Z`;

const filled = (overrides = {}) => ({ ...emptyFields(), ...overrides });

test("starts blank: no stored draft gives empty fields and no notice", () => {
  const s = memoryStorage();
  const r = loadDraft(s, { now });
  assert.equal(r.notice, null);
  assert.equal(r.baseRaw, null);
  assert.deepEqual(r.draft.fields, emptyFields());
  assert.equal(hasAnyText(r.draft.fields), false);
  assert.equal(s.map.size, 0, "loading writes nothing");
});

test("save then reload restores the same text under the one dedicated key", () => {
  const s = memoryStorage({ [PROGRESS_KEY]: '{"schemaVersion":1,"lessons":{}}' });
  const first = loadDraft(s, { now });
  const fields = filled({ problem: "练习：整理周报", result: "待验证" });
  const saved = saveDraft(s, fields, first.baseRaw, { now });
  assert.equal(saved.ok, true);
  assert.equal(saved.warning, null);
  assert.equal(s.map.get(DRAFT_KEY), saved.raw);
  assert.equal(s.map.get(PROGRESS_KEY), '{"schemaVersion":1,"lessons":{}}', "progress key untouched");
  assert.deepEqual([...s.map.keys()].sort(), [DRAFT_KEY, PROGRESS_KEY].sort());

  const again = loadDraft(s, { now });
  assert.equal(again.notice, null);
  assert.deepEqual(again.draft.fields, fields);
  assert.equal(again.draft.savedAt, saved.savedAt);
  assert.equal(again.baseRaw, saved.raw);

  // A second save from the same page uses the new base and succeeds.
  const second = saveDraft(s, filled({ problem: "改过" }), saved.raw, { now });
  assert.equal(second.ok, true);
});

test("unavailable storage: null, throwing getter, throwing getItem", () => {
  for (const source of [
    null,
    () => {
      throw new Error("SecurityError");
    },
    memoryStorage({}, { failGet: true }),
  ]) {
    const r = loadDraft(source, { now });
    assert.equal(r.notice, "unavailable");
    assert.deepEqual(r.draft.fields, emptyFields());
    const w = saveDraft(source, filled({ problem: "x" }), null, { now });
    assert.deepEqual([w.ok, w.warning, w.raw], [false, "unavailable", null]);
  }
});

test("write failure reports write_failed and leaves the stored value alone", () => {
  const s = memoryStorage({}, { failSet: (k) => k === DRAFT_KEY });
  const w = saveDraft(s, filled({ problem: "x" }), null, { now });
  assert.deepEqual([w.ok, w.warning], [false, "write_failed"]);
  assert.equal(s.map.has(DRAFT_KEY), false);
});

test("corrupt value is backed up once on load, kept, and backed up before overwrite", () => {
  const bad = "{not json";
  const s = memoryStorage({ [DRAFT_KEY]: bad });
  const r1 = loadDraft(s, { now });
  assert.equal(r1.notice, "corrupt");
  assert.ok(r1.backupKey?.startsWith(DRAFT_BACKUP_PREFIX));
  assert.equal(s.map.get(r1.backupKey), bad);
  assert.equal(s.map.get(DRAFT_KEY), bad, "load never overwrites");

  const r2 = loadDraft(s, { now });
  assert.equal(r2.backupKey, r1.backupKey, "same bad value not backed up twice");

  const w = saveDraft(s, filled({ problem: "新草稿" }), r2.baseRaw, { now });
  assert.equal(w.ok, true);
  assert.equal(w.backupKey, r1.backupKey);
  assert.equal(s.map.get(r1.backupKey), bad, "backup survives the overwrite");
  assert.deepEqual(loadDraft(s, { now }).draft.fields.problem, "新草稿");
});

test("unsupported version and non-text fields are flagged, not trusted", () => {
  assert.equal(parseDraft('{"schemaVersion":2,"fields":{}}').notice, "unsupported");
  assert.equal(parseDraft('{"schemaVersion":1,"exerciseId":"other","fields":{}}').notice, "unsupported");
  assert.equal(parseDraft('{"schemaVersion":1,"fields":{"problem":42}}').notice, "corrupt");
  assert.equal(parseDraft('{"schemaVersion":1}').notice, "corrupt");
  assert.equal(parseDraft("[]").notice, "corrupt");
  const ok = parseDraft('{"schemaVersion":1,"fields":{"problem":"a","extra":"dropped"}}');
  assert.equal(ok.notice, null);
  assert.equal(ok.draft.fields.problem, "a");
  assert.equal(Object.hasOwn(ok.draft.fields, "extra"), false);

  const s = memoryStorage({ [DRAFT_KEY]: '{"schemaVersion":2,"fields":{}}' });
  const r = loadDraft(s, { now });
  assert.equal(r.notice, "unsupported");
  assert.equal(s.map.get(r.backupKey), '{"schemaVersion":2,"fields":{}}');
});

test("backup failure blocks the overwrite", () => {
  const bad = "{broken";
  const s = memoryStorage({ [DRAFT_KEY]: bad }, { failSet: (k) => k.startsWith(DRAFT_BACKUP_PREFIX) });
  const r = loadDraft(s, { now });
  assert.deepEqual([r.notice, r.warning, r.backupKey], ["corrupt", "backup_failed", null]);
  const w = saveDraft(s, filled({ problem: "x" }), r.baseRaw, { now });
  assert.deepEqual([w.ok, w.warning], [false, "backup_failed"]);
  assert.equal(s.map.get(DRAFT_KEY), bad);
});

test("another tab's save is never silently overwritten (conflict)", () => {
  const s = memoryStorage();
  const tabA = loadDraft(s, { now });
  const tabB = loadDraft(s, { now });
  const b = saveDraft(s, filled({ problem: "B 的文字" }), tabB.baseRaw, { now });
  assert.equal(b.ok, true);

  const a = saveDraft(s, filled({ problem: "A 的文字" }), tabA.baseRaw, { now });
  assert.deepEqual([a.ok, a.warning, a.raw], [false, "conflict", null]);
  assert.equal(s.map.get(DRAFT_KEY), b.raw, "tab B's draft stays");

  // Tab A keeps getting conflict until it reloads; after reload it sees B's text.
  assert.equal(saveDraft(s, filled({ problem: "A 再试" }), tabA.baseRaw, { now }).warning, "conflict");
  assert.equal(loadDraft(s, { now }).draft.fields.problem, "B 的文字");
});

test("dirty check compares every field", () => {
  const saved = filled({ problem: "a" });
  assert.equal(isDraftDirty(saved, filled({ problem: "a" })), false);
  assert.equal(isDraftDirty(filled({ problem: "a", limits: " " }), saved), true);
});

test("copy format is deterministic, labelled as unaccepted/unsubmitted, and fills gaps", () => {
  const fields = filled({ problem: "  整理周报\r\n只用记录表  ", result: "待验证" });
  const md = draftToMarkdown(fields);
  assert.equal(md, draftToMarkdown({ ...fields }), "same input, same output");
  assert.ok(md.startsWith("# 模拟练习草稿（未验收 · 未提交）\n"));
  assert.ok(md.includes("模拟练习草稿 / 未验收 / 未提交"));
  assert.ok(md.includes("## 1. 我的业务问题与目标\n\n整理周报\n只用记录表\n"));
  assert.ok(!md.includes("\r"));
  assert.ok(md.includes("## 6. 实际结果 / 证据\n\n待验证\n"));
  assert.ok(md.includes(`## 2. 输入材料与来源边界\n\n${MISSING_TEXT}\n`));
  assert.ok(md.includes(`## 8. 对应 SC / 差距（可选）\n\n${SC_GAP_PENDING_TEXT}\n`));
  assert.equal((md.match(/^## /gm) ?? []).length, DRAFT_FIELD_IDS.length);
  assert.ok(!/20\d\d-\d\d-\d\d/.test(md), "no timestamps in the copy");

  const blank = draftToMarkdown(emptyFields());
  assert.equal((blank.match(new RegExp(`\n${MISSING_TEXT}\n`, "g")) ?? []).length, DRAFT_FIELD_IDS.length - 1);
});
