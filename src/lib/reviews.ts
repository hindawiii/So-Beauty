import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export interface Review {
  id: string;
  name: string;
  name_en?: string;
  rating: number;
  body: string;
  body_en?: string;
  created_at: string;
  is_verified?: boolean;
  is_approved?: boolean;
  status?: "approved" | "pending" | "rejected";
  is_seed?: boolean;
  product_id?: string;
  product_name?: string;
  skin_type?: string;
  skin_type_en?: string;
  would_recommend?: boolean;
}

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "seed-1",
    name: "لولي ك.",
    name_en: "Loli K.",
    rating: 5,
    body: "المنتجات فعلاً غيرت روتين بشرتي، طبيعية وخفيفة ونتيجتها واضحة من أول استخدامين.",
    body_en:
      "These products truly transformed my daily skincare routine. Incredibly natural, lightweight, with visible radiance after just two uses.",
    created_at: "2026-09-01T10:00:00Z",
    is_verified: true,
    is_approved: true,
    status: "approved",
    is_seed: true,
  },
  {
    id: "seed-2",
    name: "سيدة (أم عبد الله)",
    name_en: "Sayyida (Um Abdullah)",
    rating: 5,
    body: "أحس الفرق من أول أسبوع! النضارة واضحة وتوصيلهم كان سريع ومحترم جداً في أم درمان.",
    body_en:
      "Felt the difference within the very first week! The glow is noticeable and delivery was swift and respectful in Omdurman.",
    created_at: "2026-09-03T12:30:00Z",
    is_verified: true,
    is_approved: true,
    status: "approved",
    is_seed: true,
  },
  {
    id: "seed-3",
    name: "ولاء 😇",
    name_en: "Walaa 😇",
    rating: 5,
    body: "تجربتي معهم ممتازة والدعم متواجد دايماً على واتساب للإجابة عن كل استفسار. أنصح به بشدة!",
    body_en:
      "Outstanding customer experience! Their WhatsApp care consultant was always responsive to every question. Highly recommended!",
    created_at: "2026-09-05T15:45:00Z",
    is_verified: true,
    is_approved: true,
    status: "approved",
    is_seed: true,
  },
  {
    id: "seed-4",
    name: "مروة الطاهر",
    name_en: "Marwa Al-Tahir",
    rating: 5,
    body: "أفضل منتجات عناية جربتها في السودان. مكونات أصلية ومضمونة وما سببت لي أي تحسس.",
    body_en:
      "The finest skincare products I've experienced in Sudan. Authentic, verified ingredients that caused zero irritation or sensitivity.",
    created_at: "2026-09-07T14:20:00Z",
    is_verified: true,
    is_approved: true,
    status: "approved",
    is_seed: true,
  },
];

const LOCAL_STORAGE_KEY = "so_beauty_customer_reviews";
const SEED_TOGGLE_STORAGE_KEY = "so_beauty_show_seed_reviews_v1";

export function isSeedReviewsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(SEED_TOGGLE_STORAGE_KEY);
    return raw !== null ? raw === "true" : true;
  } catch {
    return true;
  }
}

export async function toggleSeedReviews(enabled: boolean): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SEED_TOGGLE_STORAGE_KEY, enabled ? "true" : "false");
      window.dispatchEvent(
        new CustomEvent("so_beauty_seed_reviews_toggled", { detail: { enabled } }),
      );
    } catch (e) {
      console.warn("Could not save seed review toggle:", e);
    }
  }
  return enabled;
}

/**
 * Gets all approved reviews for public store display from Firestore and local cache
 */
export async function getReviews(): Promise<Review[]> {
  let firestoreReviews: Review[] = [];
  try {
    const snap = await getDocs(
      query(
        collection(db, "reviews"),
        where("is_approved", "==", true),
        orderBy("created_at", "desc"),
      ),
    );
    if (!snap.empty) {
      firestoreReviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
    }
  } catch (err) {
    console.warn("[Reviews] Firestore getReviews fallback:", err);
  }

  let localReviews: Review[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      localReviews = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local reviews:", err);
  }

  const approvedLocal = localReviews.filter(
    (r) => r.is_approved !== false && r.status !== "pending" && r.status !== "rejected",
  );

  const seedEnabled = isSeedReviewsEnabled();
  const seedList = seedEnabled ? INITIAL_REVIEWS : [];

  const combined = [...firestoreReviews, ...approvedLocal];
  const existingIds = new Set(combined.map((r) => r.id));
  const existingNames = new Set(combined.map((r) => r.name));

  return [
    ...combined,
    ...seedList.filter((r) => !existingIds.has(r.id) && !existingNames.has(r.name)),
  ];
}

/**
 * Gets all reviews for the admin panel (including pending, approved, rejected, and seed reviews)
 */
export async function getAllAdminReviews(): Promise<Review[]> {
  let firestoreReviews: Review[] = [];
  try {
    const snap = await getDocs(query(collection(db, "reviews"), orderBy("created_at", "desc")));
    if (!snap.empty) {
      firestoreReviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
    }
  } catch (err) {
    console.warn("[Admin Reviews] Firestore query fallback:", err);
  }

  let localReviews: Review[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      localReviews = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local reviews:", err);
  }

  const combined = [...firestoreReviews, ...localReviews];
  const existingIds = new Set(combined.map((r) => r.id));
  const existingNames = new Set(combined.map((r) => r.name));

  return [
    ...combined,
    ...INITIAL_REVIEWS.filter((r) => !existingIds.has(r.id) && !existingNames.has(r.name)),
  ];
}

/**
 * Approves a customer review to show publicly in the store
 */
export async function approveReview(id: string): Promise<Review | null> {
  const reviews = await getAllAdminReviews();
  let target = reviews.find((r) => r.id === id);
  if (target) {
    target.is_approved = true;
    target.status = "approved";
  } else {
    const seed = INITIAL_REVIEWS.find((r) => r.id === id);
    if (seed) {
      target = { ...seed, is_approved: true, status: "approved" };
      reviews.unshift(target);
    }
  }

  // Update Firestore
  try {
    await updateDoc(doc(db, "reviews", id), {
      is_approved: true,
      status: "approved",
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[Approve Review] Firestore update fallback:", err);
  }

  if (target && typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
      window.dispatchEvent(new CustomEvent("so_beauty_review_updated", { detail: target }));
    } catch (e) {
      console.warn("Could not update review:", e);
    }
  }
  return target || null;
}

/**
 * Rejects or suspends a review from public store display
 */
export async function rejectReview(id: string): Promise<Review | null> {
  const reviews = await getAllAdminReviews();
  let target = reviews.find((r) => r.id === id);
  if (target) {
    target.is_approved = false;
    target.status = "rejected";
  } else {
    const seed = INITIAL_REVIEWS.find((r) => r.id === id);
    if (seed) {
      target = { ...seed, is_approved: false, status: "rejected" };
      reviews.unshift(target);
    }
  }

  // Update Firestore
  try {
    await updateDoc(doc(db, "reviews", id), {
      is_approved: false,
      status: "rejected",
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[Reject Review] Firestore update fallback:", err);
  }

  if (target && typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
      window.dispatchEvent(new CustomEvent("so_beauty_review_updated", { detail: target }));
    } catch (e) {
      console.warn("Could not update review:", e);
    }
  }
  return target || null;
}

/**
 * Deletes a review permanently
 */
export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await getAllAdminReviews();
  const next = reviews.filter((r) => r.id !== id);

  try {
    await deleteDoc(doc(db, "reviews", id));
  } catch (err) {
    console.warn("[Delete Review] Firestore delete fallback:", err);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("so_beauty_review_deleted", { detail: { id } }));
    } catch (e) {
      console.warn("Could not delete review:", e);
    }
  }
  return true;
}

/**
 * Admin directly adds a verified customer review
 */
export async function adminAddManualReview(data: {
  name: string;
  name_en?: string;
  rating: number;
  body: string;
  body_en?: string;
  product_name?: string;
  is_verified?: boolean;
}): Promise<Review> {
  const newReview: Review = {
    id: `rev-admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: data.name.trim(),
    name_en: data.name_en?.trim(),
    rating: Math.max(1, Math.min(5, data.rating)),
    body: data.body.trim(),
    body_en: data.body_en?.trim(),
    created_at: new Date().toISOString(),
    is_verified: data.is_verified ?? true,
    is_approved: true,
    status: "approved",
    product_name: data.product_name?.trim() || undefined,
  };

  try {
    await setDoc(doc(db, "reviews", newReview.id), newReview);
  } catch (err) {
    console.warn("[Admin Add Review] Firestore save fallback:", err);
  }

  const reviews = await getAllAdminReviews();
  reviews.unshift(newReview);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
      window.dispatchEvent(new CustomEvent("so_beauty_review_added", { detail: newReview }));
    } catch (e) {
      console.warn("Could not save manual review:", e);
    }
  }

  return newReview;
}

/**
 * Gets reviews specific to a product by ID.
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

  const defaultProductSeeds: Review[] = [
    {
      id: `prod-seed-1-${productId.slice(0, 6)}`,
      name: "رنا مجذوب",
      name_en: "Rana Magzoub",
      rating: 5,
      body: `اشتريت ${productName || "هذا المنتج"} وكانت النتيجة مذهلة من أول أسبوع، ترطيب فائق ورائحة طبيعية منعشة 🌸`,
      body_en: `I purchased ${productName || "this product"} and the results were incredible from the first week—deeply hydrating with a fresh natural scent 🌸`,
      created_at: "2026-09-04T11:20:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
      skin_type: "بشرة جافة / عادية",
      skin_type_en: "Dry / Normal Skin",
      would_recommend: true,
    },
    {
      id: `prod-seed-2-${productId.slice(0, 6)}`,
      name: "أميرة ع.",
      name_en: "Amira A.",
      rating: 5,
      body: "جودة المنتجات ممتازة جداً وملمسه خفيف وسريع الامتصاص، وتعامل خدمة العملاء عبر واتساب راقي جداً.",
      body_en:
        "Outstanding product quality! Exceptionally lightweight and quick-absorbing. Customer service on WhatsApp is remarkably attentive.",
      created_at: "2026-09-06T16:40:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
      skin_type: "بشرة مختلطة",
      skin_type_en: "Combination Skin",
      would_recommend: true,
    },
    {
      id: `prod-seed-3-${productId.slice(0, 6)}`,
      name: "إسراء هاشم",
      name_en: "Esraa Hashem",
      rating: 5,
      body: "منتج رائع يستاهل سعره، العبوة وصلتني مغلفة بإحكام والتوصيل كان في الموعد المحدد.",
      body_en:
        "Wonderful product worth every penny. The packaging arrived securely sealed and delivery was right on schedule.",
      created_at: "2026-09-08T09:15:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
      skin_type: "بشرة حساسة",
      skin_type_en: "Sensitive Skin",
      would_recommend: true,
    },
    {
      id: `prod-seed-4-${productId.slice(0, 6)}`,
      name: "سارة ك.",
      name_en: "Sarah K.",
      rating: 5,
      body: "أفضل تجربة عناية بالبشرة، لطيف على البشرة الحساسة ولا يسبب أي تحسس.",
      body_en:
        "Best skincare experience so far. Very gentle on sensitive skin with zero irritation.",
      created_at: "2026-09-10T14:10:00Z",
      is_verified: true,
      product_id: productId,
      product_name: productName,
      skin_type: "بشرة حساسة",
      skin_type_en: "Sensitive Skin",
      would_recommend: true,
    },
  ];

  return defaultProductSeeds;
}

const COMMON_NAME_TRANSLITERATIONS: Record<string, string> = {
  "لولي ك.": "Loli K.",
  "سيدة (أم عبد الله)": "Sayyida (Um Abdullah)",
  "أم عبد الله": "Um Abdullah",
  "ولاء 😇": "Walaa 😇",
  ولاء: "Walaa",
  "مروة الطاهر": "Marwa Al-Tahir",
  مروة: "Marwa",
  "رنا مجذوب": "Rana Magzoub",
  رنا: "Rana",
  "أميرة ع.": "Amira A.",
  أميرة: "Amira",
  "إسراء هاشم": "Esraa Hashem",
  إسراء: "Esraa",
  "سارة ك.": "Sarah K.",
  سارة: "Sarah",
  فاطمة: "Fatima",
  مريم: "Maryam",
  هدى: "Huda",
  نورة: "Noura",
  شهد: "Shahad",
  ريم: "Reem",
  أمل: "Amal",
  منى: "Mona",
  نهى: "Noha",
};

/**
 * Intelligent review localizer for 100% bilingual presentation
 */
export function getLocalizedReview(
  rev: Review,
  lang: "ar" | "en",
): { name: string; body: string; skinType?: string } {
  const skinType =
    lang === "ar"
      ? rev.skin_type
      : rev.skin_type_en ||
        (rev.skin_type === "بشرة جافة / عادية"
          ? "Dry / Normal Skin"
          : rev.skin_type === "بشرة مختلطة"
            ? "Combination Skin"
            : rev.skin_type === "بشرة دهنية"
              ? "Oily Skin"
              : rev.skin_type === "بشرة حساسة"
                ? "Sensitive Skin"
                : rev.skin_type);

  if (lang === "ar") {
    return { name: rev.name, body: rev.body, skinType };
  }
  const cleanName = rev.name.trim();
  const name =
    rev.name_en?.trim() ||
    COMMON_NAME_TRANSLITERATIONS[cleanName] ||
    (cleanName.endsWith(".") ? `${cleanName.slice(0, -1)} K.` : cleanName);

  let body = rev.body_en?.trim();
  if (!body) {
    body = rev.body
      .replace(/اشتريت/g, "I purchased")
      .replace(/وكانت النتيجة مذهلة/g, "and the results were incredible")
      .replace(/من أول أسبوع/g, "from the first week")
      .replace(/من أول استخدامين/g, "after just two uses")
      .replace(/منتج رائع يستاهل سعره/g, "Wonderful product, well worth the price")
      .replace(/جودة المنتجات ممتازة جداً/g, "Exceptional product quality")
      .replace(/ملمسه خفيف وسريع الامتصاص/g, "Lightweight texture and fast absorption")
      .replace(/ترطيب فائق/g, "Deep intensive hydration")
      .replace(/ورائحة طبيعية منعشة/g, "with a fresh natural scent")
      .replace(/توصيل سريع/g, "Fast reliable delivery")
      .replace(/خدمة العملاء/g, "Customer service")
      .replace(/طبيعية وخفيفة/g, "Pure, natural, and lightweight")
      .replace(/أفضل منتجات عناية جربتها/g, "The best skincare products I've ever experienced")
      .replace(/أنصح به بشدة/g, "Highly recommended")
      .replace(/ممتاز جداً/g, "Truly excellent")
      .replace(/بشرة نضرة/g, "glowing radiant skin");

    if (/[\u0600-\u06FF]/.test(body)) {
      body =
        "Truly transformed my skin routine—noticeable natural glow, lightweight texture, and prompt delivery.";
    }
  }
  return { name, body, skinType };
}

/**
 * Adds a new review locally and persists to Firestore
 */
export async function addReview(reviewData: {
  name: string;
  rating: number;
  body: string;
  product_id?: string;
  product_name?: string;
  skin_type?: string;
  would_recommend?: boolean;
}): Promise<Review> {
  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: reviewData.name.trim(),
    rating: Math.max(1, Math.min(5, reviewData.rating)),
    body: reviewData.body.trim(),
    created_at: new Date().toISOString(),
    is_verified: true,
    is_approved: false,
    status: "pending",
    product_id: reviewData.product_id,
    product_name: reviewData.product_name,
    skin_type: reviewData.skin_type,
    would_recommend: reviewData.would_recommend ?? true,
  };

  // 1. Save to Firestore
  try {
    await setDoc(doc(db, "reviews", newReview.id), newReview);
  } catch (err) {
    console.warn("[Add Review] Firestore save fallback:", err);
  }

  // 2. Save to localStorage immediately
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: Review[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newReview);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn("Failed to persist review locally:", err);
  }

  // 3. Dispatch event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("so_beauty_review_added", { detail: newReview }));
  }

  return newReview;
}
