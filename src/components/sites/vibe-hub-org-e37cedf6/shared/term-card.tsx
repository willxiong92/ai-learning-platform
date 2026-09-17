import Link from "next/link";
import type { Term } from "@/lib/vibehub/types";
import { FavoriteButton } from "./favorite-button";

export function TermCard({ term }: { term: Term }) {
  return (
    <article className="card" data-id={term.id}>
      <div className="card-head">
        <Link
          className="card-title-group card-title-link"
          href={`/${term.id}`}
          aria-label={term.cn}
          data-card-detail="true"
        >
          <h3>
            {term.cn}
            <span>{term.name}</span>
          </h3>
        </Link>
        <FavoriteButton termId={term.id} />
      </div>
      <div className="card-tagline card-quote">{term.tagline}</div>
      <div
        className={term.demoClass}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: term.demoHTML }}
      />
    </article>
  );
}
