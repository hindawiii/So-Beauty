import React, { useState } from "react";
import { Layers, Save, Copy, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StoreBrandingSettings } from "@/context/StoreSettingsContext";
import { PRESET_BLUEPRINTS, StoreBlueprint } from "@/lib/blueprintsVault";

interface StoreBlueprintsVaultCardProps {
  formData: StoreBrandingSettings;
  onApplyBlueprint: (blueprint: StoreBlueprint) => void;
}

export function StoreBlueprintsVaultCard({
  formData,
  onApplyBlueprint,
}: StoreBlueprintsVaultCardProps) {
  const [blueprintJsonInput, setBlueprintJsonInput] = useState("");
  const [customVault, setCustomVault] = useState<StoreBlueprint[]>(() => {
    if (typeof window === "undefined") return PRESET_BLUEPRINTS;
    try {
      const saved = localStorage.getItem("luxe_saved_blueprints_vault");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse saved blueprints vault:", e);
    }
    return PRESET_BLUEPRINTS;
  });

  const handleExportBlueprint = () => {
    try {
      const payload = JSON.stringify(formData, null, 2);
      navigator.clipboard.writeText(payload);
      toast.success("تم نسخ كود الهيكل (JSON) بالكامل إلى الحافظة بنجاح! 📋");
    } catch {
      toast.error("فشل نسخ الكود");
    }
  };

  const handleSaveToVault = () => {
    const name = window.prompt("أدخلي اسماً مميزاً لهذا القالب في الخزينة:", formData.storeName);
    if (!name) return;

    const newBp: StoreBlueprint = {
      id: `custom-${Date.now()}`,
      name,
      description: `قالب مخصص تم حفظه بتاريخ ${new Date().toLocaleDateString("ar-EG")}`,
      settings: formData,
    };

    const next = [newBp, ...customVault];
    setCustomVault(next);
    try {
      localStorage.setItem("luxe_saved_blueprints_vault", JSON.stringify(next));
      toast.success(`تم حفظ القالب "${name}" في خزينة القوالب المحلية بنجاح! 💾`);
    } catch {
      toast.error("فشل الحفظ في الذاكرة المحلية");
    }
  };

  const handleImportBlueprint = () => {
    if (!blueprintJsonInput.trim()) {
      toast.error("يرجى لصق كود JSON صحيح في الحقل أولاً");
      return;
    }

    try {
      const parsed = JSON.parse(blueprintJsonInput.trim());
      if (typeof parsed !== "object" || !parsed) {
        throw new Error("Invalid object");
      }

      onApplyBlueprint({
        id: `imported-${Date.now()}`,
        name: parsed.storeName || "قالب مستورد",
        description: "تم استيراده من كود JSON خارجي",
        settings: parsed,
      });

      setBlueprintJsonInput("");
      toast.success("تم استيراد وتطبيق هيكل القالب بنجاح! ✨");
    } catch {
      toast.error("كود JSON غير صالح. تأكدي من نسخ كود صحيح مطابق للشروط");
    }
  };

  return (
    <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-slate-900">
            7. خزينة القوالب المعتمدة والنسخ الاحتياطي (Blueprints Vault)
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSaveToVault}
            className="h-8 px-2.5 rounded-lg text-xs gap-1 font-bold text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ كقالب معتمد</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExportBlueprint}
            className="h-8 px-2.5 rounded-lg text-xs gap-1 font-bold text-slate-700 hover:text-slate-900"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ كود الهيكل (JSON)</span>
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        اختر أي قالب جاهز معتمد ليتحول المتجر بالكامل بنصوصه، مميزاته، وأقسامه وألوانه في ثانية
        واحدة:
      </p>

      {/* Presets List */}
      <div className="space-y-2">
        {customVault.map((bp) => (
          <div
            key={bp.id}
            className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors"
          >
            <div>
              <h4 className="text-xs font-bold text-slate-900">{bp.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{bp.description}</p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => onApplyBlueprint(bp)}
              className="h-8 px-3 rounded-lg text-xs font-bold shrink-0 bg-slate-900 hover:bg-slate-800 text-white"
            >
              تطبيق القالب فوراً 🚀
            </Button>
          </div>
        ))}
      </div>

      {/* Import JSON Box */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <label className="text-[11px] font-semibold text-slate-700 block">
          استيراد كود هيكل مخصص (Paste Blueprint JSON):
        </label>
        <div className="flex gap-2">
          <Input
            value={blueprintJsonInput}
            onChange={(e) => setBlueprintJsonInput(e.target.value)}
            placeholder='الصق كود JSON مثل: {"storeName": "متجري", "heroTitle": "..."}'
            className="h-9 text-xs rounded-xl font-mono text-start flex-1"
            dir="ltr"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleImportBlueprint}
            className="h-9 px-4 rounded-xl text-xs font-bold shrink-0"
          >
            <Upload className="w-3.5 h-3.5 ms-1" />
            <span>استيراد الكود</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
