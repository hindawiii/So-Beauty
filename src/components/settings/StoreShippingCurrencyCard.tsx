import React from "react";
import { Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StoreBrandingSettings } from "@/context/StoreSettingsContext";

interface StoreShippingCurrencyCardProps {
  formData: StoreBrandingSettings;
  onChange: <K extends keyof StoreBrandingSettings>(
    key: K,
    value: StoreBrandingSettings[K],
  ) => void;
}

export function StoreShippingCurrencyCard({ formData, onChange }: StoreShippingCurrencyCardProps) {
  return (
    <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Coins className="w-4 h-4 text-amber-600" />
        <h3 className="font-bold text-sm text-slate-900">
          3. العملة الافتراضية ورسوم وسياسات التوصيل
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">العملة الافتراضية للمتجر</label>
          <select
            value={formData.defaultCurrency}
            onChange={(e) =>
              onChange(
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
          <label className="text-xs font-semibold text-slate-700">رسوم التوصيل القياسية</label>
          <Input
            type="number"
            min={0}
            value={formData.deliveryFee}
            onChange={(e) => onChange("deliveryFee", Number(e.target.value) || 0)}
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
            onChange={(e) => onChange("freeShippingThreshold", Number(e.target.value) || 0)}
            className="h-10 text-xs font-mono rounded-xl"
          />
          <p className="text-[11px] text-slate-400">
            💡 يتم تنبيه العميلة في السلة تلقائياً بالمبلغ المتبقي للحصول على توصيل مجاني.
          </p>
        </div>
      </div>
    </div>
  );
}
