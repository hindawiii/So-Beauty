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
