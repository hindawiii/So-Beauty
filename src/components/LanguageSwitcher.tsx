import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "header" | "drawer" | "compact" | "topbar";
  className?: string;
}

export function LanguageSwitcher({ variant = "header", className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage, isRTL } = useLanguage();

  if (variant === "topbar") {
    const isAr = language === "ar";
    const nextLangCode = isAr ? "EN" : "AR";
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center justify-center min-w-[32px] h-6.5 sm:h-7 px-2.5 rounded-full font-mono font-bold text-xs tracking-wider bg-white/20 hover:bg-white/35 active:scale-90 text-white border border-white/25 shadow-2xs transition-all cursor-pointer shrink-0 select-none ${className}`}
        title={isAr ? "Switch to English (EN)" : "التحويل إلى اللغة العربية (AR)"}
        aria-label={isAr ? "Switch to English" : "التبديل إلى اللغة العربية"}
      >
        <span>{nextLangCode}</span>
      </button>
    );
  }

  if (variant === "drawer") {
    return (
      <div className={`p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{isRTL ? "لغة المتجر" : "Store Language"}</span>
          </span>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold uppercase">
            {language}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLanguage("ar")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
              language === "ar"
                ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>🇸🇩</span>
            <span>العربية</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
              language === "en"
                ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>🌐</span>
            <span>English</span>
          </button>
        </div>
      </div>
    );
  }

  // Header / Compact Variant: High-contrast, tactile pill with zero clutter
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs shadow-2xs ${className}`}
      dir="ltr"
    >
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer select-none text-xs min-h-[32px] flex items-center justify-center ${
          language === "ar"
            ? "bg-white text-slate-900 shadow-2xs font-extrabold"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="التبديل إلى اللغة العربية"
        aria-label="Switch to Arabic"
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer select-none text-xs min-h-[32px] flex items-center justify-center ${
          language === "en"
            ? "bg-white text-slate-900 shadow-2xs font-extrabold"
            : "text-slate-600 hover:text-slate-900"
        }`}
        title="Switch to English"
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
