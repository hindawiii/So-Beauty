import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Gift,
  ChevronDown,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedSetting } from "@/lib/product-localization";
import { Button } from "@/components/ui/button";
import natural from "@/assets/natural-collection.jpg";

export function LuxeBundlesCarousel() {
  const { settings } = useStoreSettings();
  const { language, isRTL } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(true);

  // Fetch box category products
  const { data: boxes, isLoading } = useQuery({
    queryKey: ["products", "box"],
    queryFn: () => listProducts({ data: { category: "box" } }),
    staleTime: 1000 * 60 * 5,
  });

  // Calculate active card index & scroll bounds
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = Math.abs(el.scrollLeft);

    setCanScrollStart(current > 8);
    setCanScrollEnd(current < maxScroll - 8);

    // Calculate approximate active card index for dots indicator
    if (boxes && boxes.length > 0) {
      const cardWidth = el.scrollWidth / boxes.length;
      if (cardWidth > 0) {
        const idx = Math.min(boxes.length - 1, Math.max(0, Math.round(current / cardWidth)));
        setActiveIndex(idx);
      }
    }
  }, [boxes]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();

    return () => {
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState]);

  // Smooth scroll handler for arrows (supporting RTL/LTR and device viewports)
  const handleScroll = (direction: "forward" | "backward") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Use actual card element width + gap for pixel-perfect card-by-card step
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardStep = firstCard ? firstCard.offsetWidth + 16 : 260;
    const scrollAmount = direction === "forward" ? cardStep : -cardStep;
    const finalAmount = isRTL ? -scrollAmount : scrollAmount;

    el.scrollBy({ left: finalAmount, behavior: "smooth" });
  };

  // Direct dot click navigation
  const scrollToCard = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el || !boxes || boxes.length === 0) return;

    const cardWidth = (el.scrollWidth - el.clientWidth) / Math.max(1, boxes.length - 1);
    const targetOffset = index * cardWidth;
    el.scrollTo({
      left: isRTL ? -targetOffset : targetOffset,
      behavior: "smooth",
    });
  };

  // Smooth scroll down to the shelf when clicking the explore button
  const handleScrollToShelf = () => {
    if (shelfRef.current) {
      shelfRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const bannerTitle =
    settings.promoTitle || (language === "ar" ? "Natural Bloom" : "Natural Bloom");

  const bannerSubtitle = getLocalizedSetting(
    settings.promoSubtitle,
    language,
    language === "ar"
      ? "مكوّنات نباتية 100% مستخلصة بعناية لتمنحك بشرة نضرة وصحية وباقات توفير حصرية."
      : "100% botanical plant-derived formulas crafted for radiant, healthy skin and exclusive bundle savings.",
  );

  const bannerCta = getLocalizedSetting(
    settings.promoCtaText,
    language,
    language === "ar" ? "تصفح البوكسات في الأسفل" : "Explore Bundles Below",
  );

  const bannerImage = settings.promoImageUrl || natural;

  return (
    <section
      aria-label={language === "ar" ? "عروض وبوكسات المتجر" : "Store Bundles"}
      className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-10"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-primary/5 dark:bg-card/70 border border-primary/10 p-3.5 sm:p-6 md:p-8 shadow-xs overflow-hidden relative">
        {/* Subtle decorative glowing corner */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -end-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        />

        {/* 1. Iconic Original Editorial Banner (Preserving the Store's Soul with Mobile-Optimized Heights) */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center mb-6 sm:mb-8 md:mb-10">
          <div className="relative group overflow-hidden rounded-xl sm:rounded-2xl shadow-xs">
            <img
              src={bannerImage}
              alt={bannerTitle}
              className="w-full max-h-[200px] sm:max-h-[280px] md:max-h-[380px] object-cover rounded-xl sm:rounded-2xl group-hover:scale-102 transition-transform duration-700"
            />
            {/* Subtle soft gradient overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-xl sm:rounded-2xl"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-bold mb-2 sm:mb-3 w-fit border border-primary/15">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span>
                {language === "ar" ? "مجموعات العناية المختارة" : "Curated Botanical Sets"}
              </span>
            </div>

            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-primary tracking-tight"
              style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
            >
              {bannerTitle}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed max-w-xl">
              {bannerSubtitle}
            </p>

            {/* Dual Actions in a Single Compact Row on All Screen Sizes */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleScrollToShelf}
                size="sm"
                className="flex-1 sm:flex-initial rounded-full px-3.5 sm:px-6 min-h-[42px] sm:min-h-[44px] h-10 sm:h-11 text-xs sm:text-sm font-bold gap-1.5 sm:gap-2 cursor-pointer shadow-xs hover:shadow-md transition-all justify-center"
              >
                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{bannerCta}</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce shrink-0" />
              </Button>

              <Link to="/boxes" className="flex-1 sm:flex-initial">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto rounded-full px-3 sm:px-5 min-h-[42px] sm:min-h-[44px] h-10 sm:h-11 text-xs sm:text-sm font-medium gap-1 sm:gap-1.5 border-primary/25 hover:bg-primary/5 transition-all justify-center"
                >
                  <span className="truncate">
                    {language === "ar" ? "كل البوكسات" : "All Bundles"}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Integrated Box Carousel Shelf (Seamlessly Nested Below) */}
        {isLoading ? (
          <div className="border-t border-primary/10 pt-4 sm:pt-5">
            <div className="h-4 sm:h-5 w-40 sm:w-48 bg-muted/60 rounded-full animate-pulse mb-3" />
            <div className="flex gap-2.5 sm:gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[58vw] max-w-[210px] sm:w-[230px] md:w-[250px] shrink-0 rounded-2xl border border-border/40 bg-muted/20 p-2.5 animate-pulse"
                >
                  <div className="aspect-square rounded-xl bg-muted/50 mb-2" />
                  <div className="h-3 bg-muted/60 rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-muted/40 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : boxes && boxes.length > 0 ? (
          <div ref={shelfRef} className="border-t border-primary/10 pt-4 sm:pt-6 scroll-mt-6">
            {/* Shelf Sub-Header */}
            <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">
                  {language === "ar"
                    ? "البوكسات المتوفرة للطلب الفوري"
                    : "Available Exclusive Bundles"}
                </h3>
                <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
                  ({boxes.length})
                </span>
              </div>
            </div>

            {/* Horizontal Scroll Track: Compact Square-proportioned 58vw Card Width on Mobile with Next Card Peeking Clearly */}
            <div
              ref={scrollContainerRef}
              className="flex gap-2.5 sm:gap-4 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 pt-1 no-scrollbar focus:outline-none"
              tabIndex={0}
              aria-label={language === "ar" ? "شريط كروت البوكسات الحصرية" : "Bundles Carousel"}
            >
              {boxes.map((bundle) => (
                <div
                  key={bundle.id}
                  className="w-[58vw] max-w-[210px] sm:w-[230px] md:w-[250px] lg:w-[270px] shrink-0 snap-start transition-transform duration-300"
                >
                  <ProductCard product={bundle} />
                </div>
              ))}
            </div>

            {/* Bottom Ergonomic Navigation Bar: Arrows + Dots Visible on Mobile, Tablet & Desktop */}
            <div className="mt-4 pt-3.5 border-t border-primary/10 flex items-center justify-between gap-3">
              {/* Pagination Dots indicator (Visible on all devices) */}
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label={language === "ar" ? "مؤشر صفحات البوكسات" : "Bundles indicator"}
              >
                {boxes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToCard(i)}
                    aria-label={`${language === "ar" ? "البوكس رقم" : "Bundle"} ${i + 1}`}
                    aria-selected={activeIndex === i}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIndex === i
                        ? "w-5 sm:w-6 bg-primary"
                        : "w-2 bg-primary/25 hover:bg-primary/50"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows: Now explicitly visible on ALL devices (Mobile, Tablet & Desktop) */}
              <div className="flex items-center gap-1.5 sm:gap-2" dir="ltr">
                <button
                  type="button"
                  onClick={() => handleScroll(isRTL ? "forward" : "backward")}
                  disabled={!canScrollStart}
                  aria-label={isRTL ? "التالي" : "Previous"}
                  className="w-8 h-8 sm:w-10 sm:h-10 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] rounded-full border border-primary/20 bg-background hover:bg-primary/10 hover:border-primary/50 text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 dark:text-slate-100" />
                </button>

                <button
                  type="button"
                  onClick={() => handleScroll(isRTL ? "backward" : "forward")}
                  disabled={!canScrollEnd}
                  aria-label={isRTL ? "السابق" : "Next"}
                  className="w-8 h-8 sm:w-10 sm:h-10 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] rounded-full border border-primary/20 bg-background hover:bg-primary/10 hover:border-primary/50 text-foreground flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 dark:text-slate-100" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
