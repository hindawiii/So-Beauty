import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Target,
  Eye,
  MessageCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import natural from "@/assets/natural-collection.jpg";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — قصة المتجر ورؤيتنا | About Us" },
      {
        name: "description",
        content: "تعرّف على قصتنا، رسالتنا ورؤيتنا في تقديم أفضل المنتجات والخدمات المعتمدة.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { settings } = useStoreSettings();
  const { t, language } = useLanguage();

  const brandName =
    settings.storeName || (language === "ar" ? "سوار للجمال والعناية" : "So Beauty Care");
  const heroImg = settings.promoImageUrl || settings.heroImageUrl || natural;

  const values = [
    {
      Icon: Leaf,
      title: t("about.valAuthentic"),
      desc: t("about.valAuthenticDesc"),
    },
    {
      Icon: ShieldCheck,
      title: t("about.valWarranty"),
      desc: t("about.valWarrantyDesc"),
    },
    {
      Icon: Sparkles,
      title: t("about.valFastShipping"),
      desc: t("about.valFastShippingDesc"),
    },
    {
      Icon: HeartHandshake,
      title: t("about.valCare"),
      desc: t("about.valCareDesc"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-12 md:py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1 rounded-full mb-3.5">
                {t("about.badge")}
              </span>
              <h1
                className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight"
                style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
              >
                {t("about.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
                {t("about.subtitle")}
              </p>
              <div className="space-y-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <p>{t("about.storyP1")}</p>
                <p>{t("about.storyP2")}</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-lg border border-slate-200/60 bg-card">
              <img
                src={heroImg}
                alt={brandName}
                className="w-full h-auto max-h-[460px] object-cover hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="container mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              {language === "ar" ? "رسالتنا" : "Our Mission"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {language === "ar"
                ? "أن نجعل تجربة العناية بالبشرة سهلة وموثوقة لكل سيدة، عبر توفير منتجات أصلية ونقية مستوردة بأعلى معايير الأمان وبأسعار عادلة تناسب الجميع."
                : "To make skincare accessible, pure, and trusted for every individual through certified authentic products, rigorous quality standards, and fair pricing."}
            </p>
          </div>
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              {language === "ar" ? "رؤيتنا" : "Our Vision"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {language === "ar"
                ? "أن نكون الوجهة الأولى في عالم الجمال والعناية الطبيعية، وصناعة مجتمع يقدّر القيمة والجودة والأصالة ويضع صحة البشرة فوق أي اعتبار."
                : "To stand as the premier destination for genuine natural beauty, fostering a community that treasures purity, verified authenticity, and exceptional customer care."}
            </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="container mx-auto px-4 pb-14">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
              {t("about.valuesTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {language === "ar"
                ? "المبادئ التي تقود كل قرار وخدمة نقدمها لعملائنا الكرام"
                : "The guiding principles that shape every product and service we deliver"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border/70 rounded-3xl p-6 text-center hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground text-primary flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support & WhatsApp CTA */}
        <section className="container mx-auto px-4 pb-16">
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-primary">
              {t("about.contactCta")}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
              {t("about.contactCtaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href={getWhatsAppChatUrl(
                  settings.whatsappNumber,
                  language === "ar"
                    ? `مرحباً، أود استشارة حول منتجات متجر ${brandName} 🌸`
                    : `Hello! I would like a consultation regarding ${brandName} products 🌸`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="h-11 px-6 font-semibold gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white border-none shadow-sm cursor-pointer">
                  <WhatsAppEmblemIcon className="w-4 h-4 fill-current" />
                  <span>{t("about.chatWhatsApp")}</span>
                </Button>
              </a>
              <Link to="/products">
                <Button variant="outline" className="h-11 px-6 font-semibold">
                  {t("common.exploreNow")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
