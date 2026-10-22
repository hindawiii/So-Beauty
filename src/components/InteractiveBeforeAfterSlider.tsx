import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ChevronsLeftRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkle,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";

export function InteractiveBeforeAfterSlider() {
  const { language, isRTL, t } = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [openMetricId, setOpenMetricId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMetric = (id: number) => {
    setOpenMetricId((prev) => (prev === id ? null : id));
  };

  const clinicalMetrics = [
    {
      id: 1,
      stat: "96%",
      titleAr: "ترطيب عميق ونعومة فورية",
      titleEn: "Deep Hydration & Instant Softness",
      descAr: "ملحوظ من الأسبوع الأول من الاستخدام المنتظم مع تحسن ملموس في مرونة البشرة وحيويتها.",
      descEn: "Visibly noticed from the first week of regular use with marked boost in elasticity.",
      icon: null,
    },
    {
      id: 2,
      stat: "91%",
      titleAr: "توحيد لون البشرة والنضارة",
      titleEn: "Radiant Even Skin Tone",
      descAr: "تلاشي البقع الباهتة وتوحيد لون البشرة واستعادة الإشراقة الطبيعية الصحية.",
      descEn: "Reduction in dull patches with restored natural healthy glow and even tone.",
      icon: null,
    },
    {
      id: 3,
      stat: null,
      titleAr: "دورة تجديد خلال 28 يوماً",
      titleEn: "28-Day Renewal Cycle",
      descAr: "متوسط دورة تجديد خلايا البشرة بالتركيبات العشبية الطبيعية دون التسبب في أي تهيج.",
      descEn: "Natural cell replenishment powered by pure botanicals in complete gentle harmony.",
      icon: Clock,
    },
  ];

  const handleMove = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    let percentage = (x / width) * 100;

    if (percentage < 3) percentage = 3;
    if (percentage > 97) percentage = 97;

    setSliderPosition(percentage);
    setHasInteracted(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(5, prev - 5));
      setHasInteracted(true);
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(95, prev + 5));
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <section
      aria-label={language === "ar" ? "نتائج قبل وبعد الاستخدام" : "Before and After Results"}
      className="container mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10"
    >
      <div className="bg-card/70 border border-primary/15 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative radiant backdrop */}
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -start-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        />

        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4 mb-4 sm:mb-6 md:mb-8 pb-3.5 sm:pb-5 border-b border-primary/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold mb-2 border border-primary/15">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>
                {language === "ar" ? "نتائج سريرية مثبتة" : "Clinically Proven Transformations"}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("home.beforeAfterTitle")}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            {language === "ar"
              ? "مرري المقبض لمشاهدة استعادة نضارة البشرة الطبيعية بعد 4 أسابيع من الاستخدام."
              : "Drag the slider to reveal restored radiance and hydration after 4 weeks of regular care."}
          </p>
        </div>

        {/* 2-Column Balanced Architecture (Starting on Tablet `md:` so Tablet & Desktop display in ONE comfortable row) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-7 items-center">
          {/* Column 1: The Precision Interactive Slider (md:col-span-7 on tablet & desktop) */}
          <div className="md:col-span-7">
            <div
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="slider"
              aria-label={
                language === "ar" ? "شريط مقارنة قبل وبعد" : "Before and After Comparison Slider"
              }
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative w-full aspect-[4/3] max-h-[240px] sm:max-h-[300px] md:max-h-[360px] lg:max-h-[400px] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xs cursor-ew-resize select-none touch-none focus:outline-none focus:ring-4 focus:ring-primary/20 group"
            >
              {/* Base Layer: AFTER Image */}
              <img
                src={afterImg}
                alt={t("home.afterLabel")}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Top Layer: BEFORE Image */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                <img
                  src={beforeImg}
                  alt={t("home.beforeLabel")}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* The Vertical Divider Line & Luxury Grip Handle */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20 flex items-center justify-center"
                style={{
                  left: `${sliderPosition}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {/* Crisp divider line */}
                <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />

                {/* Circular Luxury Drag Handle */}
                <div
                  className={`absolute w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white dark:bg-slate-900 text-primary border-2 border-primary/40 shadow-xl flex items-center justify-center transition-transform duration-150 ${
                    isDragging ? "scale-115 ring-4 ring-primary/25" : "group-hover:scale-105"
                  }`}
                >
                  <ChevronsLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Floating Frosted Badges: Before & After */}
              <div className="absolute top-2.5 start-2.5 sm:top-3 sm:start-3 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{t("home.beforeLabel")}</span>
                </span>
              </div>

              <div className="absolute top-2.5 end-2.5 sm:top-3 sm:end-3 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-white text-xs font-bold border border-white/25 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>{t("home.afterLabel")}</span>
                </span>
              </div>
            </div>

            {/* Minimalist Precision Slider Control Track Underneath the Image Frame */}
            <div className="mt-3 p-2 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-border/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold px-1 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setSliderPosition(10);
                    setHasInteracted(true);
                  }}
                  className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                    sliderPosition < 40
                      ? "text-amber-600 dark:text-amber-400 font-black scale-102"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                  title={t("home.beforeLabel")}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30 shrink-0" />
                  <span>{t("home.beforeLabel")}</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground shadow-2xs">
                  <ChevronsLeftRight className="w-3 h-3 text-primary" />
                  <span>{Math.round(sliderPosition)}%</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSliderPosition(90);
                    setHasInteracted(true);
                  }}
                  className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                    sliderPosition > 60
                      ? "text-primary font-black scale-102"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                  title={t("home.afterLabel")}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{t("home.afterLabel")}</span>
                </button>
              </div>

              {/* Native Accessible Range Slider Input */}
              <div className="relative flex items-center px-1">
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="0.5"
                  value={sliderPosition}
                  onChange={(e) => {
                    setSliderPosition(Number(e.target.value));
                    setHasInteracted(true);
                  }}
                  className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 accent-primary cursor-pointer transition-all"
                  aria-label={
                    language === "ar" ? "شريط سحب مقارنة النتائج" : "Comparison slider track"
                  }
                />
              </div>
            </div>
          </div>

          {/* Column 2: Concise Clinical Trust & Direct In-Place Routine Quick Action */}
          <div className="md:col-span-5 flex flex-col justify-center gap-3">
            {/* Scannable Clinical Evidence Trust Strip (No heavy accordions) */}
            <div className="flex flex-col gap-2">
              {clinicalMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-xl sm:rounded-2xl border border-primary/15 bg-card/90 p-2.5 sm:p-3 flex items-center gap-3 shadow-2xs"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-extrabold text-xs sm:text-sm">
                    {metric.icon ? <metric.icon className="w-4 h-4 text-primary" /> : metric.stat}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {language === "ar" ? metric.titleAr : metric.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {language === "ar" ? metric.descAr : metric.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* In-Place Routine Quick Action */}
            <div className="pt-1 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {language === "ar"
                    ? "تركيبات عشبية نقية مختبرة وآمنة تماماً على البشرة."
                    : "Dermatologically approved botanicals safe for sensitive skin."}
                </span>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const shelf =
                    document.getElementById("shelf-boxes-target") ||
                    document.querySelector("section[aria-label*='البوكسات']");
                  if (shelf) {
                    shelf.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    window.location.href = "/boxes";
                  }
                }}
                size="sm"
                className="w-full rounded-full px-4 sm:px-6 h-10 sm:h-11 min-h-[42px] text-xs sm:text-sm font-bold gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all justify-center"
              >
                <Sparkle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                <span>
                  {language === "ar" ? "اكتشفي باقات وروتين النتائج" : "Explore Proven Routines"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
