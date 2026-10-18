import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
  Star,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  X,
} from "lucide-react";
import { LuxeBundlesCarousel } from "@/components/LuxeBundlesCarousel";
import { InteractiveBeforeAfterSlider } from "@/components/InteractiveBeforeAfterSlider";
import heroProducts from "@/assets/hero-products.jpg";
import natural from "@/assets/natural-collection.jpg";
import skinHydrated from "@/assets/skin-hydrated.jpg";
import skinBalanced from "@/assets/skin-balanced.jpg";
import skinFirm from "@/assets/skin-firm.jpg";
import skinGlow from "@/assets/skin-glow.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { BentoProductsGrid, CarouselProducts } from "@/components/BentoProductsGrid";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { InfiniteMarqueeRibbon } from "@/components/InfiniteMarqueeRibbon";
import { listProducts, attachMetadataToProduct } from "@/lib/products.functions";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { Button } from "@/components/ui/button";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { getReviews, Review, INITIAL_REVIEWS } from "@/lib/reviews";
import {
  useStoreSettings,
  HomepageSectionId,
  DEFAULT_HOMEPAGE_SECTIONS_ORDER,
} from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { useBiDirectionalSwipe } from "@/hooks/useBiDirectionalSwipe";
import {
  getLocalizedCategory,
  getLocalizedSetting,
  matchesSkinType,
  SKIN_TYPE_TRANSLATIONS,
} from "@/lib/product-localization";

const featuredQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "المتجر الإلكتروني — تسوق بأمان وجودة أصلية" },
      { name: "description", content: "تسوق أفضل المنتجات الأصلية مع شحن سريع ودفع عند الاستلام." },
    ],
  }),
  loader: ({ context }) => {
    // 1. Instant Cache Seeding to ensure zero render delay
    const cached = context.queryClient.getQueryData(["products", "featured"]);
    if (!cached) {
      const activeMocks = MOCK_PRODUCTS.filter((p) => p.is_active).map(attachMetadataToProduct);
      context.queryClient.setQueryData(["products", "featured"], activeMocks);
    }
    // 2. Fetch fresh data in the background without freezing or delaying UI
    context.queryClient.prefetchQuery(featuredQuery);
  },
  component: Index,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">غير موجود</div>,
});

function Index() {
  const { settings } = useStoreSettings();
  const { t, language } = useLanguage();
  const { data: allProducts } = useSuspenseQuery(featuredQuery);
  const [activeSkinType, setActiveSkinType] = useState<string | null>(null);

  const matchedSkinProducts = useMemo(() => {
    if (!activeSkinType) return [];
    return allProducts.filter((p) => matchesSkinType(p, activeSkinType));
  }, [allProducts, activeSkinType]);

  const handleToggleSkinType = (typeId: string) => {
    setActiveSkinType((prev) => (prev === typeId ? null : typeId));
  };

  const heroTitle = getLocalizedSetting(
    settings.heroTitle,
    language,
    language === "ar" ? "جمالكِ الطبيعي يبدأ من هنا" : "Your Natural Beauty Starts Here",
  );
  const heroSubtitle = getLocalizedSetting(
    settings.heroSubtitle,
    language,
    language === "ar"
      ? `اكتشفي تشكيلة ${settings.storeName || "سو بيوتي"} من أفضل المنتجات الأصلية بجودة معتمدة وخدمة سريعة.`
      : `Explore ${settings.storeName_en || "So Beauty"} collection of certified skincare and fast door-to-door delivery.`,
  );
  const heroPrimaryCta =
    getLocalizedSetting(settings.heroPrimaryCtaText, language, settings.heroPrimaryCtaText_en) ||
    t("home.shopNowBtn");
  const heroSecondaryCta =
    getLocalizedSetting(
      settings.heroSecondaryCtaText,
      language,
      settings.heroSecondaryCtaText_en,
    ) || t("home.viewOffersBtn");
  const heroImage = settings.heroImageUrl || heroProducts;

  const features = [
    {
      icon: Sparkles,
      title: getLocalizedSetting(
        settings.feature1Title,
        language,
        language === "ar" ? "نتائج فعّالة" : "Proven Results",
      ),
      desc: getLocalizedSetting(
        settings.feature1Desc,
        language,
        language === "ar"
          ? "منتجات مصنوعة بعناية لأفضل النتائج."
          : "Carefully formulated for radiant skin.",
      ),
    },
    {
      icon: Truck,
      title: getLocalizedSetting(
        settings.feature2Title,
        language,
        language === "ar" ? "شحن سريع" : "Fast Delivery",
      ),
      desc: getLocalizedSetting(
        settings.feature2Desc,
        language,
        language === "ar" ? "توصيل طلبك في أسرع وقت." : "Prompt dispatch across all cities.",
      ),
    },
    {
      icon: CreditCard,
      title: getLocalizedSetting(
        settings.feature3Title,
        language,
        language === "ar" ? "دفع آمن" : "Cash on Delivery",
      ),
      desc: getLocalizedSetting(
        settings.feature3Desc,
        language,
        language === "ar" ? "ادفع عند الاستلام أو أونلاين." : "Inspect upon arrival before paying.",
      ),
    },
    {
      icon: ShieldCheck,
      title: getLocalizedSetting(
        settings.feature4Title,
        language,
        language === "ar" ? "أصلية 100%" : "100% Authentic",
      ),
      desc: getLocalizedSetting(
        settings.feature4Desc,
        language,
        language === "ar" ? "نضمن جودة وأصالة كل منتج." : "Guaranteed purity and verified origin.",
      ),
    },
  ];

  // Dynamic Section Rendering Engine according to sectionsOrder and hiddenSections
  const orderedSections = useMemo(() => {
    const list =
      settings.sectionsOrder && settings.sectionsOrder.length > 0
        ? settings.sectionsOrder
        : DEFAULT_HOMEPAGE_SECTIONS_ORDER;
    // ensure every known section is accounted for
    const existing = new Set(list);
    const complete = [...list];
    for (const sec of DEFAULT_HOMEPAGE_SECTIONS_ORDER) {
      if (!existing.has(sec)) {
        complete.push(sec);
      }
    }
    return complete;
  }, [settings.sectionsOrder]);

  const hiddenSectionsSet = useMemo(() => {
    return new Set(settings.hiddenSections || []);
  }, [settings.hiddenSections]);

  const renderSection = (secId: HomepageSectionId) => {
    if (hiddenSectionsSet.has(secId)) return null;

    switch (secId) {
      case "hero":
        return (
          <section key="hero" className="bg-primary/5 py-8 md:py-14 transition-colors">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1
                  className="text-3xl md:text-5xl font-bold text-primary mb-3 leading-tight"
                  style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
                >
                  {heroTitle}
                </h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {heroSubtitle}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Link to="/products">
                    <Button size="lg" className="shadow-sm">
                      {heroPrimaryCta}
                    </Button>
                  </Link>
                  <Link to="/offers">
                    <Button size="lg" variant="outline">
                      {heroSecondaryCta}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-3xl shadow-lg border border-slate-200/60 bg-white">
                <img
                  src={heroImage}
                  alt={settings.storeName}
                  className="w-full h-auto max-h-[460px] object-cover hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </section>
        );

      case "marquee":
        if (settings.showMarqueeRibbon === false) return null;
        return <InfiniteMarqueeRibbon key="marquee" />;

      case "trust_badges":
        return (
          <section key="trust_badges" className="container mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="bg-card/90 dark:bg-card/70 border border-border/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xs">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-border/50">
                {features.map((f, idx) => (
                  <div
                    key={f.title}
                    className={`text-center p-2.5 sm:p-3 flex flex-col items-center justify-center transition-all ${
                      idx > 1 ? "pt-3.5 sm:pt-3" : ""
                    }`}
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-2xs">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold mb-0.5 text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      {f.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug max-w-[200px]">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "skin_types":
        if (settings.showSkinTypesSection === false) return null;
        return (
          <section key="skin_types" className="container mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 border border-primary/15 px-3.5 py-1 rounded-full mb-3">
                {language === "ar" ? "عناية مخصصة لاحتياجك" : "Targeted Skin Solutions"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                {t("home.skinTypesTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                {language === "ar"
                  ? "انقري على نوع بشرتكِ لعرض المنتجات والروتين الأنسب لكِ مباشرة هنا"
                  : "Tap your skin type to instantly preview your bespoke routine right here"}
              </p>
            </div>
            <div className="grid grid-cols-2 min-[580px]:grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {[
                {
                  id: "hydrated",
                  img: skinHydrated,
                  label: t("home.skinHydrated"),
                  taglineAr: "ترطيب عميق ونعومة",
                  taglineEn: "Deep Hydration & Dew",
                },
                {
                  id: "balanced",
                  img: skinBalanced,
                  label: t("home.skinBalanced"),
                  taglineAr: "تنقية وتوازن المسام",
                  taglineEn: "Clarifying & Balance",
                },
                {
                  id: "firm",
                  img: skinFirm,
                  label: t("home.skinFirm"),
                  taglineAr: "شد ومكافحة التجاعيد",
                  taglineEn: "Firming & Elasticity",
                },
                {
                  id: "glow",
                  img: skinGlow,
                  label: t("home.skinGlow"),
                  taglineAr: "إشراقة وتوحيد اللون",
                  taglineEn: "Radiance & Glow",
                },
              ].map((c) => {
                const isSelected = activeSkinType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleSkinType(c.id)}
                    aria-pressed={isSelected}
                    className={`group relative rounded-2xl overflow-hidden aspect-[4/5] block text-start transition-all duration-300 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl scale-[1.02] -translate-y-1 z-10"
                        : activeSkinType
                          ? "opacity-75 hover:opacity-100 hover:scale-[1.01] shadow-xs"
                          : "shadow-md hover:shadow-xl hover:-translate-y-1"
                    }`}
                  >
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                        isSelected ? "scale-105" : "group-hover:scale-105"
                      }`}
                    />

                    {/* Luxe Minimalist Frosted-Glass Selection Badge in Corner */}
                    {isSelected && (
                      <div className="absolute top-2.5 end-2.5 z-10 animate-in fade-in zoom-in-95 duration-200">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                          <span>{language === "ar" ? "محدد" : "Selected"}</span>
                        </span>
                      </div>
                    )}

                    {/* Elegant Gradient Vignette at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 pt-12 pb-3.5 px-3 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent text-white text-center flex flex-col items-center justify-end">
                      <span className="font-bold text-xs sm:text-sm tracking-wide drop-shadow-xs">
                        {c.label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-white/80 font-normal mt-0.5 line-clamp-1">
                        {language === "ar" ? c.taglineAr : c.taglineEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Unified In-Situ Routine Shelf Across All Viewports (Phone, Tablet, Desktop) */}
            {activeSkinType && matchedSkinProducts.length > 0 && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-3xl bg-primary/5 dark:bg-card border-2 border-primary/20 shadow-xs animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-primary/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>
                          {language === "ar" ? "الروتين والمنتجات المقترحة" : "Curated Routine"}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        ({matchedSkinProducts.length}{" "}
                        {language === "ar" ? "منتجات مطابقة" : "Matching Products"})
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {language === "ar"
                        ? SKIN_TYPE_TRANSLATIONS[activeSkinType]?.titleAr
                        : SKIN_TYPE_TRANSLATIONS[activeSkinType]?.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {language === "ar"
                        ? SKIN_TYPE_TRANSLATIONS[activeSkinType]?.subtitleAr
                        : SKIN_TYPE_TRANSLATIONS[activeSkinType]?.subtitleEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSkinType(null)}
                      className="rounded-xl h-9 text-xs gap-1.5 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === "ar" ? "إلغاء التحديد" : "Clear Filter"}</span>
                    </Button>
                    <Link
                      to="/products"
                      search={{ skinType: activeSkinType }}
                      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
                    >
                      <span>{language === "ar" ? "عرض بالكتالوج الكامل" : "View in Catalog"}</span>
                      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                    </Link>
                  </div>
                </div>

                {/* Direct Product Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {matchedSkinProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </section>
        );

      case "featured_products":
        return (
          <section key="featured_products" className="container mx-auto px-4 py-7 sm:py-9">
            <div className="flex justify-between items-baseline mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">
                  {t("home.featuredTitle")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("home.featuredSubtitle")}
                </p>
              </div>
              <Link
                to="/products"
                className="text-primary font-semibold flex items-center gap-1 text-xs sm:text-sm hover:underline"
              >
                <span>{t("common.viewAll")}</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
              </Link>
            </div>
            <Suspense
              fallback={
                <div className="py-8 text-center text-slate-400">{t("common.loading")}</div>
              }
            >
              <FeaturedProducts />
            </Suspense>
          </section>
        );

      case "bundles":
        return <LuxeBundlesCarousel key="bundles" />;

      case "promo_banner":
        if (!settings.promoTitle && !settings.promoImageUrl) return null;
        return (
          <section key="promo_banner" className="container mx-auto px-4 py-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="max-w-xl text-start">
                <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/15 inline-block mb-3">
                  {language === "ar" ? "عرض حصري مميز" : "Special Spotlight"}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  {settings.promoTitle || "عروض التوفير الكبرى"}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                  {settings.promoSubtitle || "خصومات وباقات مختارة بعناية لأجود المنتجات الأصلية."}
                </p>
                <Link to={settings.promoCtaLink || "/offers"}>
                  <Button size="lg" className="rounded-xl shadow-xs font-bold">
                    {settings.promoCtaText ||
                      (language === "ar" ? "اكتشف العروض الآن" : "Shop Offers")}
                  </Button>
                </Link>
              </div>
              {settings.promoImageUrl && (
                <div className="w-full md:w-1/3 max-w-sm rounded-2xl overflow-hidden shadow-md border border-white/40">
                  <img
                    src={settings.promoImageUrl}
                    alt={settings.promoTitle || "Promo"}
                    className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>
          </section>
        );

      case "before_after":
        if (settings.showBeforeAfterSection === false) return null;
        return <InteractiveBeforeAfterSlider key="before_after" />;

      case "reviews":
        if (settings.showCustomerReviews === false) return null;
        return (
          <div key="reviews" className="container mx-auto px-4 py-8">
            <ProductReviewsSection />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{orderedSections.map((secId) => renderSection(secId))}</main>
      <SiteFooter />
    </div>
  );
}

function FeaturedProducts() {
  const { settings } = useStoreSettings();
  const { language, t } = useLanguage();
  const { data: allProducts } = useSuspenseQuery(featuredQuery);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const categories = useMemo(
    () =>
      Array.from(new Set(allProducts.map((p) => p.category?.trim()).filter(Boolean))) as string[],
    [allProducts],
  );

  // Ordered filter sequence for fluid swipe gestures
  const filterList = useMemo(() => ["all", "offers", ...categories], [categories]);

  const handleSwipeNext = useCallback(() => {
    const currentIndex = filterList.indexOf(selectedFilter);
    if (currentIndex < filterList.length - 1) {
      setSelectedFilter(filterList[currentIndex + 1]);
    }
  }, [filterList, selectedFilter]);

  const handleSwipePrev = useCallback(() => {
    const currentIndex = filterList.indexOf(selectedFilter);
    if (currentIndex > 0) {
      setSelectedFilter(filterList[currentIndex - 1]);
    }
  }, [filterList, selectedFilter]);

  // Hook up fluid gestures with vertical scroll locking & RTL intelligence
  const swipeHandlers = useBiDirectionalSwipe({
    onSwipeNext: handleSwipeNext,
    onSwipePrev: handleSwipePrev,
    threshold: 45,
  });

  const filtered =
    selectedFilter === "all"
      ? allProducts.slice(0, 8)
      : selectedFilter === "offers"
        ? allProducts
            .filter((p) => p.original_price != null && Number(p.original_price) > Number(p.price))
            .slice(0, 8)
        : allProducts.filter((p) => p.category === selectedFilter).slice(0, 8);

  const layout = settings.homepageProductsLayout || "grid";

  return (
    <div className="space-y-6">
      {/* Interactive Category Filter Pills with quick touch scroll */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedFilter("all")}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              selectedFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {t("home.allCategories")} ({allProducts.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter("offers")}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1 ${
              selectedFilter === "offers"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{t("home.offersCategory")}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedFilter === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {getLocalizedCategory(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Render layout based on settings: bento, carousel, or grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs sm:text-sm text-slate-500">{t("common.noResults")}</p>
        </div>
      ) : layout === "bento" ? (
        <BentoProductsGrid products={filtered} />
      ) : layout === "carousel" ? (
        <CarouselProducts products={filtered} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 transition-all duration-300">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
