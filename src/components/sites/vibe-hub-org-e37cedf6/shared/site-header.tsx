"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { SearchBox } from "./search-box";
import { ThemeControls } from "./theme-controls";

const NAV_ITEMS = [
  { href: "/", label: "术语" },
  { href: "/ai-guide", label: "课程" },
  { href: "/practice", label: "实践" },
  { href: "/changelog", label: "更新" },
] as const;

function isNavItemCurrent(pathname: string, href: string) {
  if (href === "/practice" && pathname.startsWith("/ai-collab")) return true;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const isSkillCurrent = isNavItemCurrent(pathname, "/skill");

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link className="vh-logo" href="/" aria-label="OKKI 团队 AI 学习网站">
          <span className="okki-wordmark" aria-hidden="true" />
          <span className="okki-site-name" aria-hidden="true">团队 AI 学习站</span>
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
            href="/skill"
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
          <Link href="/ai-guide" onClick={() => setMenuOpen(false)}>课程</Link>
          <Link href="/practice" onClick={() => setMenuOpen(false)}>实践</Link>
          <Link href="/changelog" onClick={() => setMenuOpen(false)}>更新</Link>
          <Link href="/skill" onClick={() => setMenuOpen(false)}>Skill</Link>
          <Link href="/favorites" onClick={() => setMenuOpen(false)}>收藏</Link>
        </div>
      )}
    </nav>
  );
}
