import { useCallback, useEffect, useSyncExternalStore } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
}

const KEY = "moonflower_cart_v1";
let items: CartItem[] = [];
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

const EMPTY_SERVER_ITEMS: CartItem[] = [];

function getServerSnapshot(): CartItem[] {
  return EMPTY_SERVER_ITEMS;
}

export function useCart() {
  useEffect(() => {
    hydrate();
    listeners.forEach((l) => l());
  }, []);
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((p: Omit<CartItem, "quantity">, qty = 1) => {
    hydrate();
    const existing = items.find((i) => i.id === p.id);
    if (existing) existing.quantity += qty;
    else items = [...items, { ...p, quantity: qty }];
    persist();
  }, []);

  const remove = useCallback((id: string) => {
    items = items.filter((i) => i.id !== id);
    persist();
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    items = items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
    persist();
  }, []);

  const clear = useCallback(() => {
    items = [];
    persist();
  }, []);

  const count = current.reduce((s, i) => s + i.quantity, 0);
  const total = current.reduce((s, i) => s + i.quantity * i.price, 0);

  return { items: current, add, remove, setQty, clear, count, total };
}
