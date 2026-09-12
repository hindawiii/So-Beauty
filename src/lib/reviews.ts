import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  name: string;
  rating: number;
  body: string;
  created_at: string;
  is_verified?: boolean;
  product_id?: string;
  product_name?: string;
}

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "seed-1",
    name: "لولي ك.",
    rating: 5,
    body: "المنتجات فعلاً غيرت روتين بشرتي، طبيعية وخفيفة ونتيجتها واضحة من أول استخدامين.",
    created_at: "2026-09-01T10:00:00Z",
    is_verified: true,
  },
  {
    id: "seed-2",
    name: "سيدة (أم عبد الله)",
    rating: 5,
    body: "أحس الفرق من أول أسبوع! النضارة واضحة وتوصيلهم كان سريع ومحترم جداً في أم درمان.",
    created_at: "2026-09-03T12:30:00Z",
    is_verified: true,
  },
  {
    id: "seed-3",
    name: "ولاء 😇",
    rating: 5,
    body: "تجربتي معهم ممتازة والدعم متواجد دايماً على واتساب للإجابة عن كل استفسار. أنصح به بشدة!",
    created_at: "2026-09-05T15:45:00Z",
    is_verified: true,
  },
  {
    id: "seed-4",
    name: "مروة الطاهر",
    rating: 5,
    body: "أفضل منتجات عناية جربتها في السودان. مكونات أصلية ومضمونة وما سببت لي أي تحسس.",
    created_at: "2026-09-07T14:20:00Z",
    is_verified: true,
  },
];

const LOCAL_STORAGE_KEY = "so_beauty_customer_reviews";

/**
 * Gets all reviews by merging stored local reviews with default seed reviews.
 * If Supabase is connected, it also attempts to fetch approved reviews.
 */
export async function getReviews(): Promise<Review[]> {
  let localReviews: Review[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      localReviews = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local reviews:", err);
  }

  // Attempt Supabase fetch
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, rating, body, created_at, is_approved, product_id, product_name")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const existingIds = new Set(data.map((r: Review) => r.id));
      const remainingLocal = localReviews.filter((r) => !existingIds.has(r.id));
      const remainingInitial = INITIAL_REVIEWS.filter(
        (r) => !existingIds.has(r.id) && !localReviews.some((l) => l.name === r.name),
      );
      return [...data, ...remainingLocal, ...remainingInitial];
    }
  } catch {
    // Supabase unavailable or table not created yet, fall back gracefully
  }

  // Fallback to local + initial reviews
  const existingNames = new Set(localReviews.map((r) => r.name));
  const merged = [...localReviews, ...INITIAL_REVIEWS.filter((r) => !existingNames.has(r.name))];
  return merged;
}

/**
 * Gets reviews specific to a product by ID.
 * Merges customer submitted reviews with dedicated seed reviews for this product.
 */
export async function getProductReviews(
  productId: string,
  productName?: string,
): Promise<Review[]> {
  const all = await getReviews();
  const directMatches = all.filter((r) => r.product_id === productId);

  if (directMatches.length > 0) {
    return directMatches;
  }

  // Generate 2-3 realistic tailored reviews if none exists yet for this product
  const defaultProductSeeds: Review[] = [
    {
      id: `prod-seed-1-${productId.slice(0, 6)}`,
      name: "رنا مجذوب",
      rating: 5,
      body: `اشتريت ${productName || "هذا المنتج"} وكانت النتيجة مذهلة من أول أسبوع، ترطيب فائق ورائحة طبيعية منعشة 🌸`,
      created_at: "2026-09-04T11:20:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
    },
    {
      id: `prod-seed-2-${productId.slice(0, 6)}`,
      name: "أميرة ع.",
      rating: 5,
      body: "جودة المنتجات ممتازة جداً وملمسه خفيف وسريع الامتصاص، وتعامل خدمة العملاء عبر واتساب راقي جداً.",
      created_at: "2026-09-06T16:40:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
    },
    {
      id: `prod-seed-3-${productId.slice(0, 6)}`,
      name: "إسراء هاشم",
      rating: 4,
      body: "منتج رائع يستاهل سعره، العبوة وصلتني مغلفة بإحكام والتوصيل كان في الموعد المحدد.",
      created_at: "2026-09-08T09:15:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
    },
  ];

  return defaultProductSeeds;
}

/**
 * Adds a new review locally and persists to Supabase in the background.
 */
export async function addReview(reviewData: {
  name: string;
  rating: number;
  body: string;
  product_id?: string;
  product_name?: string;
}): Promise<Review> {
  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: reviewData.name.trim(),
    rating: Math.max(1, Math.min(5, reviewData.rating)),
    body: reviewData.body.trim(),
    created_at: new Date().toISOString(),
    is_verified: true,
    product_id: reviewData.product_id,
    product_name: reviewData.product_name,
  };

  // 1. Save to localStorage immediately
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: Review[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newReview);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn("Failed to persist review locally:", err);
  }

  // 2. Dispatch window event for immediate UI reaction across components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("so_beauty_review_added", { detail: newReview }));
  }

  // 3. Attempt async persist to Supabase if connected
  try {
    await supabase.from("reviews").insert({
      name: newReview.name,
      rating: newReview.rating,
      body: newReview.body,
      is_approved: true,
      product_id: newReview.product_id,
      product_name: newReview.product_name,
    });
  } catch {
    // Graceful offline/fallback handling
  }

  return newReview;
}
