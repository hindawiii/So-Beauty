import { useState } from "react";
import {
  Store,
  Phone,
  Coins,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  History,
  Image as ImageIcon,
  KeyRound,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useStoreSettings, StoreBrandingSettings } from "@/context/StoreSettingsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function StoreSettingsTab() {
  const {
    settings,
    updateSettings,
    resetToGoldenSnapshot,
    restoreFromManualBackup,
    createManualBackup,
    hasBackup,
  } = useStoreSettings();

  const [formData, setFormData] = useState<StoreBrandingSettings>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleChange = <K extends keyof StoreBrandingSettings>(
    key: K,
    value: StoreBrandingSettings[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    updateSettings(formData);
    setHasUnsavedChanges(false);
    toast.success("تم حفظ إعدادات وهوية المتجر وإنشاء نقطة استعادة احتياطية تلقائياً ✨");
  };

  const handleRestoreGolden = () => {
    if (
      confirm(
        "هل تودين بالتأكيد استعادة نسخة سو بيوتي الأصلية الذهبية (أم درمان — شارع الوادي، روائع العناية)؟",
      )
    ) {
      resetToGoldenSnapshot();
      toast.success("تمت استعادة نسخة سو بيوتي الأصلية بنجاح 🌸");
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const handleRestoreBackup = () => {
    if (confirm("هل تودين التراجع عن آخر تغيير واستعادة النسخة الاحتياطية السابقة؟")) {
      const ok = restoreFromManualBackup();
      if (ok) {
        toast.success("تم التراجع واستعادة النسخة السابقة بنجاح 🔄");
        setTimeout(() => window.location.reload(), 300);
      } else {
        toast.error("لا توجد نسخة احتياطية سابقة محفوظة");
      }
    }
  };

  const handleTakeBackup = () => {
    createManualBackup();
    toast.success("تم إنشاء لقطة نظام احتياطية (Snapshot) يدوياً بنجاح 🛡️");
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-slate-900 text-white">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>مركز المطور لتخصيص وهوية النظام</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Developer Mode Only
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            هذه الشاشة مخصصة لك كمطور ومالك للنظام فقط ولا يمكن للعميل العادي في (/admin) رؤيتها أو
            الوصول إليها. خصّص بيانات المتجر في دقيقتين قبل تسليمه للمشتري، مع ميزة التراجع
            والاستعادة الآمنة بنقرة زر.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleTakeBackup}
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-slate-700 hover:text-slate-900"
            title="حفظ لقطة من الحالة الحالية"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>حفظ نسخة احتياطية</span>
          </Button>

          {hasBackup && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRestoreBackup}
              className="h-10 px-3 rounded-xl text-xs gap-1.5 text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100"
              title="التراجع عن آخر تغيير"
            >
              <History className="w-3.5 h-3.5" />
              <span>تراجع عن التعديل الأخير</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleRestoreGolden}
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-rose-700 border-rose-200 bg-rose-50/40 hover:bg-rose-100"
            title="استعادة إعدادات سو بيوتي الأصلية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة النسخة الذهبية (سو بيوتي)</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`h-10 px-5 rounded-xl text-xs gap-2 font-bold shadow-xs transition-all ${
              hasUnsavedChanges
                ? "bg-slate-900 hover:bg-slate-800 text-white animate-pulse"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>حفظ التعديلات الآن</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Brand Identity & Logo */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-900">1. هوية المتجر واللوجو</h3>
              </div>
              <span className="text-[11px] text-slate-400">يدعم اللوجو النصي أو رابط صورة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  اسم المتجر / العلامة التجارية
                </label>
                <Input
                  value={formData.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  placeholder="مثلاً: سو بيوتي - So Beauty"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  شعار المتجر الفرعي (Tagline)
                </label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="سو بيوتي · عناية طبيعية"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              {/* Logo URL Image Field */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    <span>رابط صورة شعار العميل (اختياري - Logo Image URL)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    اتركيه فارغاً لاستخدام الشعار النصي الفاخر
                  </span>
                </label>
                <Input
                  value={formData.logoUrl || ""}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png (أو اتركه فارغاً)"
                  className="h-10 text-xs rounded-xl text-start font-mono"
                  dir="ltr"
                />
                {formData.logoUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <img
                      src={formData.logoUrl}
                      alt="معاينة الشعار"
                      className="h-8 max-w-[120px] object-contain rounded"
                      onError={() => toast.error("رابط الصورة غير صالح أو غير متاح للمشاهدة")}
                    />
                    <span className="text-[11px] text-slate-500">
                      معاينة فورية للشعار الصوري المُدخل
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  شريط الإعلان العلوي (سطر 1)
                </label>
                <Input
                  value={formData.bannerNotice}
                  onChange={(e) => handleChange("bannerNotice", e.target.value)}
                  placeholder="عناية طبيعية متكاملة بكل تفاصيل بشرتك"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>شريط الإعلان العلوي (سطر 2)</span>
                  <span className="text-[10px] text-slate-400">
                    اتركيه فارغاً ليتقلص الشريط لسطر واحد
                  </span>
                </label>
                <Input
                  value={formData.bannerSubNotice}
                  onChange={(e) => handleChange("bannerSubNotice", e.target.value)}
                  placeholder="من الترطيب إلى النضارة، اكتشفي ما يلائمكِ بعناية."
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>الرمز / الأيقونة الملائمة للإعلان</span>
                  <span className="text-[10px] text-emerald-700">تتكيف تلقائياً مع نوع العرض</span>
                </label>
                <select
                  value={formData.bannerIcon || "sparkles"}
                  onChange={(e) =>
                    handleChange(
                      "bannerIcon",
                      e.target.value as StoreBrandingSettings["bannerIcon"],
                    )
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-background text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="sparkles">
                    ✨ بريق وفخامة (Sparkles - مناسب للجمال والعناية والعطور)
                  </option>
                  <option value="gift">
                    🎁 هدية وعروض ترويجية (Gift - مناسب للخصومات والبكجات)
                  </option>
                  <option value="truck">
                    🚚 شحن وتوصيل فوري (Truck - لإعلانات الشحن السريع والمجاني)
                  </option>
                  <option value="crown">
                    👑 فخامة ملكية (Crown - للملابس الراقية والبراندات الفاخرة)
                  </option>
                  <option value="shield">
                    🛡️ ضمان وجودة أصلية 100% (Shield - مناسب للأجهزة والإلكترونيات)
                  </option>
                  <option value="quote">💬 اقتباس ورسالة خاصة ("نص" - Quote)</option>
                  <option value="none">بدون أيقونة (نص فقط)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  عنوان نبذة المتجر بالفوتر
                </label>
                <Input
                  value={formData.aboutTitle}
                  onChange={(e) => handleChange("aboutTitle", e.target.value)}
                  placeholder="روائع العناية"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  نص نبذة المتجر بالفوتر
                </label>
                <Input
                  value={formData.aboutDescription}
                  onChange={(e) => handleChange("aboutDescription", e.target.value)}
                  placeholder="نسعى لتقديم أفضل منتجات العناية الطبيعية..."
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact & WhatsApp Commerce */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Phone className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                2. إعدادات استقبال الطلبات والواتساب التجاري
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>رقم الواتساب التجاري لتلقي الطلبات</span>
                  <span className="text-[10px] text-emerald-700 font-mono">بدون + أو مسافات</span>
                </label>
                <Input
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="249900776688"
                  className="h-10 text-xs font-mono rounded-xl text-start"
                  dir="ltr"
                />
                <p className="text-[11px] text-slate-400">
                  تصل عليه فوراً فواتير الشراء المباشرة ومحادثات العملاء.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  هاتف خدمة العملاء المعروض بالموقع
                </label>
                <Input
                  value={formData.supportPhone}
                  onChange={(e) => handleChange("supportPhone", e.target.value)}
                  placeholder="+249 900 776 688"
                  className="h-10 text-xs rounded-xl"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  البريد الإلكتروني للدعم
                </label>
                <Input
                  value={formData.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  placeholder="sobeauty.one@gmail.com"
                  className="h-10 text-xs rounded-xl"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  العنوان ومقر المستودع
                </label>
                <Input
                  value={formData.storeAddress}
                  onChange={(e) => handleChange("storeAddress", e.target.value)}
                  placeholder="أم درمان — شارع الوادي"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Shipping & Currency Rules */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Coins className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">
                3. العملة الافتراضية ورسوم وسياسات التوصيل
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  العملة الافتراضية للمتجر
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) =>
                    handleChange(
                      "defaultCurrency",
                      e.target.value as StoreBrandingSettings["defaultCurrency"],
                    )
                  }
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-background text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="SDG">جنيه سوداني (ج.س / SDG)</option>
                  <option value="EGP">جنيه مصري (ج.م / EGP)</option>
                  <option value="SAR">ريال سعودي (ر.س / SAR)</option>
                  <option value="AED">درهم إماراتي (د.إ / AED)</option>
                  <option value="USD">دولار أمريكي ($ / USD)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  رسوم التوصيل القياسية
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.deliveryFee}
                  onChange={(e) => handleChange("deliveryFee", Number(e.target.value) || 0)}
                  className="h-10 text-xs font-mono rounded-xl"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  حد التوصيل المجاني (قيمة السلة المؤهلة للشحن المجاني)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.freeShippingThreshold}
                  onChange={(e) =>
                    handleChange("freeShippingThreshold", Number(e.target.value) || 0)
                  }
                  className="h-10 text-xs font-mono rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Client PIN & Niche Presets */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-900">
                4. رمز مرور لوحة العميل المشتري (/admin) والقوالب السريعة
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  رمز الدخول الخاص بالعميل المشتري
                </label>
                <Input
                  value={formData.adminPin}
                  onChange={(e) => handleChange("adminPin", e.target.value)}
                  placeholder="2026"
                  maxLength={6}
                  className="h-10 text-xs font-mono rounded-xl text-start"
                  dir="ltr"
                />
                <p className="text-[11px] text-slate-400">
                  هذا هو الرمز الذي ستسلمه للعميل ليفتح به صفحته على /admin فقط.
                </p>
              </div>

              {/* Quick Niche Presets */}
              <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">
                  🚀 تحويل نشاط المتجر بنقرة زر واحدة (Business Niche Presets):
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        storeName: "بوتيك الأناقة - Elegance Boutique",
                        tagline: "أرقى صيحات الأزياء والملابس الفاخرة",
                        bannerNotice:
                          "تشكيلة الموسم الجديد متوفرة الآن | توصيل سريع لباب المنزل 👗",
                        bannerSubNotice: "أناقة يومية تناسب ذوقك الرفيع. تسوقي الآن",
                        aboutTitle: "عالم الأناقة",
                        aboutDescription:
                          "نقدم لكم أرقى تشكيلات الأزياء العصرية بأعلى معايير الجودة وأفضل الأسعار.",
                        logoUrl: "",
                      }));
                      setHasUnsavedChanges(true);
                      toast.info("تم اختيار قالب متجر الملابس والأزياء 👗");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/50 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    👗 متجر ملابس وأزياء
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        storeName: "تكنو زون - TechnoZone",
                        tagline: "أحدث الإلكترونيات والهواتف الذكية والإكسسوارات الأصلية",
                        bannerNotice: "ضمان حقيقي لمدة عام على جميع الأجهزة الإلكترونية 📱",
                        bannerSubNotice: "أفضل الهواتف والأجهزة الأصلية مع شحن آمن وسريع.",
                        aboutTitle: "عالم التكنولوجيا",
                        aboutDescription:
                          "وجهتكم الأولى للإلكترونيات والأجهزة الذكية الأصلية مع ضمان شامل وخدمة ما بعد البيع.",
                        logoUrl: "",
                      }));
                      setHasUnsavedChanges(true);
                      toast.info("تم اختيار قالب متجر الإلكترونيات والهواتف 📱");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/50 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    📱 متجر إلكترونيات وهواتف
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        storeName: "روائح الشرق - Oud & Perfumes",
                        tagline: "أفخم العطور الفرنسية والشرقية والعود الأصلي",
                        bannerNotice: "ثبات وفخامة تدوم طويلاً | عينات مجانية مع كل طلب ✨",
                        bannerSubNotice: "روائح تأسر الحواس وتمنحك حضوراً لا ينسى.",
                        aboutTitle: "روائع العطور",
                        aboutDescription:
                          "نصنع لكم تجربة عطرية لا تضاهى تجمع بين أصالة العود الشرقي وأرقى العطور العالمية.",
                        logoUrl: "",
                      }));
                      setHasUnsavedChanges(true);
                      toast.info("تم اختيار قالب متجر العطور والبخور ✨");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/50 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    ✨ متجر عطور وبخور
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        storeName: "سو بيوتي - So Beauty",
                        tagline: "سو بيوتي · عناية طبيعية",
                        bannerNotice: "عناية طبيعية متكاملة بكل تفاصيل بشرتك",
                        bannerSubNotice:
                          "من الترطيب إلى النضارة، اكتشفي ما يلائمكِ بعناية. تسوّقي الآن",
                        aboutTitle: "روائع العناية",
                        aboutDescription:
                          "نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع منتجاتنا أصلية بنسبة 100%.",
                        storeAddress: "أم درمان — شارع الوادي",
                        supportPhone: "+249 900 776 688",
                        supportEmail: "sobeauty.one@gmail.com",
                        logoUrl: "",
                      }));
                      setHasUnsavedChanges(true);
                      toast.info("تمت استعادة قالب سو بيوتي الأصلي 🌸");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/50 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    🌸 متجر سو بيوتي الأصلي
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview / Client Delivery Sheet (1 Col) */}
        <div className="space-y-6">
          {/* Live Mock Card */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>معاينة حية لهوية العميل</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                جاهز للتسليم
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-3">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-10 w-auto object-contain rounded"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {formData.storeName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{formData.storeName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{formData.tagline}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1.5 text-slate-600">
                <p className="flex items-center justify-between">
                  <span>واتساب الطلبات:</span>
                  <span className="font-mono text-emerald-700 font-bold" dir="ltr">
                    +{formData.whatsappNumber}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span>العنوان المعتمد:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[150px]">
                    {formData.storeAddress}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span>العملة الأساسية:</span>
                  <span className="font-bold text-slate-800">{formData.defaultCurrency}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>رمز مرور العميل:</span>
                  <span className="font-mono font-bold text-slate-800">{formData.adminPin}</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 بمجرد الضغط على "حفظ التعديلات"، يتم تحديث المتجر وعناوين الطلبات فوراً بدون الحاجة
              لإعادة البناء البرمجي.
            </p>
          </div>

          {/* Handover Security Advice */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs text-white">
                قواعد تسليم المتجر بأمان (Developer Rules)
              </h4>
            </div>

            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>أعطِ العميل رابط (/admin) فقط ليدير منتجاته وطلباته.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>أعطه الرمز ({formData.adminPin}) المحدد له أعلاه.</span>
              </li>
              <li className="flex items-start gap-2 text-rose-300">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>رابط (/developer) احتفظ به لنفسك ولا تشاركه مع أي عميل نهائياً.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-700/60">
              <Link
                to="/admin"
                className="flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <span>معاينة لوحة تحكم العميل (/admin)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
