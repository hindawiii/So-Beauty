import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  KeyRound,
  SlidersHorizontal,
  ArrowLeft,
  Lock,
  Code2,
  Sparkles,
  Flame,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LuxePinBoxes } from "@/components/LuxePinBoxes";
import { StoreSettingsTab } from "@/components/StoreSettingsTab";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "مركز المطور السري — Developer Master Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DeveloperDashboardPage,
});

// Master Developer PIN known ONLY to you (Default 6-digit PIN: 998877)
const MASTER_DEV_PINS = ["998877", "dev2026", "202600"];

function DeveloperDashboardPage() {
  const { settings, updateSettings } = useStoreSettings();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("so_beauty_developer_auth") === "true";
    }
    return false;
  });

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Check if developer portal has been destroyed / locked by the developer
  if (settings.developerPortalLocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans text-center">
        <div className="max-w-md">
          <h1 className="text-7xl font-extrabold text-foreground tracking-tight">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير متوفرة، أو ربما تم نقلها أو حذفها نهائياً.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              العودة للرئيسية
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              تصفح المنتجات
            </Link>
          </div>

          {/* Invisible / Discrete Emergency Unlock Trigger for the owner */}
          <div className="mt-12">
            <button
              type="button"
              onClick={() => {
                const master = prompt("Enter Master Authorization Code:");
                if (master === "998877" || master === "dev2026") {
                  updateSettings({ developerPortalLocked: false });
                  toast.success("تم استعادة مسار المطور بنجاح 🛡️");
                }
              }}
              className="text-[10px] text-muted-foreground/20 hover:text-muted-foreground/60 transition-colors select-none cursor-default"
              title="System verification"
            >
              •
            </button>
          </div>
        </div>
      </div>
    );
  }

  const verifyMasterPin = (candidatePin: string) => {
    const cleanPin = candidatePin.trim();
    if (MASTER_DEV_PINS.includes(cleanPin)) {
      setIsAuthenticated(true);
      sessionStorage.setItem("so_beauty_developer_auth", "true");
      setPinError("");
      toast.success("مرحباً بك في مركز المطور ومالك النظام 🛡️✨");
    } else {
      setPinError(
        "رمز المرور للمطور غير صحيح (مكون من 6 أرقام). هذا المسار مخصص لمالك النظام فقط.",
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("so_beauty_developer_auth");
    setIsAuthenticated(false);
    setPinInput("");
    toast.info("تم قفل مركز المطور بنجاح 🔒");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" dir="rtl">
      <SiteHeader />

      {!isAuthenticated ? (
        /* Developer Master Gate (Login Screen) */
        <div className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="w-full max-w-md bg-card border border-slate-200/80 rounded-3xl p-8 shadow-sm text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Code2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Developer Master Gate (6-Digit Security)</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">بوابة المطور ومالك النظام</h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                هذا المسار مخصص لمالك النظام والمطور حصراً لإعداد هوية المتاجر وقوالب الأنشطة
                والاستعادة الآمنة. العميل المشتري يدخل عبر (/admin) برمز الدخول الخاص به.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyMasterPin(pinInput);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  أدخل رمز المطور الرئيسي المكون من 6 أرقام (Master PIN)
                </label>
                <LuxePinBoxes
                  length={6}
                  onComplete={(enteredPin) => {
                    setPinInput(enteredPin);
                    verifyMasterPin(enteredPin);
                  }}
                  error={pinError}
                  onClearError={() => setPinError("")}
                />
                <p className="text-[11px] text-slate-400 font-mono">
                  رمز المطور السري الافتراضي: 998877
                </p>
              </div>

              <Button
                type="submit"
                disabled={pinInput.length < 6}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs"
              >
                تأكيد الدخول الآمن
              </Button>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
              <Link
                to="/admin"
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
              >
                <span>الذهاب إلى لوحة إدارة المتجر العامة (/admin)</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Developer Control Center */
        <main className="flex-1 container mx-auto px-4 py-8 space-y-6 max-w-6xl">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <span>مركز المطور ومالك النظام (System Core Admin)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Master Authorized
                  </span>
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  تحكم كامل في هوية المتجر، القوالب، قفل النسخ، واستعادة النظام بنقرة زر.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link to="/admin">
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-xl text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white gap-1.5"
                >
                  <span>لوحة العميل (/admin)</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="h-9 px-3 rounded-xl text-xs bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/60 hover:text-rose-200 gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>قفل الجلسة</span>
              </Button>
            </div>
          </div>

          {/* Store Settings & Niche Management Tab */}
          <StoreSettingsTab />
        </main>
      )}

      <SiteFooter />
    </div>
  );
}
