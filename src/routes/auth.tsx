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

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — So Beauty" },
      {
        name: "description",
        content: "سجّل دخولك أو أنشئ حسابًا جديدًا للاستمتاع بتجربة تسوق كاملة.",
      },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email({ message: "بريد إلكتروني غير صحيح" }).max(255);
const passwordSchema = z.string().min(6, { message: "كلمة السر 6 أحرف على الأقل" }).max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

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
        toast.success("تم إنشاء الحساب");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailV,
          password: passV,
        });
        if (error) throw error;
        toast.success("مرحبًا بعودتك");
      }
      navigate({ to: redirect && redirect.startsWith("/") ? redirect : "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error("تعذّر تسجيل الدخول بـ Google");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <Button variant="outline" className="w-full mb-4" onClick={google} type="button">
            تسجيل الدخول عبر Google
          </Button>
          <div className="text-center text-xs text-muted-foreground mb-4">أو</div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة السر</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : mode === "signin" ? "دخول" : "إنشاء الحساب"}
            </Button>
          </form>
          <div className="text-center mt-6 text-sm">
            {mode === "signin" ? (
              <>
                ليس لديك حساب؟{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-semibold">
                  أنشئ حسابًا
                </button>
              </>
            ) : (
              <>
                لديك حساب؟{" "}
                <button onClick={() => setMode("signin")} className="text-primary font-semibold">
                  سجّل الدخول
                </button>
              </>
            )}
          </div>
          <div className="text-center mt-4">
            <Link to="/" className="text-xs text-muted-foreground hover:underline">
              العودة للرئيسية
            </Link>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
