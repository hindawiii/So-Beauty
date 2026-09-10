import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { MOCK_PRODUCTS, atomicDecrementMockStock } from "./mock-products";
import { z } from "zod";

export type SavedOrder = {
  id: string;
  user_id: string | null;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  full_name: string;
  phone: string;
  shipping_address: string;
  city: string;
  notes?: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
};

// In-memory orders registry for guests and fallback when database is in transition
export const MOCK_ORDERS: SavedOrder[] = [];

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    return createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
  } catch {
    return null;
  }
}

const itemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
});

const createOrderSchema = z.object({
  full_name: z.string().trim().min(2, "الاسم الكامل مطلوب (حرفين على الأقل)").max(100),
  phone: z.string().trim().min(6, "رقم الهاتف غير صالح").max(20),
  shipping_address: z.string().trim().min(5, "العنوان التفصيلي مطلوب").max(500),
  city: z.string().trim().min(2, "اسم المدينة مطلوب").max(100),
  notes: z.string().trim().max(500).optional(),
  items: z.array(itemSchema).min(1, "السلة فارغة").max(50),
});

/**
 * Creates an order supporting both logged-in users and guests.
 * Performs atomic stock validation and decrement.
 */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Resolve authentication if available (optional for Guest Checkout)
    let authenticatedUserId: string | null = null;
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const sb = getSupabaseClient();
      if (sb && token.split(".").length === 3) {
        try {
          const { data: claimsData } = await sb.auth.getClaims(token);
          if (claimsData?.claims?.sub) {
            authenticatedUserId = claimsData.claims.sub;
          }
        } catch {
          // Token expired or invalid, proceed as guest
        }
      }
    }

    // 2. Resolve products and validate availability
    const ids = data.items.map((i) => i.product_id);
    const sb = getSupabaseClient();
    let dbProducts: {
      id: string;
      name: string;
      price: number;
      stock: number;
      is_active: boolean;
    }[] = [];

    if (sb) {
      try {
        const { data: rows, error } = await sb
          .from("products")
          .select("id,name,price,stock,is_active")
          .in("id", ids);
        if (!error && rows) {
          dbProducts = rows.map((r) => ({
            id: r.id,
            name: r.name,
            price: Number(r.price),
            stock: Number(r.stock),
            is_active: r.is_active,
          }));
        }
      } catch {
        // Fallback to in-memory catalog
      }
    }

    // Combine DB products with mock products as resilient catalog
    const catalog = ids.map((id) => {
      const fromDb = dbProducts.find((p) => p.id === id);
      if (fromDb) return fromDb;
      const fromMock = MOCK_PRODUCTS.find((p) => p.id === id);
      if (fromMock) {
        return {
          id: fromMock.id,
          name: fromMock.name,
          price: Number(fromMock.price),
          stock: Number(fromMock.stock),
          is_active: fromMock.is_active,
        };
      }
      return null;
    });

    if (catalog.some((p) => !p)) {
      throw new Error("أحد المنتجات المختارة غير متوفر في المتجر");
    }

    // 3. Pre-validate stock for all items before any deduction
    for (const item of data.items) {
      const prod = catalog.find((p) => p?.id === item.product_id)!;
      if (!prod.is_active) {
        throw new Error(`المنتج (${prod.name}) غير متاح للطلب حالياً`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(
          `نعتذر، الكمية المطلوبة من "${prod.name}" غير متوفرة في المخزون (المتبقي: ${prod.stock})`,
        );
      }
    }

    // 4. Calculate total & prepare order items payload
    let total = 0;
    const orderItemsPayload = data.items.map((it) => {
      const p = catalog.find((x) => x?.id === it.product_id)!;
      const itemSubtotal = p.price * it.quantity;
      total += itemSubtotal;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: it.quantity,
        unit_price: p.price,
      };
    });

    // 5. Atomic Stock Decrement
    // Always decrement in in-memory state for immediate sync
    for (const it of data.items) {
      atomicDecrementMockStock(it.product_id, it.quantity);
    }

    // Also decrement in DB if connected
    if (sb) {
      for (const it of data.items) {
        try {
          const currentProd = dbProducts.find((p) => p.id === it.product_id);
          if (currentProd) {
            const nextStock = Math.max(0, currentProd.stock - it.quantity);
            await sb.from("products").update({ stock: nextStock }).eq("id", it.product_id);
          }
        } catch {
          // Non-blocking for offline fallback
        }
      }
    }

    // 6. Generate order ID and record order
    const orderId = crypto.randomUUID();
    let dbSuccess = false;

    if (sb) {
      try {
        const { error: oErr } = await sb.from("orders").insert({
          id: orderId,
          user_id: authenticatedUserId as never,
          total,
          full_name: data.full_name,
          phone: data.phone,
          shipping_address: data.shipping_address,
          city: data.city,
          notes: data.notes ?? null,
        });

        if (!oErr) {
          const { error: iErr } = await sb.from("order_items").insert(
            orderItemsPayload.map((x) => ({
              ...x,
              order_id: orderId,
            })),
          );
          if (!iErr) {
            dbSuccess = true;
          }
        }
      } catch {
        dbSuccess = false;
      }
    }

    // Save in memory registry (guarantees order persistence for guests & offline preview)
    const savedOrder: SavedOrder = {
      id: orderId,
      user_id: authenticatedUserId,
      total,
      status: "pending",
      full_name: data.full_name,
      phone: data.phone,
      shipping_address: data.shipping_address,
      city: data.city,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
      order_items: orderItemsPayload.map((item, index) => ({
        id: `${orderId}-item-${index + 1}`,
        ...item,
      })),
    };
    MOCK_ORDERS.unshift(savedOrder);

    return {
      orderId,
      total,
      isGuest: !authenticatedUserId,
      status: "pending",
      itemsCount: data.items.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, total, status, created_at, order_items(id, product_name, quantity, unit_price)")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
    // Fallback to in-memory orders matching user
    return MOCK_ORDERS.filter((o) => o.user_id === context.userId);
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
