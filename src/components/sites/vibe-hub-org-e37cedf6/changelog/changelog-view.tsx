"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ChangelogData, ChangelogEntry } from "@/lib/vibehub/types";

const FILTERS = ["全部", "功能更新", "新增词汇"] as const;
type Filter = (typeof FILTERS)[number];

function monthKey(datetime: string | null): string | null {
  if (!datetime) return null;
  const [y, m] = datetime.split("-");
  return `${y}-${m}`;
}

function scrollToMonth(key: string) {
  document.getElementById(`changelog-month-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function filterEntry(entry: ChangelogEntry, filter: Filter) {
  if (filter === "全部") return entry;
  const wantType = filter === "功能更新" ? "updates" : "terms";
  const groups = entry.groups.filter((g) => g.type === wantType);
  if (groups.length === 0) return null;
  return { ...entry, groups };
}

export function ChangelogView({ data }: { data: ChangelogData }) {
  const [filter, setFilter] = useState<Filter>("全部");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);

  const monthKeys = useMemo(() => {
    const seen = new Set<string>();
    const keys: string[] = [];
    for (const e of data.entries) {
      const k = monthKey(e.datetime);
      if (k && !seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
    return keys;
  }, [data.entries]);

  const visibleEntries = useMemo(
    () => data.entries.map((e) => filterEntry(e, filter)).filter((e): e is ChangelogEntry => !!e),
    [data.entries, filter]
  );

  const monthAnchorDatetimes = useMemo(() => {
    const seen = new Set<string>();
    const anchors = new Set<string>();
    for (const e of data.entries) {
      const k = monthKey(e.datetime);
      if (k && !seen.has(k) && e.datetime) {
        seen.add(k);
        anchors.add(e.datetime);
      }
    }
    return anchors;
  }, [data.entries]);

  function selectFilter(i: number) {
    setFilter(FILTERS[i]);
    const btn = tabRefs.current[i];
    if (btn) setIndicator({ x: btn.offsetLeft, w: btn.offsetWidth });
  }

  return (
    <div className="changelog-page">
      <div className="changelog-layout">
        <aside className="changelog-sidebar">
          <div className="changelog-sidebar-sticky">
            <div className="changelog-sidebar-section">
              <div className="changelog-sidebar-heading">
                <i className="ti ti-calendar" aria-hidden="true" />
                <span>时间定位</span>
              </div>
              <nav className="changelog-sidebar-nav" aria-label="按月份快速定位">
                {data.months.map((m, i) => (
                  <button
                    key={m.label}
                    type="button"
                    className="changelog-sidebar-link"
                    onClick={() => monthKeys[i] && scrollToMonth(monthKeys[i])}
                  >
                    <span>{m.label}</span>
                    <span className="changelog-sidebar-count">{m.count}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="changelog-sidebar-stats">
              {data.stats.map((s) => (
                <div className="changelog-sidebar-stat" key={s.label}>
                  <span className="changelog-stat-number">{s.number}</span>
                  <span className="changelog-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="changelog-main">
          <nav className="changelog-breadcrumb" aria-label="Breadcrumb">
            <Link className="changelog-breadcrumb-link" href="/">
              <i className="ti ti-arrow-left" aria-hidden="true" />
              <span>术语图鉴</span>
            </Link>
            <span className="changelog-breadcrumb-sep">/</span>
            <span className="changelog-breadcrumb-current">更新日志</span>
          </nav>

          <header className="changelog-header">
            <div className="changelog-header-main">
              <h1 className="changelog-title">{data.title}</h1>
              <p className="changelog-subtitle">{data.subtitle}</p>
            </div>
            <div className="changelog-filter-group" role="tablist" aria-label="Filter timeline">
              <div
                className="changelog-filter-indicator"
                aria-hidden="true"
                style={
                  indicator
                    ? { transform: `translateX(${indicator.x}px)`, width: indicator.w, opacity: 1 }
                    : undefined
                }
              />
              {FILTERS.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  aria-selected={filter === f}
                  className={`changelog-filter-btn${filter === f ? " is-active" : ""}`}
                  onClick={() => selectFilter(i)}
                >
                  {f}
                </button>
              ))}
            </div>
          </header>

          <section className="changelog-timeline" aria-label="Timeline">
            {visibleEntries.map((entry, i) => {
              const key = monthKey(entry.datetime);
              const isMonthAnchor = !!entry.datetime && monthAnchorDatetimes.has(entry.datetime);
              return (
                <article
                  className="changelog-entry"
                  id={isMonthAnchor && key ? `changelog-month-${key}` : undefined}
                  key={entry.datetime ?? i}
                >
                  <div className="changelog-entry-meta">
                    <div className="changelog-track-node" aria-hidden="true" />
                    <time className="changelog-entry-date" dateTime={entry.datetime ?? undefined}>
                      {entry.dateLabel}
                    </time>
                  </div>
                  <div className="changelog-entry-body">
                    <header className="changelog-milestone">
                      <h2 className="changelog-milestone-title">{entry.milestoneTitle}</h2>
                    </header>
                    {entry.groups.map((g, gi) =>
                      g.type === "updates" ? (
                        <div className="changelog-group changelog-updates-group" key={gi}>
                          <ul className="changelog-items-list">
                            {g.items.map((it, ii) => (
                              <li className="changelog-item" key={ii}>
                                <span className="changelog-item-icon" aria-hidden="true">
                                  <i className={it.icon ?? undefined} />
                                </span>
                                <span className="changelog-item-text">{it.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="changelog-group changelog-terms-group" key={gi}>
                          <div className="changelog-terms-heading">
                            <span className="changelog-terms-label">
                              <i className="ti ti-books" aria-hidden="true" />
                              <span>{g.label}</span>
                            </span>
                          </div>
                          <div className="changelog-terms-grid">
                            {g.terms.map((t) => (
                              <Link
                                className="changelog-term-pill"
                                href={t.href ?? "#"}
                                title={t.title ?? undefined}
                                key={t.href}
                              >
                                <span className="changelog-term-cn">{t.cn}</span>
                                <span className="changelog-term-en">{t.en}</span>
                                <span className="changelog-term-cat">{t.cat}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
