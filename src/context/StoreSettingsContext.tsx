import React, { createContext, useContext, useEffect, useState } from "react";

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
  bannerSubNotice: string;
  bannerIcon?: "sparkles" | "gift" | "truck" | "crown" | "shield" | "quote" | "none";
  aboutTitle: string;
  aboutDescription: string;
  logoUrl?: string; // Optional logo image URL for custom branding
  isDemoMode: boolean;
  adminPin: string;

  // Dynamic Homepage Sections Configuration
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryCtaText?: string;
  heroSecondaryCtaText?: string;
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
  bannerSubNotice: "من الترطيب إلى النضارة، اكتشفي ما يلائمكِ بعناية. تسوّقي الآن",
  bannerIcon: "sparkles",
  aboutTitle: "روائع العناية",
  aboutDescription:
    "نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع منتجاتنا أصلية بنسبة 100%.",
  logoUrl: "",
  isDemoMode: false,
  adminPin: "2026",

  heroTitle: "جمالكِ الطبيعي يبدأ من هنا",
  heroSubtitle:
    "اكتشفي مجموعة So Beauty من منتجات العناية الطبيعية بالبشرة — نقاء نباتي وإشراقة تدوم.",
  heroPrimaryCtaText: "تسوّق الآن",
  heroSecondaryCtaText: "شاهد العروض",
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
}

const StoreSettingsContext = createContext<StoreSettingsContextType | null>(null);

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreBrandingSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load store settings from localStorage:", e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [hasBackup, setHasBackup] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(BACKUP_STORAGE_KEY);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      // Dynamically apply primary color & font CSS variables if defined
      if (typeof document !== "undefined") {
        if (settings.themeColorOklch) {
          document.documentElement.style.setProperty("--primary", settings.themeColorOklch);
          document.documentElement.style.setProperty("--brand", settings.themeColorOklch);
          document.documentElement.style.setProperty("--ring", settings.themeColorOklch);
        }
        if (settings.fontDisplay) {
          document.documentElement.style.setProperty("--font-display", settings.fontDisplay);
        }
        if (settings.storeName) {
          document.title = `${settings.storeName} — ${settings.tagline || "تسوق أونلاين"}`;
        }
      }
    } catch (e) {
      console.warn("Failed to persist store settings:", e);
    }
  }, [settings]);

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
        settings,
        updateSettings,
        resetToGoldenSnapshot,
        createManualBackup,
        restoreFromManualBackup,
        hasBackup,
        getWhatsAppUrl,
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
      getWhatsAppUrl: (msg?: string) => {
        const rawNumber = DEFAULT_STORE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, "");
        const fallbackMsg = msg || `مرحباً ${DEFAULT_STORE_SETTINGS.storeName} 🌸`;
        return `https://wa.me/${rawNumber}?text=${encodeURIComponent(fallbackMsg)}`;
      },
    };
  }
  return ctx;
}
