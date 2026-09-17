import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getProduct, listProducts } from "@/lib/products.functions";
import {
  resolveProductImage,
  extractProductGallery,
  cleanProductDescription,
} from "@/lib/product-images";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductCard } from "@/components/ProductCard";
import { ProductImageViewer } from "@/components/ProductImageViewer";
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
  });

const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/products_/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.id)),
  head: () => ({ meta: [{ title: "تفاصيل ومواصفات المنتج — تسوق أونلاين" }] }),
  component: Page,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">المنتج غير متوفر</h1>
        <p className="text-muted-foreground mb-6">قد يكون المنتج قد تم نقله أو حذفه.</p>
        <Link to="/products">
          <Button>العودة للمنتجات</Button>
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        {/* Back Navigation Bar with Generous Breathing Space and Safe Distance */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-border/60">
          <Link
            to="/products"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 min-h-11 rounded-xl bg-muted/60 hover:bg-muted text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
            aria-label="الرجوع إلى قائمة المنتجات"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-primary" />
            <span>الرجوع إلى جميع المنتجات</span>
          </Link>

          {/* Breadcrumb Navigation with dedicated spacing */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 sm:pt-0">
            <Link to="/" className="hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
            <Link to="/products" className="hover:text-primary transition-colors">
              المنتجات
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
            <span className="text-foreground font-medium truncate max-w-[160px] sm:max-w-[240px]">
              تفاصيل المنتج
            </span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">جاري تحميل تفاصيل المنتج...</p>
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
  const { data: allProducts } = useSuspenseQuery(allProductsQuery);
  const { add } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const { formatPrice, formatBoth } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionButtonsRef = useRef<HTMLDivElement>(null);

  const galleryImages = useMemo(() => extractProductGallery(p), [p]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const activeImage = galleryImages[selectedImgIndex] || resolveProductImage(p.image_url);

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
      name: p.name,
      price,
      original_price: original,
      image_url: p.image_url,
      category: p.category,
    });
    if (added) {
      toast.success("أُضيف إلى قائمة المفضلة 💖");
    } else {
      toast.info("تمت إزالة المنتج من المفضلة");
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add({ id: p.id, name: p.name, price, image_url: p.image_url }, quantity);
    toast.success(`تمت إضافة (${quantity}) من "${p.name}" إلى السلة 🌸`);
  };

  // Related products
  const relatedProducts = allProducts
    .filter((item) => item.id !== p.id && (p.category ? item.category === p.category : true))
    .slice(0, 4);

  const finalRelated =
    relatedProducts.length >= 4
      ? relatedProducts
      : [
          ...relatedProducts,
          ...allProducts.filter(
            (item) => item.id !== p.id && !relatedProducts.some((r) => r.id === item.id),
          ),
        ].slice(0, 4);

  return (
    <div className="space-y-14">
      {/* Product Hero Grid */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Product Visual Showcase (Gallery with Touch Pinch-to-Zoom) */}
        <div className="space-y-4">
          <div className="relative">
            <ProductImageViewer
              src={activeImage}
              alt={`${p.name} - زاوية ${selectedImgIndex + 1}`}
              isOutOfStock={isOutOfStock}
            />

            {/* Wishlist Button - Protected Safe Corner */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`absolute top-4 end-4 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm cursor-pointer ${
                isWished
                  ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500"
              }`}
              aria-label={isWished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-75 ${
                  isWished ? "fill-current text-white" : ""
                }`}
              />
            </button>

            {/* Discount Badge - Micro Luxury Pill */}
            {original && original > price && (
              <span className="absolute top-4 start-4 z-20 bg-red-600 text-white text-[11px] font-bold tracking-tight px-2.5 py-0.5 rounded-full shadow-xs border border-red-500/40 pointer-events-none">
                خ%{Math.round(((original - price) / original) * 100)}
              </span>
            )}

            {/* Out of Stock Badge */}
            {isOutOfStock && (
              <span className="absolute bottom-16 start-4 z-20 bg-slate-900/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs pointer-events-none">
                نفد من المخزون
              </span>
            )}
          </div>

          {/* Multi-angle Thumbnails Showcase (Shown only if multiple angles exist) */}
          {galleryImages.length > 1 && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-2xl border border-border/60">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>زوايا تصوير المنتج ({galleryImages.length} صور)</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/50">
                  {selectedImgIndex + 1} / {galleryImages.length}
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      idx === selectedImgIndex
                        ? "border-primary shadow-xs ring-2 ring-primary/20 scale-102"
                        : "border-border/80 opacity-70 hover:opacity-100 hover:border-slate-400"
                    }`}
                    aria-label={`عرض الزاوية ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${p.name} - زاوية ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {idx === selectedImgIndex && (
                      <span className="absolute bottom-0 inset-x-0 h-1 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Sensory Badges Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <Leaf className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                نباتي 100%
              </span>
              <span className="text-[10px] text-slate-400">مستخلصات عضوية</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                ترطيب 24h
              </span>
              <span className="text-[10px] text-slate-400">تغذية خلوية عميقة</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                جودة معتمدة
              </span>
              <span className="text-[10px] text-slate-400">آمن ومختبر</span>
            </div>
          </div>
        </div>

        {/* Product Info & Purchase Controls */}
        <div className="flex flex-col justify-start">
          {/* Brand & Category Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">
              {p.category || "عناية متكاملة"}
            </span>
            <span className="text-xs font-semibold text-slate-400">So Beauty Care</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3 leading-snug">
            {p.name}
          </h1>

          {/* Rating Summary Link */}
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">4.9</span>
            </div>
            <span className="text-slate-300">•</span>
            <a
              href="#product-reviews"
              className="text-xs text-primary hover:underline font-semibold"
            >
              (آراء وتجارب العميلات المعتمدة)
            </a>
          </div>

          {/* Pricing & Stock status */}
          <div className="flex flex-wrap items-baseline gap-3 mb-4" suppressHydrationWarning>
            <span
              suppressHydrationWarning
              className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight"
            >
              {primaryPrice}
            </span>
            {formattedOriginal && (
              <span
                suppressHydrationWarning
                className="text-lg text-slate-400 line-through font-normal"
              >
                {formattedOriginal}
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
            <div className="ms-auto">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  غير متوفر حالياً
                </span>
              ) : stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  متبقي {stock} قطع فقط في المخزون
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  متوفر للشحن الفوري
                </span>
              )}
            </div>
          </div>

          {/* Short Lead Summary */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line">
            {cleanProductDescription(p.description) ||
              "منتج عناية تخصصي عالي الفعالية، مصمم لتغذية بشرتكِ ومنحها الإشراقة والترطيب العميق طوال اليوم دون أي ملمس دهني."}
          </p>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6" suppressHydrationWarning>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                الكمية المطلوبة:
              </span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-card shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="تقليل الكمية"
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
                  aria-label="زيادة الكمية"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span suppressHydrationWarning className="text-xs text-slate-500 font-medium">
                (الإجمالي: {totalPriceFormatted})
              </span>
            </div>
          )}

          {/* Action Buttons (Ref attached for sticky observation) */}
          <div ref={actionButtonsRef} className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              size="lg"
              disabled={isOutOfStock}
              className="flex-1 h-12 rounded-xl text-base font-bold gap-2 shadow-sm"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {isOutOfStock ? "المنتج غير متوفر" : "أضف إلى السلة"}
            </Button>

            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleWishlistToggle}
              className={`h-12 px-4 rounded-xl font-semibold gap-2 transition-all shrink-0 ${
                isWished
                  ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50"
                  : "hover:text-rose-600 hover:border-rose-300"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWished ? "fill-current text-rose-500" : ""}`} />
              <span className="text-xs sm:text-sm">{isWished ? "في المفضلة" : "المفضلة"}</span>
            </Button>

            <a
              href={getWhatsAppProductOrderUrl(p.name, price * quantity, p.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:w-auto"
            >
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full h-12 rounded-xl border-emerald-600/40 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-bold gap-2"
              >
                <WhatsAppEmblemIcon size={20} className="text-emerald-600" />
                طلب فوري عبر واتساب
              </Button>
            </a>
          </div>

          {/* Guarantees & Trust Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>مكونات طبيعية 100% مختبرة بعناية</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>توصيل سريع لجميع مدن السودان</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>الدفع عند الاستلام بعد المعاينة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skincare Ritual & Clinical Tabs (Dior-Inspired Accordion) */}
      <section className="bg-card border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
            دليل العناية المتكاملة
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            كل ما تحتاجين معرفته عن {p.name} 🌸
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
                <span>الفوائد الرئيسية والنتائج المثبتة</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 pt-2 pb-4">
              <p>
                تم ابتكار هذه التركيبة لتعمل في تناغم تام مع طبقات البشرة لتقديم نتائج ملحوظة منذ
                الأسبوع الأول:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ps-2 text-slate-700 dark:text-slate-300 font-medium">
                <li>تعزيز نضارة البشرة واستعادة إشراقتها الطبيعية ومحاربة علامات الإجهاد.</li>
                <li>ترطيب مكثف يمتد حتى 24 ساعة دون انسداد المسام أو ترك لمعان دهني.</li>
                <li>تحسين مرونة وملمس البشرة وجعلها أكثر نعومة وتجانساً.</li>
                <li>حماية مضاعفة من الجفاف والعوامل الجوية القاسية.</li>
              </ul>
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
                <span>طريقة الاستخدام وروتين العناية اليومي (Ritual)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 pt-2 pb-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    ☀️ الروتين الصباحي:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    ضعي قطرات مناسبة على بشرة نظيفة وجافة بعد الغسول. دلكي بلطف بحركات دائرية من
                    منتصف الوجه للخارج حتى الامتصاص التام قبل تطبيق واقي الشمس.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    🌙 الروتين المسائي:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    يُفضل استخدامه قبل النوم كخطوة أساسية في التغذية الليلية لمساعدة خلايا البشرة
                    على التجدد والاسترخاء طوال ساعات الليل.
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
                <span>المكونات الفعالة والتركيبة النقية</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 pt-2 pb-4">
              <p>
                نعتمد أعلى معايير النقاء الصيدلاني؛ تركيبتنا غنية بالمستخلصات الطبيعية النقية
                والفيتامينات المغذية، وخالية تماماً من:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  خالٍ من البارابين
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  خالٍ من الكبريتات (Sulfates)
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  خالٍ من الزيوت المعدنية المسببة لانسداد المسام
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  غير مجرب على الحيوانات (Cruelty-Free)
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
                <span>نوع البشرة وتوصيات خبيرة الجمال</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 pb-4">
              <p>
                هذا المنتج مناسب لجميع أنواع البشرة (العادية، الجافة، المختلطة، والحساسة). إذا كانت
                بشرتكِ شديدة التحسس لأي عطور، فإن تركيبتنا المهدئة صُممت لتناسب حتى أكثر أنواع
                البشرة رقة.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between gap-3">
                <span className="text-primary font-bold">
                  هل تحتاجين لاستشارة نوع بشرتكِ مجاناً؟
                </span>
                <a
                  href={getWhatsAppProductOrderUrl(p.name, price, p.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-emerald-700 font-bold hover:underline"
                >
                  اسألي الخبيرة عبر واتساب ←
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
                <span>الشحن والتوصيل وضمان الاستلام</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 pt-2 pb-4">
              <p>
                نوفر خدمة الشحن الآمن والسريع لكافة الولايات والمدن السودانية مع ميزة التغليف المحكم
                المقاوم للحرارة لضمان وصول المنتج بأعلى فاعلية وجودة.
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                ⭐ ميزة المعاينة قبل الدفع: يحق لكِ فحص المنتج والتأكد من سلامة العبوة عند استلامها
                من المندوب مباشرة قبل سداد القيمة.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Customer Reviews & Experiences Section */}
      <ProductReviewsSection productId={p.id} productName={p.name} />

      {/* Related Products Section */}
      {finalRelated.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                منتجات قد تعجبكِ أيضاً 🌸
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                تشكيلة مختارة بعناية لتكمل روتين العناية بجمالكِ
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {finalRelated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Buy Bar on Mobile / Scrolled View */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-slate-200/80 p-3 sm:px-6 shadow-2xl transition-all duration-300 md:hidden flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={resolveProductImage(p.image_url)}
              alt={p.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                {p.name}
              </h4>
              <span className="text-sm font-bold text-primary" suppressHydrationWarning>
                {primaryPrice}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>أضف للسلة</span>
            </Button>

            <a
              href={getWhatsAppProductOrderUrl(p.name, price * quantity, p.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-10 px-3 rounded-xl border-emerald-600/40 text-emerald-700 hover:bg-emerald-50"
                aria-label="طلب عبر واتساب"
              >
                <WhatsAppEmblemIcon size={16} className="text-emerald-600" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
