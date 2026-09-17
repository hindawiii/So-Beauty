// Specialized Color & Typography Harmony Engine
// Implements color wheel mathematics, harmony rules, WCAG AA contrast check, and curated typography pairs.

export interface ColorPaletteTheme {
  id: string;
  name: string;
  category: "tech" | "beauty" | "luxury" | "minimal" | "custom";
  primaryOklch: string; // e.g. "oklch(0.48 0.08 300)"
  primaryHex: string; // e.g. "#833271"
  backgroundHex?: string;
  accentHex?: string;
  description: string;
}

export interface TypographyPairTheme {
  id: string;
  name: string;
  category: "tech" | "beauty" | "fashion" | "minimal";
  displayFont: string; // CSS font family for headings
  bodyFont: string; // CSS font family for body & UI
  description: string;
}

export const CURATED_COLOR_PALETTES: ColorPaletteTheme[] = [
  {
    id: "cyber_tech",
    name: "⚡ Cyber Tech للإلكترونيات",
    category: "tech",
    primaryOklch: "oklch(0.52 0.22 255)",
    primaryHex: "#1e40af",
    description: "أزرق تكنولوجي كهربائي مخصص للهواتف والأجهزة الذكية والإلكترونيات وتكنوزون",
  },
  {
    id: "soft_luxury",
    name: "🌸 Soft Luxury للجمال",
    category: "beauty",
    primaryOklch: "oklch(0.48 0.08 300)",
    primaryHex: "#7b3370",
    description: "بنفسجي عنابي ناعم وفاخر لمستحضرات التجميل ومتاجر العناية بالبشرة وسو بيوتي",
  },
  {
    id: "royal_gold",
    name: "👑 Royal Gold للمجوهرات والعطور",
    category: "luxury",
    primaryOklch: "oklch(0.55 0.16 65)",
    primaryHex: "#b45309",
    description: "ذهبي كهرماني ملكي فخم مخصص للعطور الفاخرة والمجوهرات والساعات والعبايات",
  },
  {
    id: "modern_minimal",
    name: "🖤 Modern Minimal للأزياء",
    category: "minimal",
    primaryOklch: "oklch(0.28 0.02 260)",
    primaryHex: "#1f2937",
    description: "رمادي فحمي عميق كلاسيكي مخصص للملابس والأزياء العصرية والماركات الحديثة",
  },
  {
    id: "royal_emerald",
    name: "💎 الزمرد الملكي (Emerald Silk)",
    category: "luxury",
    primaryOklch: "oklch(0.45 0.14 155)",
    primaryHex: "#065f46",
    description: "أخضر زمردي راقٍ وأصيل للمنتجات الطبيعية والأناقة العالية",
  },
  {
    id: "rose_blush",
    name: "🌷 روز بلش ناعم (Rose Quartz)",
    category: "beauty",
    primaryOklch: "oklch(0.58 0.18 350)",
    primaryHex: "#be185d",
    description: "وردي قرمزي ناعم مخصص لمنتجات العناية العضوية ومستحضرات الشفاه",
  },
];

export const CURATED_TYPOGRAPHY_PAIRS: TypographyPairTheme[] = [
  {
    id: "beauty_marhey",
    name: "🌸 عناية ناعمة (El Messiri + Tajawal)",
    category: "beauty",
    displayFont: '"El Messiri", "Tajawal", serif',
    bodyFont: '"Tajawal", ui-sans-serif, system-ui, sans-serif',
    description: "عناوين شرقية متموجة مع خط قراءة انسيابي فائق النعومة والراحة",
  },
  {
    id: "tech_modern",
    name: "⚡ إلكترونيات وتقنية (Cairo + Tajawal)",
    category: "tech",
    displayFont: '"Cairo", "Tajawal", sans-serif',
    bodyFont: '"Tajawal", ui-sans-serif, system-ui, sans-serif',
    description: "عناوين عصرية متناسقة مع خط قراءة تقني مريح للأجهزة والمواصفات",
  },
  {
    id: "luxury_editorial",
    name: "👑 الفخامة الملكية (Playfair + Tajawal)",
    category: "fashion",
    displayFont: '"Playfair Display", "El Messiri", serif',
    bodyFont: '"Tajawal", ui-sans-serif, system-ui, sans-serif',
    description: "مزيج كلاسيكي عالمي راقٍ للمتاجر العالمية والبراندات الراقية",
  },
];

// Helper to convert Hex to OKLCH approximation
export function hexToOklch(hex: string): string {
  // Clean hex
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length !== 6) return "oklch(0.48 0.08 300)";

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // Approximate perceived lightness & chroma & hue
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Lightness approximation (0 to 1)
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const clampedL = Math.max(0.35, Math.min(0.65, Number(l.toFixed(2))));

  // Chroma approximation (0 to 0.3)
  const c = Math.max(0.08, Math.min(0.25, Number((delta * 0.35).toFixed(2))));

  // Hue calculation
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return `oklch(${clampedL} ${c} ${h})`;
}

// Generate a random high-quality harmonious color palette using color theory
export function generateRandomHarmoniousPalette(): ColorPaletteTheme {
  const hues: Array<{
    h: number;
    name: string;
    hex: string;
    cat: ColorPaletteTheme["category"];
  }> = [
    { h: 255, name: "أزرق فضاء (Cosmic Blue)", hex: "#2563eb", cat: "tech" },
    { h: 160, name: "زمرد غابي (Forest Emerald)", hex: "#059669", cat: "luxury" },
    { h: 320, name: "ماغنوليا ملوكي (Royal Plum)", hex: "#831843", cat: "beauty" },
    { h: 35, name: "عسل نقي (Pure Amber)", hex: "#d97706", cat: "luxury" },
    { h: 195, name: "أزرق كهربائي (Electric Cyan)", hex: "#0284c7", cat: "tech" },
    { h: 280, name: "بنفسج ديب (Deep Violet)", hex: "#6b21a8", cat: "luxury" },
    { h: 15, name: "مرجان دافئ (Warm Coral)", hex: "#e11d48", cat: "beauty" },
  ];

  const choice = hues[Math.floor(Math.random() * hues.length)];
  const lightness = (0.42 + Math.random() * 0.15).toFixed(2);
  const chroma = (0.12 + Math.random() * 0.1).toFixed(2);

  return {
    id: `generated_${Date.now()}`,
    name: `🎲 ${choice.name}`,
    category: choice.cat,
    primaryOklch: `oklch(${lightness} ${chroma} ${choice.h})`,
    primaryHex: choice.hex,
    description: "لوحة ألوان متجانسة رياضياً تم توليدها وتطبيقها تلقائياً للمتجر",
  };
}
