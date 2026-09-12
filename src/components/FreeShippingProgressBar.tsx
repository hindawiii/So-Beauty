import { Truck, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const FREE_SHIPPING_THRESHOLD = 250; // ج.م

interface FreeShippingProgressBarProps {
  total: number;
  showLinkToProducts?: boolean;
}

export function FreeShippingProgressBar({
  total,
  showLinkToProducts = true,
}: FreeShippingProgressBarProps) {
  const diff = FREE_SHIPPING_THRESHOLD - total;
  const isFree = diff <= 0;
  const progressPercent = isFree
    ? 100
    : Math.max(8, Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100)));

  return (
    <aside
      aria-label="شريط تقدم التوصيل المجاني"
      className={`rounded-2xl p-4 transition-all duration-300 border ${
        isFree
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
          : "bg-primary/5 border-primary/20 text-slate-800 dark:text-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          {isFree ? (
            <>
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>مبروك! لقد حصلتِ على توصيل مجاني لطلبكِ 🎉</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span>
                أضيفي منتجات بقيمة{" "}
                <span className="font-bold text-primary underline decoration-primary/40 underline-offset-2">
                  {diff.toFixed(2)} ج.م
                </span>{" "}
                واحصلي على شحن مجاني! 🚚
              </span>
            </>
          )}
        </div>

        {!isFree && showLinkToProducts && (
          <Link
            to="/products"
            className="text-[11px] sm:text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            أضيفي المزيد
          </Link>
        )}
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isFree ? "bg-emerald-500" : "bg-primary"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 px-0.5">
        <span>0 ج.م</span>
        <span className="font-medium">حد الشحن المجاني ({FREE_SHIPPING_THRESHOLD} ج.م)</span>
      </div>
    </aside>
  );
}
