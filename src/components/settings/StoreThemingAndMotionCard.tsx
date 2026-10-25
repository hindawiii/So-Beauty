import React, { useState } from "react";
import { Palette, Dices, Type, MousePointerClick, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StoreBrandingSettings } from "@/context/StoreSettingsContext";
import {
  CURATED_COLOR_PALETTES,
  CURATED_TYPOGRAPHY_PAIRS,
  hexToOklch,
  generateRandomHarmoniousPalette,
} from "@/lib/harmonyEngine";

interface StoreThemingAndMotionCardProps {
  formData: StoreBrandingSettings;
  onChange: <K extends keyof StoreBrandingSettings>(
    key: K,
    value: StoreBrandingSettings[K],
  ) => void;
}

export function StoreThemingAndMotionCard({ formData, onChange }: StoreThemingAndMotionCardProps) {
  const [customHexInput, setCustomHexInput] = useState("");

  const handleApplyPalette = (hex: string, oklch: string, name: string) => {
    onChange("themeColorHex", hex);
    onChange("themeColorOklch", oklch);
    toast.success(`تم تطبيق لوحة ألوان: ${name} ✨`);
  };

  const handleApplyCustomHex = () => {
    const cleanHex = customHexInput.trim();
    if (!cleanHex || !/^#([0-9A-F]{3}){1,2}$/i.test(cleanHex)) {
      toast.error("يرجى إدخال كود لون سداسي عشري صحيح مثل #1e40af أو #059669");
      return;
    }
    const oklch = hexToOklch(cleanHex);
    onChange("themeColorHex", cleanHex);
    onChange("themeColorOklch", oklch);
    toast.success(`تم احتساب تناغم اللون ${cleanHex} بصيغة OKLCH بنجاح!`);
    setCustomHexInput("");
  };

  const handleRandomPalette = () => {
    const pal = generateRandomHarmoniousPalette();
    onChange("themeColorHex", pal.primaryHex);
    onChange("themeColorOklch", pal.primaryOklch);
    toast.success(`🎲 تم توليد لوحة ألوان جديدة: "${pal.name}" بنجاح!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Color Harmony Engine */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-slate-900">
              4. منظومة الألوان المتجانسة وتوليد الهوية الفاخرة
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
          اختر لوحة ألوان جاهزة متوافقة مع معايير الأناقة والجمال أو استخدم كود لونك المفضل:
        </p>

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

        {/* Custom Hex Input */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={customHexInput}
              onChange={(e) => setCustomHexInput(e.target.value)}
              placeholder="لصق كود لون مخصص (مثلاً: #1e40af)"
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

      {/* 2. Typography Pairs */}
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
                onChange("fontDisplay", pair.displayFont);
                onChange("fontBody", pair.bodyFont);
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

      {/* 3. Card Motion Styles */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MousePointerClick className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-slate-900">
            6. محرك الحركات التفاعلية لكروت المنتجات (Card Motion)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              id: "tilt",
              title: "كروت مائلة ثلاثية الأبعاد (3D Tilt)",
              desc: "ميلان فراغي 3D فخم عند التمرير بزاوية بصرية مريحة.",
              badge: "الأكثر طلباً",
            },
            {
              id: "flip",
              title: "كروت منقلبة (3D Flip View)",
              desc: "دوران الكرت 180 درجة لعرض الوجه الخلفي والمواصفات.",
              badge: "جديد وحصري 🔥",
            },
            {
              id: "jump",
              title: "كروت تقفز وتطفو (Bounce Jump)",
              desc: "قفزة خفيفة ومرنة للأعلى بنسبة 8px لجذب الانتباه.",
              badge: "حيوي وممتع",
            },
            {
              id: "shake",
              title: "كروت تهتز (Playful Wiggle)",
              desc: "اهتزاز لطيف يعطي انطباعاً بالتفاعل المباشر.",
              badge: "تفاعل مرح",
            },
            {
              id: "rotate",
              title: "كروت تدور بزاوية (Rotation)",
              desc: "دوران طفيف بزاوية درجتين مع تكبير خفيف للكارت.",
              badge: "أزياء وعطور",
            },
            {
              id: "none",
              title: "حركة كلاسيكية هادئة (Minimal)",
              desc: "تكبير كلاسيكي ناعم للصورة دون أي ميلان أو اهتزاز.",
              badge: "رسمي وهادئ",
            },
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                onChange("cardMotionStyle", style.id as StoreBrandingSettings["cardMotionStyle"]);
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

        {/* Feature Toggles */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                سلايدر تقليب الصور داخل الكرت (In-Card Slider)
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ظهور أسهم مصغرة ونقاط لتقليب صور المنتج المتعددة.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.enableInCardSlider !== false}
              onChange={(e) => onChange("enableInCardSlider", e.target.checked)}
              className="w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary ms-3 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                زر المعاينة السريعة الفورية (Quick Peek & View)
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                إتاحة زر العين العائم لفتح تفاصيل المنتج المنبثقة.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.enableQuickPeek !== false}
              onChange={(e) => onChange("enableQuickPeek", e.target.checked)}
              className="w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary ms-3 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
