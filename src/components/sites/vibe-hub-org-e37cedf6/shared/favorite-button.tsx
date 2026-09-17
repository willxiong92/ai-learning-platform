"use client";

import { useFavorites } from "@/hooks/use-favorites";

export function FavoriteButton({ termId }: { termId: string }) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(termId);
  return (
    <button
      type="button"
      className="favorite-button"
      aria-label="收藏术语"
      aria-pressed={active}
      title="收藏术语"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(termId);
      }}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M23.9986 5L17.8856 17.4776L4 19.4911L14.0589 29.3251L11.6544 43L23.9986 36.4192L36.3454 43L33.9586 29.3251L44 19.4911L30.1913 17.4776L23.9986 5Z" />
      </svg>
    </button>
  );
}
