"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/**
 * Course routes run as a fixed-viewport app on the source site (no footer,
 * page itself never scrolls — only the article/term-panel panes scroll
 * internally). Every other route keeps the normal scrolling page + footer.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isCourseRoute = pathname === "/courses" || pathname.startsWith("/courses/");
  const isCourseReader = /^\/courses\/[^/]+\/[^/]+/.test(pathname);
  const shellClass = ["site-shell", isCourseRoute && "is-course-route", isCourseReader && "is-course-reader"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {!isCourseRoute && <SiteFooter />}
    </div>
  );
}
