import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Star, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/context/CurrencyContext";
import { resolveProductImage } from "@/lib/product-images";
import { toast } from "sonner";

interface BentoProductsGridProps {
  products: ProductCardProduct[];
}

export function BentoProductsGrid({ products }: BentoProductsGridProps) {
  const { add } = useCart();
  const { formatPrice } = useCurrency();

  if (!products || products.length === 0) {
    return null;
  }

  // Hero product is the top featured one
  const heroProduct = products[0];
  // Next two products for side bento blocks
  const sideProduct1 = products[1];
  const sideProduct2 = products[2];
  // Remaining items for standard grid
  const restProducts = products.slice(3, 7);

  const heroImage = resolveProductImage(heroProduct);
  const side1Image = sideProduct1 ? resolveProductImage(sideProduct1) : null;
  const side2Image = sideProduct2 ? resolveProductImage(sideProduct2) : null;

  return (
    <div className="space-y-6">
      {/* Bento Main Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large Hero Bento Card (Span 7 cols) */}
        {heroProduct && (
          <div className="lg:col-span-7 group relative bg-gradient-to-br from-primary/10 via-primary/5 to-card rounded-3xl p-6 md:p-8 border border-primary/20 overflow-hidden flex flex-col justify-between min-h-[380px] shadow-sm hover:shadow-md transition-all">
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full bg-primary text-primary-foreground shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>المنتج الأكثر طلباً · Hero Pick</span>
                </span>
                {heroProduct.category && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 text-muted-foreground border border-border/60">
                    {heroProduct.category}
                  </span>
                )}
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug mb-2">
                {heroProduct.name}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                {heroProduct.description ||
                  "تركيبة نباتية متقدمة تمنح بشرتك حيوية ونضارة طبيعية فورية مع كل استخدام."}
              </p>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-black text-primary">
                  {formatPrice(heroProduct.price)}
                </span>
                {heroProduct.original_price && (
                  <span className="text-sm line-through text-muted-foreground font-medium">
                    {formatPrice(heroProduct.original_price)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    add(heroProduct.id, 1);
                    toast.success(`تمت إضافة ${heroProduct.name} إلى السلة! 🛍️`);
                  }}
                  className="h-11 px-6 text-xs md:text-sm font-bold gap-2 rounded-xl shadow-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف للسلة الآن</span>
                </Button>
                <Link
                  to="/products/$id"
                  params={{ id: heroProduct.id }}
                  className="h-11 px-4 rounded-xl border border-border/80 bg-background/60 hover:bg-background text-xs md:text-sm font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>التفاصيل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Floating Image */}
            <div className="relative lg:absolute lg:end-4 lg:bottom-4 lg:top-4 mt-6 lg:mt-0 flex items-center justify-center pointer-events-none">
              <img
                src={heroImage}
                alt={heroProduct.name}
                loading="lazy"
                className="w-56 h-56 md:w-64 md:h-64 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        )}

        {/* Secondary Bento Column (Span 5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {sideProduct1 && (
            <div className="group relative bg-card rounded-2xl p-5 border border-border/80 overflow-hidden flex items-center justify-between shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all">
              <div className="max-w-[60%] space-y-1.5">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                  عناية مركزة
                </span>
                <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {sideProduct1.name}
                </h4>
                <div className="text-base font-black text-primary">
                  {formatPrice(sideProduct1.price)}
                </div>
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      add(sideProduct1.id, 1);
                      toast.success(`تمت إضافة ${sideProduct1.name} للسلة`);
                    }}
                    className="h-8 text-xs font-bold gap-1 rounded-lg"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>أضف</span>
                  </Button>
                </div>
              </div>
              {side1Image && (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted/30 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={side1Image}
                    alt={sideProduct1.name}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
            </div>
          )}

          {sideProduct2 && (
            <div className="group relative bg-card rounded-2xl p-5 border border-border/80 overflow-hidden flex items-center justify-between shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all">
              <div className="max-w-[60%] space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                  تفتيح طبيعي
                </span>
                <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {sideProduct2.name}
                </h4>
                <div className="text-base font-black text-primary">
                  {formatPrice(sideProduct2.price)}
                </div>
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      add(sideProduct2.id, 1);
                      toast.success(`تمت إضافة ${sideProduct2.name} للسلة`);
                    }}
                    className="h-8 text-xs font-bold gap-1 rounded-lg"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>أضف</span>
                  </Button>
                </div>
              </div>
              {side2Image && (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted/30 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={side2Image}
                    alt={sideProduct2.name}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Supporting products in modern clean row */}
      {restProducts.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>باقي التشكيلة المختارة</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({restProducts.length} منتجات إضافية)
              </span>
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {restProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CarouselProductsProps {
  products: ProductCardProduct[];
}

export function CarouselProducts({ products }: CarouselProductsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 320;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative space-y-3">
      {/* Navigation Arrows */}
      <div className="flex items-center justify-end gap-2 mb-2">
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="السابق"
          className="w-9 h-9 rounded-xl border border-border/80 bg-background hover:bg-muted flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="التالي"
          className="w-9 h-9 rounded-xl border border-border/80 bg-background hover:bg-muted flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Horizontal Carousel Scroller */}
      <div
        ref={containerRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[260px] sm:w-[280px] shrink-0 snap-start h-full flex flex-col"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
