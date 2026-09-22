import React, { useState } from "react";
import {
  Globe2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Languages,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileText,
  Package,
  Layers,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Product } from "@/lib/mock-products";
import { useServerFn } from "@tanstack/react-start";
import {
  adminBulkTranslateProductsAi,
  adminTranslateTextAi,
  BulkTranslateResult,
} from "@/lib/gemini-translate.functions";
import { useStoreSettings } from "@/context/StoreSettingsContext";

interface AdminLocalizationStudioTabProps {
  products: Product[];
  onProductsUpdated: (updatedProducts: Product[]) => void;
  adminPin?: string;
}

export function AdminLocalizationStudioTab({
  products,
  onProductsUpdated,
  adminPin,
}: AdminLocalizationStudioTabProps) {
  const { settings, updateSettings } = useStoreSettings();

  const bulkTranslateFn = useServerFn(adminBulkTranslateProductsAi);
  const translateTextFn = useServerFn(adminTranslateTextAi);

  // Bulk Product Translation State
  const [isTranslatingProducts, setIsTranslatingProducts] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });

  // Store Notices Quick Translation State
  const [isTranslatingNotice, setIsTranslatingNotice] = useState(false);
  const [translatedBannerNotice, setTranslatedBannerNotice] = useState<string>("");
  const [translatedBannerSubNotice, setTranslatedBannerSubNotice] = useState<string>("");

  // Free-form AI Text Translator Playground
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState<"ar" | "en">("en");
  const [isTranslatingCustomText, setIsTranslatingCustomText] = useState(false);
  const [customTranslationResult, setCustomTranslationResult] = useState<string>("");
  const [hasCopiedText, setHasCopiedText] = useState(false);

  // Products Localization Stats
  const localizedProductsCount = products.filter((p) => Boolean(p.name_en?.trim())).length;
  const missingProducts = products.filter((p) => !p.name_en?.trim());
  const percentLocalized =
    products.length > 0 ? Math.round((localizedProductsCount / products.length) * 100) : 100;

  // 1. Bulk Translate Missing Products
  const handleBulkTranslateProducts = async () => {
    if (products.length === 0) {
      toast.info("لا توجد منتجات مسجلة في المتجر لترجمتها.");
      return;
    }

    const itemsToTranslate = missingProducts.length > 0 ? missingProducts : products;

    try {
      setIsTranslatingProducts(true);
      setTranslationProgress({ completed: 0, total: itemsToTranslate.length });

      toast.info(`جارِ تشغيل الذكاء الاصطناعي لترجمة ${itemsToTranslate.length} منتج...`, {
        duration: 4000,
      });

      // Split into batches of 8 for optimal responsiveness & high-quality LLM prompts
      const BATCH_SIZE = 8;
      const allResults: BulkTranslateResult[] = [];

      for (let i = 0; i < itemsToTranslate.length; i += BATCH_SIZE) {
        const chunk = itemsToTranslate.slice(i, i + BATCH_SIZE);
        const res = await bulkTranslateFn({
          data: {
            products: chunk.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description || undefined,
              category: p.category,
            })),
            adminPin,
          },
        });

        if (res && res.results) {
          allResults.push(...res.results);
        }

        setTranslationProgress({
          completed: Math.min(i + chunk.length, itemsToTranslate.length),
          total: itemsToTranslate.length,
        });
      }

      // Merge translations back into existing products array
      const resultsMap = new Map(allResults.map((r) => [r.id, r]));
      const updatedList = products.map((prod) => {
        const found = resultsMap.get(prod.id);
        if (found) {
          return {
            ...prod,
            name_en: found.name_en,
            description_en: found.description_en || prod.description_en,
          };
        }
        return prod;
      });

      onProductsUpdated(updatedList);
      toast.success(
        `اكتملت الترجمة الفورية بالذكاء الاصطناعي بنجاح! تمت إضافة العناوين والأوصاف الإنجليزية الفاخرة لـ ${allResults.length} منتج. ✨`,
        { duration: 6000 },
      );
    } catch (err: unknown) {
      console.error("Bulk translate error:", err);
      toast.error("حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي، يرجى المحاولة لاحقاً.");
    } finally {
      setIsTranslatingProducts(false);
      setTranslationProgress({ completed: 0, total: 0 });
    }
  };

  // 2. Translate Top Banner Announcement
  const handleTranslateNoticeAi = async () => {
    const rawNotice = settings.bannerNotice || "";
    const rawSubNotice = settings.bannerSubNotice || "";

    if (!rawNotice.trim() && !rawSubNotice.trim()) {
      toast.warning("يرجى التأكد من وجود نص إعلاني عربي في إعدادات الهوية أولاً.");
      return;
    }

    try {
      setIsTranslatingNotice(true);
      toast.info("جارِ صياغة النسخة الإنجليزية الترويجية بالذكاء الاصطناعي...");

      let enNotice = "";
      let enSubNotice = "";

      if (rawNotice.trim()) {
        const res1 = await translateTextFn({
          data: {
            text: rawNotice,
            targetLang: "en",
            context: "announcement",
            adminPin,
          },
        });
        enNotice = res1.translatedText;
      }

      if (rawSubNotice.trim()) {
        const res2 = await translateTextFn({
          data: {
            text: rawSubNotice,
            targetLang: "en",
            context: "announcement",
            adminPin,
          },
        });
        enSubNotice = res2.translatedText;
      }

      setTranslatedBannerNotice(enNotice);
      setTranslatedBannerSubNotice(enSubNotice);
      toast.success("تم توليد الصياغة الإنجليزية الترويجية بنجاح!");
    } catch (err) {
      console.error(err);
      toast.error("تعذر ترجمة نصوص الإعلان.");
    } finally {
      setIsTranslatingNotice(false);
    }
  };

  // 3. Free-Form Text Translator
  const handleTranslateCustomText = async () => {
    if (!sourceText.trim()) {
      toast.warning("يرجى إدخال نص لترجمته.");
      return;
    }

    try {
      setIsTranslatingCustomText(true);
      const res = await translateTextFn({
        data: {
          text: sourceText,
          targetLang,
          context: "marketing",
          adminPin,
        },
      });

      setCustomTranslationResult(res.translatedText);
      toast.success(
        res.source === "gemini"
          ? "تمت الترجمة التسويقية بواسطة Gemini بنجاح! ✨"
          : "تمت الترجمة السريعة بنجاح.",
      );
    } catch (err) {
      console.error(err);
      toast.error("فشل تنفيذ الترجمة الذكية.");
    } finally {
      setIsTranslatingCustomText(false);
    }
  };

  const copyCustomResult = () => {
    if (!customTranslationResult) return;
    navigator.clipboard.writeText(customTranslationResult);
    setHasCopiedText(true);
    toast.success("تم نسخ النص المترجم إلى الحافظة!");
    setTimeout(() => setHasCopiedText(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Luxe Hero Card */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>نظام التوطين والترجمة الفورية بضغطة زر (AI Localization)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              توطين متجر سو بيوتي بذكاء Google Gemini
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تحويل كتالوج المنتجات والإعلانات الترويجية من العربية إلى الإنجليزية التجارية الفاخرة
              بأسلوب احترافي يجذب المستثمرين والعملاء متعددي الجنسيات مع دعم كامل للاتجاهين (RTL /
              LTR).
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-300 font-medium">جاهزية التوطين العالمي</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-white">{percentLocalized}%</span>
                <span className="text-xs text-emerald-400 font-bold">
                  ({localizedProductsCount}/{products.length} منتج)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Main Powerful Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Col 1-7: Bulk Product Catalog AI Translation */}
        <div className="lg:col-span-7 bg-card border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    ترجمة كتالوج المنتجات بالكامل بضغطة زر
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    صياغة الأسماء والأوصاف الإنجليزية الفاخرة لجميع منتجات المتجر دفعة واحدة
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 shrink-0">
                AI Batch Engine
              </span>
            </div>

            {/* Status Visual Box */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 my-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600 dark:text-slate-300">
                  حالة الكتالوج الحالي: {localizedProductsCount} منتج مترجم من أصل {products.length}
                </span>
                <span className="text-primary font-bold">{percentLocalized}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-linear-to-r from-emerald-500 to-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentLocalized}%` }}
                />
              </div>

              {missingProducts.length > 0 ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    يوجد {missingProducts.length} منتج بحاجة إلى ترجمة إنجليزية فورية للعرض الدولي.
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    جميع المنتجات في الكتالوج مترجمة بالكامل وجاهزة للمستثمرين والمتسوقين!
                  </span>
                </div>
              )}
            </div>

            {/* List preview of products to be translated */}
            <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pe-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                معاينة عينة من المنتجات في النظام:
              </p>
              {products.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image_url || "/placeholder.jpg"}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {p.name_en ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            EN: {p.name_en}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-medium">
                            بانتظار الصياغة الإنجليزية
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      p.name_en
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {p.name_en ? "مترجم ✓" : "بحاجة للترجمة"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleBulkTranslateProducts}
              disabled={isTranslatingProducts || products.length === 0}
              className="w-full h-12 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm gap-2 shadow-sm cursor-pointer"
            >
              {isTranslatingProducts ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    جارِ الترجمة الدُفعية ({translationProgress.completed}/
                    {translationProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {missingProducts.length > 0
                      ? `ترجمة المنتجات المتبقية (${missingProducts.length}) بالذكاء الاصطناعي`
                      : "إعادة تحسين وتحديث ترجمات الكتالوج بالكامل"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right/Col 8-12: Free-form AI Copywriting & Marketing Translator */}
        <div className="lg:col-span-5 bg-card border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    مترجم النصوص التسويقية الفاخر
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أداة ذكية لصياغة الإعلانات، الشروط، وتدوينات العناية
                  </p>
                </div>
              </div>
            </div>

            {/* Language Direction Toggle */}
            <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => setTargetLang("en")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  targetLang === "en"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                العربية ← English (الترجمة للإنجليزية)
              </button>
              <button
                type="button"
                onClick={() => setTargetLang("ar")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  targetLang === "ar"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                English ← العربية (التعريب التجاري)
              </button>
            </div>

            {/* Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                النص الأصلي المراد ترجمته:
              </label>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={
                  targetLang === "en"
                    ? "اكتب مثلاً: خصم 30% على بوكسات العناية الملكية بمناسبة الشهر الفضيل..."
                    : "Enter marketing text: Luxury antioxidant facial serum for glowing, youthful skin..."
                }
                rows={3}
                className="text-xs rounded-xl resize-none"
              />
            </div>

            {/* Result Box */}
            {customTranslationResult && (
              <div className="mt-4 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>النتيجة المصاغة بأسلوب تجميلي راقٍ:</span>
                  </span>
                  <button
                    type="button"
                    onClick={copyCustomResult}
                    className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                  >
                    {hasCopiedText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
                <p
                  className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed"
                  dir={targetLang === "ar" ? "rtl" : "ltr"}
                >
                  {customTranslationResult}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleTranslateCustomText}
              disabled={isTranslatingCustomText || !sourceText.trim()}
              className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              {isTranslatingCustomText ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارِ الترجمة والتوطين التسويقي...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>ترجمة النص الآن بذكاء الاصطناعي</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Notice & Branding Quick Translation Card */}
      <div className="bg-card border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                ترجمة الشريط الترويجي وإعلانات المتجر (Top Promo Banner)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توليد النسخة الإنجليزية للإعلانات التي تظهر أعلى الموقع للزوار الأجانب
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleTranslateNoticeAi}
            disabled={isTranslatingNotice}
            className="h-10 px-4 rounded-xl text-xs gap-1.5 font-bold cursor-pointer"
          >
            {isTranslatingNotice ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>توليد الترجمة الإنجليزية للشريط الترويجي</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Arabic Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              النص العربي الحالي (في الشريط العلوي):
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {settings.bannerNotice || "شحن سريع ومجاني داخل الخرطوم والولايات"}
            </p>
            {settings.bannerSubNotice && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                السطر الفرعي: {settings.bannerSubNotice}
              </p>
            )}
          </div>

          {/* Generated English Preview */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-2">
            <span className="font-bold text-indigo-900 dark:text-indigo-300">
              النسخة الإنجليزية الترويجية (English Banner):
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200" dir="ltr">
              {translatedBannerNotice ||
                "🌸 Fast & Secure Delivery across Sudan | 100% Authentic Luxury Cosmetics"}
            </p>
            {translatedBannerSubNotice && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400" dir="ltr">
                Sub-notice: {translatedBannerSubNotice}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
