"use client";

import { useFavorites } from "@/hooks/use-favorites";

export function FavoritesChipCount() {
  const { ids, ready } = useFavorites();
  return <span>{ready ? ids.length : 0}</span>;
}
