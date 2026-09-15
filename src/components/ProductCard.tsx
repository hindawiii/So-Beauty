import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Heart, Check, Eye } from "lucide-react";
import { resolveProductImage } from "@/lib/product-images";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCurrency } from "@/context/CurrencyContext";
import { QuickViewDialog } from "@/components/QuickViewDialog";
import { toast } from "sonner";

export interface ProductCardProduct {
  id: string;
  name: string;
  price: number | string;
  original_price?: number | string | null;
  image_url: string | null;
  category?: string | null;
  stock?: number | null;
  description?: string | null;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const { add } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const { formatPrice, formatBoth } = useCurrency();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const isWished = isInWishlist(product.id);

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
      toast.success("أُضيف إلى قائمة المفضلة 💖");
    } else {
      toast.info("تمت إزالة المنتج من المفضلة");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    add({ id: product.id, name: product.name, price, image_url: product.image_url });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success("أُضيف إلى السلة بنجاح ✨");
  };

  return (
    <article className="group bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/70 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
      {/* Product Image Area - Clicking opens product details */}
      <div className="relative aspect-[4/4.5] sm:aspect-square bg-muted/40 overflow-hidden shrink-0 cursor-pointer">
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 text-start"
          aria-label={`عرض تفاصيل ${product.name}`}
        >
          <img
            src={resolveProductImage(product.image_url)}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              isOutOfStock ? "grayscale opacity-75" : "group-hover:scale-106"
            }`}
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button - Compact & Crisp Floating Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-2 end-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-xs cursor-pointer ${
            isWished
              ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
              : "bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500 hover:scale-105"
          }`}
          aria-label={isWished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform active:scale-75 ${
              isWished ? "fill-current text-white" : ""
            }`}
          />
        </button>

        {/* Quick View Button - Subtle Floating Action on Hover for Desktop */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsQuickViewOpen(true);
          }}
          className="hidden md:flex absolute bottom-2.5 end-2.5 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-primary hover:scale-105 items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="معاينة سريعة"
          aria-label={`معاينة سريعة لـ ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Discount Badge - Prominent Red Mini Badge */}
        {original && original > price && (
          <span className="absolute top-2 start-2 z-10 bg-red-600 text-white text-[10px] sm:text-[11px] font-bold tracking-tight px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full shadow-xs border border-red-500/40 pointer-events-none">
            خ%{Math.round(((original - price) / original) * 100)}
          </span>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute bottom-2 start-2 z-10 bg-slate-900/90 text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
            نفد من المخزون
          </span>
        ) : stock !== null && stock <= 5 ? (
          <span className="absolute bottom-2 start-2 z-10 bg-amber-600/95 text-white text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs pointer-events-none">
            متبقي {stock} فقط
          </span>
        ) : null}
      </div>

      {/* Product Content Section - Mobile Optimized Compact Architecture */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between text-start gap-1.5 sm:gap-2">
        <div>
          {/* Category Micro Chip */}
          {product.category && (
            <div className="mb-1">
              <span className="text-[10px] font-medium text-muted-foreground truncate block">
                {product.category}
              </span>
            </div>
          )}

          {/* Product Name - Strictly 2 Lines with Consistent Height */}
          <Link
            to="/products/$id"
            params={{ id: product.id }}
            className="block group-hover:text-primary transition-colors"
          >
            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-snug sm:leading-relaxed text-foreground min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Area - Streamlined Unified Bottom Block */}
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
            {/* Secondary USD reference shown unobtrusively on tablets/desktop */}
            {secondaryPrice && (
              <span
                suppressHydrationWarning
                className="hidden sm:inline-block text-[9px] text-muted-foreground font-mono mt-0.5 leading-none truncate"
              >
                {secondaryPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Ergonomic Fast Tap Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`w-8 h-8 sm:w-auto sm:h-9 sm:px-3 rounded-lg sm:rounded-xl font-medium text-xs transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : justAdded
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xs"
            }`}
            aria-label={isOutOfStock ? "المنتج غير متوفر" : "أضف إلى السلة"}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">أُضيف</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">أضف</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Full-Screen Immersive Quick View Modal */}
      <QuickViewDialog
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </article>
  );
}
