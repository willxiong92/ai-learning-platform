"use client";

// Local practice draft for /learning/practice. Storage rules (one key, backup
// before overwrite, conflict instead of overwriting another tab's save) live in
// practice-draft.mjs; this file only wires them to the page. Nothing here
// uploads or submits: the only outside effect is the clipboard, and only when
// the learner clicks the copy button.
import { useState, useSyncExternalStore } from "react";
import {
  DRAFT_FIELDS,
  draftToMarkdown,
  isDraftDirty,
  loadDraft,
  saveDraft,
  type DraftFieldId,
  type DraftFields,
  type DraftLoadResult,
  type DraftSaveResult,
} from "@/lib/ai-learning/practice-draft.mjs";

const LOAD_NOTICE: Record<string, string> = {
  corrupt: "本机保存的草稿无法读取，已从空白开始",
  unsupported: "本机保存的草稿来自不认识的版本，已从空白开始",
  unavailable: "这个浏览器不允许本地存储：可以照常填写和复制，但保存不了",
};

const SAVE_FAILURE: Record<string, string> = {
  unavailable: "浏览器不允许本地存储",
  backup_failed: "旧草稿备份失败，为避免覆盖没有写入",
  write_failed: "写入失败（可能是存储空间已满）",
};

// Reaching window.localStorage can throw when storage is blocked; the draft
// module calls this getter inside try/catch.
const getStorage = () => window.localStorage;

const noopSubscribe = () => () => {};

/** Renders the editor only after hydration, so the first client render reads storage safely. */
export function PracticeDraft() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return <p className="ai-learning-note">正在读取本机草稿……</p>;
  return <PracticeDraftEditor />;
}

type CopyState = { kind: "idle" } | { kind: "copied" } | { kind: "manual"; text: string };

function PracticeDraftEditor() {
  // Loaded once. There is deliberately no listener for other tabs: nothing
  // changes this page's text while the learner is typing.
  const [initial] = useState<DraftLoadResult>(() => loadDraft(getStorage));
  const [fields, setFields] = useState<DraftFields>(initial.draft.fields);
  const [savedFields, setSavedFields] = useState<DraftFields>(initial.draft.fields);
  const [savedAt, setSavedAt] = useState<string | null>(initial.draft.savedAt);
  const [baseRaw, setBaseRaw] = useState<string | null>(initial.baseRaw);
  const [lastSave, setLastSave] = useState<DraftSaveResult | null>(null);
  const [copy, setCopy] = useState<CopyState>({ kind: "idle" });

  const dirty = isDraftDirty(fields, savedFields);

  const update = (id: DraftFieldId, value: string) => {
    setFields((prev) => ({ ...prev, [id]: value }));
    setCopy({ kind: "idle" });
  };

  const onSave = () => {
    const result = saveDraft(getStorage, fields, baseRaw);
    setLastSave(result);
    if (result.ok) {
      setSavedFields(fields);
      setSavedAt(result.savedAt);
      setBaseRaw(result.raw);
    }
  };

  const onCopy = async () => {
    const text = draftToMarkdown(fields);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setCopy({ kind: "copied" });
    } catch {
      setCopy({ kind: "manual", text });
    }
  };

  const loadLines: string[] = [];
  if (initial.notice) {
    const backup =
      initial.notice !== "unavailable" && initial.backupKey ? `（原记录已备份在本浏览器：${initial.backupKey}）` : "";
    loadLines.push(`${LOAD_NOTICE[initial.notice]}${backup}。`);
  }
  if (initial.warning === "backup_failed") loadLines.push("原草稿备份失败，本页不会覆盖它。");

  return (
    <div className="ai-learning-draft">
      {loadLines.length > 0 && (
        <div className="ai-learning-warning" role="status">
          {loadLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      <form
        className="ai-learning-draft-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        {DRAFT_FIELDS.map((field, i) => (
          <div key={field.id} className="ai-learning-draft-field">
            <label htmlFor={`draft-${field.id}`}>
              <span className="ai-learning-question-no">{i + 1}.</span>
              {field.label}
            </label>
            <p className="ai-learning-note">{field.hint}</p>
            <textarea
              id={`draft-${field.id}`}
              className="ai-learning-textarea"
              rows={field.optional ? 2 : 4}
              value={fields[field.id]}
              onChange={(e) => update(field.id, e.target.value)}
            />
          </div>
        ))}

        <div className="ai-learning-draft-bar">
          <p className="ai-learning-draft-state" role="status">
            {dirty
              ? "有未保存的修改：刷新或关闭页面会丢失"
              : savedAt
                ? `已保存到本浏览器（${savedAt.slice(0, 16).replace("T", " ")} UTC）`
                : "还没有保存过"}
          </p>
          <div className="ai-learning-draft-actions">
            <button type="submit" className="ai-learning-button is-primary">
              保存草稿
            </button>
            <button type="button" className="ai-learning-button" onClick={onCopy}>
              复制为 Markdown
            </button>
          </div>
        </div>
      </form>

      {lastSave && !lastSave.ok && (
        <div className="ai-learning-warning" role="alert">
          {lastSave.warning === "conflict" ? (
            <p>
              没有保存：另一个标签页在你打开本页之后保存过草稿，本页不会覆盖它。你现在的文字还在本页：请先点“复制为
              Markdown”或手动复制留底，再刷新本页查看已保存的版本，自行决定保留哪些内容后重新保存。
            </p>
          ) : (
            <p>
              没有保存（{SAVE_FAILURE[lastSave.warning ?? "write_failed"]}）：文字只在本页，刷新或关闭后会丢失，可以先复制留底。
            </p>
          )}
        </div>
      )}

      {copy.kind === "copied" && (
        <p className="ai-learning-note" role="status">
          已复制到剪贴板。复制只是把文字放进你的剪贴板，没有提交给任何人，也不是验收。
        </p>
      )}
      {copy.kind === "manual" && (
        <div className="ai-learning-warning" role="status">
          <p>这个浏览器没有允许自动复制，内容还没有复制。请在下面的文本框里全选后手动复制：</p>
          <textarea
            className="ai-learning-textarea ai-learning-draft-fallback"
            readOnly
            rows={10}
            value={copy.text}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="草稿 Markdown，手动复制"
          />
        </div>
      )}
    </div>
  );
}
