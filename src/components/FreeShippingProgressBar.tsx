import { Truck, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export const FREE_SHIPPING_THRESHOLD = 250; // default fallback

interface FreeShippingProgressBarProps {
  total: number;
  showLinkToProducts?: boolean;
}

export function FreeShippingProgressBar({
  total,
  showLinkToProducts = true,
}: FreeShippingProgressBarProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { settings } = useStoreSettings();

  const threshold = settings?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;
  const diff = threshold - total;
  const isFree = diff <= 0;
  const progressPercent = isFree
    ? 100
    : Math.max(8, Math.min(100, Math.round((total / threshold) * 100)));

  return (
    <aside
      aria-label={t("freeShippingBar.ariaLabel")}
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
              <span>{t("freeShippingBar.unlocked")}</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span>{t("freeShippingBar.remaining").replace("{amount}", formatPrice(diff))}</span>
            </>
          )}
        </div>

        {!isFree && showLinkToProducts && (
          <Link
            to="/products"
            className="text-[11px] sm:text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            {t("freeShippingBar.addMore")}
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
        <span>{formatPrice(0)}</span>
        <span className="font-medium">
          {t("freeShippingBar.thresholdLabel").replace("{amount}", formatPrice(threshold))}
        </span>
      </div>
    </aside>
  );
}
