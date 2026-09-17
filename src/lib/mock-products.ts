import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  gallery_images?: string[] | null;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
    name: "سيروم فيتامين سي النقي",
    description:
      "سيروم مركز غني بمضادات الأكسدة لتوحيد لون البشرة واستعادة نضارتها الطبيعية وإشراقتها الحيوية.",
    price: 280,
    original_price: 350,
    image_url: "/src/assets/product-1.jpg",
    category: "skincare",
    stock: 25,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e",
    name: "مرطب الهيالورونيك المكثف",
    description:
      "كريم ترطيب فائق الخفة بحمض الهيالورونيك وخلاصة الصبار لحبس الرطوبة طوال اليوم دون أثر دهني.",
    price: 240,
    original_price: 300,
    image_url: "/src/assets/product-2.jpg",
    category: "skincare",
    stock: 30,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f",
    name: "غسول الوجه المهدئ الطبيعي",
    description:
      "منظف رغوي لطيف بخلاصة البابونج والشاي الأخضر ينقي المسام بعمق مع الحفاظ على حاجز البشرة الطبيعي.",
    price: 190,
    original_price: 220,
    image_url: "/src/assets/product-3.jpg",
    category: "skincare",
    stock: 40,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "d4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a",
    name: "زيت الورد النقي لتجديد البشرة",
    description:
      "مستخلص نقي 100% من بذور الورد الطبيعية لتغذية البشرة ومحاربة علامات التقدم في السن وتنعيم الخطوط.",
    price: 320,
    original_price: 390,
    image_url: "/src/assets/product-4.jpg",
    category: "skincare",
    stock: 18,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "e5f6a1b2-c3d4-4e5f-8a1b-7c8d9e0f1a2b",
    name: "مجموعة التوهج الكاملة (عرض خاص)",
    description:
      "عرض التوفير الأكبر: سيروم فيتامين سي + غسول مهدئ + مرطب هيدرا بسعر مخفض لفترة محدودة.",
    price: 499,
    original_price: 650,
    image_url: "/src/assets/product-1.jpg",
    category: "offer",
    stock: 15,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "f6a1b2c3-d4e5-4f6a-9b2c-8d9e0f1a2b3c",
    name: "بكج الترطيب العميق ومكافحة الجفاف",
    description:
      "بوكس متكامل يحتوي على مرطب مركز وقناع ليلي مغذي وسيروم استعادة الرطوبة للبشرة الجافة والحساسة.",
    price: 580,
    original_price: 750,
    image_url: "/src/assets/product-2.jpg",
    category: "box",
    stock: 12,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "a7b8c9d0-e1f2-4a3b-8c4d-9e0f1a2b3c4d",
    name: "بوكس العناية الملكي المتكامل",
    description:
      "أفخم بوكس عناية: 4 منتجات أساسية بالإضافة إلى رولر التدليك الفاخر وحقيبة سفر مخملية مميزة.",
    price: 890,
    original_price: 1100,
    image_url: "/src/assets/product-3.jpg",
    category: "box",
    stock: 8,
    is_featured: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "b8c9d0e1-f2a3-4b4c-9d5e-0f1a2b3c4d5e",
    name: "رولر تدليك الوجه من حجر اليشم",
    description:
      "أداة تدليك طبيعية مصنوعة من حجر اليشم الأصلي لتحفيز الدورة الدموية وتقليل الانتفاخات وتحسين امتصاص السيروم.",
    price: 150,
    original_price: 190,
    image_url: "/src/assets/product-4.jpg",
    category: "accessory",
    stock: 50,
    is_featured: false,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

/**
 * Atomically checks and decrements product stock in memory.
 * Returns success status along with updated stock or error message.
 */
export function atomicDecrementMockStock(
  productId: string,
  quantity: number,
): { success: boolean; remaining: number; error?: string } {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return { success: false, remaining: 0, error: "المنتج غير موجود" };
  }
  if (!product.is_active) {
    return {
      success: false,
      remaining: product.stock,
      error: `المنتج (${product.name}) غير متاح حالياً`,
    };
  }
  if (product.stock < quantity) {
    return {
      success: false,
      remaining: product.stock,
      error: `الكمية المطلوبة من "${product.name}" غير متوفرة في المخزون (المتبقي: ${product.stock})`,
    };
  }
  product.stock -= quantity;
  product.updated_at = new Date().toISOString();
  return { success: true, remaining: product.stock };
}

/**
 * Admin: Update product details (stock, price, active, featured)
 */
export function updateMockProduct(
  productId: string,
  patch: Partial<
    Pick<
      Product,
      | "stock"
      | "price"
      | "original_price"
      | "is_active"
      | "is_featured"
      | "image_url"
      | "description"
      | "gallery_images"
    >
  >,
): Product | null {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) return null;

  if (patch.stock !== undefined) product.stock = Math.max(0, Math.floor(patch.stock));
  if (patch.price !== undefined) product.price = Math.max(0, patch.price);
  if (patch.original_price !== undefined) product.original_price = patch.original_price;
  if (patch.is_active !== undefined) product.is_active = patch.is_active;
  if (patch.is_featured !== undefined) product.is_featured = patch.is_featured;
  if (patch.image_url !== undefined) product.image_url = patch.image_url;
  if (patch.description !== undefined) product.description = patch.description;
  if (patch.gallery_images !== undefined) product.gallery_images = patch.gallery_images;
  product.updated_at = new Date().toISOString();

  return { ...product };
}
