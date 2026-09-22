import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type } from "@google/genai";
import { requireAdminGuard } from "./admin-auth";

export interface TranslateProductInput {
  name: string;
  description?: string;
  category?: string;
  howToUse?: string;
  keyIngredients?: string;
  adminPin?: string;
}

export interface TranslateProductOutput {
  ok: boolean;
  source: "gemini" | "fallback";
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  how_to_use_ar?: string;
  how_to_use_en?: string;
  key_ingredients_ar?: string;
  key_ingredients_en?: string;
  suggested_category?: "skincare" | "box" | "offer" | "accessory";
}

/**
 * Intelligent domain-specific dictionary for cosmetics and skincare fallback
 */
const BEAUTY_TERMS_MAP: Array<{ pattern: RegExp; ar: string; en: string }> = [
  { pattern: /سيروم|serum/i, ar: "سيروم", en: "Serum" },
  { pattern: /فيتامين\s*سي|vitamin\s*c/i, ar: "فيتامين سي النقي", en: "Pure Vitamin C" },
  { pattern: /هيالورونيك|hyaluronic/i, ar: "الهيالورونيك المرطب", en: "Hyaluronic Hydrating" },
  { pattern: /كولاجين|collagen/i, ar: "الكولاجين لشد البشرة", en: "Firming Collagen" },
  { pattern: /ريتينول|retinol/i, ar: "الريتينول لتجديد الشباب", en: "Youth Renewal Retinol" },
  {
    pattern: /نياسيناميد|niacinamide/i,
    ar: "النياسيناميد لتنقية المسام",
    en: "Pore-Refining Niacinamide",
  },
  { pattern: /كريم|cream/i, ar: "كريم", en: "Cream" },
  { pattern: /مرطب|moisturiz(er|ing)/i, ar: "مرطب مكثف", en: "Intensive Moisturizer" },
  { pattern: /غسول|منظف|cleanser/i, ar: "غسول منظف لطيف", en: "Gentle Purifying Cleanser" },
  { pattern: /تونر|toner/i, ar: "تونر منشط ومنقي", en: "Revitalizing Purifying Toner" },
  { pattern: /ماسك|قناع|mask/i, ar: "ماسك مغذي", en: "Nourishing Mask" },
  {
    pattern: /مقشر|سكراب|scrub|exfoliat/i,
    ar: "مقشر ومجدد للبشرة",
    en: "Exfoliating Skin Radiance Scrub",
  },
  {
    pattern: /واقي\s*شمس|sunscreen|spf/i,
    ar: "واقي شمس واسع المدى SPF 50+",
    en: "Broad Spectrum Sunscreen SPF 50+",
  },
  { pattern: /زيت|oil/i, ar: "زيت مغذي طبيعي", en: "Natural Nourishing Oil" },
  {
    pattern: /بوكس|مجموعة|بكج|box|set|bundle/i,
    ar: "بوكس العناية الملكي الفاخر",
    en: "Luxury Royal Care Gift Set",
  },
  { pattern: /ورد|rose/i, ar: "ماء الورد العضوي", en: "Organic Rose Water" },
  { pattern: /صبار|ألوفيرا|aloe\s*vera/i, ar: "خلاصة الصبار المهدئة", en: "Soothing Aloe Vera" },
  {
    pattern: /شاي\s*أخضر|green\s*tea/i,
    ar: "الشاي الأخضر المضاد للأكسدة",
    en: "Antioxidant Green Tea",
  },
  {
    pattern: /تفتيح|نضارة|brighten|glow|radiance/i,
    ar: "لإشراقة ونضارة طبيعية",
    en: "for Natural Glow & Radiance",
  },
  {
    pattern: /شد|تجاعيد|firming|anti-aging/i,
    ar: "لمكافحة علامات التقدم وشد البشرة",
    en: "Anti-Aging & Firming",
  },
  {
    pattern: /ترطيب|hydrat(ion|ing)/i,
    ar: "ترطيب عميق يدوم طويلاً",
    en: "Deep Long-Lasting Hydration",
  },
];

function fallbackTranslate(data: TranslateProductInput): TranslateProductOutput {
  const isArabicInput = /[\u0600-\u06FF]/.test(data.name || "");
  const trimmedName = data.name.trim();
  const trimmedDesc = data.description?.trim() || "";

  let translatedNameEn = trimmedName;
  let translatedNameAr = trimmedName;
  let translatedDescEn = trimmedDesc;
  let translatedDescAr = trimmedDesc;

  // Keyword enhancement
  const matchedEnParts: string[] = [];
  const matchedArParts: string[] = [];

  for (const term of BEAUTY_TERMS_MAP) {
    if (term.pattern.test(trimmedName) || term.pattern.test(trimmedDesc)) {
      matchedEnParts.push(term.en);
      matchedArParts.push(term.ar);
    }
  }

  if (isArabicInput) {
    // Translating AR -> EN
    if (matchedEnParts.length > 0) {
      translatedNameEn = matchedEnParts.slice(0, 3).join(" ");
    } else {
      translatedNameEn = `${trimmedName} — Luxury Care`;
    }

    translatedDescEn = trimmedDesc
      ? `Premium beauty and skincare product carefully formulated with natural ingredients to revitalize, nourish, and enhance your natural glow.`
      : `High-quality luxury skincare formulated to nourish, protect, and illuminate your complexion with long-lasting vitality.`;
  } else {
    // Translating EN -> AR
    if (matchedArParts.length > 0) {
      translatedNameAr = matchedArParts.slice(0, 3).join(" ");
    } else {
      translatedNameAr = `${trimmedName} — عناية فاخرة`;
    }

    translatedDescAr = trimmedDesc
      ? `منتج عناية وتجميل فائق الجودة مصنوع من مكونات طبيعية متطورة لتغذية البشرة وترطيبها بعمق واستعادة نضارتها وحيويتها.`
      : `تركيبة عناية مركزة تغذي البشرة وتحمي حاجزها الطبيعي وتمنحها نضارة وإشراقة مخملية تدوم طوال اليوم.`;
  }

  let suggestedCat: "skincare" | "box" | "offer" | "accessory" = "skincare";
  const combined = `${trimmedName} ${trimmedDesc}`.toLowerCase();
  if (/بوكس|مجموعة|بكج|box|set|bundle/i.test(combined)) {
    suggestedCat = "box";
  } else if (/عرض|تخفيض|خصم|offer|discount|deal/i.test(combined)) {
    suggestedCat = "offer";
  } else if (/فرش|إسفنج|رولر|أداة|brush|sponge|tool|accessory/i.test(combined)) {
    suggestedCat = "accessory";
  }

  return {
    ok: true,
    source: "fallback",
    name_ar: translatedNameAr,
    name_en: translatedNameEn,
    description_ar: translatedDescAr,
    description_en: translatedDescEn,
    how_to_use_ar:
      data.howToUse?.trim() || "توضع بضع قطرات على بشرة نظيفة ويدلك برفق حتى الامتصاص التام.",
    how_to_use_en:
      "Apply a few drops onto clean, dry skin and gently massage until fully absorbed.",
    key_ingredients_ar: data.keyIngredients?.trim() || "مستخلصات نباتية طبيعية وفيتامينات مغذية.",
    key_ingredients_en:
      "Natural botanical extracts, pure vitamins, and gentle skin-loving actives.",
    suggested_category: suggestedCat,
  };
}

/**
 * Server Function: AI-Driven Product Translation using Gemini API
 */
export const adminTranslateProductAi = createServerFn({ method: "POST" })
  .inputValidator((data: TranslateProductInput) => data)
  .handler(async ({ data }): Promise<TranslateProductOutput> => {
    // Security check
    await requireAdminGuard(data.adminPin);

    if (!data.name || data.name.trim().length === 0) {
      throw new Error("يرجى إدخال اسم المنتج لبدء الترجمة الذكية");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is not configured, gracefully use the high-quality domain fallback
    if (!apiKey) {
      return fallbackTranslate(data);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are a high-end luxury beauty and skincare brand copywriter for "So Beauty" (سو بيوتي).
Translate, adapt, and elevate the following cosmetic product details into BOTH professional Arabic and English.
Make sure the product name sounds sophisticated, commercial, and appealing in both languages.
Make sure the descriptions are persuasive, emphasizing benefits (hydration, radiance, skin barrier protection, anti-aging, natural luxury).

Input Product:
- Name: "${data.name.trim()}"
- Category: "${data.category || "skincare"}"
- Raw Description: "${data.description?.trim() || ""}"
- How to Use: "${data.howToUse?.trim() || ""}"
- Key Ingredients: "${data.keyIngredients?.trim() || ""}"

Respond with the exact requested JSON schema with high accuracy.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a master bilingual copywriter specializing in luxury cosmetic, skincare, and beauty e-commerce. Always return valid structured JSON matching the provided schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name_ar: {
                type: Type.STRING,
                description: "Attractive, natural Arabic product name for cosmetics",
              },
              name_en: {
                type: Type.STRING,
                description: "Sophisticated, international English product name",
              },
              description_ar: {
                type: Type.STRING,
                description: "Captivating Arabic product description emphasizing benefits",
              },
              description_en: {
                type: Type.STRING,
                description: "Captivating English product description emphasizing benefits",
              },
              how_to_use_ar: {
                type: Type.STRING,
                description: "Clear usage instructions in Arabic",
              },
              how_to_use_en: {
                type: Type.STRING,
                description: "Clear usage instructions in English",
              },
              key_ingredients_ar: {
                type: Type.STRING,
                description: "Key active ingredients in Arabic",
              },
              key_ingredients_en: {
                type: Type.STRING,
                description: "Key active ingredients in English",
              },
              suggested_category: {
                type: Type.STRING,
                description: "One of: skincare, box, offer, accessory",
              },
            },
            required: ["name_ar", "name_en", "description_ar", "description_en"],
          },
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return fallbackTranslate(data);
      }

      const parsed = JSON.parse(text);

      const validCategories: Array<"skincare" | "box" | "offer" | "accessory"> = [
        "skincare",
        "box",
        "offer",
        "accessory",
      ];
      const validCategory = validCategories.includes(parsed.suggested_category)
        ? (parsed.suggested_category as "skincare" | "box" | "offer" | "accessory")
        : undefined;

      return {
        ok: true,
        source: "gemini",
        name_ar: parsed.name_ar || data.name,
        name_en: parsed.name_en || data.name,
        description_ar: parsed.description_ar || data.description || "",
        description_en: parsed.description_en || "",
        how_to_use_ar: parsed.how_to_use_ar || data.howToUse,
        how_to_use_en: parsed.how_to_use_en,
        key_ingredients_ar: parsed.key_ingredients_ar || data.keyIngredients,
        key_ingredients_en: parsed.key_ingredients_en,
        suggested_category: validCategory,
      };
    } catch (err) {
      console.warn("[AI Product Translation] Gemini call failed, falling back gracefully:", err);
      return fallbackTranslate(data);
    }
  });

export interface BulkTranslateItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface BulkTranslateResult {
  id: string;
  name_en: string;
  description_en: string;
  source: "gemini" | "fallback";
}

/**
 * Server Function: Bulk AI Translation for Multiple Products at once
 */
export const adminBulkTranslateProductsAi = createServerFn({ method: "POST" })
  .inputValidator((data: { products: BulkTranslateItem[]; adminPin?: string }) => data)
  .handler(async ({ data }): Promise<{ ok: boolean; results: BulkTranslateResult[] }> => {
    await requireAdminGuard(data.adminPin);

    const items = data.products || [];
    if (items.length === 0) {
      return { ok: true, results: [] };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // High-quality fallback for all items
      const results: BulkTranslateResult[] = items.map((item) => {
        const fb = fallbackTranslate({
          name: item.name,
          description: item.description,
          category: item.category,
        });
        return {
          id: item.id,
          name_en: fb.name_en,
          description_en: fb.description_en,
          source: "fallback",
        };
      });
      return { ok: true, results };
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are a world-class luxury beauty and cosmetic brand copywriter.
Translate and craft compelling English commercial names and descriptions for the following cosmetic products.
Make sure the English names sound sophisticated, premium, and commercially attractive.
Make sure the English descriptions highlight beauty benefits (skin barrier, hydration, youth radiance, pure botanicals).

Input Products List:
${JSON.stringify(
  items.map((it) => ({
    id: it.id,
    name_ar: it.name,
    category: it.category || "skincare",
    raw_desc: it.description || "",
  })),
  null,
  2,
)}

Return a structured JSON list of translated items matching the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a luxury skincare & cosmetic localization engine. Always return valid structured JSON matching the provided schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name_en: { type: Type.STRING },
                description_en: { type: Type.STRING },
              },
              required: ["id", "name_en", "description_en"],
            },
          },
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error("Empty response from AI");
      }

      const parsedList = JSON.parse(text) as Array<{
        id: string;
        name_en: string;
        description_en: string;
      }>;
      const parsedMap = new Map(parsedList.map((p) => [p.id, p]));

      const results: BulkTranslateResult[] = items.map((item) => {
        const found = parsedMap.get(item.id);
        if (found && found.name_en?.trim()) {
          return {
            id: item.id,
            name_en: found.name_en.trim(),
            description_en: found.description_en?.trim() || "",
            source: "gemini",
          };
        }
        const fb = fallbackTranslate({
          name: item.name,
          description: item.description,
          category: item.category,
        });
        return {
          id: item.id,
          name_en: fb.name_en,
          description_en: fb.description_en,
          source: "fallback",
        };
      });

      return { ok: true, results };
    } catch (err) {
      console.warn("[Bulk AI Translation] Gemini API call failed, falling back gracefully:", err);
      const results: BulkTranslateResult[] = items.map((item) => {
        const fb = fallbackTranslate({
          name: item.name,
          description: item.description,
          category: item.category,
        });
        return {
          id: item.id,
          name_en: fb.name_en,
          description_en: fb.description_en,
          source: "fallback",
        };
      });
      return { ok: true, results };
    }
  });

export interface TranslateTextInput {
  text: string;
  targetLang: "ar" | "en";
  context?: "marketing" | "announcement" | "store_policy" | "product_spec";
  adminPin?: string;
}

export interface TranslateTextOutput {
  ok: boolean;
  translatedText: string;
  source: "gemini" | "fallback";
}

/**
 * Server Function: General Smart Marketing & UI Text Translation
 */
export const adminTranslateTextAi = createServerFn({ method: "POST" })
  .inputValidator((data: TranslateTextInput) => data)
  .handler(async ({ data }): Promise<TranslateTextOutput> => {
    await requireAdminGuard(data.adminPin);

    const raw = data.text?.trim();
    if (!raw) {
      return { ok: true, translatedText: "", source: "fallback" };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback simple translation helper
      return {
        ok: true,
        translatedText: data.targetLang === "en" ? `${raw} (English Version)` : raw,
        source: "fallback",
      };
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const targetLanguageName = data.targetLang === "ar" ? "Arabic (العربية)" : "English";
      const prompt = `You are a high-end luxury e-commerce and cosmetic copywriter.
Translate the following store/marketing text into fluent, persuasive ${targetLanguageName}.
Context: ${data.context || "marketing"}.
Ensure impeccable tone of voice, professional phrasing, and flawless spelling.

Original Text:
"""
${raw}
"""

Return only the translated text in JSON format: {"translatedText": "..."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a professional luxury cosmetic brand translator. Always return valid JSON matching schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
            },
            required: ["translatedText"],
          },
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(text);
      return {
        ok: true,
        translatedText: parsed.translatedText || raw,
        source: "gemini",
      };
    } catch (err) {
      console.warn("[AI Text Translation] Gemini call failed, using fallback:", err);
      return {
        ok: true,
        translatedText: raw,
        source: "fallback",
      };
    }
  });
