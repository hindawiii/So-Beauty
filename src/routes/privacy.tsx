import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Lock, Eye, FileText, Truck, Phone, Mail, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية وأمان البيانات | Privacy Policy" },
      {
        name: "description",
        content:
          "نلتزم بحماية خصوصية بياناتك الشخصية ومعلومات الشحن والتوصيل وفق أعلى معايير الأمان والسرية.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const { settings } = useStoreSettings();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            {t("nav.home")}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 rotate-0" />
          <span className="text-foreground font-medium">{t("footer.privacy")}</span>
        </div>

        {/* Header Title Section */}
        <div className="mb-10 text-center sm:text-start border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("privacy.badge")}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
          >
            {t("privacy.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            {t("privacy.subtitle")}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1: Collection */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("privacy.collectionTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("privacy.collectionP")}</p>
          </section>

          {/* Section 2: Usage */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("privacy.usageTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("privacy.usageP")}</p>
          </section>

          {/* Section 3: Security */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("privacy.securityTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("privacy.securityP")}</p>
          </section>

          {/* Section 4: Cookies & LocalStorage */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("privacy.cookiesTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("privacy.cookiesP")}</p>
          </section>

          {/* Section 5: Support & Inquiries */}
          <section className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("privacy.supportTitle")}
            </h2>
            <p className="text-muted-foreground">{t("privacy.supportP")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium" dir="ltr">
                  {settings.supportPhone || "+249 900 776 688"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium" dir="ltr">
                  {settings.supportEmail || "support@store.com"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
