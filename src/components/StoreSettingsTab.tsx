import { useState, useEffect } from "react";
import { ShieldCheck, Save, RotateCcw, Sliders, History, Download, Flame } from "lucide-react";
import { useStoreSettings, StoreBrandingSettings } from "@/context/StoreSettingsContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StoreBlueprint } from "@/lib/blueprintsVault";
import { downloadSanitizedConfigFile } from "@/lib/sanitization-shield";
import { StoreGeneralInfoCard } from "@/components/settings/StoreGeneralInfoCard";
import { StoreShippingCurrencyCard } from "@/components/settings/StoreShippingCurrencyCard";
import { StoreThemingAndMotionCard } from "@/components/settings/StoreThemingAndMotionCard";
import { StoreBlueprintsVaultCard } from "@/components/settings/StoreBlueprintsVaultCard";

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

  // Sync formData when external settings change
  useEffect(() => {
    setFormData((prev) => {
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

  const handleApplyBlueprint = (bp: StoreBlueprint) => {
    setFormData((prev) => ({
      ...prev,
      ...bp.settings,
    }));
    setHasUnsavedChanges(true);
    toast.success(`تم تطبيق ${bp.name} بنجاح! 🚀`);
  };

  const handleSave = () => {
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
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-slate-700 hover:text-slate-900 cursor-pointer"
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
              className="h-10 px-3 rounded-xl text-xs gap-1.5 text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100 cursor-pointer"
              title="التراجع عن آخر تغيير"
            >
              <History className="w-3.5 h-3.5" />
              <span>تراجع للنسخة السابقة</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleRestoreGolden}
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-rose-700 border-rose-200 bg-rose-50/50 hover:bg-rose-100 cursor-pointer"
            title="استعادة بيانات سو بيوتي الأصلية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة نسخة سو بيوتي الأصلية</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              downloadSanitizedConfigFile(formData);
              toast.success("تم تنزيل ملف الإعدادات المشفر الآمن بنجاح 🛡️");
            }}
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 cursor-pointer"
            title="تنزيل ملف الإعدادات المشفر"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل ملف الإعدادات</span>
          </Button>
        </div>
      </div>

      {/* Floating Save Actions Bar */}
      {hasUnsavedChanges && (
        <div className="sticky top-20 z-30 p-3.5 rounded-2xl bg-slate-950 text-white shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold">
              توجد تغييرات غير محفوظة في إعدادات النظام!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormData(settings);
                setHasUnsavedChanges(false);
                toast.info("تم إلغاء التعديلات غير المحفوظة");
              }}
              className="text-xs text-slate-300 hover:text-white cursor-pointer h-9 px-3"
            >
              إلغاء التعديلات
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="h-9 px-5 rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ وتطبيق الآن</span>
            </Button>
          </div>
        </div>
      )}

      {/* 1. Store General Info & Social */}
      <StoreGeneralInfoCard formData={formData} onChange={handleChange} />

      {/* 2. Shipping & Currency Rules */}
      <StoreShippingCurrencyCard formData={formData} onChange={handleChange} />

      {/* 3. Theming & Motion Engine */}
      <StoreThemingAndMotionCard formData={formData} onChange={handleChange} />

      {/* 4. Blueprints Vault & Templates */}
      <StoreBlueprintsVaultCard formData={formData} onApplyBlueprint={handleApplyBlueprint} />

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          onClick={handleSave}
          className="h-11 px-6 rounded-xl text-xs sm:text-sm font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ جميع الإعدادات</span>
        </Button>
      </div>
    </div>
  );
}
