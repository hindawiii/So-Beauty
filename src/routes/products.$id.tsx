import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getProduct, listProducts } from "@/lib/products.functions";
import { resolveProductImage } from "@/lib/product-images";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/components/ProductCard";
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
  Heart,
  Star,
} from "lucide-react";
import { getWhatsAppProductOrderUrl } from "@/lib/whatsapp";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";

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

export const Route = createFileRoute("/products/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.id)),
  head: () => ({ meta: [{ title: "تفاصيل المنتج — So Beauty" }] }),
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
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link to="/products" className="hover:text-primary transition-colors">
            المنتجات
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-medium truncate max-w-[200px]">تفاصيل المنتج</span>
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
  const [quantity, setQuantity] = useState(1);

  const price = Number(p.price);
  const original = p.original_price != null ? Number(p.original_price) : null;
  const stock = p.stock != null ? Number(p.stock) : 25;
  const isOutOfStock = stock <= 0;
  const maxAvailable = Math.max(1, Math.min(stock, 20));
  const isWished = isInWishlist(p.id);

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

  // Related products
  const relatedProducts = allProducts
    .filter((item) => item.id !== p.id && (p.category ? item.category === p.category : true))
    .slice(0, 4);

  // If not enough from same category, supplement with any other products
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
    <div className="space-y-16">
      {/* Product Hero Grid */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted/40 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
          <img
            src={resolveProductImage(p.image_url)}
            alt={p.name}
            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
              isOutOfStock ? "grayscale opacity-75" : ""
            }`}
          />
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`absolute top-4 end-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-xs shadow-sm ${
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
          {original && original > price && (
            <span className="absolute top-4 start-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
              خصم {Math.round(((original - price) / original) * 100)}%
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute bottom-4 start-4 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
              نفد من المخزون
            </span>
          )}
        </div>

        {/* Product Info & Purchase Controls */}
        <div className="flex flex-col justify-center">
          {p.category && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              {p.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-snug">
            {p.name}
          </h1>

          {/* Rating Summary Link */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current text-amber-400" />
              <span className="text-sm font-bold text-slate-800">4.9</span>
            </div>
            <span className="text-slate-300">•</span>
            <a href="#product-reviews" className="text-xs text-primary hover:underline font-medium">
              (آراء وتجارب العميلات لهذا المنتج)
            </a>
          </div>

          {/* Pricing & Stock status */}
          <div className="flex flex-wrap items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-primary">{price} ج.م</span>
            {original && original > price && (
              <span className="text-lg text-slate-400 line-through">{original} ج.م</span>
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
                  متوفر في المخزون
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 border-b border-slate-100 pb-6">
            {p.description ||
              "منتج عناية طبيعي عالي الفعالية، مصمم لتغذية بشرتكِ ومنحها الإشراقة والترطيب العميق طوال اليوم."}
          </p>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-slate-800">الكمية المطلوبة:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-card shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="تقليل الكمية"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-slate-900 select-none">
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
              <span className="text-xs text-slate-500">
                (الإجمالي: {(price * quantity).toFixed(2)} ج.م)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              size="lg"
              disabled={isOutOfStock}
              className="flex-1 h-12 rounded-xl text-base font-semibold gap-2 shadow-xs"
              onClick={() => {
                if (isOutOfStock) return;
                add({ id: p.id, name: p.name, price, image_url: p.image_url }, quantity);
                toast.success(`تمت إضافة (${quantity}) من "${p.name}" إلى السلة 🌸`);
              }}
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
                className="w-full h-12 rounded-xl border-emerald-600/40 hover:border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-semibold gap-2"
              >
                <WhatsAppEmblemIcon size={20} className="text-emerald-600" />
                طلب فوري عبر واتساب
              </Button>
            </a>
          </div>

          {/* Guarantees & Trust Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-xs text-slate-600">
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

      {/* Customer Reviews & Experiences Section */}
      <ProductReviewsSection productId={p.id} productName={p.name} />

      {/* Related Products Section */}
      {finalRelated.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
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
    </div>
  );
}
