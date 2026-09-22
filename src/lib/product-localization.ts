import type { Product } from "@/lib/mock-products";

/**
 * Known product category translations mapping
 */
const CATEGORY_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  skincare: { ar: "عناية بالبشرة", en: "Skincare" },
  haircare: { ar: "عناية بالشعر", en: "Haircare" },
  bodycare: { ar: "عناية بالجسم", en: "Body Care" },
  makeup: { ar: "مكياج وتجميل", en: "Makeup" },
  fragrance: { ar: "عطور فاخرة", en: "Fragrance" },
  boxes: { ar: "بوكسات فاخرة", en: "Gift Sets" },
  box: { ar: "بوكسات وباقات فاخرة", en: "Care Bundles & Sets" },
  offer: { ar: "عروض التوفير الخاصة", en: "Special Super Deals" },
  accessory: { ar: "أدوات وإكسسوارات العناية", en: "Beauty Tools & Accessories" },
  "عناية بالبشرة": { ar: "عناية بالبشرة", en: "Skincare" },
  "عناية بالشعر": { ar: "عناية بالشعر", en: "Haircare" },
  "عناية بالجسم": { ar: "عناية بالجسم", en: "Body Care" },
  مكياج: { ar: "مكياج", en: "Makeup" },
  عطور: { ar: "عطور", en: "Fragrance" },
  "بوكسات فاخرة": { ar: "بوكسات فاخرة", en: "Gift Sets" },
  "عروض التوفير": { ar: "عروض التوفير", en: "Super Deals" },
};

/**
 * Built-in high-quality English catalog translations for base products
 */
const BUILTIN_PRODUCT_TRANSLATIONS: Record<string, { name: string; description?: string }> = {
  "سيروم فيتامين سي النقي": {
    name: "Pure Vitamin C Radiance Serum",
    description:
      "Antioxidant-rich concentrated serum that evens skin tone, restores natural glow, and revives skin vitality.",
  },
  "مرطب الهيالورونيك المكثف": {
    name: "Intense Hyaluronic Hydration Cream",
    description:
      "Ultra-lightweight moisturizer with pure hyaluronic acid and aloe vera to lock in deep moisture all day with zero greasy feel.",
  },
  "غسول الوجه المهدئ الطبيعي": {
    name: "Calming Natural Facial Cleanser",
    description:
      "Gentle foaming cleanser enriched with chamomile and green tea that purifies pores while protecting the skin barrier.",
  },
  "زيت الورد النقي لتجديد البشرة": {
    name: "Pure Rosehip Rejuvenating Face Oil",
    description:
      "100% cold-pressed organic rosehip seed oil to nourish, firm, and smooth fine lines naturally.",
  },
  "كريم الكولاجين الليلي لشد البشرة": {
    name: "Collagen Firming Night Cream",
    description:
      "Deeply restorative night treatment rich in plant collagen and shea butter to restore firmness and skin elasticity.",
  },
  "تونر ماء الورد المنعش": {
    name: "Refreshing Organic Rose Water Toner",
    description:
      "100% natural rose water toner that balances pH, refines pores, and delivers instant skin revitalization.",
  },
  "ماسك الطين الوردي المنقي": {
    name: "Purifying French Pink Clay Mask",
    description:
      "Detoxifying pink clay mask infused with organic minerals to gently clarify pores and brighten dull complexion.",
  },
  "واقي شمس سائل SPF 50+": {
    name: "Invisible Fluid Sunscreen SPF 50+",
    description:
      "High-protection broad-spectrum sunscreen with a velvet matte finish that leaves zero white cast on skin.",
  },
  "مجموعة التوهج الكاملة (عرض خاص)": {
    name: "Ultimate Radiance Glow Bundle (Special Offer)",
    description:
      "Ultimate value bundle: Pure Vitamin C Serum + Soothing Cleanser + Hydra Cream at an exclusive limited-time price.",
  },
  "بكج الترطيب العميق ومكافحة الجفاف": {
    name: "Deep Moisture & Anti-Dryness Care Set",
    description:
      "Complete restorative box featuring intensive hydration moisturizer, deeply nourishing night mask, and recovery serum.",
  },
  "بوكس العناية الملكي المتكامل": {
    name: "Royal All-in-One Luxury Care Box",
    description:
      "The pinnacle luxury box: 4 essential organic skincare essentials plus genuine jade massage roller and velvet pouch.",
  },
  "رولر تدليك الوجه من حجر اليشم": {
    name: "Genuine Jade Facial Massage Roller",
    description:
      "Natural beauty tool handcrafted from authentic jade stone to stimulate blood circulation, depuff, and boost serum absorption.",
  },
};

const I18N_REGEX = /<!--I18N:(.*?)-->/;

/**
 * Extracts localized English metadata from product or embedded tag
 */
export function extractProductI18n(
  product:
    | {
        description?: string | null;
        name_en?: string | null;
        description_en?: string | null;
      }
    | null
    | undefined,
): { name_en?: string; description_en?: string } {
  if (!product) return {};
  const res: { name_en?: string; description_en?: string } = {};
  if (product.name_en && product.name_en.trim().length > 0) {
    res.name_en = product.name_en.trim();
  }
  if (product.description_en && product.description_en.trim().length > 0) {
    res.description_en = product.description_en.trim();
  }
  if (product.description && typeof product.description === "string") {
    const match = product.description.match(I18N_REGEX);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.name_en && !res.name_en) res.name_en = parsed.name_en;
        if (parsed.description_en && !res.description_en) {
          res.description_en = parsed.description_en;
        }
      } catch {
        // ignore parse error
      }
    }
  }
  return res;
}

/**
 * Encodes localized metadata into persistent comment tag
 */
export function encodeProductI18n(i18n: {
  name_en?: string | null;
  description_en?: string | null;
}): string {
  const clean: { name_en?: string; description_en?: string } = {};
  if (i18n.name_en?.trim()) clean.name_en = i18n.name_en.trim();
  if (i18n.description_en?.trim()) clean.description_en = i18n.description_en.trim();
  if (!clean.name_en && !clean.description_en) return "";
  return `<!--I18N:${JSON.stringify(clean)}-->`;
}

/**
 * Beauty and cosmetic terminology map for instant English translation
 */
const BEAUTY_TERMS_REPLACE: Array<[RegExp, string]> = [
  [/سيروم/g, "Serum"],
  [/فيتامين سي/g, "Vitamin C"],
  [/فيتامين/g, "Vitamin"],
  [/حمض الهيالورونيك/g, "Hyaluronic Acid"],
  [/الهيالورونيك/g, "Hyaluronic"],
  [/كريم/g, "Cream"],
  [/مرطب/g, "Hydrating Moisturizer"],
  [/غسول/g, "Cleanser"],
  [/منظف/g, "Cleanser"],
  [/زيت/g, "Oil"],
  [/الورد/g, "Rose"],
  [/طبيعي/g, "Natural"],
  [/النقي/g, "Pure"],
  [/المكثف/g, "Intense"],
  [/المهدئ/g, "Soothing"],
  [/لتجديد/g, "Renewing"],
  [/البشرة/g, "Skin"],
  [/الوجه/g, "Face"],
  [/مجموعة/g, "Set"],
  [/بوكس/g, "Box"],
  [/بكج/g, "Bundle"],
  [/التوهج/g, "Glow"],
  [/الكاملة/g, "Complete"],
  [/عرض خاص/g, "Special Offer"],
  [/ملكي/g, "Royal"],
  [/المتكامل/g, "All-in-One"],
  [/تدليك/g, "Massage"],
  [/رولر/g, "Roller"],
  [/اليشم/g, "Jade"],
  [/مكافحة/g, "Anti-"],
  [/الجفاف/g, "Dryness"],
  [/الترطيب/g, "Moisturizing"],
  [/العميق/g, "Deep"],
];

function fallbackTranslateBeautyText(text: string): string {
  let translated = text;
  for (const [re, rep] of BEAUTY_TERMS_REPLACE) {
    translated = translated.replace(re, rep);
  }
  // If mostly Arabic still, provide a polished cosmetic label
  const hasArabic = /[\u0600-\u06FF]/.test(translated);
  if (hasArabic) {
    return translated.replace(/[\u0600-\u06FF]+/g, "").trim() || "Luxury Beauty Care Product";
  }
  return translated.replace(/\s+/g, " ").trim();
}

/**
 * Get localized name for a product based on current language
 */
export function getLocalizedProductName(
  product: Pick<Product, "name"> & { name_en?: string | null; description?: string | null },
  lang: "ar" | "en",
): string {
  if (lang === "ar") {
    return product.name;
  }
  // 1. Direct name_en property
  if (product.name_en && product.name_en.trim().length > 0) {
    return product.name_en.trim();
  }
  // 2. Extracted from I18N tag
  const extracted = extractProductI18n(product);
  if (extracted.name_en && extracted.name_en.trim().length > 0) {
    return extracted.name_en.trim();
  }
  // 3. Check builtin dictionary
  const trimmed = product.name?.trim() || "";
  if (BUILTIN_PRODUCT_TRANSLATIONS[trimmed]?.name) {
    return BUILTIN_PRODUCT_TRANSLATIONS[trimmed].name;
  }
  // 4. Intelligent cosmetics dictionary fallback
  const smartFall = fallbackTranslateBeautyText(trimmed);
  if (smartFall && smartFall !== trimmed) {
    return smartFall;
  }
  return product.name;
}

/**
 * Get localized description for a product
 */
export function getLocalizedProductDescription(
  product: Pick<Product, "description"> & { description_en?: string | null; name?: string },
  lang: "ar" | "en",
): string {
  if (lang === "ar") {
    return cleanProductDescription(product.description || "");
  }
  // 1. Direct description_en
  if (product.description_en && product.description_en.trim().length > 0) {
    return product.description_en.trim();
  }
  // 2. Extracted from I18N tag
  const extracted = extractProductI18n(product);
  if (extracted.description_en && extracted.description_en.trim().length > 0) {
    return extracted.description_en.trim();
  }
  // 3. Check builtin dictionary
  const nameTrimmed = product.name?.trim() || "";
  if (BUILTIN_PRODUCT_TRANSLATIONS[nameTrimmed]?.description) {
    return BUILTIN_PRODUCT_TRANSLATIONS[nameTrimmed].description!;
  }
  // 4. Fallback cosmetic description
  return "Premium botanical cosmetic formula crafted with 100% authentic natural extracts to nourish and rejuvenate your skin with a radiant, healthy glow.";
}

/**
 * Known default Arabic store texts to English mapping
 */
const DEFAULT_SETTING_TRANSLATIONS: Record<string, string> = {
  // Hero
  "جمالكِ الطبيعي يبدأ من هنا": "Natural Beauty Starts Here",
  "اكتشفي مجموعة So Beauty من منتجات العناية الطبيعية بالبشرة — نقاء نباتي وإشراقة تدوم.":
    "Discover the So Beauty collection of pure botanical skincare — clean botanicals, radiant glow that lasts.",
  "تسوّق الآن": "Shop Now",
  "شاهد العروض": "Explore Offers",

  // Features
  "نتائج فعّالة": "Proven Results",
  "منتجات مصنوعة بعناية لأفضل النتائج.": "Thoughtfully crafted formulas for optimal effectiveness.",
  "شحن سريع": "Express Delivery",
  "توصيل طلبك في أسرع وقت.": "Swift and reliable doorstep delivery for your orders.",
  "دفع آمن": "Secure Payment",
  "ادفع عند الاستلام أو أونلاين.": "Cash on Delivery or encrypted secure checkout.",
  "أصلية 100%": "100% Authentic",
  "نضمن جودة وأصالة كل منتج.": "Guaranteed genuine natural ingredients with certified quality.",

  // Banner
  "عناية طبيعية متكاملة بكل تفاصيل بشرتك":
    "Complete Natural Care Tailored to Every Detail of Your Skin",
  "من الترطيب إلى النضارة، اكتشفي ما يلائمكِ بعناية. تسوّقي الآن":
    "From deep hydration to radiant glow, discover your personalized routine. Shop now.",

  // Promo / Bloom
  "مكوّنات نباتية 100% مستخلصة بعناية لتمنحك بشرة نضرة وصحية.":
    "100% organic botanical extracts gently formulated to grant you vibrant, healthy, and luminous skin.",
  "اكتشف البوكسات": "Explore Care Sets",

  // About
  "روائع العناية": "Art of Natural Skincare",
  "نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع منتجاتنا أصلية بنسبة 100%.":
    "We strive to deliver the finest natural skincare solutions at competitive prices with uncompromising quality. 100% authentic and ethically crafted.",

  // Store name / Tagline
  "سو بيوتي - So Beauty": "So Beauty Boutique",
  "سو بيوتي · عناية طبيعية": "So Beauty · Pure Botanical Care",
  "أم درمان — شارع الوادي": "Omdurman — Al-Wadi Street",
};

/**
 * Returns the localized text for a store setting, translating default Arabic texts to English
 */
export function getLocalizedSetting(
  text: string | undefined | null,
  lang: "ar" | "en",
  fallbackEn?: string,
): string {
  if (lang === "ar") return text || "";
  if (fallbackEn && fallbackEn.trim().length > 0) {
    return fallbackEn.trim();
  }
  if (!text) return "";

  const trimmed = text.trim();
  if (DEFAULT_SETTING_TRANSLATIONS[trimmed]) {
    return DEFAULT_SETTING_TRANSLATIONS[trimmed];
  }

  // If text contains Arabic and no translation exists, try smart dictionary replace
  const translated = fallbackTranslateBeautyText(trimmed);
  if (translated && translated !== trimmed) {
    return translated;
  }

  return text;
}

/**
 * Get localized category name
 */
export function getLocalizedCategory(
  category: string | undefined | null,
  lang: "ar" | "en",
): string {
  if (!category) return "";
  const key = category.trim();
  const found = CATEGORY_TRANSLATIONS[key] || CATEGORY_TRANSLATIONS[key.toLowerCase()];
  if (found) {
    return lang === "ar" ? found.ar : found.en;
  }
  return category;
}
