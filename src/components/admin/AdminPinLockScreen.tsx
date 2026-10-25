import React from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuxePinBoxes } from "@/components/LuxePinBoxes";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface AdminPinLockScreenProps {
  pinError: string;
  onPinComplete: (enteredPin: string) => void;
  onUnlock: (e?: React.FormEvent) => void;
  onClearError: () => void;
  defaultPinHint?: string;
}

export function AdminPinLockScreen({
  pinError,
  onPinComplete,
  onUnlock,
  onClearError,
  defaultPinHint = "2026",
}: AdminPinLockScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-3.5 shadow-xs ring-8 ring-primary/5">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold mb-2">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>منطقة محمية ومشفرة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              لوحة إدارة متجر سو بيوتي
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              أدخلي رمز المرور المكون من 4 خانات للوصول إلى إدارة الطلبات والمخزون والمنتجات.
            </p>
          </div>

          <form onSubmit={onUnlock} className="space-y-5">
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 text-center">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                رمز الدخول الإداري (PIN):
              </label>

              <LuxePinBoxes
                length={4}
                onComplete={onPinComplete}
                error={pinError}
                onClearError={onClearError}
              />

              <p className="text-[11px] text-slate-400 mt-3 text-center">
                💡 تلميح: الرمز الافتراضي للتجربة هو{" "}
                <strong className="font-mono text-primary font-bold">{defaultPinHint}</strong>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-sm gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>فتح لوحة التحكم</span>
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                العودة إلى واجهة المتجر الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
