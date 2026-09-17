import React from "react";
import { Eye, Check, X, Sparkles } from "lucide-react";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { Button } from "@/components/ui/button";

export function SandboxPreviewBanner() {
  const { isPreviewMode, previewThemeTitle, commitSandboxPreview, cancelSandboxPreview } =
    useStoreSettings();

  if (!isPreviewMode) return null;

  return (
    <aside
      aria-label="شريط معاينة القالب التجريبي"
      className="sticky top-0 z-50 w-full bg-slate-950/95 text-white backdrop-blur-md border-b border-amber-500/40 shadow-lg px-4 py-2.5 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>وضع المعاينة الحية المؤقتة (Sandbox Preview):</span>
          </div>
          <span className="bg-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-full font-medium border border-amber-500/30">
            {previewThemeTitle || "قالب مخصص"}
          </span>
          <span className="hidden sm:inline text-slate-400">
            (التغييرات غير محفوظة للزوار حتى تضغطي على تطبيق)
          </span>
        </div>

        <div className="flex items-center gap-2 ms-auto">
          <Button
            size="sm"
            onClick={commitSandboxPreview}
            className="h-8 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>حفظ واعتماد للمتجر</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={cancelSandboxPreview}
            className="h-8 px-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء المعاينة</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
