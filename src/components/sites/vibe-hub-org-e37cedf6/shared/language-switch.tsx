"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { id: "zh", label: "中文" },
  { id: "en", label: "English" },
] as const;

/**
 * Live site has a full /en translation; this fork is Chinese-only, so the
 * switch is visual/interactive parity only (no English content to route to).
 */
export function LanguageSwitch() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = LANGUAGES.find((l) => l.id === lang)!;

  return (
    <div className="nav-language" ref={ref}>
      <button
        type="button"
        className="nav-lang"
        aria-label="选择语言"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current.label}</span>
        <i aria-hidden="true" />
      </button>
      {open && (
        <div className="nav-popover nav-language-popover right" role="menu" aria-label="选择语言">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="menuitemradio"
              aria-checked={l.id === lang}
              className={`nav-language-option${l.id === lang ? " is-selected" : ""}`}
              onClick={() => {
                setLang(l.id);
                setOpen(false);
              }}
            >
              <span>{l.label}</span>
              <i aria-hidden="true">{l.id === lang ? "✓" : ""}</i>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
