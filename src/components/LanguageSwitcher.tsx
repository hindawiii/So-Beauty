import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "header" | "drawer" | "compact";
  className?: string;
}

export function LanguageSwitcher({ variant = "header", className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, isRTL } = useLanguage();

  if (variant === "drawer") {
    return (
      <div className={`p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{isRTL ? "لغة المتجر" : "Store Language"}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 uppercase">{language}</span>
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
        className={`px-2 py-1 rounded-full font-bold transition-all cursor-pointer select-none text-[11px] min-h-[30px] flex items-center justify-center ${
          language === "ar"
            ? "bg-white text-slate-900 shadow-2xs font-extrabold"
            : "text-slate-500 hover:text-slate-800"
        }`}
        title="التبديل إلى اللغة العربية"
        aria-label="Switch to Arabic"
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded-full font-bold transition-all cursor-pointer select-none text-[11px] min-h-[30px] flex items-center justify-center ${
          language === "en"
            ? "bg-white text-slate-900 shadow-2xs font-extrabold"
            : "text-slate-500 hover:text-slate-800"
        }`}
        title="Switch to English"
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
