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
  Plus,
  Image as ImageIcon,
  Loader2,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "@/lib/mock-products";
import { ProductQualityAdvisor } from "@/components/ProductQualityAdvisor";
import { resolveProductImage, extractProductGallery } from "@/lib/product-images";
import { extractProductI18n } from "@/lib/product-localization";
import { adminTranslateProductAi } from "@/lib/gemini-translate.functions";

type ProductCategory = Database["public"]["Enums"]["product_category"];

export interface UpdateProductPayload {
  id: string;
  name: string;
  name_en?: string | null;
  category: ProductCategory;
  price: number;
  original_price?: number | null;
  stock: number;
  image_url?: string;
  gallery_images?: string[];
  description?: string;
  description_en?: string | null;
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
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState<ProductCategory>("skincare");
  const [price, setPrice] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("0");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Multi-angle gallery state (Optional for merchant)
  const [enableGallery, setEnableGallery] = useState<boolean>(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newAngleUrl, setNewAngleUrl] = useState<string>("");

  // Extracted details
  const [howToUse, setHowToUse] = useState("");
  const [keyIngredients, setKeyIngredients] = useState("");
  const [skinType, setSkinType] = useState("");

  // Sync state whenever product changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      const i18n = extractProductI18n(product);
      setNameEn(product.name_en || i18n.name_en || "");
      setDescriptionEn(product.description_en || i18n.description_en || "");
      setCategory(product.category || "skincare");
      setPrice(String(product.price || ""));
      setOriginalPrice(product.original_price ? String(product.original_price) : "");
      setStock(String(product.stock ?? 0));
      setImageUrl(product.image_url || "");
      setIsFeatured(Boolean(product.is_featured));
      setIsActive(product.is_active !== false);

      // Extract existing multi-angles if any
      const existingGallery = extractProductGallery(product);
      if (existingGallery.length > 1) {
        setEnableGallery(true);
        // Exclude the primary image which is already set in imageUrl
        const extraAngles = existingGallery.slice(1);
        setGalleryUrls(extraAngles);
      } else {
        setEnableGallery(false);
        setGalleryUrls([]);
      }
      setNewAngleUrl("");

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

  const handleAiTranslate = async () => {
    const inputName = name.trim() || nameEn.trim();
    if (!inputName) {
      toast.error("يرجى التأكد من وجود اسم للمنتج أولاً للبدء في الترجمة والتوليد الذكي ✨");
      return;
    }

    try {
      setIsTranslating(true);
      const adminPin =
        typeof window !== "undefined"
          ? localStorage.getItem("so_admin_pin") || undefined
          : undefined;

      const res = await adminTranslateProductAi({
        data: {
          name: inputName,
          description: description.trim() || descriptionEn.trim() || undefined,
          category,
          howToUse: howToUse.trim() || undefined,
          keyIngredients: keyIngredients.trim() || undefined,
          adminPin,
        },
      });

      if (res?.ok) {
        if (res.name_ar && !name.trim()) setName(res.name_ar);
        if (res.name_en) setNameEn(res.name_en);
        if (res.description_ar && !description.trim()) setDescription(res.description_ar);
        if (res.description_en) setDescriptionEn(res.description_en);
        if (res.how_to_use_ar && !howToUse.trim()) setHowToUse(res.how_to_use_ar);
        if (res.key_ingredients_ar && !keyIngredients.trim()) {
          setKeyIngredients(res.key_ingredients_ar);
        }

        toast.success(
          res.source === "gemini"
            ? "✨ تم توليد وترجمة تفاصيل المنتج باللغتين عبر Gemini AI بنجاح!"
            : "✨ تمت صياغة وترجمة تفاصيل المنتج باللغتين بنجاح!",
        );
      }
    } catch (err) {
      console.error("AI translate error:", err);
      const msg =
        err instanceof Error ? err.message : "حدث خطأ أثناء الترجمة الذكية، يرجى المحاولة ثانية";
      toast.error(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isOpen || !product) return null;

  const numericPrice = Number(price) || 0;
  const numericOriginal = originalPrice ? Number(originalPrice) : null;
  const discountPercent =
    numericOriginal && numericOriginal > numericPrice && numericPrice > 0
      ? Math.round(((numericOriginal - numericPrice) / numericOriginal) * 100)
      : null;

  const handleAddAngle = () => {
    if (!newAngleUrl.trim()) return;
    const url = newAngleUrl.trim();
    if (!galleryUrls.includes(url)) {
      setGalleryUrls((prev) => [...prev, url]);
    }
    setNewAngleUrl("");
  };

  const handleRemoveAngle = (indexToRemove: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

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

      // Compile gallery images: Primary image first, followed by extra angles
      const primaryClean = imageUrl.trim() || product.image_url;
      const compiledGallery: string[] | undefined =
        enableGallery && galleryUrls.length > 0
          ? [primaryClean, ...galleryUrls.filter((u) => u !== primaryClean)]
          : undefined;

      const res = await updateProductFn({
        data: {
          id: product.id,
          name: name.trim(),
          name_en: nameEn.trim() || undefined,
          category,
          price: numericPrice,
          original_price: numericOriginal,
          stock: Math.max(0, Number(stock) || 0),
          image_url: primaryClean,
          gallery_images: compiledGallery,
          description: fullDescription,
          description_en: descriptionEn.trim() || undefined,
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
              {/* AI Smart Translation & Localization Assistant */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground">
                        مساعد الترجمة والتوطين الذكي
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                        Gemini AI
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ترجمة وصياغة الاسم والوصف باللغتين العربية والإنجليزية تلقائياً بدقة
                      واحترافية.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isTranslating || (!name.trim() && !nameEn.trim())}
                  onClick={handleAiTranslate}
                  className="h-9 px-3.5 shrink-0 rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التوليد والترجمة...</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-3.5 h-3.5" />
                      <span>ترجمة ذكية للمنتج ✨</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Product Names: Arabic & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                    <span>
                      اسم المنتج (بالعربية) <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Arabic Name
                    </span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                    <span>الاسم بالإنجليزية (English Name)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      اختياري / AI
                    </span>
                  </label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Pure Vitamin C Illuminating Serum"
                    className="h-11 rounded-xl text-sm font-sans"
                    dir="ltr"
                  />
                </div>
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

              {/* Multi-angle Gallery Options (Completely optional for merchant) */}
              <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        تفعيل معرض الزوايا المتعددة للمنتج (اختياري)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        إذا لم يتم تفعيله، سيظهر المنتج بصورته الأساسية فقط بدون أي أسهم أو تشتيت
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGallery}
                      onChange={(e) => setEnableGallery(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary" />
                  </label>
                </div>

                {enableGallery && (
                  <div className="pt-2 border-t border-border/60 space-y-3 animate-in fade-in duration-200">
                    <div className="flex gap-2">
                      <Input
                        value={newAngleUrl}
                        onChange={(e) => setNewAngleUrl(e.target.value)}
                        placeholder="أدخل رابط زاوية إضافية (قوام المنتج، العبوة الخلفية...)"
                        className="h-10 text-xs font-mono flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAngle();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddAngle}
                        className="h-10 px-3 shrink-0 gap-1 text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة زاوية</span>
                      </Button>
                    </div>

                    {/* Gallery Thumbnails List */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>الزوايا المحددة للمنتج ({1 + galleryUrls.length} صور)</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          الصورة 1 هي الواجهة الأساسية
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {/* Primary Image Preview */}
                        <div className="relative p-1.5 rounded-xl border border-primary/40 bg-primary/5 flex items-center gap-2">
                          <img
                            src={resolveProductImage(imageUrl || product.image_url)}
                            alt="الزاوية الأساسية"
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-primary block truncate">
                              الأساسية
                            </span>
                            <span className="text-[9px] text-muted-foreground block">
                              الواجهة الرئيسية
                            </span>
                          </div>
                        </div>

                        {/* Extra Angles */}
                        {galleryUrls.map((angleUrl, idx) => (
                          <div
                            key={idx}
                            className="relative p-1.5 rounded-xl border border-border/70 bg-card flex items-center gap-2 group"
                          >
                            <img
                              src={resolveProductImage(angleUrl)}
                              alt={`زاوية ${idx + 2}`}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-foreground block truncate">
                                زاوية {idx + 2}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAngle(idx)}
                              className="w-6 h-6 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center shrink-0 transition-colors"
                              title="حذف الزاوية"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* General Description: Arabic & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                    <span>الوصف التعريفي (بالعربية)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Arabic</span>
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
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                    <span>الوصف بالإنجليزية (English Description)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      English / AI
                    </span>
                  </label>
                  <Textarea
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="English description or auto-translate with Gemini AI..."
                    rows={3}
                    className="rounded-xl text-xs sm:text-sm resize-none font-sans"
                    dir="ltr"
                  />
                </div>
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
