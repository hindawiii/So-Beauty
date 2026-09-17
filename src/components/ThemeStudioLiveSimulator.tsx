import React, { useState } from "react";
import {
  Smartphone,
  Monitor,
  ShoppingBag,
  Star,
  Sparkles,
  CheckCircle2,
  Heart,
  Eye,
  ShieldCheck,
  Truck,
  ArrowRight,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeStudioLiveSimulatorProps {
  themeColorHex: string;
  fontFamily: string;
  motionStyle: "tilt" | "jump" | "shake" | "rotate" | "flip" | "none";
  storeName: string;
  tagline: string;
}

export function ThemeStudioLiveSimulator({
  themeColorHex,
  fontFamily,
  motionStyle,
  storeName,
  tagline,
}: ThemeStudioLiveSimulatorProps) {
  const [deviceView, setDeviceView] = useState<"mobile" | "desktop">("mobile");
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "product">("home");

  return (
    <div className="bg-card border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header controls: Title & Device Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors"
            style={{ backgroundColor: themeColorHex }}
          >
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>شاشة المحاكاة الحية الفورية (Live Store Simulator)</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                مباشر وفوري
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              شاهد كيف ستبدو الألوان، الخطوط، والأزرار للمستخدم النهائي أثناء التخصيص.
            </p>
          </div>
        </div>

        {/* Device Switcher & Screen Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Switch Screen Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "home"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("product")}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "product"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              كارت المنتج
            </button>
          </div>

          {/* Switch Device */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDeviceView("mobile")}
              className={`p-1.5 rounded-lg transition-all ${
                deviceView === "mobile"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="معاينة الهاتف المحمول (Mobile View)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceView("desktop")}
              className={`p-1.5 rounded-lg transition-all ${
                deviceView === "desktop"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="معاينة الكمبيوتر والأجهزة اللوحية (Desktop View)"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Stage */}
      <div className="w-full flex justify-center py-2 bg-slate-50/60 rounded-xl border border-slate-100">
        <div
          className={`transition-all duration-300 ${
            deviceView === "mobile" ? "w-full max-w-[360px]" : "w-full max-w-[700px]"
          }`}
        >
          {/* Mock Browser/Device Container */}
          <div className="bg-white rounded-3xl border-2 border-slate-800/10 shadow-lg overflow-hidden flex flex-col">
            {/* Device Header Bar */}
            <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[11px] font-mono select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="ms-2 font-sans font-bold text-slate-300">
                  {deviceView === "mobile" ? "عرض الهاتف (Mobile)" : "عرض المتصفح (Web)"}
                </span>
              </div>
              <span className="text-slate-400 text-[10px]">sobeauty.store</span>
            </div>

            {/* Simulated Store Content */}
            <div
              className="p-4 space-y-4 text-slate-900 min-h-[360px] bg-slate-50/30"
              style={{ fontFamily }}
            >
              {/* Top Store Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h5
                    className="font-bold text-base tracking-tight"
                    style={{ color: themeColorHex }}
                  >
                    {storeName || "So Beauty"}
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    {tagline || "عناية طبيعية متكاملة بكل تفاصيل بشرتكِ"}
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: themeColorHex }}
                >
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>

              {activeTab === "home" ? (
                /* Home Preview: Hero Section & Features */
                <div className="space-y-3.5">
                  {/* Hero Banner Mock */}
                  <div
                    className="rounded-2xl p-4 text-white relative overflow-hidden shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${themeColorHex} 0%, ${themeColorHex}cc 100%)`,
                    }}
                  >
                    <div className="relative z-10 space-y-2">
                      <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        <span>مجموعة العناية الفاخرة</span>
                      </span>
                      <h4 className="text-lg font-bold leading-tight">
                        جمالكِ الطبيعي يبدأ بعناية فائقة
                      </h4>
                      <p className="text-xs text-white/90 leading-relaxed">
                        منتجات طبيعية 100% مستخلصة بعناية لإشراقة ونضارة تدوم طوال اليوم.
                      </p>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="bg-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-white/90 transition-all flex items-center gap-1.5"
                          style={{ color: themeColorHex }}
                        >
                          <span>تسوقي الآن</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>

                        <button
                          type="button"
                          className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-3 py-2 rounded-xl backdrop-blur-xs transition-all"
                        >
                          العروض المميزة
                        </button>
                      </div>
                    </div>

                    {/* Subtle decorative circles */}
                    <div className="absolute -bottom-8 -end-8 w-28 h-28 rounded-full bg-white/10 blur-md pointer-events-none" />
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-white rounded-xl border border-slate-100 flex flex-col items-center gap-1 shadow-2xs">
                      <Truck className="w-3.5 h-3.5" style={{ color: themeColorHex }} />
                      <span className="font-bold text-slate-800">شحن سريع</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100 flex flex-col items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: themeColorHex }} />
                      <span className="font-bold text-slate-800">أصلي 100%</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100 flex flex-col items-center gap-1 shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span className="font-bold text-slate-800">تقييم 4.9/5</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Product Card Preview */
                <div className="space-y-3">
                  <div
                    className={`bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs transition-all duration-300 ${
                      motionStyle === "jump"
                        ? "hover:-translate-y-1.5 hover:shadow-md"
                        : motionStyle === "tilt"
                          ? "hover:rotate-1 hover:shadow-md"
                          : ""
                    }`}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-4/3 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80"
                        alt="سيروم سو بيوتي الملكي"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span
                        className="absolute top-2 start-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs"
                        style={{ backgroundColor: themeColorHex }}
                      >
                        الأكثر طلباً ⭐
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLiked(!isLiked)}
                        className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs"
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
                        />
                      </button>
                    </div>

                    <div className="pt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          عناية وترطيب فائق
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>4.9</span>
                        </div>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 leading-snug">
                        سيروم الترطيب والنضارة الملكي So Beauty
                      </h5>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span
                          className="text-base font-bold font-mono"
                          style={{ color: themeColorHex }}
                        >
                          1,850 ج.م
                        </span>
                        <span className="text-xs text-slate-400 line-through font-mono">
                          2,400 ج.م
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ms-auto">
                          وفر 23%
                        </span>
                      </div>

                      <Button
                        type="button"
                        className="w-full h-9 rounded-xl text-xs font-bold text-white shadow-xs gap-1.5 mt-2 transition-all cursor-pointer"
                        style={{ backgroundColor: themeColorHex }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>إضافة للسلة · الدفع عند الاستلام</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Status */}
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الخط النشط: {fontFamily.split(",")[0].replace(/"/g, "")}</span>
                </span>
                <span className="font-mono font-bold" style={{ color: themeColorHex }}>
                  {themeColorHex.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
