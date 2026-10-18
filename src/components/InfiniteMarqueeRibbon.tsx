import React from "react";
import { Sparkles, ShieldCheck, HeartHandshake, Truck, Award } from "lucide-react";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";

export function InfiniteMarqueeRibbon() {
  const { settings } = useStoreSettings();
  const { language, isRTL } = useLanguage();

  const storeNameAr = settings.storeName?.trim() || "سو بيوتي";
  const storeNameEn = settings.storeName_en?.trim() || "SO BEAUTY";

  const phrasesAr = [
    { text: "مستحضرات طبيعية فاخرة لإشراقة تدوم", icon: Sparkles },
    { text: "أصالة مضمونة 100% بجودة معتمدة", icon: Award },
    { text: "توصيل سريع حتى باب المنزل", icon: Truck },
    { text: "الدفع عند الاستلام مع حق المعاينة الكاملة", icon: ShieldCheck },
    { text: "عناية مخصصة تناسب كافة أنواع البشرة", icon: HeartHandshake },
  ];

  const phrasesEn = [
    { text: "Pure Luxury Botanicals for Timeless Radiance", icon: Sparkles },
    { text: "100% Certified Authentic & Dermatologically Tested", icon: Award },
    { text: "Prompt Doorstep Delivery Across All Cities", icon: Truck },
    { text: "Safe Cash on Delivery with Right to Inspect", icon: ShieldCheck },
    { text: "Bespoke Formulas Crafted for Every Skin Need", icon: HeartHandshake },
  ];

  const phrases = language === "ar" ? phrasesAr : phrasesEn;
  const storeName = language === "ar" ? storeNameAr : storeNameEn;

  const renderTrackItems = () => (
    <div className="flex items-center gap-6 sm:gap-10 shrink-0 px-3 sm:px-6">
      {phrases.map((phrase, idx) => (
        <React.Fragment key={`${phrase.text}-${idx}`}>
          {/* Brand Name Badge */}
          <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-amber-300 dark:text-amber-400 text-xs sm:text-sm whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
            <span>{storeName}</span>
          </div>

          <span className="text-amber-400/60 text-xs select-none">✦</span>

          {/* Value Prop Phrase */}
          <div className="flex items-center gap-2 text-slate-200 dark:text-slate-200 text-xs sm:text-sm font-medium whitespace-nowrap">
            <phrase.icon className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-90" />
            <span>{phrase.text}</span>
          </div>

          <span className="text-amber-400/60 text-xs select-none">✦</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section
      aria-label={language === "ar" ? "شريط العلامة التجارية الترويجي" : "Brand Showcase Ribbon"}
      className="marquee-container relative w-full overflow-hidden bg-slate-950 dark:bg-slate-900 border-y border-amber-500/20 py-2.5 sm:py-3 select-none transition-colors shadow-2xs cursor-grab active:cursor-grabbing touch-pan-y"
    >
      {/* Subtle ambient lighting gradients on edges for editorial infinity depth */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-8 sm:w-16 bg-gradient-to-r rtl:bg-gradient-to-l from-slate-950 dark:from-slate-900 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-8 sm:w-16 bg-gradient-to-l rtl:bg-gradient-to-r from-slate-950 dark:from-slate-900 to-transparent z-10" />

      {/* Continuously looping tracks (Track A + Track B seamless duplicate) */}
      <div className="animate-luxe-marquee flex items-center">
        {renderTrackItems()}
        <div aria-hidden="true" className="flex items-center">
          {renderTrackItems()}
        </div>
      </div>
    </section>
  );
}
