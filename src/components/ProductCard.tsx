import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingCart,
  Heart,
  Check,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";
import { resolveProductImage, extractProductGallery } from "@/lib/product-images";
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedCategory,
} from "@/lib/product-localization";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export interface ProductCardProduct {
  id: string;
  name: string;
  name_en?: string | null;
  price: number | string;
  original_price?: number | string | null;
  image_url: string | null;
  category?: string | null;
  stock?: number | null;
  description?: string | null;
  description_en?: string | null;
  gallery_images?: (string | null)[] | null;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const { language, t } = useLanguage();
  const { add } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const { formatPrice, formatBoth } = useCurrency();
  const [justAdded, setJustAdded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const isWished = isInWishlist(product.id);

  // Localized product name, category, and description
  const displayName = useMemo(
    () => getLocalizedProductName(product, language),
    [product, language],
  );
  const displayCategory = useMemo(
    () => getLocalizedCategory(product.category, language),
    [product.category, language],
  );
  const displayDescription = useMemo(
    () => getLocalizedProductDescription(product, language),
    [product, language],
  );

  // Extract authentic gallery images (Length is 1 if merchant did not add multi-angles)
  const galleryImages = useMemo(() => extractProductGallery(product), [product]);
  const hasMultipleImages = galleryImages.length > 1;
  const isFlipEnabled = settings.cardMotionStyle === "flip";

  const cardMotionClass =
    settings.cardMotionStyle === "jump"
      ? "card-motion-jump"
      : settings.cardMotionStyle === "shake"
        ? "card-motion-shake"
        : settings.cardMotionStyle === "rotate"
          ? "card-motion-rotate"
          : settings.cardMotionStyle === "none"
            ? ""
            : settings.cardMotionStyle === "flip"
              ? ""
              : "card-motion-tilt";

  const price = Number(product.price);
  const original = product.original_price != null ? Number(product.original_price) : null;
  const stock = product.stock != null ? Number(product.stock) : null;
  const isOutOfStock = stock !== null && stock <= 0;

  const { primary: primaryPrice, secondary: secondaryPrice } = formatBoth(price);
  const formattedOriginal = original ? formatPrice(original) : null;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle({
      id: product.id,
      name: product.name,
      price,
      original_price: original,
      image_url: product.image_url,
      category: product.category,
    });
    if (added) {
      toast.success(t("productDetail.addedToWishlist"));
    } else {
      toast.info(t("productDetail.removedFromWishlist"));
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    add({ id: product.id, name: product.name, price, image_url: product.image_url });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success(t("productDetail.addedToCart"));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultipleImages || touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    // Minimum 35px swipe threshold
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // Swiped left (next in RTL or LTR depending on reading direction)
        setCurrentImgIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
      } else {
        // Swiped right
        setCurrentImgIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const toggleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the target is not an interactive button/link/input
    const target = e.target as HTMLElement | null;
    if (target && target.closest("button, a, input, select, textarea")) {
      return;
    }
    navigate({ to: "/products/$id", params: { id: product.id } });
  };

  return (
    <div
      className={`relative w-full h-full ${
        isFlipEnabled ? `flip-card-container ${isFlipped ? "is-flipped" : ""}` : ""
      }`}
    >
      <div
        className={
          isFlipEnabled
            ? "flip-card-inner min-h-[380px] sm:min-h-[420px]"
            : "w-full h-full flex flex-col"
        }
      >
        {/* ================= FRONT CARD FACE ================= */}
        <article
          onClick={handleCardClick}
          className={`group bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/70 hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative cursor-pointer ${cardMotionClass} ${
            isFlipEnabled ? "flip-card-front w-full" : ""
          }`}
        >
          {/* Product Image Area - With In-Card Slider & Quick Peek */}
          <div
            className="relative aspect-[4/4.5] sm:aspect-square bg-muted/40 overflow-hidden shrink-0 cursor-pointer select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Link
              to="/products/$id"
              params={{ id: product.id }}
              className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 text-start"
              aria-label={`عرض تفاصيل ${product.name}`}
            >
              <img
                src={galleryImages[currentImgIndex] || resolveProductImage(product.image_url)}
                alt={`${product.name} - زاوية ${currentImgIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                  isOutOfStock ? "grayscale opacity-75" : "group-hover:scale-106"
                }`}
                loading="lazy"
              />
            </Link>

            {/* In-Card Multi-Angle Indicator Badge (Shown ONLY if merchant configured multiple angles) */}
            {hasMultipleImages && (
              <span className="absolute top-2 start-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/75 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs pointer-events-none transition-opacity">
                <Layers className="w-2.5 h-2.5 text-primary-foreground" />
                <span>
                  {currentImgIndex + 1}/{galleryImages.length}
                </span>
              </span>
            )}

            {/* In-Card Mini Image Slider Controls (Interactive Slider Navigation) */}
            {settings.enableInCardSlider !== false && hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute start-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                  aria-label="الزاوية السابقة"
                >
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute end-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                  aria-label="الزاوية التالية"
                >
                  <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                </button>

                {/* In-Card Slider Dots Indicator with direct click support */}
                <div className="absolute bottom-2 inset-x-0 z-10 flex items-center justify-center gap-1">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImgIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentImgIndex
                          ? "w-4 bg-primary shadow-xs"
                          : "w-1.5 bg-white/70 dark:bg-slate-700/70 hover:bg-white"
                      }`}
                      aria-label={`عرض الزاوية ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Wishlist Button - Compact & Crisp Floating Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`absolute top-2 end-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-xs cursor-pointer ${
                isWished
                  ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
                  : "bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500 hover:scale-105"
              }`}
              aria-label={
                isWished
                  ? t("productDetail.removedFromWishlist")
                  : t("productDetail.addedToWishlist")
              }
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform active:scale-75 ${
                  isWished ? "fill-current text-white" : ""
                }`}
              />
            </button>

            {/* Flip Card Toggle Button (Only if enabled in theme settings) */}
            {isFlipEnabled && (
              <button
                type="button"
                onClick={toggleFlip}
                className="absolute bottom-2.5 end-2.5 z-10 h-7 px-2.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-[11px] font-medium flex items-center gap-1 shadow-md transition-all cursor-pointer backdrop-blur-xs"
                title={t("common.quickSpecs")}
              >
                <RotateCw className="w-3 h-3 text-amber-300" />
                <span>{t("common.quickSpecs")}</span>
              </button>
            )}

            {/* Discount Badge - Prominent Red Mini Badge */}
            {original && original > price && (
              <span className="absolute top-2 start-2 z-10 bg-red-600 text-white text-[10px] sm:text-[11px] font-bold tracking-tight px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full shadow-xs border border-red-500/40 pointer-events-none">
                {language === "ar"
                  ? `خصم ${Math.round(((original - price) / original) * 100)}%`
                  : `-${Math.round(((original - price) / original) * 100)}%`}
              </span>
            )}

            {/* Stock Status Badge */}
            {isOutOfStock ? (
              <span className="absolute bottom-2 start-2 z-10 bg-slate-900/90 text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
                {t("common.outOfStock")}
              </span>
            ) : stock !== null && stock <= 5 ? (
              <span className="absolute bottom-2 start-2 z-10 bg-amber-600/95 text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
                {t("common.remainingOnly")} {stock} {t("common.piecesOnly")}
              </span>
            ) : null}
          </div>

          {/* Product Content Section */}
          <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between text-start gap-1.5 sm:gap-2">
            <div>
              {/* Category Micro Chip */}
              {displayCategory && (
                <div className="mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground truncate block">
                    {displayCategory}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <Link
                to="/products/$id"
                params={{ id: product.id }}
                className="block group-hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-snug sm:leading-relaxed text-foreground min-h-[2rem] sm:min-h-[2.5rem]">
                  {displayName}
                </h3>
              </Link>
            </div>

            {/* Price & Action Area */}
            <div className="pt-2 mt-auto border-t border-border/40 flex items-center justify-between gap-1.5">
              {/* Price Block */}
              <div className="flex flex-col min-w-0" suppressHydrationWarning>
                <div
                  className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap"
                  suppressHydrationWarning
                >
                  <span
                    suppressHydrationWarning
                    className="text-primary font-bold text-xs sm:text-base tracking-tight leading-none"
                  >
                    {primaryPrice}
                  </span>
                  {formattedOriginal && (
                    <span
                      suppressHydrationWarning
                      className="text-[11px] sm:text-xs text-muted-foreground/80 font-medium inline-block line-through decoration-slate-400/90 dark:decoration-slate-500/90 decoration-[1.5px] leading-normal"
                    >
                      {formattedOriginal}
                    </span>
                  )}
                </div>
                {secondaryPrice && (
                  <span
                    suppressHydrationWarning
                    className="hidden sm:inline-block text-[9px] text-muted-foreground font-mono mt-0.5 leading-none truncate"
                  >
                    {secondaryPrice}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`w-8 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-lg sm:rounded-xl font-medium text-xs transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                  isOutOfStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : justAdded
                      ? "bg-emerald-600 text-white shadow-emerald-500/20 animate-cart-success"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xs"
                }`}
                aria-label={isOutOfStock ? t("common.outOfStock") : t("common.addToCart")}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">{t("common.added")}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">{t("common.add")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </article>

        {/* ================= BACK CARD FACE (3D FLIP VIEW) ================= */}
        {isFlipEnabled && (
          <article className="flip-card-back absolute inset-0 bg-card rounded-xl sm:rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg flex flex-col justify-between p-4 sm:p-5 text-start">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{t("common.quickSpecs")}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleFlip}
                  className="w-7 h-7 rounded-full bg-muted/80 hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                  title="العودة لصورة المنتج"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-foreground mt-3 line-clamp-2">{displayName}</h4>

              <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-4">
                {displayDescription ||
                  (language === "ar"
                    ? "منتج أصلي عالي الجودة مختار بعناية لتقديم تجربة استخدام فائقة الجمال والفاعلية مع ضمان استرجاع حقيقي."
                    : "High-quality authentic product carefully curated to provide exceptional radiance, effectiveness, and satisfaction.")}
              </p>

              <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between py-1 border-b border-border/30">
                  <span>{t("common.category")}:</span>
                  <span className="font-semibold text-foreground">
                    {displayCategory || (language === "ar" ? "عام" : "General")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/30">
                  <span>{t("common.availability")}:</span>
                  <span
                    className={`font-semibold ${
                      isOutOfStock ? "text-rose-500" : "text-emerald-600"
                    }`}
                  >
                    {isOutOfStock ? t("common.outOfStock") : t("common.inStockFast")}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("common.totalPrice")}:</span>
                <span className="text-primary font-extrabold text-base">{primaryPrice}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="w-full h-9 rounded-xl font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{t("common.buyNow")}</span>
                </button>
                <Link
                  to="/products/$id"
                  params={{ id: product.id }}
                  className="w-full h-9 rounded-xl font-medium text-xs bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center gap-1 transition-all"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{t("common.fullDetails")}</span>
                </Link>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
