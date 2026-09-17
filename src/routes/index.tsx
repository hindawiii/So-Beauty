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
} from "lucide-react";
import heroProducts from "@/assets/hero-products.jpg";
import natural from "@/assets/natural-collection.jpg";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";
import skinHydrated from "@/assets/skin-hydrated.jpg";
import skinBalanced from "@/assets/skin-balanced.jpg";
import skinFirm from "@/assets/skin-firm.jpg";
import skinGlow from "@/assets/skin-glow.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { BentoProductsGrid, CarouselProducts } from "@/components/BentoProductsGrid";
import { listProducts } from "@/lib/products.functions";
import { Button } from "@/components/ui/button";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { getReviews, Review, INITIAL_REVIEWS } from "@/lib/reviews";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { useBiDirectionalSwipe } from "@/hooks/useBiDirectionalSwipe";

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
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery),
  component: Index,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">غير موجود</div>,
});

function Index() {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  const heroTitle = settings.heroTitle || "جمالكِ الطبيعي يبدأ من هنا";
  const heroSubtitle =
    settings.heroSubtitle ||
    `اكتشف تشكيلة ${settings.storeName} من أفضل المنتجات الأصلية بجودة معتمدة وخدمة سريعة.`;
  const heroImage = settings.heroImageUrl || heroProducts;

  const features = [
    {
      icon: Sparkles,
      title: settings.feature1Title || "نتائج فعّالة",
      desc: settings.feature1Desc || "منتجات مصنوعة بعناية لأفضل النتائج.",
    },
    {
      icon: Truck,
      title: settings.feature2Title || "شحن سريع",
      desc: settings.feature2Desc || "توصيل طلبك في أسرع وقت.",
    },
    {
      icon: CreditCard,
      title: settings.feature3Title || "دفع آمن",
      desc: settings.feature3Desc || "ادفع عند الاستلام أو أونلاين.",
    },
    {
      icon: ShieldCheck,
      title: settings.feature4Title || "أصلية 100%",
      desc: settings.feature4Desc || "نضمن جودة وأصالة كل منتج.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Dynamic Hero Section */}
        <section className="bg-primary/5 py-12 md:py-20 transition-colors">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1
                className="text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight"
                style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
              >
                {heroTitle}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                {heroSubtitle}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/products">
                  <Button size="lg" className="shadow-sm">
                    {settings.heroPrimaryCtaText || "تسوّق الآن"}
                  </Button>
                </Link>
                <Link to="/offers">
                  <Button size="lg" variant="outline">
                    {settings.heroSecondaryCtaText || "شاهد العروض"}
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

        {/* 4 Trust Badges */}
        <section className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="text-center p-4 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <f.icon className="w-10 h-10 mx-auto text-primary mb-3" />
              <h3 className="font-bold mb-1 text-slate-900 text-sm md:text-base">{f.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t("home.featuredTitle")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
            fallback={<div className="py-8 text-center text-slate-400">{t("common.loading")}</div>}
          >
            <FeaturedProducts />
          </Suspense>
        </section>

        {/* Promo Banner Section */}
        <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center bg-primary/5 rounded-3xl border border-primary/10">
          <img
            src={settings.promoImageUrl || natural}
            alt={settings.promoTitle || "عروض المتجر"}
            className="rounded-2xl w-full max-h-[360px] object-cover shadow-sm"
          />
          <div>
            <h2
              className="text-3xl font-bold mb-3 text-primary"
              style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
            >
              {settings.promoTitle || "عروض حصرية"}
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {settings.promoSubtitle ||
                "منتجات مختارة بعناية فائقة لتمنحك أفضل تجربة وقيمة استثنائية."}
            </p>
            <Link to="/boxes">
              <Button size="lg">{settings.promoCtaText || "اكتشف العروض"}</Button>
            </Link>
          </div>
        </section>

        {/* Optional Skin Types Section (Only when showSkinTypesSection !== false) */}
        {settings.showSkinTypesSection !== false && (
          <section className="container mx-auto px-4 py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">اختاري بشرتك</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { img: skinHydrated, label: "بشرة مرطبة", tone: "oklch(0.25 0.05 240)" },
                { img: skinBalanced, label: "بشرة موحّدة", tone: "oklch(0.22 0.08 150)" },
                { img: skinFirm, label: "بشرة مشدودة", tone: "oklch(0.28 0.08 300)" },
                { img: skinGlow, label: "بشرة مشرقة", tone: "oklch(0.35 0.15 25)" },
              ].map((c) => (
                <Link
                  key={c.label}
                  to="/products"
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md hover:shadow-xl transition-shadow"
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute bottom-0 inset-x-0 py-3 px-4 text-white text-center font-bold text-sm md:text-base"
                    style={{ background: c.tone }}
                  >
                    {c.label}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Optional Before & After Section (Only when showBeforeAfterSection !== false) */}
        {settings.showBeforeAfterSection !== false && (
          <section className="container mx-auto px-4 py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">قبل وبعد</h2>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div>
                <img src={beforeImg} alt="قبل" className="rounded-2xl w-full shadow-sm" />
                <p className="text-center mt-2 font-bold text-slate-700">قبل</p>
              </div>
              <div>
                <img src={afterImg} alt="بعد" className="rounded-2xl w-full shadow-sm" />
                <p className="text-center mt-2 font-bold text-slate-700">بعد</p>
              </div>
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        {settings.showCustomerReviews !== false && <CustomerReviewsSection />}
      </main>
      <SiteFooter />
    </div>
  );
}

function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  const loadReviews = useCallback(async () => {
    try {
      const data = await getReviews();
      if (data && data.length > 0) {
        setReviews(data);
      }
    } catch {
      // fallback handled gracefully
    }
  }, []);

  useEffect(() => {
    loadReviews();
    const handleAdded = () => {
      loadReviews();
    };
    window.addEventListener("so_beauty_review_added", handleAdded);
    return () => window.removeEventListener("so_beauty_review_added", handleAdded);
  }, [loadReviews]);

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">آراء عملائنا</h2>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-sm text-slate-600">
            تجارب حقيقية لعميلاتنا مع منتجات سو بيوتي الطبيعية للعناية بالبشرة
          </p>
        </div>
        <AddReviewDialog onReviewAdded={loadReviews} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((t) => (
          <div
            key={t.id || t.name}
            className="bg-card p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {t.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    تجربة موثوقة
                  </span>
                )}
              </div>
              <p className="mb-4 text-slate-700 text-sm leading-relaxed font-normal">"{t.body}"</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">— {t.name}</span>
              <span className="text-xs text-slate-400">تقييم معتمد</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();
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
    <div className="space-y-6" {...swipeHandlers}>
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
              {cat}
            </button>
          ))}
        </div>

        {/* Subtle touch swipe indicator hint for mobile devices */}
        <span className="hidden sm:inline-flex text-[11px] text-muted-foreground whitespace-nowrap opacity-75 font-medium items-center gap-1">
          <span>👈 {t("home.swipeTip")} 👉</span>
        </span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-300">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
