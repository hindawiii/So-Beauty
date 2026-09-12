import { useCallback, useEffect, useSyncExternalStore } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image_url: string | null;
  category?: string | null;
}

const KEY = "so_beauty_wishlist_v1";
let items: WishlistItem[] = [];
const listeners = new Set<() => void>();
let hydrated = false;

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    items = [];
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return items;
}

const EMPTY_SERVER_ITEMS: WishlistItem[] = [];

function getServerSnapshot(): WishlistItem[] {
  return EMPTY_SERVER_ITEMS;
}

export function useWishlist() {
  useEffect(() => {
    hydrate();
    listeners.forEach((l) => l());
  }, []);

  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isInWishlist = useCallback((id: string) => current.some((it) => it.id === id), [current]);

  const add = useCallback((item: WishlistItem) => {
    hydrate();
    if (!items.some((i) => i.id === item.id)) {
      items = [item, ...items];
      persist();
    }
  }, []);

  const remove = useCallback((id: string) => {
    hydrate();
    items = items.filter((i) => i.id !== id);
    persist();
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    hydrate();
    const exists = items.some((i) => i.id === item.id);
    if (exists) {
      items = items.filter((i) => i.id !== item.id);
      persist();
      return false; // removed
    } else {
      items = [item, ...items];
      persist();
      return true; // added
    }
  }, []);

  const clear = useCallback(() => {
    items = [];
    persist();
  }, []);

  return {
    items: current,
    count: current.length,
    isInWishlist,
    add,
    remove,
    toggle,
    clear,
  };
}
