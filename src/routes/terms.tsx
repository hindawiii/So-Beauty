import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileText,
  ShieldAlert,
  RotateCcw,
  Truck,
  CreditCard,
  Scale,
  CheckCircle2,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "الشروط والأحكام — سياسة الاستخدام والتعامل | Terms of Service" },
      {
        name: "description",
        content:
          "الشروط والأحكام المنظمة لعمليات الشراء، الدفع عند الاستلام، الشحن، والاستبدال بمتجرنا المعتمد.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
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
          <span className="text-foreground font-medium">{t("footer.terms")}</span>
        </div>

        {/* Header Title Section */}
        <div className="mb-10 text-center sm:text-start border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Scale className="w-4 h-4" />
            <span>{t("terms.badge")}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
          >
            {t("terms.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            {t("terms.subtitle")}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1: Introduction */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("terms.introTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("terms.introP")}</p>
          </section>

          {/* Section 2: Orders & Pricing */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("terms.orderingTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("terms.orderingP")}</p>
          </section>

          {/* Section 3: COD */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("terms.codTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("terms.codP")}</p>
          </section>

          {/* Section 4: Shipping */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("terms.shippingTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("terms.shippingP")}</p>
          </section>

          {/* Section 5: Return / Exchanges */}
          <section className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{t("terms.returnTitle")}</h2>
            </div>
            <p className="text-muted-foreground">{t("terms.returnP")}</p>
          </section>

          {/* Section 6: Support */}
          <section className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {language === "ar" ? "خدمة العملاء والاستفسارات" : "Customer Care & Inquiries"}
            </h2>
            <p className="text-muted-foreground">
              {language === "ar"
                ? "إذا كان لديكم أي ملاحظة أو استفسار حول طلبكم وسياسات التعامل، يسعدنا تواصلكم المباشر معنا فوراً:"
                : "If you have any questions or feedback regarding your order or policies, feel free to reach out directly:"}
            </p>
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
            <p className="text-xs text-muted-foreground pt-2">{t("terms.lastUpdated")}</p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
