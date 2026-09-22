import React, { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode =
  | "SDG" // السودان
  | "SAR" // السعودية
  | "AED" // الإمارات
  | "EGP" // مصر
  | "KWD" // الكويت
  | "QAR" // قطر
  | "OMR" // عُمان
  | "BHD" // البحرين
  | "JOD" // الأردن
  | "IQD" // العراق
  | "MAD" // المغرب
  | "DZD" // الجزائر
  | "TND" // تونس
  | "LYD" // ليبيا
  | "YER" // اليمن
  | "ILS" // فلسطين
  | "LBP" // لبنان
  | "SYP" // سوريا
  | "MRU" // موريتانيا
  | "SOS" // الصومال
  | "DJF" // جيبوتي
  | "KMF" // جزر القمر
  | "USD"; // دولي

export interface CurrencyConfig {
  code: CurrencyCode;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  flag: string;
  country: string;
  rateAgainstEGP: number; // How many units of this currency equal 1 EGP (Base: 1 EGP ≈ 0.0205 USD)
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  SDG: {
    code: "SDG",
    nameAr: "جنيه سوداني",
    nameEn: "Sudanese Pound",
    symbolAr: "ج.س",
    symbolEn: "SDG",
    flag: "🇸🇩",
    country: "السودان",
    rateAgainstEGP: 51.2, // 1 EGP ≈ 51.2 SDG
    decimals: 0,
  },
  SAR: {
    code: "SAR",
    nameAr: "ريال سعودي",
    nameEn: "Saudi Riyal",
    symbolAr: "ر.س",
    symbolEn: "SAR",
    flag: "🇸🇦",
    country: "السعودية",
    rateAgainstEGP: 0.077, // 1 EGP ≈ 0.077 SAR
    decimals: 2,
  },
  AED: {
    code: "AED",
    nameAr: "درهم إماراتي",
    nameEn: "UAE Dirham",
    symbolAr: "د.إ",
    symbolEn: "AED",
    flag: "🇦🇪",
    country: "الإمارات",
    rateAgainstEGP: 0.075, // 1 EGP ≈ 0.075 AED
    decimals: 2,
  },
  EGP: {
    code: "EGP",
    nameAr: "جنيه مصري",
    nameEn: "Egyptian Pound",
    symbolAr: "ج.م",
    symbolEn: "EGP",
    flag: "🇪🇬",
    country: "مصر",
    rateAgainstEGP: 1,
    decimals: 0,
  },
  KWD: {
    code: "KWD",
    nameAr: "دينار كويتي",
    nameEn: "Kuwaiti Dinar",
    symbolAr: "د.ك",
    symbolEn: "KWD",
    flag: "🇰🇼",
    country: "الكويت",
    rateAgainstEGP: 0.0063, // 1 EGP ≈ 0.0063 KWD
    decimals: 3,
  },
  QAR: {
    code: "QAR",
    nameAr: "ريال قطري",
    nameEn: "Qatari Riyal",
    symbolAr: "ر.ق",
    symbolEn: "QAR",
    flag: "🇶🇦",
    country: "قطر",
    rateAgainstEGP: 0.0746,
    decimals: 2,
  },
  OMR: {
    code: "OMR",
    nameAr: "ريال عماني",
    nameEn: "Omani Rial",
    symbolAr: "ر.ع",
    symbolEn: "OMR",
    flag: "🇴🇲",
    country: "سلطنة عمان",
    rateAgainstEGP: 0.00789,
    decimals: 3,
  },
  BHD: {
    code: "BHD",
    nameAr: "دينار بحريني",
    nameEn: "Bahraini Dinar",
    symbolAr: "د.ب",
    symbolEn: "BHD",
    flag: "🇧🇭",
    country: "البحرين",
    rateAgainstEGP: 0.0077,
    decimals: 3,
  },
  JOD: {
    code: "JOD",
    nameAr: "دينار أردني",
    nameEn: "Jordanian Dinar",
    symbolAr: "د.أ",
    symbolEn: "JOD",
    flag: "🇯🇴",
    country: "الأردن",
    rateAgainstEGP: 0.0145,
    decimals: 2,
  },
  IQD: {
    code: "IQD",
    nameAr: "دينار عراقي",
    nameEn: "Iraqi Dinar",
    symbolAr: "د.ع",
    symbolEn: "IQD",
    flag: "🇮🇶",
    country: "العراق",
    rateAgainstEGP: 26.84,
    decimals: 0,
  },
  MAD: {
    code: "MAD",
    nameAr: "درهم مغربي",
    nameEn: "Moroccan Dirham",
    symbolAr: "د.م",
    symbolEn: "MAD",
    flag: "🇲🇦",
    country: "المغرب",
    rateAgainstEGP: 0.205,
    decimals: 2,
  },
  DZD: {
    code: "DZD",
    nameAr: "دينار جزائري",
    nameEn: "Algerian Dinar",
    symbolAr: "د.ج",
    symbolEn: "DZD",
    flag: "🇩🇿",
    country: "الجزائر",
    rateAgainstEGP: 2.75,
    decimals: 0,
  },
  TND: {
    code: "TND",
    nameAr: "دينار تونسي",
    nameEn: "Tunisian Dinar",
    symbolAr: "د.ت",
    symbolEn: "TND",
    flag: "🇹🇳",
    country: "تونس",
    rateAgainstEGP: 0.064,
    decimals: 2,
  },
  LYD: {
    code: "LYD",
    nameAr: "دينار ليبي",
    nameEn: "Libyan Dinar",
    symbolAr: "د.ل",
    symbolEn: "LYD",
    flag: "🇱🇾",
    country: "ليبيا",
    rateAgainstEGP: 0.0994,
    decimals: 2,
  },
  YER: {
    code: "YER",
    nameAr: "ريال يمني",
    nameEn: "Yemeni Rial",
    symbolAr: "ر.ي",
    symbolEn: "YER",
    flag: "🇾🇪",
    country: "اليمن",
    rateAgainstEGP: 5.12,
    decimals: 0,
  },
  ILS: {
    code: "ILS",
    nameAr: "شيكل",
    nameEn: "Shekel",
    symbolAr: "₪",
    symbolEn: "ILS",
    flag: "🇵🇸",
    country: "فلسطين",
    rateAgainstEGP: 0.076,
    decimals: 2,
  },
  LBP: {
    code: "LBP",
    nameAr: "ليرة لبنانية",
    nameEn: "Lebanese Pound",
    symbolAr: "ل.ل",
    symbolEn: "LBP",
    flag: "🇱🇧",
    country: "لبنان",
    rateAgainstEGP: 1835,
    decimals: 0,
  },
  SYP: {
    code: "SYP",
    nameAr: "ليرة سورية",
    nameEn: "Syrian Pound",
    symbolAr: "ل.س",
    symbolEn: "SYP",
    flag: "🇸🇾",
    country: "سوريا",
    rateAgainstEGP: 266,
    decimals: 0,
  },
  MRU: {
    code: "MRU",
    nameAr: "أوقية موريتانية",
    nameEn: "Mauritanian Ouguiya",
    symbolAr: "أ.م",
    symbolEn: "MRU",
    flag: "🇲🇷",
    country: "موريتانيا",
    rateAgainstEGP: 0.816,
    decimals: 1,
  },
  SOS: {
    code: "SOS",
    nameAr: "شلن صومالي",
    nameEn: "Somali Shilling",
    symbolAr: "ش.ص",
    symbolEn: "SOS",
    flag: "🇸🇴",
    country: "الصومال",
    rateAgainstEGP: 11.7,
    decimals: 0,
  },
  DJF: {
    code: "DJF",
    nameAr: "فرنك جيبوتي",
    nameEn: "Djiboutian Franc",
    symbolAr: "ف.ج",
    symbolEn: "DJF",
    flag: "🇩🇯",
    country: "جيبوتي",
    rateAgainstEGP: 3.65,
    decimals: 0,
  },
  KMF: {
    code: "KMF",
    nameAr: "فرنك قمري",
    nameEn: "Comorian Franc",
    symbolAr: "ف.ق",
    symbolEn: "KMF",
    flag: "🇰🇲",
    country: "جزر القمر",
    rateAgainstEGP: 9.38,
    decimals: 0,
  },
  USD: {
    code: "USD",
    nameAr: "دولار أمريكي",
    nameEn: "US Dollar",
    symbolAr: "$",
    symbolEn: "$",
    flag: "🇺🇸",
    country: "دولي",
    rateAgainstEGP: 0.0205, // 1 EGP ≈ $0.0205 (~$1 = 48.8 EGP)
    decimals: 2,
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInEGP: number, options?: { showCode?: boolean }) => string;
  convertPrice: (amountInEGP: number) => number;
  formatBoth: (amountInEGP: number) => { primary: string; secondary?: string };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Map ISO 3166-1 alpha-2 country codes directly to our CurrencyCode
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  SD: "SDG", // السودان
  SA: "SAR", // السعودية
  AE: "AED", // الإمارات
  EG: "EGP", // مصر
  KW: "KWD", // الكويت
  QA: "QAR", // قطر
  OM: "OMR", // عُمان
  BH: "BHD", // البحرين
  JO: "JOD", // الأردن
  IQ: "IQD", // العراق
  MA: "MAD", // المغرب
  DZ: "DZD", // الجزائر
  TN: "TND", // تونس
  LY: "LYD", // ليبيا
  YE: "YER", // اليمن
  PS: "ILS", // فلسطين
  LB: "LBP", // لبنان
  SY: "SYP", // سوريا
  MR: "MRU", // موريتانيا
  SO: "SOS", // الصومال
  DJ: "DJF", // جيبوتي
  KM: "KMF", // جزر القمر
  US: "USD", // الولايات المتحدة
  GB: "USD",
  CA: "USD",
  EU: "USD",
};

/**
 * Instant, synchronous zero-latency detection using TimeZone and Client Locales
 */
function detectInitialCurrency(): CurrencyCode {
  try {
    // Priority 1: Stored explicit preference from manual selection
    const saved = localStorage.getItem("so_beauty_currency");
    if (saved && saved in CURRENCIES) {
      return saved as CurrencyCode;
    }

    // Priority 2: Precise TimeZone heuristic (0ms, zero latency)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lowerTz = timeZone.toLowerCase();

    if (lowerTz.includes("khartoum") || lowerTz.includes("sudan")) return "SDG";
    if (lowerTz.includes("cairo") || lowerTz.includes("egypt")) return "EGP";
    if (lowerTz.includes("riyadh") || lowerTz.includes("saudi")) return "SAR";
    if (lowerTz.includes("dubai") || lowerTz.includes("abu_dhabi")) return "AED";
    if (lowerTz.includes("kuwait")) return "KWD";
    if (lowerTz.includes("qatar") || lowerTz.includes("doha")) return "QAR";
    if (lowerTz.includes("muscat") || lowerTz.includes("oman")) return "OMR";
    if (lowerTz.includes("bahrain")) return "BHD";
    if (lowerTz.includes("amman") || lowerTz.includes("jordan")) return "JOD";
    if (lowerTz.includes("baghdad") || lowerTz.includes("iraq")) return "IQD";
    if (lowerTz.includes("casablanca") || lowerTz.includes("morocco")) return "MAD";
    if (lowerTz.includes("algiers") || lowerTz.includes("algeria")) return "DZD";
    if (lowerTz.includes("tunis") || lowerTz.includes("tunisia")) return "TND";
    if (lowerTz.includes("tripoli") || lowerTz.includes("libya")) return "LYD";
    if (lowerTz.includes("aden") || lowerTz.includes("sanaa") || lowerTz.includes("yemen"))
      return "YER";
    if (lowerTz.includes("jerusalem") || lowerTz.includes("gaza")) return "ILS";
    if (lowerTz.includes("beirut") || lowerTz.includes("lebanon")) return "LBP";
    if (lowerTz.includes("damascus") || lowerTz.includes("syria")) return "SYP";
    if (lowerTz.includes("nouakchott") || lowerTz.includes("mauritania")) return "MRU";
    if (lowerTz.includes("mogadishu") || lowerTz.includes("somalia")) return "SOS";
    if (lowerTz.includes("djibouti")) return "DJF";

    // Priority 3: Browser locale codes (e.g. ar-SA, ar-EG, ar-SD)
    const languages = navigator.languages || [navigator.language || ""];
    for (const lang of languages) {
      const match = /[-_]([a-zA-Z]{2})$/.exec(lang.trim());
      if (match && match[1]) {
        const countryCode = match[1].toUpperCase();
        if (COUNTRY_TO_CURRENCY[countryCode]) {
          return COUNTRY_TO_CURRENCY[countryCode];
        }
      }
    }

    // Default for Arabic regions is SAR, international is USD
    const primaryLang = (navigator.language || "").toLowerCase();
    if (primaryLang.startsWith("ar")) {
      return "SAR";
    }
    return "USD";
  } catch {
    return "SAR";
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Always default to 'SDG' (store's home currency in Sudan) on initial render to guarantee SSR hydration match
  const [currency, setCurrencyState] = useState<CurrencyCode>("SDG");

  // Detect and synchronize currency preference after client mount
  useEffect(() => {
    try {
      const detected = detectInitialCurrency();
      setCurrencyState(detected);
    } catch {
      // Safe fallback
    }
  }, []);

  // Silent background IP verification on initial load (only if user hasn't explicitly chosen yet)
  useEffect(() => {
    try {
      const manualSelection = localStorage.getItem("so_beauty_currency_manual");
      if (manualSelection === "true") {
        // User explicitly picked a currency in the past; respect it completely
        return;
      }

      // Silent Geo-IP lookup with timeout to never block UI or slow down experience
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      fetch("https://ipapi.co/json/", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          clearTimeout(timeoutId);
          if (data && data.country_code) {
            const countryCode = String(data.country_code).toUpperCase();
            const matchedCurrency = COUNTRY_TO_CURRENCY[countryCode];
            if (matchedCurrency && matchedCurrency in CURRENCIES) {
              setCurrencyState((current) => {
                // If the user manually changed it while request was in flight, do not overwrite
                if (localStorage.getItem("so_beauty_currency_manual") === "true") {
                  return current;
                }
                localStorage.setItem("so_beauty_currency", matchedCurrency);
                return matchedCurrency;
              });
            }
          }
        })
        .catch(() => {
          // Silent fallback to initial timezone detection - no disruption
        });

      return () => clearTimeout(timeoutId);
    } catch {
      // Safe fallback
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem("so_beauty_currency", code);
      // Mark as manual override so silent auto-detection will not overwrite the user's explicit choice
      localStorage.setItem("so_beauty_currency_manual", "true");
    } catch {
      // safe fallback
    }
  };

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.SAR;

  const convertPrice = (amountInEGP: number): number => {
    const rate = currencyConfig.rateAgainstEGP;
    const converted = amountInEGP * rate;
    return Number(converted.toFixed(currencyConfig.decimals));
  };

  const formatPrice = (amountInEGP: number, options?: { showCode?: boolean }): string => {
    const converted = convertPrice(amountInEGP);
    const formattedNumber = converted.toLocaleString("ar-EG", {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });

    if (options?.showCode) {
      return `${formattedNumber} ${currencyConfig.symbolAr} (${currencyConfig.code})`;
    }
    return `${formattedNumber} ${currencyConfig.symbolAr}`;
  };

  const formatBoth = (amountInEGP: number): { primary: string; secondary?: string } => {
    const primary = formatPrice(amountInEGP);
    if (currency === "USD") {
      const egpFormatted = `${amountInEGP.toLocaleString("ar-EG")} ج.م (EGP)`;
      return { primary, secondary: `يعادل تقريباً ${egpFormatted}` };
    }
    const usdConverted = (amountInEGP * CURRENCIES.USD.rateAgainstEGP).toFixed(2);
    return { primary, secondary: `(~ $${usdConverted} USD)` };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatPrice,
        convertPrice,
        formatBoth,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
