"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { SearchBox } from "./search-box";
import { ThemeControls } from "./theme-controls";
import { LanguageSwitch } from "./language-switch";

const NAV_ITEMS = [
  { href: "/", label: "术语" },
  { href: "/practice", label: "练习" },
  { href: "/courses", label: "课程" },
  { href: "/anti-ai-flavor", label: "防止 AI 味儿" },
  { href: "/changelog", label: "更新" },
] as const;

function isNavItemCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const isSkillCurrent = isNavItemCurrent(pathname, "/vibehub-skill");

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link className="vh-logo" href="/" aria-label="VibeHub">
          <img
            className="vh-logo-mark"
            src="/sites/vibe-hub-org-e37cedf6/shared/images/vh-logo-v4-tight.png"
            alt=""
            width={20}
            height={20}
          />
          <span className="vh-logo-stage" aria-hidden="true">
            <span className="vh-word vh-word-brand">
              Vibe<b>Hub</b>
            </span>
            <span className="vh-word vh-word-tagline">Web Coding 学习站</span>
          </span>
        </Link>
        <div className="nav-primary">
          {NAV_ITEMS.map((item) => {
            const current = isNavItemCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                className={`nav-primary-item${current ? " is-current" : ""}`}
                href={item.href}
                aria-current={current ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            className={`nav-skill-link${isSkillCurrent ? " is-current" : ""}`}
            href="/vibehub-skill"
            aria-label="Skill"
            aria-current={isSkillCurrent ? "page" : undefined}
          >
            <i className="ti ti-ai-agent" aria-hidden="true" />
            <span>Skill</span>
          </Link>
        </div>
      </div>
      <div className="nav-right">
        <Suspense fallback={<div className="nav-search" />}>
          <SearchBox />
        </Suspense>
        <LanguageSwitch />
        <ThemeControls />
      </div>
      <button
        type="button"
        className="nav-mobile-toggle"
        aria-label="打开菜单"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {menuOpen && (
        <div className="nav-mobile-menu">
          <Link href="/" onClick={() => setMenuOpen(false)}>术语</Link>
          <Link href="/practice" onClick={() => setMenuOpen(false)}>练习</Link>
          <Link href="/courses" onClick={() => setMenuOpen(false)}>课程</Link>
          <Link href="/anti-ai-flavor" onClick={() => setMenuOpen(false)}>防止 AI 味儿</Link>
          <Link href="/changelog" onClick={() => setMenuOpen(false)}>更新</Link>
          <Link href="/vibehub-skill" onClick={() => setMenuOpen(false)}>Skill</Link>
          <Link href="/favorites" onClick={() => setMenuOpen(false)}>收藏</Link>
        </div>
      )}
    </nav>
  );
}
