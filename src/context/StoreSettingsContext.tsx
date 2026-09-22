import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { generatePaletteFromHex } from "@/lib/colorUtils";

export interface StoreBrandingSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  storeAddress: string;
  defaultCurrency: "SDG" | "EGP" | "SAR" | "USD" | "AED";
  freeShippingThreshold: number;
  deliveryFee: number;
  bannerNotice: string;
  bannerNotice_en?: string;
  bannerSubNotice: string;
  bannerSubNotice_en?: string;
  bannerIcon?: "sparkles" | "gift" | "truck" | "crown" | "shield" | "quote" | "none";
  aboutTitle: string;
  aboutTitle_en?: string;
  aboutDescription: string;
  aboutDescription_en?: string;
  logoUrl?: string; // Optional logo image URL for custom branding
  isDemoMode: boolean;
  adminPin: string;

  // Dynamic Homepage Sections Configuration
  heroTitle?: string;
  heroTitle_en?: string;
  heroSubtitle?: string;
  heroSubtitle_en?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaText_en?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaText_en?: string;
  heroImageUrl?: string;

  // Features (4 Trust Badges)
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  feature4Title?: string;
  feature4Desc?: string;

  // Promo Banner Section
  promoTitle?: string;
  promoSubtitle?: string;
  promoCtaText?: string;
  promoImageUrl?: string;

  // Sections Visibility Toggles
  showSkinTypesSection?: boolean;
  showBeforeAfterSection?: boolean;
  showCustomerReviews?: boolean;
  reviewsTitle?: string;
  reviewsSubtitle?: string;

  // Color & Typography Harmony
  themeColorHex?: string;
  themeColorOklch?: string;
  fontDisplay?: string;
  fontBody?: string;

  // Phase 2: Interactive Motion & Card Slides Engine
  cardMotionStyle?: "tilt" | "jump" | "shake" | "rotate" | "flip" | "none";
  enableInCardSlider?: boolean;
  enableQuickPeek?: boolean;

  // Phase 3: Modular Sections & Modern Display Layouts
  homepageProductsLayout?: "grid" | "carousel" | "bento";
  showGiftBoxesSection?: boolean;
  showFaqSection?: boolean;

  // Phase 3: Security & Kill-Switch
  developerPortalLocked?: boolean;
}

// Immutable golden original settings for "سو بيوتي"
export const GOLDEN_SO_BEAUTY_SETTINGS: StoreBrandingSettings = {
  storeName: "سو بيوتي - So Beauty",
  tagline: "سو بيوتي · عناية طبيعية",
  whatsappNumber: "249900776688",
  supportPhone: "+249 900 776 688",
  supportEmail: "sobeauty.one@gmail.com",
  storeAddress: "أم درمان — شارع الوادي",
  defaultCurrency: "SDG",
  freeShippingThreshold: 50000,
  deliveryFee: 3500,
  bannerNotice: "عناية طبيعية متكاملة بكل تفاصيل بشرتك",
  bannerNotice_en: "Complete Natural Care Tailored to Every Detail of Your Skin",
  bannerSubNotice: "من الترطيب إلى النضارة، اكتشفي ما يلائمكِ بعناية. تسوّقي الآن",
  bannerSubNotice_en: "From deep hydration to radiant glow, discover your personalized routine. Shop now.",
  bannerIcon: "sparkles",
  aboutTitle: "روائع العناية",
  aboutTitle_en: "Art of Natural Skincare",
  aboutDescription:
    "نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع منتجاتنا أصلية بنسبة 100%.",
  aboutDescription_en:
    "We strive to deliver the finest natural skincare solutions at competitive prices with uncompromising quality. 100% authentic and ethically crafted.",
  logoUrl: "",
  isDemoMode: false,
  adminPin: "2026",

  heroTitle: "جمالكِ الطبيعي يبدأ من هنا",
  heroTitle_en: "Natural Beauty Starts Here",
  heroSubtitle:
    "اكتشفي مجموعة So Beauty من منتجات العناية الطبيعية بالبشرة — نقاء نباتي وإشراقة تدوم.",
  heroSubtitle_en:
    "Discover the So Beauty collection of pure botanical skincare — clean botanicals, radiant glow that lasts.",
  heroPrimaryCtaText: "تسوّق الآن",
  heroPrimaryCtaText_en: "Shop Now",
  heroSecondaryCtaText: "شاهد العروض",
  heroSecondaryCtaText_en: "Explore Offers",
  heroImageUrl: "",

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
  promoImageUrl: "",

  showSkinTypesSection: true,
  showBeforeAfterSection: true,
  showCustomerReviews: true,
  reviewsTitle: "آراء عملائنا",
  reviewsSubtitle: "تجارب حقيقية لعميلاتنا مع منتجات سو بيوتي الطبيعية للعناية بالبشرة",

  themeColorHex: "#7b3370",
  themeColorOklch: "oklch(0.48 0.08 300)",
  fontDisplay: '"El Messiri", "Tajawal", serif',

  cardMotionStyle: "tilt",
  enableInCardSlider: true,
  enableQuickPeek: true,
  developerPortalLocked: false,
};

export const DEFAULT_STORE_SETTINGS: StoreBrandingSettings = {
  ...GOLDEN_SO_BEAUTY_SETTINGS,
};

const STORAGE_KEY = "luxe_store_branding_settings_v2";
const BACKUP_STORAGE_KEY = "luxe_store_branding_backup_v2";

interface StoreSettingsContextType {
  settings: StoreBrandingSettings;
  updateSettings: (newSettings: Partial<StoreBrandingSettings>) => void;
  resetToGoldenSnapshot: () => void;
  createManualBackup: () => void;
  restoreFromManualBackup: () => boolean;
  hasBackup: boolean;
  getWhatsAppUrl: (message?: string) => string;
  // Sandbox preview mode
  previewSettings: Partial<StoreBrandingSettings> | null;
  isPreviewMode: boolean;
  previewThemeTitle: string | null;
  startSandboxPreview: (previewSettings: Partial<StoreBrandingSettings>, title: string) => void;
  commitSandboxPreview: () => void;
  cancelSandboxPreview: () => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | null>(null);

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  // Always default to DEFAULT_STORE_SETTINGS to guarantee SSR hydration match
  const [settings, setSettings] = useState<StoreBrandingSettings>(DEFAULT_STORE_SETTINGS);

  const [hasBackup, setHasBackup] = useState<boolean>(false);

  // Sandbox preview state
  const [previewSettings, setPreviewSettings] = useState<Partial<StoreBrandingSettings> | null>(
    null,
  );

  const [previewThemeTitle, setPreviewThemeTitle] = useState<string | null>(null);

  // Hydrate settings, backup, and sandbox session after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) });
      }
      setHasBackup(!!localStorage.getItem(BACKUP_STORAGE_KEY));
      const sess = sessionStorage.getItem("so_beauty_sandbox_preview");
      if (sess) {
        setPreviewSettings(JSON.parse(sess));
      }
      const title = sessionStorage.getItem("so_beauty_sandbox_preview_title");
      if (title) {
        setPreviewThemeTitle(title);
      }
    } catch (e) {
      console.warn("Failed to load store settings from client storage:", e);
    }
  }, []);

  // Effective settings are merged: preview overrides settings when in sandbox
  const effectiveSettings = useMemo(() => {
    if (!previewSettings) return settings;
    return { ...settings, ...previewSettings };
  }, [settings, previewSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to persist store settings:", e);
    }
  }, [settings]);

  useEffect(() => {
    // Dynamically apply primary color & font CSS variables based on effective settings
    if (typeof document !== "undefined") {
      let activeOklch = effectiveSettings.themeColorOklch;
      let activeSoft = "oklch(0.96 0.025 300)";
      let activeDeep = "oklch(0.22 0.05 295)";

      if (effectiveSettings.themeColorHex) {
        const generated = generatePaletteFromHex(effectiveSettings.themeColorHex);
        activeOklch = effectiveSettings.themeColorOklch || generated.oklch;
        activeSoft = generated.softOklch;
        activeDeep = generated.deepOklch;
      }

      if (activeOklch) {
        document.documentElement.style.setProperty("--primary", activeOklch);
        document.documentElement.style.setProperty("--brand", activeOklch);
        document.documentElement.style.setProperty("--ring", activeOklch);
        document.documentElement.style.setProperty("--brand-soft", activeSoft);
        document.documentElement.style.setProperty("--brand-deep", activeDeep);
      }
      if (effectiveSettings.fontDisplay) {
        document.documentElement.style.setProperty("--font-display", effectiveSettings.fontDisplay);
      }
      if (effectiveSettings.storeName) {
        document.title = `${effectiveSettings.storeName} — ${effectiveSettings.tagline || "تسوق أونلاين"}`;
      }
    }
  }, [effectiveSettings]);

  const updateSettings = (newSettings: Partial<StoreBrandingSettings>) => {
    // Auto snapshot current state before updating
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(settings));
      setHasBackup(true);
    } catch (e) {
      console.warn("Failed to create auto backup:", e);
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startSandboxPreview = (override: Partial<StoreBrandingSettings>, title: string) => {
    setPreviewSettings(override);
    setPreviewThemeTitle(title);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("so_beauty_sandbox_preview", JSON.stringify(override));
      sessionStorage.setItem("so_beauty_sandbox_preview_title", title);
    }
  };

  const commitSandboxPreview = () => {
    if (previewSettings) {
      updateSettings(previewSettings);
      cancelSandboxPreview();
    }
  };

  const cancelSandboxPreview = () => {
    setPreviewSettings(null);
    setPreviewThemeTitle(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("so_beauty_sandbox_preview");
      sessionStorage.removeItem("so_beauty_sandbox_preview_title");
    }
  };

  // Restore the original So Beauty settings
  const resetToGoldenSnapshot = () => {
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(settings));
      setHasBackup(true);
    } catch (e) {
      console.warn("Failed to backup before reset:", e);
    }
    setSettings(GOLDEN_SO_BEAUTY_SETTINGS);
  };

  // Create explicit manual backup
  const createManualBackup = () => {
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(settings));
      setHasBackup(true);
    } catch (e) {
      console.warn("Failed to create manual backup:", e);
    }
  };

  // Restore from previous backup if user made a mistake
  const restoreFromManualBackup = (): boolean => {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...parsed });
        return true;
      }
    } catch (e) {
      console.warn("Failed to restore from manual backup:", e);
    }
    return false;
  };

  const getWhatsAppUrl = (message?: string) => {
    const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, "");
    const msg =
      message ||
      `مرحباً ${settings.storeName} 🌸، أود الاستفسار بخصوص المنتجات والطلبات وتفاصيل التوصيل.`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <StoreSettingsContext.Provider
      value={{
        settings: effectiveSettings,
        updateSettings,
        resetToGoldenSnapshot,
        createManualBackup,
        restoreFromManualBackup,
        hasBackup,
        getWhatsAppUrl,
        previewSettings,
        isPreviewMode: !!previewSettings,
        previewThemeTitle,
        startSandboxPreview,
        commitSandboxPreview,
        cancelSandboxPreview,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) {
    return {
      settings: DEFAULT_STORE_SETTINGS,
      updateSettings: () => {},
      resetToGoldenSnapshot: () => {},
      createManualBackup: () => {},
      restoreFromManualBackup: () => false,
      hasBackup: false,
      previewSettings: null,
      isPreviewMode: false,
      previewThemeTitle: null,
      startSandboxPreview: () => {},
      commitSandboxPreview: () => {},
      cancelSandboxPreview: () => {},
      getWhatsAppUrl: (msg?: string) => {
        const rawNumber = DEFAULT_STORE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, "");
        const fallbackMsg = msg || `مرحباً ${DEFAULT_STORE_SETTINGS.storeName} 🌸`;
        return `https://wa.me/${rawNumber}?text=${encodeURIComponent(fallbackMsg)}`;
      },
    };
  }
  return ctx;
}
