import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "تسجيل الدخول / إنشاء حساب | Authentication" },
      {
        name: "description",
        content: "سجّلي دخولكِ أو أنشئي حسابًا جديدًا للاستمتاع بتجربة تسوق متكاملة وسريعة.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const emailSchema = z
    .string()
    .trim()
    .email({
      message:
        language === "ar" ? "يرجى إدخال بريد إلكتروني صالح" : "Please enter a valid email address",
    })
    .max(255);

  const passwordSchema = z
    .string()
    .min(6, {
      message:
        language === "ar"
          ? "كلمة المرور يجب أن لا تقل عن 6 أحرف"
          : "Password must be at least 6 characters",
    })
    .max(72);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user)
        navigate({ to: redirect && redirect.startsWith("/") ? redirect : "/", replace: true });
    });
  }, [navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const emailV = emailSchema.parse(email);
      const passV = passwordSchema.parse(password);
      if (mode === "signup") {
        const name = z.string().trim().min(2).max(100).parse(fullName);
        const { error } = await supabase.auth.signUp({
          email: emailV,
          password: passV,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success(t("auth.registerSuccessToast"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailV,
          password: passV,
        });
        if (error) throw error;
        toast.success(t("auth.loginSuccessToast"));
      }
      navigate({ to: redirect && redirect.startsWith("/") ? redirect : "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error(
        language === "ar"
          ? "تعذّر تسجيل الدخول بواسطة Google حالياً"
          : "Unable to sign in with Google right now",
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-border/80 shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{mode === "signin" ? t("auth.signInBtn") : t("auth.registerBtn")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {mode === "signin" ? t("auth.titleLogin") : t("auth.titleRegister")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {mode === "signin" ? t("auth.subtitleLogin") : t("auth.subtitleRegister")}
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full mb-4 h-11 font-medium gap-2 rounded-xl"
            onClick={google}
            type="button"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t("auth.googleBtn")}</span>
          </Button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-xs text-muted-foreground uppercase absolute">
              {t("auth.or")}
            </span>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
                  {t("auth.fullName")}
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  placeholder={t("auth.fullNamePlaceholder")}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold rounded-xl mt-2"
              disabled={loading}
            >
              {loading
                ? t("auth.loading")
                : mode === "signin"
                  ? t("auth.signInBtn")
                  : t("auth.registerBtn")}
            </Button>
          </form>

          <div className="text-center mt-6 text-xs sm:text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                <span>{t("auth.noAccount")} </span>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {t("auth.registerNow")}
                </button>
              </>
            ) : (
              <>
                <span>{t("auth.haveAccount")} </span>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {t("auth.signInNow")}
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-3 pt-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground mb-2">{t("auth.guestNotice")}</p>
            <Link to="/" className="text-xs text-primary font-medium hover:underline">
              ← {t("auth.backHome")}
            </Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
