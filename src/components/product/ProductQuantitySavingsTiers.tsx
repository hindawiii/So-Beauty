import React from "react";
import { Sparkles, Check, Flame, Gift } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductQuantitySavingsTiersProps {
  unitPrice: number;
  currentQuantity: number;
  onSelectQuantity: (qty: number) => void;
  language: string;
}

export function ProductQuantitySavingsTiers({
  unitPrice,
  currentQuantity,
  onSelectQuantity,
  language,
}: ProductQuantitySavingsTiersProps) {
  const { formatPrice } = useCurrency();

  // Tier 1: 1 unit, 0% off
  const t1Price = unitPrice;
  // Tier 2: 2 units, 15% off
  const t2Discount = 0.15;
  const t2UnitPrice = Math.round(unitPrice * (1 - t2Discount));
  const t2Total = t2UnitPrice * 2;
  const t2Savings = unitPrice * 2 - t2Total;

  // Tier 3: 3 units, 25% off
  const t3Discount = 0.25;
  const t3UnitPrice = Math.round(unitPrice * (1 - t3Discount));
  const t3Total = t3UnitPrice * 3;
  const t3Savings = unitPrice * 3 - t3Total;

  return (
    <div className="space-y-2.5 my-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-slate-50 to-primary/10 border border-primary/20">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>
            {language === "ar"
              ? "وفري أكثر عند طلب عبوات إضافية (عروض التوفير):"
              : "Buy More, Save More (Tiered Savings):"}
          </span>
        </h4>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
          {language === "ar" ? "شحن مجاني مع 2+" : "Free Ship on 2+"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Tier 1 */}
        <button
          type="button"
          onClick={() => onSelectQuantity(1)}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between relative ${
            currentQuantity === 1
              ? "bg-white dark:bg-slate-900 border-primary ring-2 ring-primary/20 shadow-xs"
              : "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              {language === "ar" ? "عبوة واحدة" : "1 Unit"}
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-mono block mt-1">
              {formatPrice(t1Price)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1.5">
            {language === "ar" ? "السعر العادي" : "Standard"}
          </span>
        </button>

        {/* Tier 2: Most Popular */}
        <button
          type="button"
          onClick={() => onSelectQuantity(2)}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between relative ${
            currentQuantity === 2
              ? "bg-white dark:bg-slate-900 border-primary ring-2 ring-primary/30 shadow-xs"
              : "bg-white/70 dark:bg-slate-900/60 border-primary/30 hover:border-primary/60"
          }`}
        >
          <span className="absolute -top-2 inset-x-1 sm:inset-x-2 text-[9px] font-bold bg-primary text-white rounded-full py-0.5 shadow-2xs">
            {language === "ar" ? "الأكثر طلباً ⭐" : "Most Popular"}
          </span>
          <div className="pt-1.5">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              {language === "ar" ? "عبوتان (-15%)" : "2 Units (-15%)"}
            </span>
            <span className="text-xs sm:text-sm font-black text-primary font-mono block mt-1">
              {formatPrice(t2UnitPrice)}
              <span className="text-[9px] text-slate-400 font-normal"> / للعبوة</span>
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">
            {language === "ar"
              ? `وفري ${formatPrice(t2Savings)}`
              : `Save ${formatPrice(t2Savings)}`}
          </span>
        </button>

        {/* Tier 3: Best Value */}
        <button
          type="button"
          onClick={() => onSelectQuantity(3)}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between relative ${
            currentQuantity === 3
              ? "bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-400/30 shadow-xs"
              : "bg-white/70 dark:bg-slate-900/60 border-amber-300 hover:border-amber-400"
          }`}
        >
          <span className="absolute -top-2 inset-x-1 sm:inset-x-2 text-[9px] font-bold bg-amber-500 text-white rounded-full py-0.5 shadow-2xs">
            {language === "ar" ? "أفضل قيمة 🎁" : "Best Value"}
          </span>
          <div className="pt-1.5">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
              {language === "ar" ? "3 عبوات (-25%)" : "3 Units (-25%)"}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-600 font-mono block mt-1">
              {formatPrice(t3UnitPrice)}
              <span className="text-[9px] text-slate-400 font-normal"> / للعبوة</span>
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 block mt-1">
            {language === "ar"
              ? `وفري ${formatPrice(t3Savings)}`
              : `Save ${formatPrice(t3Savings)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
