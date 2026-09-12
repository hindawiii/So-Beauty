import { Link } from "@tanstack/react-router";
import { ShoppingCart, Heart } from "lucide-react";
import { resolveProductImage } from "@/lib/product-images";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

export interface ProductCardProduct {
  id: string;
  name: string;
  price: number | string;
  original_price?: number | string | null;
  image_url: string | null;
  category?: string | null;
  stock?: number | null;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const { add } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const isWished = isInWishlist(product.id);

  const price = Number(product.price);
  const original = product.original_price != null ? Number(product.original_price) : null;
  const stock = product.stock != null ? Number(product.stock) : null;
  const isOutOfStock = stock !== null && stock <= 0;

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

  return (
    <article className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow flex flex-col h-full relative">
      <div className="relative aspect-square bg-muted overflow-hidden shrink-0">
        <Link to="/products/$id" params={{ id: product.id }} className="block w-full h-full">
          <img
            src={resolveProductImage(product.image_url)}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform ${
              isOutOfStock ? "grayscale opacity-75" : "group-hover:scale-105"
            }`}
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 end-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-xs shadow-xs ${
            isWished
              ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
              : "bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500"
          }`}
          aria-label={isWished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-75 ${
              isWished ? "fill-current text-white" : ""
            }`}
          />
        </button>

        {/* Discount Badge */}
        {original && original > price && (
          <span className="absolute top-2.5 start-2.5 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
            خصم {Math.round(((original - price) / original) * 100)}%
          </span>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute bottom-2.5 start-2.5 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            نفد من المخزون
          </span>
        ) : stock !== null && stock <= 5 ? (
          <span className="absolute bottom-2.5 start-2.5 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            متبقي {stock} فقط
          </span>
        ) : null}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="mb-3">
          <Link to="/products/$id" params={{ id: product.id }}>
            <h3 className="font-bold text-sm line-clamp-2 hover:text-primary leading-relaxed text-start">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-auto">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-primary font-bold text-sm md:text-base">{price} ج.م</span>
            {original && original > price && (
              <span className="text-xs text-muted-foreground line-through">{original} ج.م</span>
            )}
          </div>
          <button
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              add({ id: product.id, name: product.name, price, image_url: product.image_url });
              toast.success("أُضيف إلى السلة");
            }}
            className={`p-2.5 rounded-full transition-colors shrink-0 flex items-center justify-center ${
              isOutOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
            aria-label={isOutOfStock ? "المنتج غير متوفر" : "أضف إلى السلة"}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
