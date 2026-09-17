import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ar, Translations } from "@/locales/ar";
import { en } from "@/locales/en";

export type Language = "ar" | "en";
export type Direction = "rtl" | "ltr";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "so_beauty_store_lang_v1";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === "ar" || saved === "en") return saved;
      // Fallback check browser preference or default to Arabic
      return "ar";
    } catch {
      return "ar";
    }
  });

  const direction: Direction = useMemo(() => (language === "ar" ? "rtl" : "ltr"), [language]);
  const isRTL = direction === "rtl";

  const translations = useMemo(() => (language === "ar" ? ar : en), [language]);

  // Synchronize document dir, lang, and dynamic font family classes
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Storage unavailable or quota exceeded
    }

    const html = document.documentElement;
    html.setAttribute("dir", direction);
    html.setAttribute("lang", language);

    // Apply appropriate font-family class for Arabic vs English typography
    if (language === "ar") {
      html.classList.add("font-arabic");
      html.classList.remove("font-english");
    } else {
      html.classList.add("font-english");
      html.classList.remove("font-arabic");
    }
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "ar" ? "en" : "ar"));
  };

  // Safe dot-notation translator: e.g. t("header.searchPlaceholder")
  const t = (path: string): string => {
    const keys = path.split(".");
    let current: unknown = translations;

    for (const key of keys) {
      if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        // Fallback to Arabic dictionary if missing in target
        let fallback: unknown = ar;
        for (const fKey of keys) {
          if (
            fallback &&
            typeof fallback === "object" &&
            fKey in (fallback as Record<string, unknown>)
          ) {
            fallback = (fallback as Record<string, unknown>)[fKey];
          } else {
            return path; // Return raw key if completely not found
          }
        }
        return typeof fallback === "string" ? fallback : path;
      }
    }

    return typeof current === "string" ? current : path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        setLanguage,
        toggleLanguage,
        t,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
