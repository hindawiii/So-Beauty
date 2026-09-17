import React, { useState } from "react";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, ShieldCheck, Check, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AdminPinManagerCardProps {
  variant?: "admin" | "developer";
}

export function AdminPinManagerCard({ variant = "admin" }: AdminPinManagerCardProps) {
  const { settings, updateSettings } = useStoreSettings();
  const currentPin = settings.adminPin || "2026";

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!cleanPin) {
      toast.error("يرجى كتابة رمز المرور الجديد أولاً");
      return;
    }

    if (cleanPin.length < 4) {
      toast.error("يجب ألا يقل رمز المرور عن 4 أرقام أو حروف");
      return;
    }

    if (cleanPin !== cleanConfirm) {
      toast.error("رمز التأكيد غير مطابق لرمز المرور الجديد");
      return;
    }

    setIsSaving(true);
    try {
      updateSettings({ adminPin: cleanPin });
      // Update session storage so current admin is not kicked out
      if (typeof window !== "undefined") {
        sessionStorage.setItem("so_beauty_admin_auth_pin", cleanPin);
        sessionStorage.setItem("so_beauty_admin_auth", "true");
      }
      setNewPin("");
      setConfirmPin("");
      toast.success("تم تحديث وحفظ رمز دخول لوحة الإدارة بنجاح! 🔐✨");
    } catch {
      toast.error("حدث خطأ أثناء حفظ رمز المرور");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>تغيير كلمة سر ورمز دخول الإدارة (Admin PIN)</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                حماية الدخول
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              الرمز المستخدم لحماية وقفل شاشة الإدارة العامة (/admin).
            </p>
          </div>
        </div>

        {/* Current Active Pin Preview */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 text-xs self-start sm:self-auto">
          <span className="text-slate-500">الرمز الفعّال حالياً:</span>
          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 tracking-wider">
            {showPin ? currentPin : "••••"}
          </span>
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            title={showPin ? "إخفاء الرمز" : "إظهار الرمز"}
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdatePin} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>رمز المرور الجديد (4 أرقام أو أكثر)</span>
              <span className="text-[10px] text-slate-400">مثال: 2026 أو 4589</span>
            </label>
            <div className="relative">
              <Input
                type={showPin ? "text" : "password"}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="اكتب رمز PIN الجديد..."
                className="h-10 text-xs font-mono rounded-xl pe-9 text-start"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">تأكيد رمز المرور الجديد</label>
            <div className="relative">
              <Input
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="أعد كتابة الرمز نفسه..."
                className="h-10 text-xs font-mono rounded-xl pe-9 text-start"
                dir="ltr"
              />
              <Check className="w-4 h-4 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {variant === "developer"
                ? "يمكنك تسليم هذا الرمز للعميل للدخول إلى لوحة /admin وإخفاء مسار المطور."
                : "سيتم تطبيق الرمز فوراً وحفظه دون الحاجة لتسجيل الخروج."}
            </span>
          </div>

          <Button
            type="submit"
            disabled={isSaving || !newPin || !confirmPin}
            className="h-10 px-5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs shrink-0 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 me-1.5" />
            <span>حفظ رمز الدخول الجديد</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
