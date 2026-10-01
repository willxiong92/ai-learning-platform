"use client";

import { useState } from "react";

/** 范式的简版和完整版都要能一键复制：简版是一句话，完整版是要填空的模板 */
export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("fail");
    }
    window.setTimeout(() => setState("idle"), 1600);
  }

  return (
    <button type="button" className="collab-copy" onClick={copy} aria-label={`${label}：复制到剪贴板`}>
      {state === "done" ? "已复制" : state === "fail" ? "复制失败，请手动选中" : label}
    </button>
  );
}
