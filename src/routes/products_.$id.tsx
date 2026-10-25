import { createFileRoute, notFound, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getProduct, listProducts, attachMetadataToProduct } from "@/lib/products.functions";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import {
  resolveProductImage,
  extractProductGallery,
  cleanProductDescription,
} from "@/lib/product-images";
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedCategory,
} from "@/lib/product-localization";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { ProductGalleryViewer } from "@/components/product/ProductGalleryViewer";
import { ProductQuantitySavingsTiers } from "@/components/product/ProductQuantitySavingsTiers";
import { ProductRoutineUpsell } from "@/components/product/ProductRoutineUpsell";
import { ProductStickyBuyBar } from "@/components/product/ProductStickyBuyBar";
import { PaymentWalletsBadges } from "@/components/PaymentWalletsBadges";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
  Minus,
  Plus,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  Heart,
  Star,
  Droplets,
  HelpCircle,
  Layers,
  Leaf,
  Clock,
  Award,
} from "lucide-react";
import { getWhatsAppProductOrderUrl } from "@/lib/whatsapp";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await getProduct({ data: { id } });
      if (!p) throw notFound();
      return p;
    },
    initialData: () => {
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      return found ? attachMetadataToProduct(found) : undefined;
    },
    initialDataUpdatedAt: () => Date.now(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
  staleTime: 1000 * 60 * 10,
  gcTime: 1000 * 60 * 30,
  initialData: () => MOCK_PRODUCTS,
});

function ProductNotFound() {
  const { language, t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">
          {language === "ar" ? "المنتج غير متوفر" : "Product Not Found"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {language === "ar"
            ? "قد يكون المنتج قد تم نقله أو حذفه من المتجر."
            : "The product may have been moved or removed from the store."}
        </p>
        <Link to="/products">
          <Button>{t("productDetail.backToAll")}</Button>
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute("/products_/$id")({
  loader: ({ context, params }) => {
    // 1. If product is not yet in cache, check mock products and populate synchronously (instant 0ms render)
    const cached = context.queryClient.getQueryData(["product", params.id]);
    if (!cached) {
      const found = MOCK_PRODUCTS.find((p) => p.id === params.id);
      if (found) {
        context.queryClient.setQueryData(["product", params.id], attachMetadataToProduct(found));
      }
    }
    // Also seed allProducts in cache if not present
    const cachedAll = context.queryClient.getQueryData(["products", "all"]);
    if (!cachedAll) {
      context.queryClient.setQueryData(["products", "all"], MOCK_PRODUCTS);
    }
    // 2. Prefetch in background without blocking screen transition
    context.queryClient.prefetchQuery(productQuery(params.id));
    context.queryClient.prefetchQuery(allProductsQuery);
  },
  head: () => ({ meta: [{ title: "تفاصيل ومواصفات المنتج — تسوق أونلاين" }] }),
  component: Page,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: ProductNotFound,
});

function Page() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      const lastVisited = sessionStorage.getItem("so_beauty_last_page");
      if (lastVisited && lastVisited !== window.location.pathname) {
        router.navigate({ to: lastVisited });
        return;
      }
    }
    router.navigate({ to: "/products" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        {/* Back Navigation Bar with Generous Breathing Space and Safe Distance */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-border/60">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 min-h-11 rounded-xl bg-muted/60 hover:bg-muted text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
            aria-label={t("productDetail.backToAll")}
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-primary" />
            <span>{t("productDetail.backToAll")}</span>
          </button>

          {/* Breadcrumb Navigation with dedicated spacing */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 sm:pt-0">
            <Link to="/" className="hover:text-primary transition-colors">
              {t("productDetail.home")}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
            <Link to="/products" className="hover:text-primary transition-colors">
              {t("productDetail.products")}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
            <span className="text-foreground font-medium truncate max-w-[160px] sm:max-w-[240px]">
              {t("productDetail.productDetails")}
            </span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("productDetail.loadingProduct")}</p>
            </div>
          }
        >
          <Detail />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(id));
  const { data: allProducts } = useQuery(allProductsQuery);
  const { add } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const { formatPrice, formatBoth } = useCurrency();
  const { language, t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionButtonsRef = useRef<HTMLDivElement>(null);

  const localizedName = getLocalizedProductName(p, language);
  const localizedDescription = getLocalizedProductDescription(p, language);
  const localizedCategory = getLocalizedCategory(p.category || "عناية متكاملة", language);

  const galleryImages = useMemo(() => extractProductGallery(p), [p]);

  const price = Number(p.price);
  const original = p.original_price != null ? Number(p.original_price) : null;
  const stock = p.stock != null ? Number(p.stock) : 25;
  const isOutOfStock = stock <= 0;
  const maxAvailable = Math.max(1, Math.min(stock, 20));
  const isWished = isInWishlist(p.id);

  const { primary: primaryPrice, secondary: secondaryPrice } = formatBoth(price);
  const formattedOriginal = original ? formatPrice(original) : null;
  const totalPriceFormatted = formatPrice(price * quantity);

  // IntersectionObserver to show/hide the floating bottom bar on mobile
  useEffect(() => {
    const el = actionButtonsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When action buttons are out of view (scrolled past), show the sticky bar
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleWishlistToggle = () => {
    const added = toggle({
      id: p.id,
      name: localizedName,
      price,
      original_price: original,
      image_url: p.image_url,
      category: localizedCategory,
    });
    if (added) {
      toast.success(t("productDetail.addedToWishlist"));
    } else {
      toast.info(t("productDetail.removedFromWishlist"));
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add({ id: p.id, name: localizedName, price, image_url: p.image_url }, quantity);
    toast.success(
      language === "ar"
        ? `تمت إضافة (${quantity}) من "${localizedName}" إلى السلة 🌸`
        : `Added (${quantity}) of "${localizedName}" to cart 🌸`,
    );
  };

  // Related products (Show 3 items to fit 3-per-row grid perfectly)
  const productList =
    Array.isArray(allProducts) && allProducts.length > 0 ? allProducts : MOCK_PRODUCTS;
  const relatedProducts = productList
    .filter((item) => item.id !== p.id && (p.category ? item.category === p.category : true))
    .slice(0, 3);

  const finalRelated =
    relatedProducts.length >= 3
      ? relatedProducts
      : [
          ...relatedProducts,
          ...productList.filter(
            (item) => item.id !== p.id && !relatedProducts.some((r) => r.id === item.id),
          ),
        ].slice(0, 3);

  return (
    <div className="space-y-14">
      {/* Product Hero Grid */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
        <ProductGalleryViewer
          galleryImages={galleryImages}
          defaultImageUrl={p.image_url}
          productName={localizedName}
          isOutOfStock={isOutOfStock}
          language={language}
          outOfStockLabel={t("products.outOfStock")}
        />

        {/* Product Info & Purchase Controls */}
        <div className="flex flex-col justify-start">
          {/* Brand & Category Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">
              {localizedCategory}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              So Beauty Care
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3 leading-snug">
            {localizedName}
          </h1>

          {/* Rating Summary Link */}
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">4.9</span>
            </div>
            <span className="text-slate-400">•</span>
            <a href="#product-reviews" className="text-xs text-primary hover:underline font-bold">
              {t("productDetail.verifiedReviews")}
            </a>
          </div>

          {/* Velvetica CRO Clinical Trust Checklist */}
          <div className="space-y-1.5 mb-4 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {language === "ar"
                  ? "مختبر سريرياً وموصى به من قبل خبراء العناية الطبيعية الفائقة"
                  : "Clinically tested & recommended by organic skincare specialists"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {language === "ar"
                  ? "نتائج ملحوظة ونضارة واضحة خلال الأسبوع الأول من الاستخدام المنتظم"
                  : "Visible glow and hydration within the first week of regular use"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {language === "ar"
                  ? "تركيبة نباتية نقية 100% خالية تماماً من البارابين والعطور الاصطناعية"
                  : "100% pure botanical formula, free from parabens & synthetic fragrances"}
              </span>
            </div>
          </div>

          {/* Pricing & Stock status with Integrated Discount Pill */}
          <div className="flex flex-wrap items-center gap-3 mb-4" suppressHydrationWarning>
            <span
              suppressHydrationWarning
              className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight"
            >
              {primaryPrice}
            </span>
            {formattedOriginal && (
              <span
                suppressHydrationWarning
                className="text-base sm:text-lg text-slate-500 dark:text-slate-400 line-through font-semibold decoration-slate-500 decoration-[1.5px]"
              >
                {formattedOriginal}
              </span>
            )}
            {original && original > price && (
              <span className="inline-flex items-center text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-full">
                {language === "ar"
                  ? `خصم ${Math.round(((original - price) / original) * 100)}%`
                  : `Save ${Math.round(((original - price) / original) * 100)}%`}
              </span>
            )}
            {secondaryPrice && (
              <span
                suppressHydrationWarning
                className="text-xs text-muted-foreground font-mono font-medium block w-full sm:w-auto -mt-1 sm:mt-0"
              >
                {secondaryPrice}
              </span>
            )}
            <div className="ms-auto flex items-center gap-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t("products.outOfStock")}
                </span>
              ) : stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("productDetail.remainingStockAlert").replace("{count}", String(stock))}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("products.inStock")}
                </span>
              )}
            </div>
          </div>

          {/* Short Lead Summary */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-line">
            {cleanProductDescription(localizedDescription) ||
              (language === "ar"
                ? "منتج عناية تخصصي عالي الفعالية، مصمم لتغذية بشرتكِ ومنحها الإشراقة والترطيب العميق طوال اليوم دون أي ملمس دهني."
                : "A high-performance specialized skincare treatment designed to deeply nourish, hydrate, and illuminate your skin all day without any greasy residue.")}
          </p>

          {/* Tiered Quantity Savings Cards (Velvetica CRO Buy More Save More) */}
          {!isOutOfStock && (
            <ProductQuantitySavingsTiers
              unitPrice={price}
              currentQuantity={quantity}
              onSelectQuantity={setQuantity}
              language={language}
            />
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6" suppressHydrationWarning>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t("productDetail.quantityRequired")}
              </span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-card shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-slate-900 dark:text-slate-100 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxAvailable}
                  onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span suppressHydrationWarning className="text-xs text-slate-500 font-medium">
                ({t("productDetail.totalAmount")}: {totalPriceFormatted})
              </span>
            </div>
          )}

          {/* Unified Action Buttons Row: Equal Heights, Balanced Rectangular Shapes & Proportions */}
          <div ref={actionButtonsRef} className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              size="lg"
              disabled={isOutOfStock}
              className="flex-1 h-12 rounded-xl text-base font-bold gap-2 shadow-sm cursor-pointer"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {isOutOfStock ? t("products.outOfStock") : t("products.addToCart")}
            </Button>

            {/* Equal Rectangular Wishlist Button */}
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleWishlistToggle}
              className={`flex-1 h-12 rounded-xl text-base font-bold gap-2 cursor-pointer transition-all border ${
                isWished
                  ? "bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800"
                  : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-75 ${
                  isWished ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span>
                {isWished ? t("productDetail.inWishlist") : t("productDetail.addToWishlist")}
              </span>
            </Button>

            <a
              href={getWhatsAppProductOrderUrl(localizedName, price * quantity, p.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-5 rounded-xl border-emerald-600/40 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-bold gap-2 cursor-pointer"
              >
                <WhatsAppEmblemIcon size={20} className="text-emerald-600" />
                {t("productDetail.instantWhatsAppOrder")}
              </Button>
            </a>
          </div>

          {/* Guarantees & Trust Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>{t("productDetail.badgeNatural")}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>{t("productDetail.badgeShipping")}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{t("productDetail.badgeCod")}</span>
            </div>
          </div>

          {/* Smart Payment & Inspection Strip */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                {language === "ar" ? "طرق السداد المعتمدة لهذا المنتج" : "Accepted Payment Methods"}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {language === "ar" ? "معاينة قبل الدفع ✓" : "Inspect First ✓"}
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mb-2.5 leading-relaxed">
              {language === "ar"
                ? "متاح السداد نقداً عند الاستلام (COD) بعد استلام وفحص الطرد من المندوب، أو عبر تحويل تطبيق بنكك الفوري."
                : "Available via Cash on Delivery after order inspection, or instant Bankak wallet transfer."}
            </p>
            <PaymentWalletsBadges variant="compact" />
          </div>
        </div>
      </div>

      {/* Skincare Ritual & Clinical Tabs (Dior-Inspired Accordion) */}
      <section className="bg-card border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
            {t("productDetail.guideTitle")}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {language === "ar"
              ? `كل ما تحتاجين معرفته عن ${localizedName} 🌸`
              : `Everything you need to know about ${localizedName} 🌸`}
          </h2>
        </div>

        <Accordion type="single" collapsible defaultValue="benefits" className="w-full space-y-2">
          {/* Tab 1: Key Benefits & Clinical Results */}
          <AccordionItem
            value="benefits"
            className="border border-slate-100 dark:border-slate-800 rounded-2xl px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t("productDetail.tabBenefits")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 pt-2 pb-4">
              {language === "ar" ? (
                <>
                  <p>
                    تم ابتكار هذه التركيبة لتعمل في تناغم تام مع طبقات البشرة لتقديم نتائج ملحوظة
                    منذ الأسبوع الأول:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ps-2 text-slate-700 dark:text-slate-300 font-medium">
                    <li>تعزيز نضارة البشرة واستعادة إشراقتها الطبيعية ومحاربة علامات الإجهاد.</li>
                    <li>ترطيب مكثف يمتد حتى 24 ساعة دون انسداد المسام أو ترك لمعان دهني.</li>
                    <li>تحسين مرونة وملمس البشرة وجعلها أكثر نعومة وتجانساً.</li>
                    <li>حماية مضاعفة من الجفاف والعوامل الجوية القاسية.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    Formulated to work in perfect synergy with your skin layers for visible results
                    from the very first week:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ps-2 text-slate-700 dark:text-slate-300 font-medium">
                    <li>Restores natural radiance and fights signs of fatigue and stress.</li>
                    <li>
                      24-hour intensive hydration without clogging pores or leaving oily sheen.
                    </li>
                    <li>
                      Improves elasticity and texture for a noticeably smoother, even complexion.
                    </li>
                    <li>Double barrier defense against dryness and harsh environmental factors.</li>
                  </ul>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Tab 2: How to Apply / Daily Ritual */}
          <AccordionItem
            value="how-to-apply"
            className="border border-slate-100 dark:border-slate-800 rounded-2xl px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{t("productDetail.tabHowToApply")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 pt-2 pb-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    {t("productDetail.routineMorning")}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === "ar"
                      ? "ضعي قطرات مناسبة على بشرة نظيفة وجافة بعد الغسول. دلكي بلطف بحركات دائرية من منتصف الوجه للخارج حتى الامتصاص التام قبل تطبيق واقي الشمس."
                      : "Apply a few drops to clean, dry skin after cleanser. Gently massage outwards in circular motions until fully absorbed before sunscreen."}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    {t("productDetail.routineEvening")}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === "ar"
                      ? "يُفضل استخدامه قبل النوم كخطوة أساسية في التغذية الليلية لمساعدة خلايا البشرة على التجدد والاسترخاء طوال ساعات الليل."
                      : "Best used before sleep as a core night nourishment step to help skin cells regenerate and relax throughout the night."}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tab 3: Ingredients & Purity */}
          <AccordionItem
            value="ingredients"
            className="border border-slate-100 dark:border-slate-800 rounded-2xl px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>{t("productDetail.tabIngredients")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 pt-2 pb-4">
              <p>
                {language === "ar"
                  ? "نعتمد أعلى معايير النقاء الصيدلاني؛ تركيبتنا غنية بالمستخلصات الطبيعية النقية والفيتامينات المغذية، وخالية تماماً من:"
                  : "We adhere to pharmaceutical-grade purity; rich in active natural botanicals and vitamins, completely free of:"}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  {language === "ar" ? "خالٍ من البارابين" : "Paraben-Free"}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  {language === "ar" ? "خالٍ من الكبريتات (Sulfates)" : "Sulfate-Free"}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  {language === "ar" ? "خالٍ من الزيوت المعدنية" : "Mineral Oil-Free"}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  {language === "ar" ? "غير مجرب على الحيوانات" : "Cruelty-Free"}
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tab 4: Skin Type Suitability */}
          <AccordionItem
            value="skin-types"
            className="border border-slate-100 dark:border-slate-800 rounded-2xl px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>{t("productDetail.tabSkinTypes")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 pb-4">
              <p>
                {language === "ar"
                  ? "هذا المنتج مناسب لجميع أنواع البشرة (العادية، الجافة، المختلطة، والحساسة). إذا كانت بشرتكِ شديدة التحسس لأي عطور، فإن تركيبتنا المهدئة صُممت لتناسب حتى أكثر أنواع البشرة رقة."
                  : "Suitable for all skin types (normal, dry, combination, sensitive). Our gentle formula is dermatologist-tested for delicate skin."}
              </p>
              <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between gap-3">
                <span className="text-primary font-bold">
                  {t("productDetail.needConsultation")}
                </span>
                <a
                  href={getWhatsAppProductOrderUrl(localizedName, price, p.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-emerald-700 font-bold hover:underline"
                >
                  {t("productDetail.askExpertWhatsApp")}
                </a>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tab 5: Shipping & Delivery Assurance */}
          <AccordionItem
            value="shipping"
            className="border border-slate-100 dark:border-slate-800 rounded-2xl px-4 overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>{t("productDetail.tabShipping")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 pt-2 pb-4">
              <p>
                {language === "ar"
                  ? "نوفر خدمة الشحن الآمن والسريع لكافة الولايات والمدن مع ميزة التغليف المحكم المقاوم للحرارة لضمان وصول المنتج بأعلى فاعلية وجودة."
                  : "We offer secure, prompt delivery to all regions with heat-insulated packaging to guarantee maximum potency and quality upon arrival."}
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {language === "ar"
                  ? "⭐ ميزة المعاينة قبل الدفع: يحق لكِ فحص المنتج والتأكد من سلامة العبوة عند استلامها من المندوب مباشرة قبل سداد القيمة."
                  : "⭐ Inspection Guarantee: You have the right to inspect package integrity upon delivery before paying."}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Routine Upsell: Velvetica CRO Complete Your Routine */}
      <ProductRoutineUpsell
        currentProductId={p.id}
        allProducts={allProducts || []}
        onAddAddonToCart={(addon) =>
          add(
            {
              id: addon.id,
              name: getLocalizedProductName(addon, language),
              price: Number(addon.price),
              image_url: addon.image_url,
            },
            1,
          )
        }
        language={language}
      />

      {/* Customer Reviews & Experiences Section */}
      <ProductReviewsSection productId={p.id} productName={localizedName} />

      {/* Related Products Section */}
      {finalRelated.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t("productDetail.relatedTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t("productDetail.relatedSubtitle")}
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              {language === "ar" ? "عرض الكل" : "View All"}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {finalRelated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Buy Bar on Mobile / Scrolled View */}
      <ProductStickyBuyBar
        productName={localizedName}
        productPrice={price}
        imageUrl={p.image_url}
        quantity={quantity}
        onIncreaseQty={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
        onDecreaseQty={() => setQuantity((q) => Math.max(1, q - 1))}
        onAddToCart={handleAddToCart}
        isOutOfStock={isOutOfStock}
        language={language}
        visible={showStickyBar}
      />
    </div>
  );
}
