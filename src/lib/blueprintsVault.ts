// Certified Blueprints Vault & Pre-configured Niche Templates
import { StoreBrandingSettings } from "@/context/StoreSettingsContext";

export interface StoreBlueprint {
  id: string;
  name: string;
  niche: "electronics" | "beauty" | "fashion" | "perfumes" | "custom";
  description: string;
  createdAt: string;
  settings: Partial<StoreBrandingSettings>;
}

export const PRESET_BLUEPRINTS: StoreBlueprint[] = [
  {
    id: "blueprint_technozone_electronics",
    name: "📱 قالب تكنوزون للإلكترونيات والهواتف المعتمد",
    niche: "electronics",
    description: "مهيأ بالكامل للهواتف الذكية والإلكترونيات وضمان عام مع إخفاء أقسام البشرة",
    createdAt: "2026-09-16",
    settings: {
      storeName: "تكنوزون - TechnoZone",
      tagline: "أحدث الإلكترونيات والهواتف الذكية والإكسسوارات الأصلية",
      bannerNotice: "ضمان حقيقي لمدة عام على جميع الأجهزة الإلكترونية 📱",
      bannerSubNotice: "أفضل الهواتف والأجهزة الأصلية مع شحن آمن وسريع. تسوّق الآن",
      bannerIcon: "shield",
      aboutTitle: "عالم التكنولوجيا",
      aboutDescription:
        "وجهتكم الأولى للإلكترونيات والأجهزة الذكية الأصلية مع ضمان شامل وخدمة ما بعد البيع المعتمدة.",
      heroTitle: "أحدث التقنيات الذكية بين يديك",
      heroSubtitle:
        "اكتشف تشكيلة TechnoZone من الهواتف الذكية، الأجهزة اللوحية والإكسسوارات الأصلية بضمان شامل وأفضل الأسعار.",
      heroPrimaryCtaText: "تصفح الأجهزة الآن",
      heroSecondaryCtaText: "عروض الهواتف",
      heroImageUrl:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      feature1Title: "أجهزة أصلية 100%",
      feature1Desc: "ضمان وكيل معتمد على كل جهاز",
      feature2Title: "شحن سريع وآمن",
      feature2Desc: "توصيل مؤمن ضد الكسر حتى باب بيتك",
      feature3Title: "دفع عند الاستلام",
      feature3Desc: "عاين جهازك وافحصه قبل السداد",
      feature4Title: "ضمان استبدال فوري",
      feature4Desc: "خدمة ما بعد البيع والدعم الفني",
      promoTitle: "صفقات الأسبوع الحصرية",
      promoSubtitle: "تخفيضات كبرى على ملحقات الهواتف الذكية والسماعات اللاسلكية الأصلية.",
      promoCtaText: "اكتشف العروض التقنية",
      promoImageUrl:
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
      showSkinTypesSection: false,
      showBeforeAfterSection: false,
      showCustomerReviews: true,
      reviewsTitle: "آراء عملائنا في الأجهزة",
      reviewsSubtitle: "تجارب حقيقية لعملائنا بعد شراء الهواتف والأجهزة من تكنوزون",
      themeColorHex: "#1e40af",
      themeColorOklch: "oklch(0.52 0.22 255)",
      fontDisplay: '"Cairo", "Tajawal", sans-serif',
    },
  },
  {
    id: "blueprint_sobeauty_original",
    name: "🌸 قالب سو بيوتي للعناية بالبشرة الأصلي الذهبي",
    niche: "beauty",
    description: "النسخة الأصلية المعتمدة لمنتجات العناية بالبشرة وبوكسات التجميل وقسم قبل وبعد",
    createdAt: "2026-09-16",
    settings: {
      storeName: "سو بيوتي - So Beauty",
      tagline: "سو بيوتي · عناية طبيعية",
      bannerNotice: "عناية طبيعية متكاملة بكل تفاصيل بشرتك",
      bannerSubNotice: "من الترطيب إلى النضارة، اكتشفي ما يلائمكِ بعناية. تسوّقي الآن",
      bannerIcon: "sparkles",
      aboutTitle: "روائع العناية",
      aboutDescription:
        "نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع منتجاتنا أصلية بنسبة 100%.",
      heroTitle: "جمالكِ الطبيعي يبدأ من هنا",
      heroSubtitle:
        "اكتشفي مجموعة So Beauty من منتجات العناية الطبيعية بالبشرة — نقاء نباتي وإشراقة تدوم.",
      heroPrimaryCtaText: "تسوّق الآن",
      heroSecondaryCtaText: "شاهد العروض",
      heroImageUrl: "", // Empty to use built-in asset
      feature1Title: "نتائج فعّالة",
      feature1Desc: "منتجات مصنوعة بعناية لأفضل النتائج.",
      feature2Title: "شحن سريع",
      feature2Desc: "توصيل طلبك في أسرع وقت.",
      feature3Title: "دفع آمن",
      feature3Desc: "ادفع عند الاستلام أو أونلاين.",
      feature4Title: "أصلية 100%",
      feature4Desc: "نضمن جودة وأصالة كل منتج.",
      promoTitle: "Natural Bloom",
      promoSubtitle: "مكوّنات نباتية 100% مستخلصة بعناية لتمنحك بشرة نضرة وصحية.",
      promoCtaText: "اكتشف البوكسات",
      promoImageUrl: "", // Empty to use built-in asset
      showSkinTypesSection: true,
      showBeforeAfterSection: true,
      showCustomerReviews: true,
      reviewsTitle: "آراء عملائنا",
      reviewsSubtitle: "تجارب حقيقية لعميلاتنا مع منتجات سو بيوتي الطبيعية للعناية بالبشرة",
      themeColorHex: "#7b3370",
      themeColorOklch: "oklch(0.48 0.08 300)",
      fontDisplay: '"El Messiri", "Tajawal", serif',
    },
  },
  {
    id: "blueprint_luxury_fashion",
    name: "👗 قالب الأناقة والأزياء الراقية (Fashion Luxe)",
    niche: "fashion",
    description: "قالب مخصص للملابس والأزياء والعبايات مع تركيز على التشكيلات الحديثة",
    createdAt: "2026-09-16",
    settings: {
      storeName: "إيليجانس - Elegance Fashion",
      tagline: "أحدث صيحات الموضة والأزياء الراقية",
      bannerNotice: "توصيل مجاني لجميع الطلبات هذا الأسبوع 🛍️",
      bannerSubNotice: "أرقى تشكيلات الأزياء العصرية خياطة متقونة. تسوّق الآن",
      bannerIcon: "crown",
      aboutTitle: "عالم الأناقة",
      aboutDescription:
        "نقدم لكِ أحدث صيحات الموضة والأزياء الراقية بأقمشة فاخرة وتصاميم تواكب أحدث المعايير العالمية.",
      heroTitle: "أناقتكِ الاستثنائية لكل مناسبة",
      heroSubtitle:
        "تألقي بأحدث تشكيلات الأزياء العصرية المصممة بعناية فائقة لتبرز جاذبيتك في كل إطلالة.",
      heroPrimaryCtaText: "استكشفي التشكيلة",
      heroSecondaryCtaText: "عروض الموسم",
      heroImageUrl:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      feature1Title: "أقمشة فاخرة",
      feature1Desc: "خامات مستوردة بأعلى معايير الجودة",
      feature2Title: "شحن سريع وموثوق",
      feature2Desc: "توصيل أنيق حتى عتبة بابك",
      feature3Title: "استبدال مقاسات مرن",
      feature3Desc: "ضمان تبديل القياس بكل سهولة",
      feature4Title: "تصاميم حصرية",
      feature4Desc: "قطع مختارة بعناية لأناقتك",
      promoTitle: "تشكيلة الموسم الجديدة",
      promoSubtitle: "اكتشفي القطع الأكثر طلباً المصنوعة يدوياً لأصحاب الذوق الرفيع.",
      promoCtaText: "تصفحي القطع الحصرية",
      promoImageUrl:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
      showSkinTypesSection: false,
      showBeforeAfterSection: false,
      showCustomerReviews: true,
      reviewsTitle: "تجارب عاشقات الموضة",
      reviewsSubtitle: "آراء عميلاتنا السعيدات بأناقة وتفاصيل خامات الأزياء",
      themeColorHex: "#065f46",
      themeColorOklch: "oklch(0.45 0.14 155)",
      fontDisplay: '"Playfair Display", "El Messiri", serif',
    },
  },
  {
    id: "blueprint_royal_gold_perfumes",
    name: "👑 قالب رويال جولد للمجوهرات والعطور (Royal Gold)",
    niche: "perfumes",
    description:
      "قالب مخصص للعطور الشرقية الفاخرة، دهن العود، والمجوهرات الراقية بلمسة ذهبية ملكية",
    createdAt: "2026-09-16",
    settings: {
      storeName: "دار العود والذهب — Royal Oud",
      tagline: "نفحات عطرية ملكية وأصالة المجوهرات الفاخرة",
      bannerNotice: "شحن ملكي فاخر لجميع أنحاء البلاد 👑",
      bannerSubNotice: "عطور أصلية معتقة ومجوهرات عيار مضمون. تسوّق الآن",
      bannerIcon: "sparkles",
      aboutTitle: "عراقة الأصالة الملكية",
      aboutDescription:
        "نصنع تجارب استثنائية من أفخر أنواع العود الطبيعي، العطور الفرنسية والشرقية، والمجوهرات المصنوعة بدقة متناهية.",
      heroTitle: "فخامة تليق بمقامك العالي",
      heroSubtitle:
        "اكتشف تشكيلة Royal Gold من العطور الملكية الخالصة والمجوهرات الراقية المصممة لتدوم طويلاً.",
      heroPrimaryCtaText: "اكتشف العطور الملكية",
      heroSecondaryCtaText: "عروض المجوهرات",
      heroImageUrl:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80",
      feature1Title: "عود وعطور معتقة",
      feature1Desc: "ثبات وفواحان يدوم طويلاً مع الضمان",
      feature2Title: "توصيل فاخر ومؤمن",
      feature2Desc: "تغليف هدايا ملكي حتى باب بيتك",
      feature3Title: "دفع آمن عند الاستلام",
      feature3Desc: "معاينة المنتج وفحصه قبل السداد",
      feature4Title: "شهادة أصالة معتمدة",
      feature4Desc: "ضمان نخب أول على كل منتج",
      promoTitle: "مجموعات العود الملكية",
      promoSubtitle: "تخفيضات استثنائية على باقات الهدايا الفاخرة والمسك والعود الطبيعي.",
      promoCtaText: "اكتشف المجموعات",
      promoImageUrl:
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
      showSkinTypesSection: false,
      showBeforeAfterSection: false,
      showCustomerReviews: true,
      reviewsTitle: "شهادات أصحاب الذوق الرفيع",
      reviewsSubtitle: "انطباعات وتجارب عملائنا المميزين مع عطور ومجوهرات رويال جولد",
      themeColorHex: "#b45309",
      themeColorOklch: "oklch(0.55 0.16 65)",
      fontDisplay: '"Playfair Display", "El Messiri", serif',
    },
  },
];
