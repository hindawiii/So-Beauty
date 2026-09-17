import React, { useState } from "react";
import {
  X,
  PackagePlus,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Info,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "@/lib/mock-products";
import { ProductQualityAdvisor } from "@/components/ProductQualityAdvisor";
import { resolveProductImage } from "@/lib/product-images";

type ProductCategory = Database["public"]["Enums"]["product_category"];

export interface CreateProductPayload {
  name: string;
  category: ProductCategory;
  price: number;
  original_price?: number | null;
  stock: number;
  image_url?: string;
  gallery_images?: string[];
  description?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

interface LuxeAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (newProduct: Product) => void;
  createProductFn: (payload: {
    data: CreateProductPayload;
  }) => Promise<{ ok: boolean; product: Product }>;
}

const CATEGORY_OPTIONS: { key: ProductCategory; label: string; desc: string; icon: string }[] = [
  {
    key: "skincare",
    label: "العناية بالبشرة (Skincare)",
    desc: "سيرومات، غسولات، كريمات مرطبة، ومغذيات",
    icon: "🌿",
  },
  {
    key: "box",
    label: "بوكسات ومجموعات العناية (Care Boxes)",
    desc: "بكجات هدايا ومجموعات روتين العناية الكاملة",
    icon: "🎁",
  },
  {
    key: "offer",
    label: "عروض وتخفيضات حصرية (Special Offers)",
    desc: "عروض الخصم الحصري والتوفير لموسم العناية",
    icon: "🏷️",
  },
  {
    key: "accessory",
    label: "إكسسوارات وملحقات (Accessories)",
    desc: "فرش توزيع، أشرطة شعر، وأدوات تطبيق العناية",
    icon: "✨",
  },
];

const DEFAULT_SAMPLE_IMAGES = [
  { label: "سيروم فيتامين سي", url: "/src/assets/product-1.jpg" },
  { label: "مرطب الهيالورونيك", url: "/src/assets/product-2.jpg" },
  { label: "غسول الوجه المهدئ", url: "/src/assets/product-3.jpg" },
  { label: "بوكس العناية الملكي", url: "/src/assets/product-4.jpg" },
  { label: "واقي الشمس المخملي", url: "/src/assets/product-5.jpg" },
  { label: "مقشر ومجدد البشرة", url: "/src/assets/product-6.jpg" },
];

export function LuxeAddProductModal({
  isOpen,
  onClose,
  onProductCreated,
  createProductFn,
}: LuxeAddProductModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "quality">("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("skincare");
  const [price, setPrice] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("20");
  const [imageUrl, setImageUrl] = useState<string>("/src/assets/product-1.jpg");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState<boolean>(true);

  // Multi-angle gallery state (Optional for merchant)
  const [enableGallery, setEnableGallery] = useState<boolean>(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newAngleUrl, setNewAngleUrl] = useState<string>("");

  // Detailed fields
  const [howToUse, setHowToUse] = useState("");
  const [keyIngredients, setKeyIngredients] = useState("");
  const [skinType, setSkinType] = useState(
    "مناسب لجميع أنواع البشرة (العادية، الجافة، المختلطة، والحساسة)",
  );

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("يرجى كتابة اسم المنتج");
      setActiveTab("basic");
      return;
    }

    if (!numericPrice || numericPrice <= 0) {
      toast.error("يرجى تحديد سعر بيع صحيح للمنتج");
      setActiveTab("basic");
      return;
    }

    try {
      setIsSubmitting(true);

      // Assemble full detailed description if detailed tab has notes
      let fullDescription = description.trim();
      if (howToUse.trim() || keyIngredients.trim() || skinType.trim()) {
        const extraDetails: string[] = [];
        if (howToUse.trim()) extraDetails.push(`📌 طريقة الاستخدام: ${howToUse.trim()}`);
        if (keyIngredients.trim())
          extraDetails.push(`🌿 المكونات الفعالة: ${keyIngredients.trim()}`);
        if (skinType.trim()) extraDetails.push(`✨ نوع البشرة: ${skinType.trim()}`);

        if (extraDetails.length > 0) {
          fullDescription = fullDescription
            ? `${fullDescription}\n\n${extraDetails.join("\n")}`
            : extraDetails.join("\n");
        }
      }

      // Compile gallery images if enabled: Primary image first, followed by extra angles
      const primaryClean = imageUrl.trim() || "/src/assets/product-1.jpg";
      const compiledGallery: string[] | undefined =
        enableGallery && galleryUrls.length > 0
          ? [primaryClean, ...galleryUrls.filter((u) => u !== primaryClean)]
          : undefined;

      const res = await createProductFn({
        data: {
          name: name.trim(),
          category,
          price: numericPrice,
          original_price: numericOriginal,
          stock: Math.max(0, Number(stock) || 0),
          image_url: primaryClean,
          gallery_images: compiledGallery,
          description: fullDescription || "منتج عناية وتجميل فائق الجودة من متجر سو بيوتي.",
          is_featured: isFeatured,
          is_active: true,
        },
      });

      if (res?.ok && res.product) {
        toast.success(`تمت إضافة المنتج "${res.product.name}" بنجاح وتصنيفه في المتجر! 🎉`);
        onProductCreated(res.product);
        onClose();
      } else {
        throw new Error("فشلت استجابة إضافة المنتج");
      }
    } catch (err) {
      console.error("Failed to create product:", err);
      toast.error("حدث خطأ أثناء حفظ المنتج، يرجى المحاولة ثانية");
    } finally {
      setIsSubmitting(false);
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

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border/70 flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                إضافة منتج جديد وتصنيفه
              </h2>
              <p className="text-xs text-muted-foreground">
                حدد فئة العرض والأسعار والمخزون والتفاصيل الدقيقة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
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
            <span>1. بطاقة المنتج والأسعار</span>
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
            <span>2. تفاصيل الروتين والمكونات</span>
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

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {activeTab === "basic" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  اسم المنتج <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: سيروم النياسيناميد والزنك المقاوم للشوائب"
                  className="h-11 rounded-xl text-sm"
                  required
                />
              </div>

              {/* Category Selection */}
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
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                        category === opt.key
                          ? "bg-primary/5 border-primary ring-1 ring-primary"
                          : "bg-card border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground leading-tight">
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prices: Current & Original for line-through */}
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
                      placeholder="مثال: 220"
                      className="h-11 ps-9 text-sm font-mono font-bold"
                      required
                    />
                    <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    هذا هو السعر الفعلي الذي سيحاسب به العميل.
                  </span>
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
                      placeholder="مثال: 300 (اختياري)"
                      className="h-11 ps-9 text-sm font-mono"
                    />
                    <Tag className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {discountPercent ? (
                    <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      سيظهر شطب أنيق ونسبة خصم {discountPercent}% تلقائياً!
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      إذا ترك فارغاً لن يظهر شطب سعر.
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Quantity & Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    الرصيد بالمخزون (الكمية المتاحة)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="مثال: 25"
                      className="h-11 ps-9 text-sm font-mono"
                    />
                    <Layers className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-primary accent-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        تمييز المنتج في صدارة المتجر
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        يظهر في قسم "الأكثر طلباً ومميز" بالصفحة الأولى
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Image Picker */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  رابط صورة المنتج
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... أو مسار الصورة"
                  className="h-11 text-xs font-mono mb-2"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    أو اختاري صورة جاهزة:
                  </span>
                  {DEFAULT_SAMPLE_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border shrink-0 transition-all ${
                        imageUrl === img.url
                          ? "bg-primary text-primary-foreground font-bold border-primary"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
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

                    {/* Presets for angles */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] text-muted-foreground pb-1">
                      <span className="shrink-0">اقتراحات سريعة:</span>
                      {DEFAULT_SAMPLE_IMAGES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!galleryUrls.includes(sample.url)) {
                              setGalleryUrls((prev) => [...prev, sample.url]);
                            }
                          }}
                          className="px-2 py-0.5 rounded border border-border/60 bg-background hover:border-primary shrink-0 transition-colors"
                        >
                          + {sample.label}
                        </button>
                      ))}
                    </div>

                    {/* Gallery Thumbnails List */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>الزوايا المحددة للمنتج ({1 + galleryUrls.length} صور)</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          الصورة 1 هي الصورة الأساسية تلقائياً
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {/* Primary Image Preview */}
                        <div className="relative p-1.5 rounded-xl border border-primary/40 bg-primary/5 flex items-center gap-2">
                          <img
                            src={resolveProductImage(imageUrl || "/src/assets/product-1.jpg")}
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
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  هذه الحقول تنعكس في صفحة المنتج في أقسام الأكورديون الفاخرة (طريقة الاستخدام،
                  المكونات، ونوع البشرة) لتقدم للعميلة تجربة شراء واضحة ومقنعة.
                </p>
              </div>

              {/* General Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  الوصف التعريفي العام للمنتج
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتبي نبذة شيقة عن فوائد المنتج ونتائجه الملموسة..."
                  rows={3}
                  className="rounded-xl text-xs sm:text-sm resize-none"
                />
              </div>

              {/* How to use */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  طريقة الاستخدام وروتين العناية (How to Use)
                </label>
                <Textarea
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  placeholder="مثال: يوضع 3 إلى 4 قطرات على بشرة نظيفة وجافة صباحاً ومساءً قبل الكريم المرطب..."
                  rows={2}
                  className="rounded-xl text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Key Ingredients */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  المكونات الفعالة والنشطة (Key Ingredients)
                </label>
                <Input
                  value={keyIngredients}
                  onChange={(e) => setKeyIngredients(e.target.value)}
                  placeholder="مثال: نياسيناميد 10%، زنك 1%، حمض الهيالورونيك، مستخلص الشاي الأخضر"
                  className="h-11 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Skin Type */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نوع البشرة المناسب (Skin Types)
                </label>
                <Input
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  placeholder="مثال: لجميع أنواع البشرة، خاصة المعرضة للحبوب والمختلطة"
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
          <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeTab !== "quality" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("quality")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>فحص جودة العرض والصورة</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  الرجوع إلى بطاقة المنتج →
                </button>
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
                    <span>جاري الحفظ والتصنيف...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ ونشر المنتج الآن</span>
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
