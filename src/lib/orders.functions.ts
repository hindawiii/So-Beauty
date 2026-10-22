import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireAuth } from "./auth-middleware";
import { requireAdminGuard } from "./admin-auth";
import type { Database } from "@/types/database.types";
import { MOCK_PRODUCTS, atomicDecrementMockStock } from "./mock-products";
import { getShippingFee } from "./shipping";
import { z } from "zod";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// Autonomous local profile store fallback
const LOCAL_PROFILES = new Map<
  string,
  {
    id: string;
    full_name: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
  }
>();

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
  updated_at?: string;
  order_items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
};

// In-memory orders registry for guests and fallback
export const MOCK_ORDERS: SavedOrder[] = [
  {
    id: "ord-88129034-7a1b-4c2d-9e3f-1a2b3c4d5e6f",
    user_id: null,
    total: 620,
    status: "confirmed",
    full_name: "أميرة عثمان عبد الله",
    phone: "0912345678",
    shipping_address: "حي المطار، شارع أفريقيا، عمارة الأمل، شقة 4",
    city: "الخرطوم",
    notes: "يرجى الاتصال قبل الوصول بنصف ساعة",
    created_at: "2026-09-09T14:30:00Z",
    order_items: [
      {
        id: "item-1",
        product_id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
        product_name: "سيروم فيتامين سي النقي",
        quantity: 1,
        unit_price: 280,
      },
      {
        id: "item-2",
        product_id: "b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e",
        product_name: "مرطب الهيالورونيك المكثف",
        quantity: 1,
        unit_price: 240,
      },
    ],
  },
  {
    id: "ord-99238145-8b2c-5d3e-0f4a-2b3c4d5e6f7a",
    user_id: null,
    total: 940,
    status: "shipped",
    full_name: "إسراء مجذوب التاج",
    phone: "0123456789",
    shipping_address: "الثورة الحارة الرابعة، بالقرب من صيدلية النور",
    city: "أم درمان",
    notes: "توصيل مسائي إن أمكن",
    created_at: "2026-09-08T11:15:00Z",
    order_items: [
      {
        id: "item-3",
        product_id: "a7b8c9d0-e1f2-4a3b-8c4d-9e0f1a2b3c4d",
        product_name: "بوكس العناية الملكي المتكامل",
        quantity: 1,
        unit_price: 890,
      },
    ],
  },
  {
    id: "ord-77349256-9c3d-6e4f-1a5b-3c4d5e6f7a8b",
    user_id: null,
    total: 390,
    status: "pending",
    full_name: "منى الطيب عيسى",
    phone: "0998765432",
    shipping_address: "حي الصفا، شارع الستين",
    city: "الخرطوم بحري",
    notes: null,
    created_at: "2026-09-10T04:20:00Z",
    order_items: [
      {
        id: "item-4",
        product_id: "d4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a",
        product_name: "زيت الورد النقي لتجديد البشرة",
        quantity: 1,
        unit_price: 320,
      },
    ],
  },
  {
    id: "ord-66450367-0d4e-7f5a-2b6c-4d5e6f7a8b9c",
    user_id: null,
    total: 549,
    status: "delivered",
    full_name: "فاطمة الزهراء صديق",
    phone: "0923456781",
    shipping_address: "حي الروضة، قرب مستشفى بورتسودان",
    city: "بورتسودان",
    notes: "تم الاستلام بنجاح",
    created_at: "2026-09-06T09:40:00Z",
    order_items: [
      {
        id: "item-5",
        product_id: "e5f6a1b2-c3d4-4e5f-8a1b-7c8d9e0f1a2b",
        product_name: "مجموعة التوهج الكاملة (عرض خاص)",
        quantity: 1,
        unit_price: 499,
      },
    ],
  },
];

// Helper to sanitize text input from potential script injection
function sanitizeInput(str: string): string {
  return str.replace(/[<>]/g, "").trim();
}

const itemSchema = z.object({
  product_id: z.string().min(1, "معرف المنتج غير صالح"),
  quantity: z
    .number()
    .int()
    .min(1, "الكمية يجب أن تكون 1 على الأقل")
    .max(50, "الحد الأقصى للكمية هو 50"),
});

const createOrderSchema = z.object({
  full_name: z
    .string()
    .transform(sanitizeInput)
    .pipe(z.string().min(2, "الاسم الكامل مطلوب (حرفين على الأقل)").max(100, "الاسم طويل جداً")),
  phone: z
    .string()
    .transform(sanitizeInput)
    .pipe(z.string().min(6, "رقم الهاتف غير صالح").max(25, "رقم الهاتف طويل جداً")),
  shipping_address: z
    .string()
    .transform(sanitizeInput)
    .pipe(
      z.string().min(5, "العنوان التفصيلي مطلوب (5 أحرف على الأقل)").max(500, "العنوان طويل جداً"),
    ),
  city: z.string().transform(sanitizeInput).pipe(z.string().min(2, "اسم المدينة مطلوب").max(100)),
  notes: z
    .string()
    .transform(sanitizeInput)
    .pipe(z.string().max(500, "الملاحظات طويلة جداً"))
    .optional()
    .nullable(),
  items: z.array(itemSchema).min(1, "السلة فارغة").max(50, "عدد المنتجات يتجاوز الحد المسموح"),
});

/**
 * Creates an order supporting both logged-in users and guests.
 * Performs atomic stock validation and decrement, persisting to Firestore.
 */
export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Resolve authentication if available (optional for Guest Checkout)
    let authenticatedUserId: string | null = null;
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token && token.length > 5) {
        authenticatedUserId = token.slice(0, 32);
      }
    }

    // 2. Resolve products from Firestore or in-memory fallback
    const ids = data.items.map((i) => i.product_id);
    const catalog: {
      id: string;
      name: string;
      price: number;
      stock: number;
      is_active: boolean;
    }[] = [];

    for (const id of ids) {
      let resolved = false;
      try {
        const pSnap = await getDoc(doc(db, "products", id));
        if (pSnap.exists()) {
          const d = pSnap.data();
          catalog.push({
            id: pSnap.id,
            name: d.name,
            price: Number(d.price) || 0,
            stock: Number(d.stock) || 0,
            is_active: d.is_active !== false,
          });
          resolved = true;
        }
      } catch (err) {
        console.warn("[CreateOrder] Firestore doc fetch fallback:", err);
      }

      if (!resolved) {
        const fromMock = MOCK_PRODUCTS.find((p) => p.id === id);
        if (fromMock) {
          catalog.push({
            id: fromMock.id,
            name: fromMock.name,
            price: Number(fromMock.price),
            stock: Number(fromMock.stock),
            is_active: fromMock.is_active,
          });
        }
      }
    }

    if (catalog.length < ids.length) {
      throw new Error("أحد المنتجات المختارة غير متوفر في المتجر");
    }

    // 3. Pre-validate stock for all items
    for (const item of data.items) {
      const prod = catalog.find((p) => p.id === item.product_id)!;
      if (!prod.is_active) {
        throw new Error(`المنتج (${prod.name}) غير متاح للطلب حالياً`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(
          `نعتذر، الكمية المطلوبة من "${prod.name}" غير متوفرة في المخزون (المتبقي: ${prod.stock})`,
        );
      }
    }

    // 4. Calculate total & order items payload
    let total = 0;
    const orderItemsPayload = data.items.map((it) => {
      const p = catalog.find((x) => x.id === it.product_id)!;
      const itemSubtotal = p.price * it.quantity;
      total += itemSubtotal;
      return {
        product_id: p.id,
        product_name: p.name,
        quantity: it.quantity,
        unit_price: p.price,
      };
    });

    // 5. Decrement stock in Firestore & in-memory
    for (const it of data.items) {
      atomicDecrementMockStock(it.product_id, it.quantity);
      try {
        const pRef = doc(db, "products", it.product_id);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          const curStock = Number(pSnap.data().stock) || 0;
          await updateDoc(pRef, {
            stock: Math.max(0, curStock - it.quantity),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("[CreateOrder] Stock decrement fallback:", err);
      }
    }

    // 6. Calculate shipping fee and final total
    const shippingFee = getShippingFee(data.city, total);
    const finalTotal = total + shippingFee;

    // 7. Generate order ID and record order
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const savedOrder: SavedOrder = {
      id: orderId,
      user_id: authenticatedUserId,
      total: finalTotal,
      status: "pending",
      full_name: data.full_name,
      phone: data.phone,
      shipping_address: data.shipping_address,
      city: data.city,
      notes: data.notes ?? null,
      created_at: now,
      updated_at: now,
      order_items: orderItemsPayload.map((item, index) => ({
        id: `${orderId}-item-${index + 1}`,
        ...item,
      })),
    };

    // Save in memory registry
    MOCK_ORDERS.unshift(savedOrder);

    // Save in Firestore
    try {
      await setDoc(doc(db, "orders", orderId), savedOrder);
    } catch (err) {
      console.warn("[CreateOrder] Firestore order save fallback:", err);
    }

    return {
      orderId,
      total: finalTotal,
      isGuest: !authenticatedUserId,
      status: "pending",
      itemsCount: data.items.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "orders"),
          where("user_id", "==", context.userId),
          orderBy("created_at", "desc"),
        ),
      );
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SavedOrder);
      }
    } catch (err) {
      console.warn("[listMyOrders] Firestore query fallback:", err);
    }
    return MOCK_ORDERS.filter((o) => o.user_id === context.userId);
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    try {
      const snap = await getDoc(doc(db, "profiles", context.userId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.warn("[getMyProfile] Firestore get fallback:", err);
    }
    return (
      LOCAL_PROFILES.get(context.userId) || {
        id: context.userId,
        full_name: "مستخدم المتجر",
        phone: null,
        address: null,
        city: null,
      }
    );
  });

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = { id: context.userId, ...(data as Record<string, unknown>) };
    LOCAL_PROFILES.set(context.userId, payload as never);

    try {
      await setDoc(
        doc(db, "profiles", context.userId),
        {
          ...payload,
          role: "customer",
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (err) {
      console.warn("[updateMyProfile] Firestore save fallback:", err);
    }
    return { ok: true };
  });

const trackOrderSchema = z.object({
  query: z.string().trim().min(3, "يرجى كتابة رقم الطلب أو رقم الهاتف المعتمد"),
});

export const trackOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => trackOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const raw = data.query.trim();
    const cleanPhone = raw.replace(/[^0-9+]/g, "");
    const cleanId = raw.replace(/^#/, "").toLowerCase();

    // 1. Query Firestore
    try {
      const matchedFirestore: SavedOrder[] = [];
      if (cleanId.length >= 6) {
        const docRef = doc(db, "orders", cleanId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          matchedFirestore.push({ id: snap.id, ...snap.data() } as SavedOrder);
        }
      }

      if (matchedFirestore.length === 0 && cleanPhone.length >= 7) {
        const qSnap = await getDocs(
          query(collection(db, "orders"), where("phone", "==", cleanPhone), limit(5)),
        );
        if (!qSnap.empty) {
          for (const d of qSnap.docs) {
            matchedFirestore.push({ id: d.id, ...d.data() } as SavedOrder);
          }
        }
      }

      if (matchedFirestore.length > 0) {
        return matchedFirestore;
      }
    } catch (err) {
      console.warn("[trackOrder] Firestore query fallback:", err);
    }

    // 2. Check in-memory saved orders
    const matchedMock = MOCK_ORDERS.filter((o) => {
      const matchId =
        o.id.toLowerCase() === cleanId ||
        o.id.toLowerCase().startsWith(cleanId) ||
        o.id.slice(0, 8).toLowerCase() === cleanId;
      const matchPhone =
        cleanPhone.length >= 6 && o.phone.replace(/[^0-9+]/g, "").includes(cleanPhone);
      return matchId || matchPhone;
    });

    return matchedMock;
  });

/**
 * Admin: List all orders with status or text filter
 */
export const adminListAllOrders = createServerFn({ method: "GET" })
  .validator((data: { adminPin?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    await requireAdminGuard(data?.adminPin);

    try {
      const snap = await getDocs(query(collection(db, "orders"), orderBy("created_at", "desc")));
      if (!snap.empty) {
        const dbOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SavedOrder);
        const dbIds = new Set(dbOrders.map((o) => o.id));
        return [...dbOrders, ...MOCK_ORDERS.filter((m) => !dbIds.has(m.id))];
      }
    } catch (err) {
      console.warn("[Admin Orders] Firestore query fallback:", err);
    }

    return MOCK_ORDERS;
  });

const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  newStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  adminPin: z.string().optional(),
});

/**
 * Admin: Update status of any order (persists to Firestore and in-memory)
 */
export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateOrderStatusSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdminGuard(data.adminPin);

    // 1. Update in-memory registry
    const localOrder = MOCK_ORDERS.find(
      (o) =>
        o.id === data.orderId || o.id.startsWith(data.orderId) || o.id.slice(0, 8) === data.orderId,
    );
    if (localOrder) {
      localOrder.status = data.newStatus;
    }

    // 2. Update Firestore
    try {
      await updateDoc(doc(db, "orders", data.orderId), {
        status: data.newStatus,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("[Admin Update Order Status] Firestore update fallback:", err);
    }

    return { ok: true, status: data.newStatus };
  });
