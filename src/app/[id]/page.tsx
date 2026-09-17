import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_TERMS, getAdjacentTerms, getTerm } from "@/lib/vibehub/data";
import { FavoriteButton } from "@/components/sites/vibe-hub-org-e37cedf6/shared/favorite-button";
import { CopyMarkdownButton } from "@/components/sites/vibe-hub-org-e37cedf6/shared/copy-markdown-button";
import { TermDetailBody } from "@/components/sites/vibe-hub-org-e37cedf6/shared/term-detail-body";

export function generateStaticParams() {
  return ALL_TERMS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) return {};
  return {
    title: `${term.cn}（${term.name}）是什么｜${term.cat} · Web Coding 学习站`,
    description: term.desc,
  };
}

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) notFound();
  const { prev, next } = getAdjacentTerms(id);

  return (
    <div className="detail-shell">
      <div className="detail-topbar">
        <nav className="detail-breadcrumb" aria-label="面包屑">
          <Link className="detail-back-button" href="/" aria-label="返回术语图鉴" title="返回术语图鉴">
            ←
          </Link>
          <Link className="breadcrumb-link" href="/">
            术语图鉴
          </Link>
          <span className="breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="breadcrumb-current" aria-current="page">
            {term.cn}
          </span>
        </nav>
        <div className="detail-topbar-actions">
          <FavoriteButton termId={term.id} />
          <CopyMarkdownButton term={term} />
        </div>
      </div>

      {(prev || next) && (
        <div className="detail-entry-navigation">
          {prev && (
            <Link className="float-nav left" href={`/${prev.id}`} aria-label="上一个条目" title={prev.cn}>
              <span className="fn-arrow">←</span>
              <span className="fn-text">{prev.cn}</span>
            </Link>
          )}
          {next && (
            <Link className="float-nav right" href={`/${next.id}`} aria-label="下一个条目" title={next.cn}>
              <span className="fn-text">{next.cn}</span>
              <span className="fn-arrow">→</span>
            </Link>
          )}
        </div>
      )}

      <TermDetailBody term={term} />
    </div>
  );
}
