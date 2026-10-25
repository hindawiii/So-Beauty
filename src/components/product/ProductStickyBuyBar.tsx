import React from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveProductImage } from "@/lib/product-images";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductStickyBuyBarProps {
  productName: string;
  productPrice: number;
  imageUrl?: string;
  quantity: number;
  onIncreaseQty: () => void;
  onDecreaseQty: () => void;
  onAddToCart: () => void;
  isOutOfStock: boolean;
  language: string;
  visible: boolean;
}

export function ProductStickyBuyBar({
  productName,
  productPrice,
  imageUrl,
  quantity,
  onIncreaseQty,
  onDecreaseQty,
  onAddToCart,
  isOutOfStock,
  language,
  visible,
}: ProductStickyBuyBarProps) {
  const { formatPrice } = useCurrency();

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 shadow-xl md:hidden animate-in slide-in-from-bottom-3 duration-200">
      <div className="container mx-auto max-w-lg flex items-center justify-between gap-3">
        {/* Product Tiny Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={resolveProductImage(imageUrl)}
            alt={productName}
            className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
          />
          <div className="min-w-0">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
              {productName}
            </span>
            <span className="text-xs font-black text-primary font-mono block">
              {formatPrice(productPrice * quantity)}
            </span>
          </div>
        </div>

        {/* Quantity Mini Stepper */}
        {!isOutOfStock && (
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shrink-0">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={onDecreaseQty}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center font-bold text-xs font-mono select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={onIncreaseQty}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100"
              aria-label="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* CTA Button */}
        <Button
          size="sm"
          disabled={isOutOfStock}
          onClick={onAddToCart}
          className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-sm shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? "نفد المخزون" : "شراء الآن"}</span>
        </Button>
      </div>
    </div>
  );
}
