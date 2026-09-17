import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  Type,
  Layout,
  Layers,
  Save,
  Undo2,
  HelpCircle,
  ExternalLink,
  Grid,
  Rows3,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { THEME_PRESETS, ThemePreset } from "@/lib/theme-presets";
import { ThemeStudioLiveSimulator } from "@/components/ThemeStudioLiveSimulator";
import { generatePaletteFromHex } from "@/lib/colorUtils";

const ARABIC_FONTS = [
  {
    id: "messiri",
    name: "خط المسيري الملكي (El Messiri)",
    fontFamily: '"El Messiri", "Tajawal", serif',
    tag: "ملكي · فاخر · عناية راقية",
    sampleText: "إشراقة طبيعية تدوم بلمسة نباتية فاخرة",
  },
  {
    id: "tajawal",
    name: "خط تجوال الحديث (Tajawal)",
    fontFamily: '"Tajawal", "Cairo", sans-serif',
    tag: "عصري · مريح للعين · متوازن",
    sampleText: "منتجات العناية بالبشرة الأكثر طلباً ونقاءً",
  },
  {
    id: "cairo",
    name: "خط كايرو التقني الجريء (Cairo)",
    fontFamily: '"Cairo", "Tajawal", sans-serif',
    tag: "قوي · بارز · شاشات الموبايل",
    sampleText: "عروض حصرية وخصومات حتى 40% لفترة محدودة",
  },
];

export function StoreThemingTab() {
  const {
    settings,
    updateSettings,
    resetToGoldenSnapshot,
    startSandboxPreview,
    commitSandboxPreview,
    cancelSandboxPreview,
    isPreviewMode,
    previewThemeTitle,
  } = useStoreSettings();

  // Local draft state for live customization
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const matched = THEME_PRESETS.find((p) => p.themeColorOklch === settings.themeColorOklch);
    return matched ? matched.id : "custom";
  });

  const [customHex, setCustomHex] = useState<string>(settings.themeColorHex || "#7b3370");
  const [fontChoice, setFontChoice] = useState<string>(
    settings.fontDisplay || '"El Messiri", "Tajawal", serif',
  );
  const [motionStyle, setMotionStyle] = useState<
    "tilt" | "jump" | "shake" | "rotate" | "flip" | "none"
  >(settings.cardMotionStyle || "tilt");

  // Sections toggles & display layout
  const [productsLayout, setProductsLayout] = useState<"grid" | "carousel" | "bento">(
    settings.homepageProductsLayout || "grid",
  );
  const [showSkinTypes, setShowSkinTypes] = useState<boolean>(
    settings.showSkinTypesSection !== false,
  );
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(
    settings.showBeforeAfterSection !== false,
  );
  const [showReviews, setShowReviews] = useState<boolean>(settings.showCustomerReviews !== false);
  const [showGiftBoxes, setShowGiftBoxes] = useState<boolean>(
    settings.showGiftBoxesSection !== false,
  );

  const handleApplyPreset = (preset: ThemePreset) => {
    setSelectedPresetId(preset.id);
    setCustomHex(preset.themeColorHex);
    setFontChoice(preset.fontDisplay);
    setMotionStyle(preset.cardMotionStyle);

    // Apply immediately to settings for instant live preview
    updateSettings({
      themeColorHex: preset.themeColorHex,
      themeColorOklch: preset.themeColorOklch,
      fontDisplay: preset.fontDisplay,
      cardMotionStyle: preset.cardMotionStyle,
    });

    toast.success(`تم تفعيل قالب "${preset.name}" بنجاح! ✨`);
  };

  const handleStartSandboxForPreset = (preset: ThemePreset, e: React.MouseEvent) => {
    e.stopPropagation();
    startSandboxPreview(
      {
        themeColorHex: preset.themeColorHex,
        themeColorOklch: preset.themeColorOklch,
        fontDisplay: preset.fontDisplay,
        cardMotionStyle: preset.cardMotionStyle,
      },
      preset.name,
    );
    toast.info(
      `تم تشغيل المعاينة المؤقتة (Sandbox) لقالب "${preset.name}". تصفحي المتجر لتجربته! 👁️`,
    );
  };

  const handleApplyCustomColor = (hex: string) => {
    setCustomHex(hex);
    setSelectedPresetId("custom");

    const palette = generatePaletteFromHex(hex);
    updateSettings({
      themeColorHex: hex,
      themeColorOklch: palette.oklch,
    });
  };

  const handleSaveAllTheming = () => {
    updateSettings({
      themeColorHex: customHex,
      fontDisplay: fontChoice,
      cardMotionStyle: motionStyle,
      homepageProductsLayout: productsLayout,
      showSkinTypesSection: showSkinTypes,
      showBeforeAfterSection: showBeforeAfter,
      showCustomerReviews: showReviews,
      showGiftBoxesSection: showGiftBoxes,
    });
    toast.success("تم حفظ تخصيصات وهوية القالب بنجاح لجميع زوار المتجر! 🎉");
  };

  const handleRestoreGolden = () => {
    if (confirm("هل أنت متأكد من استعادة قالب سو بيوتي الأصلي المعتمد؟")) {
      resetToGoldenSnapshot();
      setSelectedPresetId("royal-plum");
      setCustomHex("#7b3370");
      setFontChoice('"El Messiri", "Tajawal", serif');
      setMotionStyle("tilt");
      setProductsLayout("grid");
      setShowSkinTypes(true);
      setShowBeforeAfter(true);
      setShowReviews(true);
      setShowGiftBoxes(true);
      toast.info("تمت استعادة قالب سو بيوتي الأصلي بنجاح 👑");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer with Active Sandbox Alert */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>تخصيص قالب وهوية المتجر (Store Theming Studio)</span>
              {isPreviewMode && (
                <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                  معاينة تجريبية نشطة: {previewThemeTitle}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              تحكم كامل في ألوان المتجر، نماذج العرض (شبكي، سلايدر، بينتو Bento)، الخطوط، وقوالب
              المعاينة الحية المصغرة بنقرة واحدة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isPreviewMode && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={commitSandboxPreview}
              className="h-10 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>تثبيت المعاينة</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRestoreGolden}
            className="h-10 text-xs font-bold gap-1.5 border-slate-200 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>استعادة الأصلي</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveAllTheming}
            className="h-10 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ التخصيصات</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: ONE-CLICK THEME PRESETS WITH VISUAL MINIATURE MOCKUPS */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">
              القوالب الجاهزة مع المحاكاة المصغرة (Visual Miniature Mockups)
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground">
            تطبيق فوري أو تجربة مؤقتة في وضع المعاينة (Sandbox)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`group relative p-4 rounded-2xl border-2 text-start transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/[0.03] shadow-sm"
                    : "border-border/70 bg-card hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: `${preset.previewColor}15`,
                        color: preset.previewColor,
                        borderColor: `${preset.previewColor}30`,
                      }}
                    >
                      {preset.badge}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleStartSandboxForPreset(preset, e)}
                        title="تجربة في وضع المعاينة المؤقتة (Sandbox)"
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Miniature Storefront Mockup */}
                  <div className="rounded-xl border border-slate-200/90 overflow-hidden bg-slate-50/70 p-2 mb-3 shadow-2xs">
                    {/* Header bar mock */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.previewColor }}
                        />
                        <span
                          className="text-[9px] font-bold"
                          style={{
                            fontFamily: preset.fontDisplay,
                            color: preset.previewColor,
                          }}
                        >
                          سو بيوتي
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-3 h-1 bg-slate-200 rounded-full" />
                        <div className="w-4 h-1 bg-slate-200 rounded-full" />
                      </div>
                    </div>

                    {/* Hero banner mock */}
                    <div
                      className="my-1.5 rounded-lg p-2 text-white flex items-center justify-between shadow-2xs"
                      style={{
                        background: `linear-gradient(135deg, ${preset.previewColor}, ${preset.secondaryColor})`,
                      }}
                    >
                      <div className="space-y-0.5">
                        <div
                          className="text-[10px] font-bold leading-tight"
                          style={{ fontFamily: preset.fontDisplay }}
                        >
                          جمالك الطبيعي
                        </div>
                        <div className="text-[7px] opacity-80">عناية نباتية فائقة</div>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[7px] font-bold">
                        ✦
                      </div>
                    </div>

                    {/* Product cards grid mock */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-white rounded-md p-1 border border-slate-200/60 shadow-2xs">
                        <div className="h-6 rounded bg-slate-100 flex items-center justify-center text-[8px] text-slate-300">
                          🧴
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="w-6 h-1 bg-slate-200 rounded" />
                          <div
                            className="w-3 h-2 rounded text-[7px] text-white flex items-center justify-center font-bold"
                            style={{ backgroundColor: preset.previewColor }}
                          >
                            +
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-md p-1 border border-slate-200/60 shadow-2xs">
                        <div className="h-6 rounded bg-slate-100 flex items-center justify-center text-[8px] text-slate-300">
                          ✨
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="w-6 h-1 bg-slate-200 rounded" />
                          <div
                            className="w-3 h-2 rounded text-[7px] text-white flex items-center justify-center font-bold"
                            style={{ backgroundColor: preset.previewColor }}
                          >
                            +
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5">
                    <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {preset.name}
                    </h5>
                    <span className="text-[10px] font-mono text-muted-foreground ms-auto">
                      {preset.previewColor}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate max-w-[120px]">
                    {preset.fontDisplay.includes("Messiri") ? "المسيري الملكي" : "تجوال الحديث"}
                  </span>
                  <span className="text-primary font-bold flex items-center gap-1">
                    تطبيق القالب
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ARABIC TYPOGRAPHY CARDS STUDIO */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">
              استوديو الخطوط العربية (Interactive Font Preview Cards)
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground">
            اختاري الخط الذي يعكس شخصية متجرك
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ARABIC_FONTS.map((font) => {
            const isSelected = fontChoice === font.fontFamily;
            return (
              <div
                key={font.id}
                onClick={() => {
                  setFontChoice(font.fontFamily);
                  updateSettings({ fontDisplay: font.fontFamily });
                  toast.success(`تم تفعيل ${font.name}`);
                }}
                className={`p-4 rounded-2xl border-2 text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/[0.03] shadow-xs"
                    : "border-border/70 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {font.tag}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-foreground mb-2">{font.name}</h5>
                  <p
                    className="text-base text-slate-800 dark:text-slate-200 leading-relaxed p-3 bg-muted/30 rounded-xl border border-border/50"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.sampleText}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex justify-between">
                  <span>الأبجدية: أ ب ت ث ج ح خ...</span>
                  <span className="font-bold text-primary">
                    {isSelected ? "الخط النشط" : "اختر الخط"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: LIVE ADVANCED CONTROLS & HOMEPAGE LAYOUT BUILDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Color & Motion Engine */}
        <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Sliders className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">
              التحكم اللوني المخصص وتفاعل الكروت
            </h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                اللون الأساسي المخصص (Brand Primary Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handleApplyCustomColor(e.target.value)}
                  className="w-11 h-11 rounded-xl cursor-pointer border border-border bg-transparent p-0.5"
                />
                <Input
                  value={customHex}
                  onChange={(e) => handleApplyCustomColor(e.target.value)}
                  placeholder="#7b3370"
                  className="h-11 font-mono text-xs max-w-[140px]"
                />
                <span className="text-xs text-muted-foreground">
                  يؤثر على الأزرار والشارات والأسعار فوراً
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نمط تفاعل وتحريك كروت المنتجات (Card Motion Style)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "tilt", label: "إمالة ثلاثية الأبعاد 3D" },
                    { id: "jump", label: "رفع وقفز ناعم Jump" },
                    { id: "none", label: "ثابت ومستقر None" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setMotionStyle(opt.id);
                      updateSettings({ cardMotionStyle: opt.id });
                    }}
                    className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                      motionStyle === opt.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sections Visibility & Homepage Layout Builder */}
        <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Layout className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">
              تنسيق عرض المنتجات وأقسام الصفحة الرئيسية
            </h4>
          </div>

          <div className="space-y-3">
            {/* Display Engine Toggle: Grid vs Carousel vs Bento */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نمط عرض المنتجات المميزة (Products Layout Engine)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "grid", label: "شبكة كروت (Grid)", icon: Grid },
                    { id: "carousel", label: "سلايدر أفقي (Carousel)", icon: Rows3 },
                    { id: "bento", label: "بينتو جريد (Bento)", icon: Flame },
                  ] as const
                ).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setProductsLayout(l.id);
                      updateSettings({ homepageProductsLayout: l.id });
                    }}
                    className={`h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      productsLayout === l.id
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <l.icon className="w-3.5 h-3.5" />
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin types section */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  قسم اختيار نوع البشرة (Skin Types)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  يعرض كروت أنواع البشرة الأربعة
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSkinTypes}
                  onChange={(e) => {
                    setShowSkinTypes(e.target.checked);
                    updateSettings({ showSkinTypesSection: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* Before & After section */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  قسم نتائج قبل وبعد (Before & After)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  مقارنة بصرية للنتائج الملموسة بعد الاستخدام
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBeforeAfter}
                  onChange={(e) => {
                    setShowBeforeAfter(e.target.checked);
                    updateSettings({ showBeforeAfterSection: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary" />
              </label>
            </div>

            {/* Customer reviews section */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  قسم آراء وتجارب العميلات (Reviews)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  عرض التقييمات الحقيقية والتجارب المعتمدة
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReviews}
                  onChange={(e) => {
                    setShowReviews(e.target.checked);
                    updateSettings({ showCustomerReviews: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: LIVE VISUAL SIMULATION STUDIO */}
      <ThemeStudioLiveSimulator
        themeColorHex={customHex}
        fontFamily={fontChoice}
        motionStyle={motionStyle}
        storeName={settings.storeName}
        tagline={settings.tagline}
      />
    </div>
  );
}
