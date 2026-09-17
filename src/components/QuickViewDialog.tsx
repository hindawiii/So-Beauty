import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  resolveProductImage,
  extractProductGallery,
  cleanProductDescription,
} from "@/lib/product-images";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCurrency } from "@/context/CurrencyContext";
import { getWhatsAppProductOrderUrl } from "@/lib/whatsapp";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";
import {
  ShoppingBag,
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Leaf,
  Clock,
  ExternalLink,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCardProduct } from "@/components/ProductCard";

interface QuickViewDialogProps {
  product: ProductCardProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewDialog({ product, isOpen, onClose }: QuickViewDialogProps) {
  const { add } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const { formatPrice, formatBoth, currencyConfig } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  const galleryImages = useMemo(() => (product ? extractProductGallery(product) : []), [product]);

  if (!product) return null;

  const activeImage = galleryImages[selectedImgIndex] || resolveProductImage(product.image_url);
  const price = Number(product.price);
  const original = product.original_price != null ? Number(product.original_price) : null;
  const stock = product.stock != null ? Number(product.stock) : 25;
  const isOutOfStock = stock <= 0;
  const maxAvailable = Math.max(1, Math.min(stock, 20));
  const isWished = isInWishlist(product.id);

  const { primary: primaryPrice, secondary: secondaryPrice } = formatBoth(price);
  const formattedOriginal = original ? formatPrice(original) : null;
  const totalPriceFormatted = formatPrice(price * quantity);

  const handleWishlistToggle = () => {
    const added = toggle({
      id: product.id,
      name: product.name,
      price,
      original_price: original,
      image_url: product.image_url,
      category: product.category,
    });
    if (added) {
      toast.success("أُضيف إلى قائمة المفضلة 💖");
    } else {
      toast.info("تمت إزالة المنتج من المفضلة");
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add(
      {
        id: product.id,
        name: product.name,
        price,
        image_url: product.image_url,
      },
      quantity,
    );
    toast.success(`تمت إضافة (${quantity}) من "${product.name}" إلى السلة 🌸`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Full-screen responsive container with abundant breathing room and zero cramped elements */}
      <DialogContent className="w-[96vw] max-w-6xl h-[92vh] max-h-[95vh] p-0 overflow-hidden bg-card border border-border/80 sm:rounded-3xl shadow-2xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>معاينة تفصيلية: {product.name}</DialogTitle>
        </DialogHeader>

        {/* Modal Body: Split into Visual Stage (Natural Size) & Rich Details Column */}
        <div className="flex-1 grid lg:grid-cols-12 min-h-0 overflow-y-auto">
          {/* Section 1: Full Natural Size Image Stage (Takes 6 of 12 columns on large screens) */}
          <div className="lg:col-span-6 relative bg-slate-50/80 dark:bg-slate-900/40 p-6 sm:p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-e border-border/60 min-h-[380px] lg:min-h-full">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`absolute top-5 start-5 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-md cursor-pointer ${
                isWished
                  ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
                  : "bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white hover:text-rose-500"
              }`}
              aria-label={isWished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-75 ${
                  isWished ? "fill-current text-white" : ""
                }`}
              />
            </button>

            {/* Discount Badge - Micro Luxury Pill placed safely next to Wishlist */}
            {original && original > price && (
              <span className="absolute top-5 start-18 z-20 bg-red-600 text-white text-[11px] font-bold tracking-tight px-2.5 py-0.5 rounded-full shadow-xs border border-red-500/40 pointer-events-none">
                خ%{Math.round(((original - price) / original) * 100)}
              </span>
            )}

            {/* Natural Size High-Resolution Image & Gallery Navigation */}
            <div className="w-full max-w-[440px] flex flex-col items-center justify-center my-auto relative group">
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={`${product.name} - زاوية ${selectedImgIndex + 1}`}
                  className={`w-full max-h-[420px] object-contain rounded-2xl drop-shadow-md transition-transform duration-300 ${
                    isOutOfStock ? "grayscale opacity-75" : ""
                  }`}
                />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImgIndex((prev) =>
                          prev === 0 ? galleryImages.length - 1 : prev - 1,
                        )
                      }
                      className="absolute start-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center shadow-xs cursor-pointer"
                      aria-label="الزاوية السابقة"
                    >
                      <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImgIndex((prev) =>
                          prev === galleryImages.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute end-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center shadow-xs cursor-pointer"
                      aria-label="الزاوية التالية"
                    >
                      <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </button>

                    <span className="absolute bottom-2 start-2 z-10 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/75 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs pointer-events-none">
                      <Layers className="w-2.5 h-2.5" />
                      <span>
                        {selectedImgIndex + 1}/{galleryImages.length}
                      </span>
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnails if multiple angles exist */}
              {galleryImages.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto max-w-full py-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        idx === selectedImgIndex
                          ? "border-primary ring-2 ring-primary/25 scale-105"
                          : "border-border/70 opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`عرض الزاوية ${idx + 1}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Sensory Badge */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-full shadow-xs border border-border/60">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>نقاء صيدلاني وطبيعي 100% • نتائج ملحوظة</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-full">
                📍 {currencyConfig.country} • شحن دولي ومحلي
              </span>
            </div>
          </div>

          {/* Section 2: Comprehensive Details & Purchasing Column (Takes 6 of 12 columns, with safe distance for Close X) */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto space-y-6 text-start pe-14 sm:pe-18">
            <div className="space-y-5">
              {/* Category, Rating & Live Stock */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {product.category || "عناية متكاملة بالبشرة"}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/50">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9 / 5</span>
                    <span className="text-slate-400 font-normal ms-1">(تقييم معتمد)</span>
                  </div>
                </div>

                <div>
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      غير متوفر حالياً
                    </span>
                  ) : stock <= 5 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                      متبقي {stock} فقط في المخزون
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      متوفر للشحن الفوري
                    </span>
                  )}
                </div>
              </div>

              {/* Product Full Name */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed">
                {product.name}
              </h2>

              {/* Multi-Currency Price Showcase */}
              <div
                className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-4 flex-wrap"
                suppressHydrationWarning
              >
                <div suppressHydrationWarning>
                  <div className="flex items-baseline gap-3" suppressHydrationWarning>
                    <span
                      suppressHydrationWarning
                      className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight"
                    >
                      {primaryPrice}
                    </span>
                    {formattedOriginal && (
                      <span
                        suppressHydrationWarning
                        className="text-sm sm:text-base text-muted-foreground line-through"
                      >
                        {formattedOriginal}
                      </span>
                    )}
                  </div>
                  {secondaryPrice && (
                    <span
                      suppressHydrationWarning
                      className="text-xs text-muted-foreground font-mono font-medium block mt-1"
                    >
                      {secondaryPrice}
                    </span>
                  )}
                </div>

                <div className="text-end">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">
                    ✓ ضمان جودة أصلية 100%
                  </span>
                  <span className="text-[10px] text-muted-foreground">الدفع عند الاستلام متاح</span>
                </div>
              </div>

              {/* Detailed Description & Benefits */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  وصف المنتج وأثره على البشرة
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {cleanProductDescription(product.description) ||
                    "تركيبة متطورة مستوحاة من نقاء الطبيعة، تم تصميمها بعناية فائقة لتغذية طبقات البشرة بعمق، واستعادة التوازن المائي الطبيعي، ومنحكِ إشراقة صحية تدوم طوال اليوم دون أن تترك أي أثر دهني."}
                </p>
              </div>

              {/* Key Highlights (Clinical Badges) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>خالٍ من البارابين والكيماويات</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>ترطيب وحماية تدوم 24 ساعة</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>مناسب للبشرة الحساسة</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>توصيل سريع حتى باب منزلك</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-4">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    الكمية:
                  </span>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden bg-card shadow-2xs">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-11 text-center font-bold text-sm text-slate-900 dark:text-slate-100 select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= maxAvailable}
                      onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    (الإجمالي: {totalPriceFormatted})
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions: Add to Cart, WhatsApp Order, and Full Page View */}
            <div className="pt-5 border-t border-border/70 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-xl text-sm font-bold gap-2 shadow-md cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock
                    ? "المنتج غير متوفر حالياً"
                    : `أضف إلى السلة (${totalPriceFormatted})`}
                </Button>

                <a
                  href={getWhatsAppProductOrderUrl(product.name, price * quantity, product.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:w-auto"
                >
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 rounded-xl border-emerald-600/40 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <WhatsAppEmblemIcon size={18} className="text-emerald-600" />
                    طلب سريع عبر واتساب
                  </Button>
                </a>
              </div>

              {/* Direct Full Product Page Link with ample breathing room */}
              <Link
                to="/products/$id"
                params={{ id: product.id }}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors border border-primary/20 hover:border-primary/40 rounded-xl bg-primary/5 hover:bg-primary/10"
              >
                <span>عرض صفحة المنتج الكاملة وروتين الاستخدام بالتفصيل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
