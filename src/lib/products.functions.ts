import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireAdminGuard } from "./admin-auth";
import type { Database } from "@/integrations/supabase/types";
import { MOCK_PRODUCTS } from "./mock-products";
import {
  encodeProductGallery,
  cleanProductDescription,
  extractProductGallery,
} from "./product-images";
import { encodeProductI18n, extractProductI18n } from "./product-localization";

function attachMetadataToProduct(p: Product): Product {
  const gallery = extractProductGallery(p);
  const i18n = extractProductI18n(p);
  return {
    ...p,
    gallery_images: gallery.length > 1 ? gallery : undefined,
    name_en: p.name_en || i18n.name_en || null,
    description_en: p.description_en || i18n.description_en || null,
  };
}

function serverClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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
          return (rows as Product[]).map(attachMetadataToProduct);
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
    return items.map(attachMetadataToProduct);
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
          return attachMetadataToProduct(row as Product);
        }
      } catch (err) {
        console.warn("[Products] Supabase getProduct query failed, using fallback:", err);
      }
    }

    const found = MOCK_PRODUCTS.find((p) => p.id === data.id && p.is_active);
    return found ? attachMetadataToProduct(found) : null;
  });

/**
 * Admin: List all products (active and inactive) for inventory management
 */
export const adminListAllProducts = createServerFn({ method: "GET" })
  .inputValidator((data: { adminPin?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    await requireAdminGuard(data?.adminPin);

    const sb = serverClient();
    if (sb) {
      try {
        const { data: rows, error } = await sb
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && rows && rows.length > 0) {
          return (rows as Product[]).map(attachMetadataToProduct);
        }
      } catch (err) {
        console.warn("[Admin Products] Supabase query failed, using fallback:", err);
      }
    }
    return MOCK_PRODUCTS.map(attachMetadataToProduct);
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
      adminPin?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdminGuard(data.adminPin);

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

/**
 * Admin: Create a new product with complete details
 */
export const adminCreateProduct = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      name_en?: string | null;
      category: Database["public"]["Enums"]["product_category"];
      price: number;
      original_price?: number | null;
      stock: number;
      image_url?: string;
      gallery_images?: string[];
      description?: string;
      description_en?: string | null;
      is_featured?: boolean;
      is_active?: boolean;
      adminPin?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdminGuard(data.adminPin);

    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const rawDesc = data.description ? cleanProductDescription(data.description) : "";
    const galleryTag =
      data.gallery_images && data.gallery_images.length > 1
        ? encodeProductGallery(data.gallery_images)
        : "";
    const i18nTag = encodeProductI18n({
      name_en: data.name_en,
      description_en: data.description_en,
    });

    let finalDescription = rawDesc;
    if (galleryTag) {
      finalDescription = finalDescription ? `${finalDescription}\n\n${galleryTag}` : galleryTag;
    }
    if (i18nTag) {
      finalDescription = finalDescription ? `${finalDescription}\n\n${i18nTag}` : i18nTag;
    }

    const newProduct: Product = {
      id: newId,
      name: data.name.trim(),
      name_en: data.name_en?.trim() || null,
      category: data.category,
      price: Math.max(0, Number(data.price) || 0),
      original_price: data.original_price ? Math.max(0, Number(data.original_price)) : null,
      stock: Math.max(0, Number(data.stock) || 0),
      image_url: data.image_url?.trim() || "/src/assets/product-1.jpg",
      gallery_images:
        data.gallery_images && data.gallery_images.length > 1 ? data.gallery_images : undefined,
      description: finalDescription || null,
      description_en: data.description_en?.trim() || null,
      is_featured: data.is_featured ?? false,
      is_active: data.is_active ?? true,
      created_at: now,
      updated_at: now,
    };

    // 1. Insert in-memory at top of products list
    MOCK_PRODUCTS.unshift(newProduct);

    // 2. Insert into database if available
    const sb = serverClient();
    if (sb) {
      try {
        await sb.from("products").insert({
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          original_price: newProduct.original_price,
          stock: newProduct.stock,
          image_url: newProduct.image_url,
          description: newProduct.description,
          is_featured: newProduct.is_featured,
          is_active: newProduct.is_active,
          created_at: newProduct.created_at,
          updated_at: newProduct.updated_at,
        });
      } catch (err) {
        console.warn("[Admin Create Product] Database insert fallback to in-memory:", err);
      }
    }

    return { ok: true, product: newProduct };
  });

/**
 * Admin: Full Update of any product details
 */
export const adminFullUpdateProduct = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string;
      name: string;
      name_en?: string | null;
      category: Database["public"]["Enums"]["product_category"];
      price: number;
      original_price?: number | null;
      stock: number;
      image_url?: string;
      gallery_images?: string[];
      description?: string;
      description_en?: string | null;
      is_featured?: boolean;
      is_active?: boolean;
      adminPin?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdminGuard(data.adminPin);

    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === data.id);
    const now = new Date().toISOString();

    const rawDesc =
      data.description !== undefined
        ? cleanProductDescription(data.description)
        : idx !== -1
          ? cleanProductDescription(MOCK_PRODUCTS[idx].description)
          : "";

    const galleryImagesToUse =
      data.gallery_images !== undefined
        ? data.gallery_images
        : idx !== -1
          ? (MOCK_PRODUCTS[idx].gallery_images ?? undefined)
          : undefined;

    const galleryTag =
      galleryImagesToUse && galleryImagesToUse.length > 1
        ? encodeProductGallery(galleryImagesToUse)
        : "";

    const resolvedNameEn =
      data.name_en !== undefined
        ? data.name_en?.trim() || null
        : idx !== -1
          ? (MOCK_PRODUCTS[idx].name_en ?? null)
          : null;

    const resolvedDescEn =
      data.description_en !== undefined
        ? data.description_en?.trim() || null
        : idx !== -1
          ? (MOCK_PRODUCTS[idx].description_en ?? null)
          : null;

    const i18nTag = encodeProductI18n({
      name_en: resolvedNameEn,
      description_en: resolvedDescEn,
    });

    let finalDescription = rawDesc;
    if (galleryTag) {
      finalDescription = finalDescription ? `${finalDescription}\n\n${galleryTag}` : galleryTag;
    }
    if (i18nTag) {
      finalDescription = finalDescription ? `${finalDescription}\n\n${i18nTag}` : i18nTag;
    }

    let updated: Product;
    if (idx !== -1) {
      MOCK_PRODUCTS[idx] = {
        ...MOCK_PRODUCTS[idx],
        name: data.name.trim(),
        name_en: resolvedNameEn,
        category: data.category,
        price: Math.max(0, Number(data.price) || 0),
        original_price: data.original_price ? Math.max(0, Number(data.original_price)) : null,
        stock: Math.max(0, Number(data.stock) || 0),
        image_url: data.image_url?.trim() || MOCK_PRODUCTS[idx].image_url,
        gallery_images:
          galleryImagesToUse && galleryImagesToUse.length > 1 ? galleryImagesToUse : undefined,
        description: finalDescription || null,
        description_en: resolvedDescEn,
        is_featured: data.is_featured ?? MOCK_PRODUCTS[idx].is_featured,
        is_active: data.is_active ?? MOCK_PRODUCTS[idx].is_active,
        updated_at: now,
      };
      updated = MOCK_PRODUCTS[idx];
    } else {
      updated = {
        id: data.id,
        name: data.name.trim(),
        name_en: resolvedNameEn,
        category: data.category,
        price: Math.max(0, Number(data.price) || 0),
        original_price: data.original_price ? Math.max(0, Number(data.original_price)) : null,
        stock: Math.max(0, Number(data.stock) || 0),
        image_url: data.image_url?.trim() || "/src/assets/product-1.jpg",
        gallery_images:
          galleryImagesToUse && galleryImagesToUse.length > 1 ? galleryImagesToUse : undefined,
        description: finalDescription || null,
        description_en: resolvedDescEn,
        is_featured: data.is_featured ?? false,
        is_active: data.is_active ?? true,
        created_at: now,
        updated_at: now,
      };
      MOCK_PRODUCTS.unshift(updated);
    }

    const sb = serverClient();
    if (sb) {
      try {
        await sb
          .from("products")
          .update({
            name: updated.name,
            category: updated.category,
            price: updated.price,
            original_price: updated.original_price,
            stock: updated.stock,
            image_url: updated.image_url,
            description: updated.description,
            is_featured: updated.is_featured,
            is_active: updated.is_active,
            updated_at: updated.updated_at,
          })
          .eq("id", data.id);
      } catch (err) {
        console.warn("[Admin Full Update Product] Database update fallback to in-memory:", err);
      }
    }

    return { ok: true, product: updated };
  });

/**
 * Admin: Duplicate existing product
 */
export const adminDuplicateProduct = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; adminPin?: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminGuard(data.adminPin);

    const original = MOCK_PRODUCTS.find((p) => p.id === data.id);
    if (!original) {
      throw new Error("المنتج الأصلي غير موجود");
    }

    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const duplicated: Product = {
      ...original,
      id: newId,
      name: `${original.name} (نسخة مكررة)`,
      created_at: now,
      updated_at: now,
    };

    MOCK_PRODUCTS.unshift(duplicated);

    const sb = serverClient();
    if (sb) {
      try {
        await sb.from("products").insert({
          id: duplicated.id,
          name: duplicated.name,
          category: duplicated.category,
          price: duplicated.price,
          original_price: duplicated.original_price,
          stock: duplicated.stock,
          image_url: duplicated.image_url,
          description: duplicated.description,
          is_featured: duplicated.is_featured,
          is_active: duplicated.is_active,
          created_at: duplicated.created_at,
          updated_at: duplicated.updated_at,
        });
      } catch (err) {
        console.warn("[Admin Duplicate Product] Database insert fallback to in-memory:", err);
      }
    }

    return { ok: true, product: duplicated };
  });

/**
 * Admin: Delete / Remove a product
 */
export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; adminPin?: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminGuard(data.adminPin);

    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      MOCK_PRODUCTS.splice(idx, 1);
    }

    const sb = serverClient();
    if (sb) {
      try {
        await sb.from("products").delete().eq("id", data.id);
      } catch (err) {
        console.warn("[Admin Delete Product] Database delete fallback to in-memory:", err);
      }
    }

    return { ok: true, id: data.id };
  });
