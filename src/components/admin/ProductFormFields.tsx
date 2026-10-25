import React, { useState } from "react";
import {
  Tag,
  DollarSign,
  Layers,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Languages,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database.types";
import { resolveProductImage } from "@/lib/product-images";

export type ProductCategory = Database["public"]["Enums"]["product_category"];

export interface ProductFormData {
  name: string;
  name_en?: string | null;
  category: ProductCategory;
  price: number;
  original_price?: number | null;
  stock: number;
  image_url?: string;
  gallery_images: string[];
  description?: string;
  description_en?: string | null;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface CategoryOption {
  key: ProductCategory;
  label: string;
  desc: string;
  icon: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    key: "skincare",
    label: "العناية بالبشرة (Skincare)",
    desc: "سيرومات، كريمات ترطيب، غسول، ومنتجات تفتيح طبيعية",
    icon: "🌸",
  },
  {
    key: "box",
    label: "بوكسات العناية (Luxe Boxes)",
    desc: "مجموعات العناية المتكاملة، بوكسات العروس، وحزم التوفير الفاخرة",
    icon: "🎁",
  },
  {
    key: "offer",
    label: "عروض وتخفيضات (Special Offers)",
    desc: "منتجات بأسعار ترويجية حصرية وتخفيضات موسمية مؤقتة",
    icon: "🔥",
  },
  {
    key: "accessory",
    label: "إكسسوارات وملحقات (Accessories)",
    desc: "أدوات رولر، مساج للبشرة، إسفنجات تنظيف وموزعات",
    icon: "✨",
  },
];

interface ProductFormFieldsProps {
  formData: ProductFormData;
  onChange: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
  onAddGalleryImage: (url: string) => void;
  onRemoveGalleryImage: (index: number) => void;
  isTranslating: boolean;
  onTranslateAi: () => void;
  previewDiscountPercent: number | null;
}

export function ProductFormFields({
  formData,
  onChange,
  onAddGalleryImage,
  onRemoveGalleryImage,
  isTranslating,
  onTranslateAi,
  previewDiscountPercent,
}: ProductFormFieldsProps) {
  const [newGalleryInput, setNewGalleryInput] = useState("");

  const handleAddGallery = () => {
    const trimmed = newGalleryInput.trim();
    if (trimmed) {
      onAddGalleryImage(trimmed);
      setNewGalleryInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Basic Info & Category */}
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span>بيانات وهوية المنتج الأساسية</span>
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTranslateAi}
            disabled={isTranslating || !formData.name}
            className="h-8 px-2.5 text-xs gap-1.5 text-primary hover:bg-primary/10 rounded-xl"
            title="ترجمة تلقائية ذكية عبر الذكاء الاصطناعي للاسم والوصف بالإنجليزية"
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Languages className="w-3.5 h-3.5" />
            )}
            <span>توليد الترجمة بالذكاء الاصطناعي</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم المنتج بالعربية <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="مثال: سيروم النضارة الفائق بفيتامين C"
              className="h-10 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Name in English (اختياري)
            </label>
            <Input
              value={formData.name_en || ""}
              onChange={(e) => onChange("name_en", e.target.value)}
              placeholder="e.g. Ultra Radiance Vitamin C Serum"
              className="h-10 text-xs sm:text-sm rounded-xl font-sans"
              dir="ltr"
            />
          </div>
        </div>

        {/* Category Radio Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            فئة وتصنيف المنتج في المتجر <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => onChange("category", cat.key)}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                  formData.category === cat.key
                    ? "bg-white dark:bg-slate-900 border-primary ring-2 ring-primary/15 shadow-xs"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">
                    {cat.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Pricing & Stock */}
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-primary" />
          <span>الأسعار ومخزون المستودع</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              سعر البيع الحالي (ج.م) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.price || ""}
              onChange={(e) => onChange("price", Number(e.target.value))}
              placeholder="مثال: 450"
              className="h-10 text-xs sm:text-sm font-mono rounded-xl"
              min={0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              السعر قبل الخصم (اختياري)
            </label>
            <Input
              type="number"
              value={formData.original_price || ""}
              onChange={(e) =>
                onChange("original_price", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="مثال: 550"
              className="h-10 text-xs sm:text-sm font-mono rounded-xl"
              min={0}
            />
            {previewDiscountPercent !== null && (
              <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                خصم ترويجي: {previewDiscountPercent}%
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              الكمية المتوفرة بالمخزون <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => onChange("stock", Number(e.target.value))}
              placeholder="مثال: 25"
              className="h-10 text-xs sm:text-sm font-mono rounded-xl"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* 3. Media & Gallery */}
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span>الصور ومعرض المنتج البصري</span>
        </h4>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            رابط الصورة الرئيسية للمنتج (URL)
          </label>
          <div className="flex gap-2">
            <Input
              value={formData.image_url || ""}
              onChange={(e) => onChange("image_url", e.target.value)}
              placeholder="https://... أو مسار صورة محلية"
              className="h-10 text-xs sm:text-sm rounded-xl font-mono flex-1"
              dir="ltr"
            />
            {formData.image_url && (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white">
                <img
                  src={resolveProductImage(formData.image_url)}
                  alt="معاينة"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Gallery Images List */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            صور إضافية لمعرض المنتج (Thumbnail Gallery)
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newGalleryInput}
              onChange={(e) => setNewGalleryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddGallery();
                }
              }}
              placeholder="أدخلي رابط صورة إضافية واضغطي إضافة..."
              className="h-9 text-xs rounded-xl font-mono flex-1"
              dir="ltr"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddGallery}
              className="h-9 px-3 rounded-xl text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </Button>
          </div>

          {formData.gallery_images && formData.gallery_images.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70">
              {formData.gallery_images.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50"
                >
                  <img
                    src={resolveProductImage(imgUrl)}
                    alt={`إضافية ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(idx)}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف هذه الصورة"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Descriptions */}
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>الوصف، المكونات، وطريقة الاستخدام</span>
        </h4>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            الوصف بالعربية
          </label>
          <Textarea
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="اشرحي فوائد المنتج، المكونات الطبيعية، وطريقة الاستخدام المثالية..."
            rows={3}
            className="text-xs sm:text-sm rounded-xl leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Description in English (اختياري)
          </label>
          <Textarea
            value={formData.description_en || ""}
            onChange={(e) => onChange("description_en", e.target.value)}
            placeholder="Key ingredients, proven clinical benefits, usage..."
            rows={2}
            className="text-xs sm:text-sm rounded-xl leading-relaxed font-sans"
            dir="ltr"
          />
        </div>
      </div>

      {/* 5. Toggles */}
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(formData.is_featured)}
            onChange={(e) => onChange("is_featured", e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            ⭐ تمييز المنتج في الصفحة الأولى (Featured Hero)
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.is_active !== false}
            onChange={(e) => onChange("is_active", e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            معروض للبيع ونشط في واجهة المتجر (Active)
          </span>
        </label>
      </div>
    </div>
  );
}
