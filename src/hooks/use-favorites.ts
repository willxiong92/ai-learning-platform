"use client";

import { useCallback, useEffect, useState } from "react";
import { FAVORITES_STORAGE_KEY } from "@/lib/vibehub/theme";

interface FavoriteItem {
  termId: string;
  createdAt: string;
  updatedAt: string;
}

interface FavoritesStore {
  version: 1;
  items: FavoriteItem[];
}

function readStore(): FavoritesStore {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return { version: 1, items: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch {
    // ignore corrupt/blocked storage
  }
  return { version: 1, items: [] };
}

function writeStore(store: FavoritesStore) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota/private-mode errors
  }
}

/** Client-only favorites, backed by localStorage (same key as the source site). */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // localStorage isn't available during SSR, so hydrate favorites post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(readStore().items.map((i) => i.termId));
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) setIds(readStore().items.map((i) => i.termId));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback((termId: string) => ids.includes(termId), [ids]);

  const toggle = useCallback((termId: string) => {
    const store = readStore();
    const now = new Date().toISOString();
    const existing = store.items.find((i) => i.termId === termId);
    if (existing) {
      store.items = store.items.filter((i) => i.termId !== termId);
    } else {
      store.items.push({ termId, createdAt: now, updatedAt: now });
    }
    writeStore(store);
    setIds(store.items.map((i) => i.termId));
  }, []);

  return { ids, ready, isFavorite, toggle };
}
