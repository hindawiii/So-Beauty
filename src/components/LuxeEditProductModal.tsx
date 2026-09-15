import React, { useState, useEffect } from "react";
import {
  X,
  Edit3,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  FileText,
  CheckCircle2,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "@/lib/mock-products";
import { ProductQualityAdvisor } from "@/components/ProductQualityAdvisor";

type ProductCategory = Database["public"]["Enums"]["product_category"];

export interface UpdateProductPayload {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  original_price?: number | null;
  stock: number;
  image_url?: string;
  description?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

interface LuxeEditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (updated: Product) => void;
  onProductDeleted?: (id: string) => void;
  onProductDuplicated?: (duplicated: Product) => void;
  updateProductFn: (payload: {
    data: UpdateProductPayload;
  }) => Promise<{ ok: boolean; product: Product }>;
  duplicateProductFn?: (payload: {
    data: { id: string };
  }) => Promise<{ ok: boolean; product: Product }>;
  deleteProductFn?: (payload: { data: { id: string } }) => Promise<{ ok: boolean; id: string }>;
}

const CATEGORY_OPTIONS: { key: ProductCategory; label: string; icon: string }[] = [
  { key: "skincare", label: "العناية بالبشرة (Skincare)", icon: "🌿" },
  { key: "box", label: "بوكسات ومجموعات العناية (Care Boxes)", icon: "🎁" },
  { key: "offer", label: "عروض وتخفيضات حصرية (Special Offers)", icon: "🏷️" },
  { key: "accessory", label: "إكسسوارات وملحقات (Accessories)", icon: "✨" },
];

export function LuxeEditProductModal({
  product,
  isOpen,
  onClose,
  onProductUpdated,
  onProductDeleted,
  onProductDuplicated,
  updateProductFn,
  duplicateProductFn,
  deleteProductFn,
}: LuxeEditProductModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "quality">("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("skincare");
  const [price, setPrice] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Extracted details
  const [howToUse, setHowToUse] = useState("");
  const [keyIngredients, setKeyIngredients] = useState("");
  const [skinType, setSkinType] = useState("");

  // Sync state whenever product changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "skincare");
      setPrice(String(product.price || ""));
      setOriginalPrice(product.original_price ? String(product.original_price) : "");
      setStock(String(product.stock ?? 0));
      setImageUrl(product.image_url || "");
      setIsFeatured(Boolean(product.is_featured));
      setIsActive(product.is_active !== false);

      const rawDesc = product.description || "";
      // Extract how to use and ingredients if existing in text
      let mainDesc = rawDesc;
      let parsedHow = "";
      let parsedIng = "";
      let parsedSkin = "";

      const lines = rawDesc.split("\n");
      const cleanLines: string[] = [];

      for (const line of lines) {
        if (line.includes("طريقة الاستخدام:")) {
          parsedHow = line.replace(/.*طريقة الاستخدام:\s*/, "").trim();
        } else if (line.includes("المكونات الفعالة:")) {
          parsedIng = line.replace(/.*المكونات الفعالة:\s*/, "").trim();
        } else if (line.includes("نوع البشرة:")) {
          parsedSkin = line.replace(/.*نوع البشرة:\s*/, "").trim();
        } else {
          cleanLines.push(line);
        }
      }

      mainDesc = cleanLines.join("\n").trim();
      setDescription(mainDesc);
      setHowToUse(parsedHow);
      setKeyIngredients(parsedIng);
      setSkinType(parsedSkin);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const numericPrice = Number(price) || 0;
  const numericOriginal = originalPrice ? Number(originalPrice) : null;
  const discountPercent =
    numericOriginal && numericOriginal > numericPrice && numericPrice > 0
      ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
      : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("يرجى كتابة اسم المنتج");
      setActiveTab("basic");
      return;
    }
    if (!numericPrice || numericPrice <= 0) {
      toast.error("يرجى إدخال سعر بيع صحيح للمنتج");
      setActiveTab("basic");
      return;
    }

    try {
      setIsSubmitting(true);

      // Reconstruct complete description
      let fullDescription = description.trim();
      const extraDetails: string[] = [];
      if (howToUse.trim()) extraDetails.push(`📌 طريقة الاستخدام: ${howToUse.trim()}`);
      if (keyIngredients.trim()) extraDetails.push(`🌿 المكونات الفعالة: ${keyIngredients.trim()}`);
      if (skinType.trim()) extraDetails.push(`✨ نوع البشرة: ${skinType.trim()}`);

      if (extraDetails.length > 0) {
        fullDescription = fullDescription
          ? `${fullDescription}\n\n${extraDetails.join("\n")}`
          : extraDetails.join("\n");
      }

      const res = await updateProductFn({
        data: {
          id: product.id,
          name: name.trim(),
          category,
          price: numericPrice,
          original_price: numericOriginal,
          stock: Math.max(0, Number(stock) || 0),
          image_url: imageUrl.trim() || product.image_url,
          description: fullDescription,
          is_featured: isFeatured,
          is_active: isActive,
        },
      });

      if (res?.ok && res.product) {
        toast.success(`تم تحديث بيانات المنتج "${res.product.name}" بنجاح! ✨`);
        onProductUpdated(res.product);
        onClose();
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("تعذر حفظ تعديلات المنتج، يرجى المحاولة ثانية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateProductFn) return;
    try {
      setIsDuplicating(true);
      const res = await duplicateProductFn({ data: { id: product.id } });
      if (res?.ok && res.product) {
        toast.success(`تم إنشاء نسخة جديدة من المنتج: "${res.product.name}"`);
        if (onProductDuplicated) onProductDuplicated(res.product);
        onClose();
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
      toast.error("حدث خطأ أثناء تكرار المنتج");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductFn) return;
    const confirmed = window.confirm(
      `هل أنتِ متأكدة من حذف المنتج "${product.name}" من المتجر نهائياً؟`,
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const res = await deleteProductFn({ data: { id: product.id } });
      if (res?.ok) {
        toast.success(`تم حذف المنتج بنجاح.`);
        if (onProductDeleted) onProductDeleted(product.id);
        onClose();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("تعذر حذف المنتج");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border/70 flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                تعديل المنتج: {product.name}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>المعرف: {product.id}</span>
                <span>•</span>
                <span
                  className={isActive ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}
                >
                  {isActive ? "نشط بالمتجر" : "معطل / مخفي"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Direct preview link */}
            <a
              href={`/products/${product.id}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="عرض صفحة المنتج في المتجر"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center border-b border-border/60 px-5 sm:px-6 bg-background shrink-0 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "basic"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>1. البطاقة والأسعار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. روتين العناية والمكونات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quality")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "quality"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. فحص جودة العرض والصورة</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {activeTab === "basic" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  اسم المنتج <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  التصنيف والقسم المناسب <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setCategory(opt.key)}
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                        category === opt.key
                          ? "bg-primary/5 border-primary ring-1 ring-primary"
                          : "bg-card border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <span className="text-xs font-bold text-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    سعر البيع المخفض (ج.م / ر.س) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-11 ps-9 text-sm font-mono font-bold"
                      required
                    />
                    <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    السعر القديم قبل الخصم (لخط الشطب)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="اختياري"
                      className="h-11 ps-9 text-sm font-mono"
                    />
                    <Tag className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {discountPercent ? (
                    <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      سيظهر شطب أنيق ونسبة خصم {discountPercent}% تلقائياً!
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Stock & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    رصيد المخزون (الكمية المتاحة)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="h-11 ps-9 text-sm font-mono"
                    />
                    <Layers className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer h-11">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground">
                      ⭐ مميز في صدارة المتجر
                    </span>
                  </label>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer h-11">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground">
                      {isActive ? "🟢 معروض ومتاح للشراء" : "🔴 مخفي من المتجر"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Image URL with quick preview */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  رابط صورة المنتج
                </label>
                <div className="flex gap-2.5 items-center">
                  <div className="w-12 h-12 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                    <img
                      src={imageUrl || "/src/assets/product-1.jpg"}
                      alt={name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... رابط الصورة"
                    className="h-11 text-xs font-mono flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  الوصف التعريفي العام للمنتج
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="نبذة عن المنتج وفوائده..."
                  rows={3}
                  className="rounded-xl text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  طريقة الاستخدام وروتين العناية (How to Use)
                </label>
                <Textarea
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  placeholder="كيفية الاستخدام خطوة بخطوة..."
                  rows={2}
                  className="rounded-xl text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  المكونات الفعالة والنشطة (Key Ingredients)
                </label>
                <Input
                  value={keyIngredients}
                  onChange={(e) => setKeyIngredients(e.target.value)}
                  placeholder="المكونات الطبيعية والفعالة..."
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نوع البشرة المناسب (Skin Types)
                </label>
                <Input
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  placeholder="نوع البشرة المتوافق..."
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === "quality" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <ProductQualityAdvisor
                name={name}
                category={category}
                price={price}
                originalPrice={originalPrice}
                stock={stock}
                imageUrl={imageUrl}
                description={description}
                howToUse={howToUse}
                keyIngredients={keyIngredients}
                skinType={skinType}
              />
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {duplicateProductFn && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicate}
                  disabled={isDuplicating || isSubmitting}
                  className="rounded-xl text-xs gap-1.5"
                  title="إنشاء نسخة من هذا المنتج"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>تكرار المنتج</span>
                </Button>
              )}

              {deleteProductFn && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="rounded-xl text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                  title="حذف المنتج من المتجر"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl h-10 px-4 text-xs font-semibold"
              >
                إلغاء
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl h-10 px-5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ التعديلات...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ التعديلات الآن</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
