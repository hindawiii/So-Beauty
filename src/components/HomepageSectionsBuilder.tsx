import React, { useState } from "react";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit3,
  RotateCcw,
  Sparkles,
  LayoutTemplate,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  HelpCircle,
  MoveVertical,
  Plus,
  Sliders,
  Maximize2,
  Trash2,
} from "lucide-react";
import {
  useStoreSettings,
  HomepageSectionId,
  DEFAULT_HOMEPAGE_SECTIONS_ORDER,
  StoreBrandingSettings,
} from "@/context/StoreSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SectionMeta {
  id: HomepageSectionId;
  nameAr: string;
  nameEn: string;
  icon: string;
  desc: string;
  canEditContent: boolean;
}

export const SECTIONS_META: Record<HomepageSectionId, SectionMeta> = {
  hero: {
    id: "hero",
    nameAr: "البنر الرئيسي (Hero Section)",
    nameEn: "Main Hero Banner",
    icon: "🌟",
    desc: "واجهة المتجر الأولى: العنوان الكبير، الوصف الجذاب، أزرار التسوّق، والصورة الرئيسية.",
    canEditContent: true,
  },
  marquee: {
    id: "marquee",
    nameAr: "شريط الإعلانات المتحرك (Marquee Ribbon)",
    nameEn: "Infinite Marquee Banner",
    icon: "🎀",
    desc: "شريط إخباري متحرك سلس يعرض رسائل الجودة، الشحن، والضمان بحركة مخملية مستمرة.",
    canEditContent: true,
  },
  trust_badges: {
    id: "trust_badges",
    nameAr: "مميزات المتجر الأربعة (Trust Badges)",
    nameEn: "4 Value Props / Trust Badges",
    icon: "🛡️",
    desc: "الأيقونات الأربعة لتعزيز ثقة العميل (أصلية 100%، شحن سريع، دفع آمن، نتائج فعالة).",
    canEditContent: true,
  },
  skin_types: {
    id: "skin_types",
    nameAr: 'قسم "اختاري نوع بشرتك" / التصفية المخصصة',
    nameEn: "Skin Type Targeted Routine",
    icon: "🌸",
    desc: "تصفية بصرية تفاعلية حسب نوع البشرة والاحتياج، أو تصنيفات النشاط المخصصة.",
    canEditContent: true,
  },
  featured_products: {
    id: "featured_products",
    nameAr: "كتالوج المنتجات الأكثر طلباً (Featured Products)",
    nameEn: "Featured Products Grid & Showcase",
    icon: "🛍️",
    desc: "عرض المنتجات المميزة مع فلترة الأقسام وخيارات التخطيط (Grid / Carousel / Bento).",
    canEditContent: true,
  },
  bundles: {
    id: "bundles",
    nameAr: "قسم البوكسات الملكية وباقات التوفير (Bundles)",
    nameEn: "Gift Bundles & Sets Showcase",
    icon: "🎁",
    desc: "سلايدر مميز لباقات التوفير والهدايا وبكجات المنتجات المتكاملة.",
    canEditContent: true,
  },
  promo_banner: {
    id: "promo_banner",
    nameAr: "البنر الترويجي الكبير (Promo Banner)",
    nameEn: "Promotional Callout Banner",
    icon: "🔥",
    desc: "بنر عرض خاص أو خصومات نهاية الأسبوع مع صورة جذابة وزر انتقال فوري.",
    canEditContent: true,
  },
  before_after: {
    id: "before_after",
    nameAr: 'قسم مقارنة "قبل وبعد" (Before & After Slider)',
    nameEn: "Interactive Before/After Slider",
    icon: "✨",
    desc: "سلايدر تفاعلي بالسحب لمقارنة نتائج استخدام المنتجات لإثبات الفعالية.",
    canEditContent: true,
  },
  reviews: {
    id: "reviews",
    nameAr: "قسم آراء وتقييمات العملاء (Customer Reviews)",
    nameEn: "Customer Reviews & Social Proof",
    icon: "⭐",
    desc: "شهادات العملاء الحقيقية مع نظام التقييم بالنجوم وبطاقات التجارب الموثقة.",
    canEditContent: true,
  },
};

export function HomepageSectionsBuilder() {
  const { settings, updateSettings, isPreviewMode } = useStoreSettings();

  const activeOrder: HomepageSectionId[] =
    settings.sectionsOrder && settings.sectionsOrder.length > 0
      ? settings.sectionsOrder
      : DEFAULT_HOMEPAGE_SECTIONS_ORDER;

  const hiddenSections = new Set<HomepageSectionId>(settings.hiddenSections || []);

  const [editingSectionId, setEditingSectionId] = useState<HomepageSectionId | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Reorder sections
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...activeOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    updateSettings({ sectionsOrder: newOrder });
    toast.success("تم تحديث ترتيب الأقسام بالصفحة الرئيسية فوراً 🔄");
  };

  // Toggle Section Visibility
  const toggleVisibility = (sectionId: HomepageSectionId) => {
    const newHidden = new Set(hiddenSections);
    let isNowVisible = false;

    if (newHidden.has(sectionId)) {
      newHidden.delete(sectionId);
      isNowVisible = true;
    } else {
      newHidden.add(sectionId);
      isNowVisible = false;
    }

    const payload: Partial<StoreBrandingSettings> = {
      hiddenSections: Array.from(newHidden),
    };

    // Also sync dedicated legacy flags for backward compatibility
    if (sectionId === "skin_types") payload.showSkinTypesSection = isNowVisible;
    if (sectionId === "before_after") payload.showBeforeAfterSection = isNowVisible;
    if (sectionId === "reviews") payload.showCustomerReviews = isNowVisible;
    if (sectionId === "bundles") payload.showGiftBoxesSection = isNowVisible;
    if (sectionId === "promo_banner") payload.showPromoBanner = isNowVisible;
    if (sectionId === "marquee") payload.showMarqueeRibbon = isNowVisible;

    updateSettings(payload);

    if (isNowVisible) {
      toast.success(`تم تفعيل وإظهار: ${SECTIONS_META[sectionId]?.nameAr || sectionId} 👁️`);
    } else {
      toast.info(
        `تم إخفاء: ${SECTIONS_META[sectionId]?.nameAr || sectionId} من الصفحة الرئيسية 🔒`,
      );
    }
  };

  // Reset order to Golden Default
  const handleResetOrder = () => {
    if (confirm("هل تود بالتأكيد استعادة الترتيب الافتراضي الذهبي لجميع أقسام المتجر؟")) {
      updateSettings({
        sectionsOrder: DEFAULT_HOMEPAGE_SECTIONS_ORDER,
        hiddenSections: [],
        showSkinTypesSection: true,
        showBeforeAfterSection: true,
        showCustomerReviews: true,
        showPromoBanner: true,
        showMarqueeRibbon: true,
        showGiftBoxesSection: true,
      });
      toast.success("تمت استعادة الترتيب الافتراضي الكامل بنجاح ✨");
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const newOrder = [...activeOrder];
    const draggedItem = newOrder[draggedItemIndex];
    newOrder.splice(draggedItemIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    updateSettings({ sectionsOrder: newOrder });
    setDraggedItemIndex(null);
    toast.success("تم إعادة ترتيب القسم بالسحب والإفلات بنجاح! 🚀");
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-card border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="w-5 h-5 text-primary" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>محرك تخصيص وترتيب أقسام المتجر (Sections Builder)</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                سحب وإفلات تفاعلي
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            رتّب أقسام الصفحة الرئيسية بحرية تامة بالسحب والإفلات أو أزرار التقديم والتأخير. يمكنك
            إخفاء أو إظهار أي قسم، وتعديل محتواه وصوره وروابطه بنقرة زر واحدة.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetOrder}
            className="h-9 px-3 rounded-xl text-xs gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الترتيب الافتراضي</span>
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-2.5">
        {activeOrder.map((sectionId, index) => {
          const meta = SECTIONS_META[sectionId] || {
            id: sectionId,
            nameAr: sectionId,
            nameEn: sectionId,
            icon: "📦",
            desc: "قسم مخصص",
            canEditContent: true,
          };

          const isHidden = hiddenSections.has(sectionId);

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                draggedItemIndex === index
                  ? "opacity-50 border-primary border-dashed bg-primary/5"
                  : isHidden
                    ? "bg-slate-50/70 border-slate-200/60 opacity-60"
                    : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
              }`}
            >
              {/* Left Info with Drag handle and index badge */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Drag Grip Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
                  title="اسحب لتغيير الترتيب"
                >
                  <MoveVertical className="w-4 h-4" />
                </div>

                {/* Index Pill */}
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                {/* Icon */}
                <span className="text-xl shrink-0">{meta.icon}</span>

                {/* Title & Desc */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {meta.nameAr}
                    </h4>
                    {isHidden ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold shrink-0">
                        مخفي 🔒
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shrink-0">
                        ظاهر 👁️
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{meta.desc}</p>
                </div>
              </div>

              {/* Actions Controls (Up, Down, Visibility, Edit) */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Move Up */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveSection(index, "up")}
                  className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-30"
                  title="تحريك لأعلى"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>

                {/* Move Down */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === activeOrder.length - 1}
                  onClick={() => moveSection(index, "down")}
                  className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-30"
                  title="تحريك لأسفل"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>

                {/* Visibility Toggle */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleVisibility(sectionId)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold gap-1 cursor-pointer transition-colors ${
                    isHidden
                      ? "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200"
                      : "text-emerald-700 bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60"
                  }`}
                  title={isHidden ? "إظهار في المتجر" : "إخفاء من المتجر"}
                >
                  {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isHidden ? "إظهار" : "إخفاء"}</span>
                </Button>

                {/* Edit Section Content Modal */}
                {meta.canEditContent && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setEditingSectionId(sectionId)}
                    className="h-8 px-3 rounded-lg text-xs font-bold gap-1 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل المحتوى</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Content Customizer Modal */}
      {editingSectionId && (
        <SectionContentEditorModal
          sectionId={editingSectionId}
          isOpen={Boolean(editingSectionId)}
          onClose={() => setEditingSectionId(null)}
        />
      )}
    </div>
  );
}

// Modal for editing specific section content (Hero, Badges, Promo, etc.)
interface SectionEditorProps {
  sectionId: HomepageSectionId;
  isOpen: boolean;
  onClose: () => void;
}

function SectionContentEditorModal({ sectionId, isOpen, onClose }: SectionEditorProps) {
  const { settings, updateSettings } = useStoreSettings();
  const [formData, setFormData] = useState<StoreBrandingSettings>(settings);

  if (!isOpen) return null;

  const meta = SECTIONS_META[sectionId];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast.success(`تم حفظ تعديلات قسم "${meta?.nameAr || sectionId}" بنجاح! ✨`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="text-start mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta?.icon}</span>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                تخصيص محتوى: {meta?.nameAr}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {meta?.desc}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {/* 1. HERO SECTION CUSTOMIZER */}
          {sectionId === "hero" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">العنوان الرئيسي</label>
                  <Input
                    value={formData.heroTitle || ""}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    placeholder="جمالكِ الطبيعي يبدأ من هنا"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    العنوان بالإنجليزية (English Title)
                  </label>
                  <Input
                    value={formData.heroTitle_en || ""}
                    onChange={(e) => setFormData({ ...formData, heroTitle_en: e.target.value })}
                    placeholder="Natural Beauty Starts Here"
                    className="h-10 text-xs rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">الوصف الترويجي</label>
                <Textarea
                  value={formData.heroSubtitle || ""}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="اكتشفي تشكيلة المتجر من أفضل المنتجات الطبيعية..."
                  className="min-h-[70px] text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    نص الزر الأساسي (Primary CTA)
                  </label>
                  <Input
                    value={formData.heroPrimaryCtaText || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroPrimaryCtaText: e.target.value })
                    }
                    placeholder="تسوّق الآن"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    نص الزر الثانوي (Secondary CTA)
                  </label>
                  <Input
                    value={formData.heroSecondaryCtaText || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroSecondaryCtaText: e.target.value })
                    }
                    placeholder="شاهد العروض"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  رابط صورة البنر الرئيسي (Hero Image URL)
                </label>
                <Input
                  value={formData.heroImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                  placeholder="https://... أو اتركه فارغاً لاستخدام الصورة الافتراضية الفاخرة"
                  className="h-10 text-xs rounded-xl font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* 2. MARQUEE BANNER CUSTOMIZER */}
          {sectionId === "marquee" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  نص الشريط الإعلاني المتحرك (بالعربية)
                </label>
                <Input
                  value={formData.marqueeText || ""}
                  onChange={(e) => setFormData({ ...formData, marqueeText: e.target.value })}
                  placeholder="✨ أصلي 100% · توصيل سريع وآمن · دفع عند الاستلام · ضمان الوكيل"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  نص الشريط بالإنجليزية (English Marquee)
                </label>
                <Input
                  value={formData.marqueeText_en || ""}
                  onChange={(e) => setFormData({ ...formData, marqueeText_en: e.target.value })}
                  placeholder="✨ 100% Authentic · Fast Reliable Dispatch · Doorstep Inspection"
                  className="h-10 text-xs rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* 3. TRUST BADGES CUSTOMIZER */}
          {sectionId === "trust_badges" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                عدّل مميزات المتجر الأربعة المعروضة لتعزيز ثقة العميل وإقناعه بالشراء:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 space-y-1.5 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-800">1. الميزة الأولى</label>
                  <Input
                    value={formData.feature1Title || ""}
                    onChange={(e) => setFormData({ ...formData, feature1Title: e.target.value })}
                    placeholder="نتائج فعّالة"
                    className="h-9 text-xs rounded-lg"
                  />
                  <Input
                    value={formData.feature1Desc || ""}
                    onChange={(e) => setFormData({ ...formData, feature1Desc: e.target.value })}
                    placeholder="منتجات مصنوعة بعناية لأفضل النتائج"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="p-3 rounded-xl border border-slate-200 space-y-1.5 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-800">2. الميزة الثانية</label>
                  <Input
                    value={formData.feature2Title || ""}
                    onChange={(e) => setFormData({ ...formData, feature2Title: e.target.value })}
                    placeholder="شحن سريع"
                    className="h-9 text-xs rounded-lg"
                  />
                  <Input
                    value={formData.feature2Desc || ""}
                    onChange={(e) => setFormData({ ...formData, feature2Desc: e.target.value })}
                    placeholder="توصيل طلبك في أسرع وقت"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="p-3 rounded-xl border border-slate-200 space-y-1.5 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-800">3. الميزة الثالثة</label>
                  <Input
                    value={formData.feature3Title || ""}
                    onChange={(e) => setFormData({ ...formData, feature3Title: e.target.value })}
                    placeholder="دفع آمن"
                    className="h-9 text-xs rounded-lg"
                  />
                  <Input
                    value={formData.feature3Desc || ""}
                    onChange={(e) => setFormData({ ...formData, feature3Desc: e.target.value })}
                    placeholder="ادفع عند الاستلام أو أونلاين"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="p-3 rounded-xl border border-slate-200 space-y-1.5 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-800">4. الميزة الرابعة</label>
                  <Input
                    value={formData.feature4Title || ""}
                    onChange={(e) => setFormData({ ...formData, feature4Title: e.target.value })}
                    placeholder="أصلية 100%"
                    className="h-9 text-xs rounded-lg"
                  />
                  <Input
                    value={formData.feature4Desc || ""}
                    onChange={(e) => setFormData({ ...formData, feature4Desc: e.target.value })}
                    placeholder="نضمن جودة وأصالة كل منتج"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. PROMO BANNER CUSTOMIZER */}
          {sectionId === "promo_banner" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">عنوان البنر</label>
                  <Input
                    value={formData.promoTitle || ""}
                    onChange={(e) => setFormData({ ...formData, promoTitle: e.target.value })}
                    placeholder="عروض الموسم الحصرية"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نص الزر (CTA)</label>
                  <Input
                    value={formData.promoCtaText || ""}
                    onChange={(e) => setFormData({ ...formData, promoCtaText: e.target.value })}
                    placeholder="اكتشف العروض الآن"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">وصف العرض</label>
                <Textarea
                  value={formData.promoSubtitle || ""}
                  onChange={(e) => setFormData({ ...formData, promoSubtitle: e.target.value })}
                  placeholder="تخفيضات كبرى تصل إلى 30% على المنتجات الأكثر طلباً لفترة محدودة."
                  className="min-h-[70px] text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  رابط صورة البنر الترويجي (Promo Image URL)
                </label>
                <Input
                  value={formData.promoImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, promoImageUrl: e.target.value })}
                  placeholder="https://... أو اتركه فارغاً"
                  className="h-10 text-xs rounded-xl font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* 5. FEATURED PRODUCTS LAYOUT CUSTOMIZER */}
          {sectionId === "featured_products" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                أسلوب عرض وتخطيط كروت المنتجات (Layout Mode)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "grid",
                    title: "شبكة منتجات (Grid)",
                    desc: "العرض الكلاسيكي المتوازن 2×4",
                  },
                  {
                    id: "carousel",
                    title: "سلايدر أفقي (Carousel)",
                    desc: "تمرير أفقي سلس ومريح للموبايل",
                  },
                  {
                    id: "bento",
                    title: "بينتو فاخر (Bento Luxe)",
                    desc: "أحجام متمايزة وبصرية كبرى",
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        homepageProductsLayout: mode.id as "grid" | "carousel" | "bento",
                      })
                    }
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      (formData.homepageProductsLayout || "grid") === mode.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <h5 className="text-xs font-bold text-slate-900">{mode.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. REVIEWS SECTION CUSTOMIZER */}
          {sectionId === "reviews" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">عنوان قسم الآراء</label>
                <Input
                  value={formData.reviewsTitle || ""}
                  onChange={(e) => setFormData({ ...formData, reviewsTitle: e.target.value })}
                  placeholder="آراء وتجارب عملائنا"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">الوصف الترويجي</label>
                <Input
                  value={formData.reviewsSubtitle || ""}
                  onChange={(e) => setFormData({ ...formData, reviewsSubtitle: e.target.value })}
                  placeholder="تجارب حقيقية وموثقة من عملاء المتجر بعد الشراء والتوصيل"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-4 text-xs">
              إلغاء
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
            >
              حفظ التعديلات للقسم ✨
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
