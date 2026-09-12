import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { MOCK_PRODUCTS } from "./mock-products";

function serverClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    return createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
  } catch (err) {
    console.warn("[Products] Failed to create Supabase client:", err);
    return null;
  }
}

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    const sb = serverClient();
    if (sb) {
      try {
        let q = sb
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (data?.category) q = q.eq("category", data.category as never);
        const { data: rows, error } = await q;
        if (!error && rows && rows.length > 0) {
          return rows;
        }
      } catch (err) {
        console.warn("[Products] Supabase query failed, using in-memory fallback:", err);
      }
    }

    // In-memory fallback
    let items = MOCK_PRODUCTS.filter((p) => p.is_active);
    if (data?.category) {
      items = items.filter((p) => p.category === data.category);
    }
    return items;
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sb = serverClient();
    if (sb) {
      try {
        const { data: row, error } = await sb
          .from("products")
          .select("*")
          .eq("id", data.id)
          .eq("is_active", true)
          .maybeSingle();
        if (!error && row) {
          return row;
        }
      } catch (err) {
        console.warn("[Products] Supabase getProduct query failed, using fallback:", err);
      }
    }

    return MOCK_PRODUCTS.find((p) => p.id === data.id && p.is_active) ?? null;
  });

/**
 * Admin: List all products (active and inactive) for inventory management
 */
export const adminListAllProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = serverClient();
  if (sb) {
    try {
      const { data: rows, error } = await sb
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.warn("[Admin Products] Supabase query failed, using fallback:", err);
    }
  }
  return MOCK_PRODUCTS;
});

/**
 * Admin: Update product details (stock, price, is_active, is_featured)
 */
export const adminUpdateProduct = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string;
      stock?: number;
      price?: number;
      original_price?: number | null;
      is_active?: boolean;
      is_featured?: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    // 1. Update in-memory mock products
    const inMem = MOCK_PRODUCTS.find((p) => p.id === data.id);
    if (inMem) {
      if (data.stock !== undefined) inMem.stock = Math.max(0, data.stock);
      if (data.price !== undefined) inMem.price = Math.max(0, data.price);
      if (data.original_price !== undefined) inMem.original_price = data.original_price;
      if (data.is_active !== undefined) inMem.is_active = data.is_active;
      if (data.is_featured !== undefined) inMem.is_featured = data.is_featured;
      inMem.updated_at = new Date().toISOString();
    }

    // 2. Update database if connected
    const sb = serverClient();
    if (sb) {
      try {
        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (data.stock !== undefined) updatePayload.stock = Math.max(0, data.stock);
        if (data.price !== undefined) updatePayload.price = Math.max(0, data.price);
        if (data.original_price !== undefined) updatePayload.original_price = data.original_price;
        if (data.is_active !== undefined) updatePayload.is_active = data.is_active;
        if (data.is_featured !== undefined) updatePayload.is_featured = data.is_featured;

        await sb.from("products").update(updatePayload).eq("id", data.id);
      } catch (err) {
        console.warn("[Admin Update Product] DB error:", err);
      }
    }

    return { ok: true, product: inMem };
  });
