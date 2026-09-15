import React, { useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Check,
  Info,
  Layers,
  FileText,
  Tag,
  ShieldCheck,
} from "lucide-react";

export interface QualityAnalysis {
  score: number; // 0 - 100
  grade: "ممتاز" | "جيد جداً" | "بحاجة لتحسين" | "غير مكتمل";
  recommendations: {
    id: string;
    text: string;
    importance: "ضروري" | "موصى به" | "مكتمل";
    passed: boolean;
  }[];
  imageStatus: {
    isValid: boolean;
    dimensions: { width: number; height: number } | null;
    aspectRatio: string | null;
    rating: "ممتازة HD" | "مقبولة" | "دقة منخفضة" | "رابط غير صالح" | "جاري الفحص...";
    message: string;
  };
}

interface ProductQualityAdvisorProps {
  name: string;
  category: string;
  price: number | string;
  originalPrice?: number | string | null;
  stock: number | string;
  imageUrl: string;
  description?: string;
  howToUse?: string;
  keyIngredients?: string;
  skinType?: string;
  className?: string;
}

export function ProductQualityAdvisor({
  name,
  category,
  price,
  originalPrice,
  stock,
  imageUrl,
  description = "",
  howToUse = "",
  keyIngredients = "",
  skinType = "",
  className = "",
}: ProductQualityAdvisorProps) {
  const [imageState, setImageState] = useState<QualityAnalysis["imageStatus"]>({
    isValid: false,
    dimensions: null,
    aspectRatio: null,
    rating: "جاري الفحص...",
    message: "يتم فحص أبعاد وجودة الصورة...",
  });

  // Check image dimensions & validity on client side
  useEffect(() => {
    const trimmed = imageUrl?.trim();
    if (!trimmed) {
      setImageState({
        isValid: false,
        dimensions: null,
        aspectRatio: null,
        rating: "رابط غير صالح",
        message: "لم يتم تعيين رابط صورة للمنتج بعد.",
      });
      return;
    }

    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = trimmed;

    img.onload = () => {
      if (!isMounted) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratioVal = (w / h).toFixed(2);
      let ratioLabel = "مخصص";
      if (Math.abs(w - h) <= 20) {
        ratioLabel = "1:1 (مربعة مثالية)";
      } else if (Math.abs(w / h - 4 / 5) <= 0.08) {
        ratioLabel = "4:5 (بورتريه متجر)";
      } else if (w > h) {
        ratioLabel = "أفقية";
      } else {
        ratioLabel = "طولية";
      }

      let rating: QualityAnalysis["imageStatus"]["rating"] = "مقبولة";
      let message = "أبعاد الصورة جيدة وتصلح للعرض.";

      if (w >= 700 && h >= 700) {
        rating = "ممتازة HD";
        message = `دقة فائقة (${w}×${h}px) - ستظهر بوضوح فائق ومريح على شاشات الهواتف.`;
      } else if (w < 400 || h < 400) {
        rating = "دقة منخفضة";
        message = `أبعاد الصورة (${w}×${h}px) أصغر من الموصى به (يفضل 600×600px على الأقل) وقد تظهر مشوشة.`;
      }

      setImageState({
        isValid: true,
        dimensions: { width: w, height: h },
        aspectRatio: `${ratioLabel} (~${ratioVal})`,
        rating,
        message,
      });
    };

    img.onerror = () => {
      if (!isMounted) return;
      setImageState({
        isValid: false,
        dimensions: null,
        aspectRatio: null,
        rating: "رابط غير صالح",
        message: "تعذر تحميل الصورة! تأكدي من صحة الرابط أو استخدمي إحدى صور المتجر الجاهزة.",
      });
    };

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  // Compute Quality Points
  const numPrice = Number(price) || 0;
  const numOriginal = originalPrice ? Number(originalPrice) : 0;
  const numStock = Number(stock) || 0;

  const checks = [
    {
      id: "name",
      text: "اسم تجاري جذاب ومميز للمنتج (أكثر من 8 أحرف)",
      importance: "ضروري" as const,
      passed: Boolean(name?.trim().length >= 8),
      points: 15,
    },
    {
      id: "category",
      text: "تحديد تصنيف القسم المناسب بدقة",
      importance: "ضروري" as const,
      passed: Boolean(category?.trim()),
      points: 10,
    },
    {
      id: "price",
      text: "تحديد سعر بيع فعلي مناسب",
      importance: "ضروري" as const,
      passed: numPrice > 0,
      points: 15,
    },
    {
      id: "discount",
      text: "تحديد السعر قبل الخصم لتفعيل خط الشطب ونسبة التوفير",
      importance: "موصى به" as const,
      passed: numOriginal > numPrice,
      points: 10,
    },
    {
      id: "image",
      text: "صورة واضحة وعالية الدقة (HD)",
      importance: "ضروري" as const,
      passed: imageState.isValid && imageState.rating !== "دقة منخفضة",
      points: 20,
    },
    {
      id: "description",
      text: "وصف تعريفي مقنع يبرز فوائد المنتج ومميزاته",
      importance: "ضروري" as const,
      passed: Boolean(description?.trim().length >= 25),
      points: 10,
    },
    {
      id: "routine",
      text: "طريقة الاستخدام وروتين العناية (How to Use)",
      importance: "موصى به" as const,
      passed: Boolean(howToUse?.trim().length >= 10),
      points: 10,
    },
    {
      id: "ingredients",
      text: "المكونات الفعالة والنشطة ونوع البشرة المتوافق",
      importance: "موصى به" as const,
      passed: Boolean(keyIngredients?.trim() || skinType?.trim()),
      points: 10,
    },
  ];

  const totalPoints = checks.reduce((acc, c) => acc + (c.passed ? c.points : 0), 0);
  const score = Math.min(100, Math.max(0, totalPoints));

  let grade: QualityAnalysis["grade"] = "غير مكتمل";
  let gradeColor = "text-rose-600 bg-rose-50 border-rose-200";
  let barColor = "bg-rose-500";

  if (score >= 85) {
    grade = "ممتاز";
    gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    barColor = "bg-emerald-500";
  } else if (score >= 70) {
    grade = "جيد جداً";
    gradeColor = "text-primary bg-primary/10 border-primary/20";
    barColor = "bg-primary";
  } else if (score >= 50) {
    grade = "بحاجة لتحسين";
    gradeColor = "text-amber-700 bg-amber-50 border-amber-200";
    barColor = "bg-amber-500";
  }

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
    >
      {/* Header with Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>مستشار العرض الاحترافي للمنتج</span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${gradeColor}`}
              >
                {grade} ({score}%)
              </span>
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              مؤشر ذكي يضمن تقديم منتجك للعملاء بأعلى جاذبية ومعدل تحويل
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-36 space-y-1">
          <div className="flex justify-between text-[11px] font-mono font-bold text-muted-foreground">
            <span>اكتمال المعايير</span>
            <span>{score}/100</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Image Quality Report Box */}
      <div className="rounded-xl p-3 bg-muted/40 border border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>فحص جودة وملاءمة الصورة:</span>
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              imageState.rating === "ممتازة HD"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : imageState.rating === "مقبولة"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  : imageState.rating === "دقة منخفضة"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
            }`}
          >
            {imageState.rating}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{imageState.message}</p>

        {imageState.dimensions && (
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
            <span className="bg-background px-2 py-0.5 rounded border border-border/60">
              الأبعاد: {imageState.dimensions.width} × {imageState.dimensions.height} بكسل
            </span>
            <span className="bg-background px-2 py-0.5 rounded border border-border/60">
              نسبة العرض: {imageState.aspectRatio}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Checklist */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-foreground block mb-1">
          عناصر العرض التنافسي المطلوب إضافتها:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {checks.map((c) => (
            <div
              key={c.id}
              className={`flex items-start gap-2 p-2 rounded-xl text-xs transition-colors border ${
                c.passed
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 text-emerald-900 dark:text-emerald-100"
                  : c.importance === "ضروري"
                    ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 text-rose-900 dark:text-rose-200"
                    : "bg-muted/40 border-border/50 text-muted-foreground"
              }`}
            >
              {c.passed ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <span className="leading-snug block font-medium">{c.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
