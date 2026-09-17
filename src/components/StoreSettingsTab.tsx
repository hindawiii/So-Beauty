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
  Palette,
  Type,
  LayoutTemplate,
  Dices,
  Download,
  Upload,
  Copy,
  MousePointerClick,
  Trash2,
  Lock,
  Flame,
} from "lucide-react";
import { useStoreSettings, StoreBrandingSettings } from "@/context/StoreSettingsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
  CURATED_COLOR_PALETTES,
  CURATED_TYPOGRAPHY_PAIRS,
  hexToOklch,
  generateRandomHarmoniousPalette,
} from "@/lib/harmonyEngine";
import { PRESET_BLUEPRINTS, StoreBlueprint } from "@/lib/blueprintsVault";
import { downloadSanitizedConfigFile } from "@/lib/sanitization-shield";

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
  const [customHexInput, setCustomHexInput] = useState("");
  const [blueprintJsonInput, setBlueprintJsonInput] = useState("");
  const [customVault, setCustomVault] = useState<StoreBlueprint[]>(() => {
    if (typeof window === "undefined") return PRESET_BLUEPRINTS;
    try {
      const saved = localStorage.getItem("luxe_saved_blueprints_vault");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse saved blueprints vault:", e);
    }
    return PRESET_BLUEPRINTS;
  });

  // Sync formData when external settings (like adminPin updated from AdminPinManagerCard) change
  useEffect(() => {
    setFormData((prev) => {
      // Keep user's dirty edits while safely syncing adminPin and external properties
      if (hasUnsavedChanges) {
        return {
          ...prev,
          adminPin: settings.adminPin,
        };
      }
      return settings;
    });
  }, [settings, hasUnsavedChanges]);

  const handleChange = <K extends keyof StoreBrandingSettings>(
    key: K,
    value: StoreBrandingSettings[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleApplyPalette = (hex: string, oklch: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      themeColorHex: hex,
      themeColorOklch: oklch,
    }));
    setHasUnsavedChanges(true);
    toast.success(`تم تطبيق لوحة ألوان: ${name} ✨`);
  };

  const handleRandomPalette = () => {
    const pal = generateRandomHarmoniousPalette();
    handleApplyPalette(pal.primaryHex, pal.primaryOklch, pal.name);
  };

  const handleApplyCustomHex = () => {
    if (!customHexInput.trim()) return;
    let hex = customHexInput.trim();
    if (!hex.startsWith("#")) hex = `#${hex}`;
    const oklch = hexToOklch(hex);
    handleApplyPalette(hex, oklch, `مخصصة (${hex})`);
    setCustomHexInput("");
  };

  const handleApplyBlueprint = (bp: StoreBlueprint) => {
    setFormData((prev) => ({
      ...prev,
      ...bp.settings,
    }));
    setHasUnsavedChanges(true);
    toast.success(`تم تطبيق ${bp.name} بنجاح! 🚀`);
  };

  const handleSaveToVault = () => {
    const name = prompt("اكتب اسماً لهذا القالب الناجح لحفظه في خزينة القوالب المعتمدة:");
    if (!name) return;
    const newBp: StoreBlueprint = {
      id: `bp_${Date.now()}`,
      name: `⭐ ${name}`,
      niche: "custom",
      description: `قالب مخصص تم حفظه واعتماده بنجاح في ${new Date().toLocaleDateString("ar-EG")}`,
      createdAt: new Date().toISOString(),
      settings: { ...formData },
    };
    const updated = [newBp, ...customVault];
    setCustomVault(updated);
    try {
      localStorage.setItem("luxe_saved_blueprints_vault", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to blueprints vault:", e);
    }
    toast.success("تم حفظ القالب بنجاح في خزينة القوالب المعتمدة! 💾");
  };

  const handleExportBlueprint = () => {
    const payload = JSON.stringify(formData, null, 2);
    navigator.clipboard.writeText(payload);
    toast.success("تم نسخ كود الهيكل الحالي (JSON Blueprint) إلى الحافظة بنجاح 📋");
  };

  const handleImportBlueprint = () => {
    try {
      if (!blueprintJsonInput.trim()) {
        toast.error("يرجى لصق كود الهيكل JSON في الخانة أولاً");
        return;
      }
      const parsed = JSON.parse(blueprintJsonInput.trim());
      setFormData((prev) => ({ ...prev, ...parsed }));
      setHasUnsavedChanges(true);
      setBlueprintJsonInput("");
      toast.success("تم استيراد وتطبيق كود الهيكل بنجاح! 🚀");
    } catch (e) {
      toast.error("كود الهيكل غير صالح. تأكد من نسخ كود JSON بصيغة صحيحة.");
    }
  };

  const handleSave = () => {
    // Ensure the latest adminPin is always preserved so saving branding doesn't accidentally overwrite it
    updateSettings({
      ...formData,
      adminPin: settings.adminPin || formData.adminPin,
    });
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

          {/* Admin PIN Management Card */}
          <AdminPinManagerCard variant="developer" />

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

          {/* Card 4: Smart Color Harmonizer Engine */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-900">
                  4. محرك منظومة الألوان المتجانسة وتوليد الألوان الفاخرة
                </h3>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleRandomPalette}
                className="h-8 px-3 rounded-lg text-xs gap-1.5 bg-primary text-primary-foreground hover:opacity-90 font-bold"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>🎲 توليد ألوان متجانسة تلقائياً</span>
              </Button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              اختر لوحة ألوان جاهزة لمعايير النشاط أو اضغط على زر التوليد الرياضي الذكي لحساب تناغم
              لوني فوري متوافق مع معايير القراءة العالمية.
            </p>

            {/* Curated Palettes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CURATED_COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => handleApplyPalette(pal.primaryHex, pal.primaryOklch, pal.name)}
                  className={`p-3 rounded-xl border text-start transition-all hover:shadow-xs flex flex-col justify-between ${
                    formData.themeColorHex === pal.primaryHex
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-xs"
                      style={{ background: pal.primaryHex }}
                    />
                    <span className="text-xs font-bold text-slate-900 truncate">{pal.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {pal.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Paste Custom Hex Input */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={customHexInput}
                  onChange={(e) => setCustomHexInput(e.target.value)}
                  placeholder="لصق كود لون مخصص من Coolors (مثلاً: #1e40af)"
                  className="h-9 text-xs rounded-xl font-mono text-start"
                  dir="ltr"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyCustomHex}
                className="h-9 px-4 rounded-xl text-xs font-bold shrink-0"
              >
                تطبيق اللون المخصص
              </Button>
            </div>
          </div>

          {/* Card 5: Typography Pairing Engine */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Type className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-900">
                5. منظومة الخطوط المتجانسة (العناوين الفاخرة + خط القراءة)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CURATED_TYPOGRAPHY_PAIRS.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      fontDisplay: pair.displayFont,
                      fontBody: pair.bodyFont,
                    }));
                    setHasUnsavedChanges(true);
                    toast.success(`تم تفعيل ثنائي خطوط: ${pair.name} ✍️`);
                  }}
                  className={`p-3 rounded-xl border text-start transition-all hover:shadow-xs ${
                    formData.fontDisplay === pair.displayFont
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{pair.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{pair.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card 6: Homepage Content & Sections Controller */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-900">
                  6. تخصيص نصوص وأقسام الصفحة الرئيسية ومفاتيح الإظهار/الإخفاء
                </h3>
              </div>
            </div>

            {/* Hero Banner Controls */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-800">
                أ) نصوص البنر الرئيسي (Hero Section)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    العنوان الرئيسي
                  </label>
                  <Input
                    value={formData.heroTitle || ""}
                    onChange={(e) => handleChange("heroTitle", e.target.value)}
                    placeholder="جمالكِ الطبيعي يبدأ من هنا"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    نص الزر الأساسي
                  </label>
                  <Input
                    value={formData.heroPrimaryCtaText || ""}
                    onChange={(e) => handleChange("heroPrimaryCtaText", e.target.value)}
                    placeholder="تسوّق الآن"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    الوصف الترويجي للبطل
                  </label>
                  <Input
                    value={formData.heroSubtitle || ""}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    placeholder="اكتشفي مجموعة سو بيوتي من منتجات العناية..."
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    رابط صورة البنر الرئيسي (اتركه فارغاً للصورة التلقائية)
                  </label>
                  <Input
                    value={formData.heroImageUrl || ""}
                    onChange={(e) => handleChange("heroImageUrl", e.target.value)}
                    placeholder="https://images.unsplash.com/... (اختياري)"
                    className="h-9 text-xs rounded-lg font-mono text-start"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Section Visibility Toggles */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-800">
                ب) مفاتيح إظهار/إخفاء الأقسام (Section Visibility Toggles)
              </h4>
              <p className="text-[11px] text-slate-500">
                عند التحول لمتجر إلكترونيات أو أزياء، يمكنك إخفاء أقسام البشرة في ثانية واحدة لمنع
                عدم التناسق.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.showSkinTypesSection !== false}
                    onChange={(e) => handleChange("showSkinTypesSection", e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-slate-800">قسم "اختاري بشرتك"</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.showBeforeAfterSection !== false}
                    onChange={(e) => handleChange("showBeforeAfterSection", e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-slate-800">قسم "قبل وبعد"</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.showCustomerReviews !== false}
                    onChange={(e) => handleChange("showCustomerReviews", e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    قسم "آراء وتقييمات العملاء"
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 7: Certified Blueprints Vault & Export/Import */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-slate-900">
                  7. خزينة القوالب المعتمدة والنسخ الاحتياطي (Blueprints Vault)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveToVault}
                  className="h-8 px-2.5 rounded-lg text-xs gap-1 font-bold text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ كقالب معتمد</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleExportBlueprint}
                  className="h-8 px-2.5 rounded-lg text-xs gap-1 font-bold text-slate-700 hover:text-slate-900"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ كود الهيكل (JSON)</span>
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              اختر أي قالب جاهز معتمد ليتحول المتجر بالكامل بنصوصه، مميزاته، وأقسامه وألوانه في
              ثانية واحدة!
            </p>

            {/* Presets List */}
            <div className="space-y-2">
              {customVault.map((bp) => (
                <div
                  key={bp.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{bp.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{bp.description}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApplyBlueprint(bp)}
                    className="h-8 px-3 rounded-lg text-xs font-bold shrink-0 bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    تطبيق القالب فوراً 🚀
                  </Button>
                </div>
              ))}
            </div>

            {/* Import JSON Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 block">
                استيراد كود هيكل مخصص (Paste Blueprint JSON):
              </label>
              <div className="flex gap-2">
                <Input
                  value={blueprintJsonInput}
                  onChange={(e) => setBlueprintJsonInput(e.target.value)}
                  placeholder='الصق كود JSON مثل: {"storeName": "متجري", "heroTitle": "..."}'
                  className="h-9 text-xs rounded-xl font-mono text-start flex-1"
                  dir="ltr"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleImportBlueprint}
                  className="h-9 px-4 rounded-xl text-xs font-bold shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 ms-1" />
                  <span>استيراد الكود</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Card 8: Interactive Motion Engine (Product Cards & Slides) */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MousePointerClick className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-slate-900">
                8. محرك الحركات التفاعلية لكروت المنتجات (Card Motion & Slide Styles)
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              اختر أسلوب التفاعل الحركي الذي ترغب أن تظهر به كروت المنتجات عند تمرير الماوس أو اللمس
              (Hover / Touch).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  id: "tilt",
                  title: "كروت مائلة ثلاثية الأبعاد (3D Smooth Tilt)",
                  desc: "ميلان فراغي 3D فخم عند التمرير مع رفع الظل بزاوية بصرية مريحة.",
                  badge: "الأكثر طلباً",
                },
                {
                  id: "flip",
                  title: "كروت الوجهين المنقلبة (3D Flip View)",
                  desc: "دوران الكرت 180 درجة بالكامل لعرض الوجه الخلفي والمواصفات السريعة.",
                  badge: "جديد وحصري 🔥",
                },
                {
                  id: "jump",
                  title: "كروت تقفز وتطفو (Bounce Jump)",
                  desc: "قفزة خفيفة ومرنة للأعلى بنسبة 8px لجذب انتباه المشتري للمنتج.",
                  badge: "حيوي وممتع",
                },
                {
                  id: "shake",
                  title: "كروت تهتز عند اللمس (Playful Wiggle)",
                  desc: "اهتزاز لطيف (Haptic Wiggle) يعطي انطباعاً بالتفاعل المباشر للمنتجات.",
                  badge: "تفاعل مرح",
                },
                {
                  id: "rotate",
                  title: "كروت تدور بزاوية (Subtle Rotation)",
                  desc: "دوران طفيف بزاوية درجتين مع تكبير خفيف للكارت.",
                  badge: "أزياء وعطور",
                },
                {
                  id: "none",
                  title: "حركة كلاسيكية هادئة (Minimal / Clean)",
                  desc: "تكبير كلاسيكي ناعم للصورة دون أي ميلان أو اهتزاز.",
                  badge: "رسمي وهادئ",
                },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    handleChange(
                      "cardMotionStyle",
                      style.id as StoreBrandingSettings["cardMotionStyle"],
                    );
                    toast.success(`تم اختيار أسلوب الحركة: ${style.title}`);
                  }}
                  className={`p-3.5 rounded-xl border text-start transition-all hover:shadow-xs flex flex-col justify-between ${
                    (formData.cardMotionStyle || "tilt") === style.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900">{style.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {style.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Additional Phase 2 Features: In-Card Slider & Quick Peek Toggles */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    سلايدر تقليب الصور السريعة داخل الكرت (In-Card Slider)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    ظهور أسهم مصغرة ونقاط لتقليب صور المنتج المتعددة مباشرة من الكرت.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableInCardSlider !== false}
                  onChange={(e) => handleChange("enableInCardSlider", e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary ms-3 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    زر المعاينة السريعة الفورية (Quick Peek & View)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    إتاحة زر العين العائم لفتح تفاصيل المنتج المنبثقة بنقرة واحدة.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableQuickPeek !== false}
                  onChange={(e) => handleChange("enableQuickPeek", e.target.checked)}
                  className="w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary ms-3 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Card 9: Developer Code Sanitization & Kill-Switch Gate */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-950">
                  9. درع الأمان وزر التدمير الذاتي وتطهير كود المطور (Kill-Switch & Sanitization)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                Production Freeze Shield
              </span>
            </div>

            <p className="text-xs text-rose-900/80 leading-relaxed">
              <strong>حماية ملكيتك عند بيع السورس كود للعميل ومطوره الخاص:</strong> يمكنك تجميد كافة
              إعدادات الهوية المعتمدة، قفل مسار المطور بالكامل وتحويله إلى صفحة 404، أو تصدير ملف
              إعدادات إنتاج نظيف ومطهر تماماً (Sanitized Production Config) لتسليمه للعميل ومطوره
              دون أي أثر للمفاتيح أو القوالب المخفية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Feature 1: Export Sanitized Clean Code */}
              <div className="p-3.5 rounded-xl bg-white border border-rose-200/90 flex flex-col justify-between gap-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>تصدير كود إعدادات مطهر نهائياً</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    توليد وتنزيل ملف TS/JSON مجمد يحتوي على الهوية المعتمدة فقط مع عزل وحذف أي تحكم
                    للمطور.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    downloadSanitizedConfigFile(formData);
                    toast.success(
                      "تم تصدير ملف الإعدادات المطهر بنجاح (frozen-store-config.ts) 🛡️✨",
                    );
                  }}
                  className="h-8 rounded-lg text-xs font-bold border-rose-200 text-rose-900 hover:bg-rose-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 ms-1" />
                  <span>تنزيل الكود المطهر للعميل</span>
                </Button>
              </div>

              {/* Feature 2: Immediate Route Lock */}
              <div className="p-3.5 rounded-xl bg-white border border-rose-200/90 flex flex-col justify-between gap-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      حالة المسار:{" "}
                      {formData.developerPortalLocked ? (
                        <span className="text-rose-600 font-black">مقفل ومدمّر (404)</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">نشط لمالك النظام</span>
                      )}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    عند القفل، سيظهر مسار /developer كخطأ 404 كامل لتبدو الصفحة وكأنها غير مبرمجة
                    أصلاً.
                  </p>
                </div>

                {formData.developerPortalLocked ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pin = prompt("أدخل رمز المطور الماستر لإلغاء القفل والتدمير (998877):");
                      if (pin === "998877") {
                        handleChange("developerPortalLocked", false);
                        toast.success("تم فك القفل واستعادة صلاحيات المطور بنجاح 🛡️");
                      } else {
                        toast.error("رمز غير صحيح! تم رفض إلغاء القفل.");
                      }
                    }}
                    className="h-8 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 ms-1" />
                    <span>فك القفل برمز الماستر</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "⚠️ تحذير تدمير المسار: هل تود فعلاً تدمير وإغلاق وصول لوحة المطور وتحويلها إلى صفحة 404؟",
                        )
                      ) {
                        handleChange("developerPortalLocked", true);
                        toast.success(
                          "تم تفعيل درع التدمير والقفل! اضغط 'حفظ التعديلات الآن' لتثبيت الإجراء نهائياً.",
                        );
                      }
                    }}
                    className="h-8 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 ms-1" />
                    <span>تفعيل القفل والتدمير قبل التسليم 🔥</span>
                  </Button>
                )}
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
