import React, { useState } from "react";
import { Sparkles, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/mock-products";
import { resolveProductImage } from "@/lib/product-images";
import { getLocalizedProductName } from "@/lib/product-localization";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";

interface ProductRoutineUpsellProps {
  currentProductId: string;
  allProducts: Product[];
  onAddAddonToCart: (product: Product) => void;
  language: string;
}

export function ProductRoutineUpsell({
  currentProductId,
  allProducts,
  onAddAddonToCart,
  language,
}: ProductRoutineUpsellProps) {
  const { formatPrice } = useCurrency();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Filter 2 complementary products that are active and not the current product
  const complementaryProducts = (allProducts || [])
    .filter((p) => p.id !== currentProductId && p.is_active !== false)
    .slice(0, 2);

  if (complementaryProducts.length === 0) return null;

  const handleToggleAdd = (product: Product) => {
    onAddAddonToCart(product);
    setAddedIds((prev) => new Set(prev).add(product.id));
    toast.success(
      language === "ar"
        ? `تمت إضافة "${getLocalizedProductName(product, language)}" إلى سلة روتينكِ 🌸`
        : `Added "${getLocalizedProductName(product, language)}" to your routine cart!`,
    );
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-card border border-primary/20 shadow-xs my-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>
            {language === "ar"
              ? "أكملي روتينكِ المتكامل (خطوات العناية التكميلية):"
              : "Complete Your Routine (Recommended Add-ons):"}
          </span>
        </h4>
        <span className="text-[10px] text-muted-foreground">
          {language === "ar" ? "إضافة فورية للسلة" : "One-tap add"}
        </span>
      </div>

      <div className="space-y-2.5">
        {complementaryProducts.map((prod) => {
          const isAdded = addedIds.has(prod.id);
          const pName = getLocalizedProductName(prod, language);

          return (
            <div
              key={prod.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={resolveProductImage(prod.image_url)}
                  alt={pName}
                  className="w-11 h-11 rounded-lg object-cover bg-white shrink-0 border border-slate-200/60"
                />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                    {pName}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-primary block mt-0.5">
                    +{formatPrice(prod.price)}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant={isAdded ? "outline" : "default"}
                disabled={isAdded}
                onClick={() => handleToggleAdd(prod)}
                className={`h-8 px-3 rounded-xl text-xs font-bold gap-1 shrink-0 ${
                  isAdded ? "text-emerald-700 bg-emerald-50 border-emerald-300" : "cursor-pointer"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تمت الإضافة</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة للروتين</span>
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
