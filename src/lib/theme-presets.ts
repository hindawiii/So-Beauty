export interface ThemePreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  badge: string;
  previewColor: string;
  secondaryColor: string;
  themeColorHex: string;
  themeColorOklch: string;
  themeColorSoftOklch: string;
  themeColorDeepOklch: string;
  fontDisplay: string;
  cardMotionStyle: "tilt" | "jump" | "shake" | "rotate" | "flip" | "none";
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "royal-plum",
    name: "سو بيوتي الملكي (Royal Plum & Gold)",
    nameEn: "Royal Plum & Gold",
    description:
      "الهوية الملكية الفاخرة لـ So Beauty بدرجات الأرجواني المخملي الممزوج بلمسات ذهبية راقية.",
    badge: "الأصلي المعتمد",
    previewColor: "#7b3370",
    secondaryColor: "#e6c387",
    themeColorHex: "#7b3370",
    themeColorOklch: "oklch(0.48 0.08 300)",
    themeColorSoftOklch: "oklch(0.96 0.025 300)",
    themeColorDeepOklch: "oklch(0.22 0.05 295)",
    fontDisplay: '"El Messiri", "Tajawal", serif',
    cardMotionStyle: "tilt",
  },
  {
    id: "emerald-botanical",
    name: "النقاء العشبي والزمردي (Emerald Botanical)",
    nameEn: "Pure Emerald Botanical",
    description:
      "طابع طبيعي نباتي هادئ مستوحى من أوراق الشاي الأخضر والصبار وزيوت العناية العضوية.",
    badge: "نقاء وطبيعة",
    previewColor: "#1e533c",
    secondaryColor: "#93c5aa",
    themeColorHex: "#1e533c",
    themeColorOklch: "oklch(0.45 0.11 155)",
    themeColorSoftOklch: "oklch(0.96 0.03 155)",
    themeColorDeepOklch: "oklch(0.22 0.07 155)",
    fontDisplay: '"Tajawal", "Cairo", sans-serif',
    cardMotionStyle: "jump",
  },
  {
    id: "velvet-rose",
    name: "الروز المخملي الناعم (Velvet Rose & Berry)",
    nameEn: "Velvet Rose & Berry",
    description:
      "إشراقة أنثوية ناعمة تلائم مستحضرات التجميل والعناية بالشفاه والتوريد الوردي الفاخر.",
    badge: "نعومة وإشراق",
    previewColor: "#be185d",
    secondaryColor: "#fbcfe8",
    themeColorHex: "#be185d",
    themeColorOklch: "oklch(0.55 0.22 355)",
    themeColorSoftOklch: "oklch(0.97 0.03 355)",
    themeColorDeepOklch: "oklch(0.25 0.12 355)",
    fontDisplay: '"El Messiri", "Tajawal", serif',
    cardMotionStyle: "tilt",
  },
  {
    id: "sapphire-luxe",
    name: "الياقوت الكحلي الفاخر (Sapphire Night Luxe)",
    nameEn: "Sapphire Night Luxe",
    description: "فخامة عصرية عميقة وموثوقة تعكس الأمان الطبي وجودة المختبرات السريرية المعتمدة.",
    badge: "طبي وسريري",
    previewColor: "#1d4ed8",
    secondaryColor: "#bfdbfe",
    themeColorHex: "#1d4ed8",
    themeColorOklch: "oklch(0.48 0.18 255)",
    themeColorSoftOklch: "oklch(0.96 0.03 255)",
    themeColorDeepOklch: "oklch(0.22 0.09 255)",
    fontDisplay: '"Cairo", "Tajawal", sans-serif',
    cardMotionStyle: "jump",
  },
  {
    id: "warm-amber-gold",
    name: "العنبر والذهب الدافئ (Amber & Warm Gold)",
    nameEn: "Amber & Warm Gold",
    description: "أناقة شرقية دافئة تعكس زيوت العناية الذهبية، السيرومات الغنية، والزيوت الفاخرة.",
    badge: "دفء وفخامة",
    previewColor: "#b45309",
    secondaryColor: "#fde68a",
    themeColorHex: "#b45309",
    themeColorOklch: "oklch(0.52 0.15 65)",
    themeColorSoftOklch: "oklch(0.96 0.04 65)",
    themeColorDeepOklch: "oklch(0.25 0.08 65)",
    fontDisplay: '"El Messiri", "Tajawal", serif',
    cardMotionStyle: "tilt",
  },
  {
    id: "minimal-clean",
    name: "المودرن المينيمال (Modern Clean Minimal)",
    nameEn: "Modern Clean Minimal",
    description:
      "تصميم أوروبي محايد فائق النقاء يركز 100% على صور المنتجات وتجربة الشراء المباشرة.",
    badge: "مينيمال حديث",
    previewColor: "#0f172a",
    secondaryColor: "#cbd5e1",
    themeColorHex: "#0f172a",
    themeColorOklch: "oklch(0.22 0.03 265)",
    themeColorSoftOklch: "oklch(0.97 0.01 265)",
    themeColorDeepOklch: "oklch(0.12 0.02 265)",
    fontDisplay: '"Tajawal", sans-serif',
    cardMotionStyle: "none",
  },
];
