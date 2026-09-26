"use client";

import { useEffect, useRef, useState } from "react";
import {
  COLOR_MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  THEMES,
} from "@/lib/vibehub/theme";

function applyTheme(id: string) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  const root = document.documentElement;
  root.style.setProperty("--theme-brand", theme.brand);
  root.style.setProperty("--theme-brand-hover", theme.brandHover);
  root.style.setProperty("--theme-dark-brand", theme.darkBrand);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

function applyColorMode(mode: "light" | "dark") {
  document.documentElement.dataset.colorMode = mode;
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

// 亮暗切换动效：浏览器支持 View Transitions 时，新配色从按钮位置画圆展开（样式在 handbook-motion.css）；
// 不支持、或系统开了「减少动态效果」时，直接切换，和原来一样。
function switchColorMode(mode: "light" | "dark", origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || reduceMotion) {
    applyColorMode(mode);
    return;
  }
  if (origin) {
    root.style.setProperty("--hb-vt-x", `${origin.x}px`);
    root.style.setProperty("--hb-vt-y", `${origin.y}px`);
  }
  root.dataset.vt = "color-mode";
  const transition = document.startViewTransition(() => applyColorMode(mode));
  transition.finished.finally(() => {
    delete root.dataset.vt;
  });
}

export function ThemeControls() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reads a value set by the pre-hydration inline script (THEME_INIT_SCRIPT);
    // must run post-mount since the server can't know the client's stored mode.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode((document.documentElement.dataset.colorMode as "light" | "dark") || "light");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <>
      <div className="nav-theme" ref={ref}>
        <button
          type="button"
          className="nav-circle"
          title="主题色"
          aria-label="主题色"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        />
        {open && (
          <div className="theme-dot-menu" role="menu">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                className="theme-dot-swatch"
                title={t.label}
                aria-label={t.label}
                style={{ background: t.brand }}
                onClick={() => {
                  applyTheme(t.id);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        className="nav-color-mode"
        aria-label={nextMode === "dark" ? "切换到黑夜模式" : "切换到白天模式"}
        title={nextMode === "dark" ? "切换到黑夜模式" : "切换到白天模式"}
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          switchColorMode(nextMode, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
          setMode(nextMode);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <g className="color-mode-sun" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
          <path
            className="color-mode-moon"
            strokeLinejoin="round"
            d="M20.5 14.1A8.7 8.7 0 0 1 9.9 3.5a8.8 8.8 0 1 0 10.6 10.6Z"
          />
        </svg>
      </button>
    </>
  );
}
