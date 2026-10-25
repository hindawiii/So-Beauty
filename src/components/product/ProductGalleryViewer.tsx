import React, { useState } from "react";
import { Layers, Leaf, Droplets, Award } from "lucide-react";
import { ProductImageViewer } from "@/components/ProductImageViewer";
import { resolveProductImage } from "@/lib/product-images";

interface ProductGalleryViewerProps {
  galleryImages: string[];
  defaultImageUrl?: string;
  productName: string;
  isOutOfStock: boolean;
  language: string;
  outOfStockLabel: string;
}

export function ProductGalleryViewer({
  galleryImages,
  defaultImageUrl,
  productName,
  isOutOfStock,
  language,
  outOfStockLabel,
}: ProductGalleryViewerProps) {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const activeImage = galleryImages[selectedImgIndex] || resolveProductImage(defaultImageUrl);

  return (
    <div className="space-y-4">
      {/* Zoomable Primary Stage */}
      <div className="relative">
        <ProductImageViewer
          src={activeImage}
          alt={`${productName} - ${selectedImgIndex + 1}`}
          isOutOfStock={isOutOfStock}
        />

        {isOutOfStock && (
          <span className="absolute bottom-4 start-4 z-20 bg-slate-900/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs pointer-events-none">
            {outOfStockLabel}
          </span>
        )}
      </div>

      {/* Multi-angle Thumbnails Showcase */}
      {galleryImages.length > 1 && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-2xl border border-border/60">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>
                {language === "ar"
                  ? `زوايا تصوير المنتج (${galleryImages.length} صور)`
                  : `Product Angles (${galleryImages.length} photos)`}
              </span>
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
                aria-label={`Angle ${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} - ${idx + 1}`}
                  className="w-full h-full object-contain p-1 bg-white dark:bg-slate-900"
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

      {/* Sensory Trust Badges Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <Leaf className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            {language === "ar" ? "نباتي 100%" : "100% Vegan"}
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            {language === "ar" ? "مستخلصات عضوية" : "Organic Extracts"}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            {language === "ar" ? "ترطيب 24h" : "24h Hydration"}
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            {language === "ar" ? "تغذية خلوية عميقة" : "Deep Cell Nourish"}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            {language === "ar" ? "جودة معتمدة" : "Certified Quality"}
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            {language === "ar" ? "آمن ومختبر" : "Safe & Tested"}
          </span>
        </div>
      </div>
    </div>
  );
}
