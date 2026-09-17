import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Sparkles, ShieldCheck, HeartHandshake, Target, Eye } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import natural from "@/assets/natural-collection.jpg";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — قصة المتجر ورؤيتنا" },
      {
        name: "description",
        content: "تعرّف على قصتنا، رسالتنا ورؤيتنا في تقديم أفضل المنتجات والخدمات المعتمدة.",
      },
      { property: "og:title", content: "من نحن — قصة متجرنا" },
      { property: "og:description", content: "نقدم لكم الجودة والأصالة في كل تجربة تسوق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { Icon: Leaf, title: "أصالة وجودة", desc: "منتجات موثوقة ومختارة بعناية لأعلى معايير الرضا." },
  { Icon: ShieldCheck, title: "ضمان شامل", desc: "منتجات أصلية 100% مختبرة ومضمونة المصدر." },
  {
    Icon: Sparkles,
    title: "تجربة استثنائية",
    desc: "خدمة متكاملة وابتكار يمنحك قيمة حقيقية في كل طلب.",
  },
  {
    Icon: HeartHandshake,
    title: "خدمة صادقة",
    desc: "فريق دعم قريب من عملائنا في كل خطوة ومتابعة دائمة.",
  },
];

function AboutPage() {
  const { settings } = useStoreSettings();

  const brandName = settings.storeName || "متجرنا الإلكتروني";
  const aboutHeading = settings.aboutTitle || `عالم ${brandName}`;
  const aboutStory =
    settings.aboutDescription ||
    `${brandName} علامة تجارية تأسست من إيمانٍ عميق بتقديم أعلى مستويات الجودة والتميز. نختار منتجاتنا بدقة متناهية، ونقدّم لك تشكيلة تجمع بين الفخامة والفعالية لتنعم بتجربة تسوق موثوقة ومميزة كل يوم.`;
  const heroImg = settings.promoImageUrl || settings.heroImageUrl || natural;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary/5 py-14 md:py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary font-bold mb-3 tracking-wide">من نحن</p>
              <h1
                className="text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight"
                style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
              >
                قصّة <span>{brandName}</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {aboutStory}
              </p>
            </div>
            <img
              src={heroImg}
              alt={brandName}
              className="rounded-3xl w-full max-h-[460px] object-cover shadow-lg"
            />
          </div>
        </section>

        {/* Mission / Vision */}
        <section className="container mx-auto px-4 py-14 grid md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-2xl p-8">
            <Target className="w-10 h-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-3">رسالتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نجعل تجربة التسوق وخدمة العملاء سهلة وممتعة وموثوقة لكل عميل، عبر منتجات أصلية
              بأسعار عادلة وخدمة تليق بتطلعاتكم.
            </p>
          </div>
          <div className="bg-card border rounded-2xl p-8">
            <Eye className="w-10 h-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-3">رؤيتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نكون الوجهة الأولى والموثوقة في تلبية احتياجاتكم، وصناعة مجتمع يقدّر القيمة والجودة
              والخدمة الراقية.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 pb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">قيمنا الراسخة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map(({ Icon, title, desc }) => (
              <div key={title} className="text-center p-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16">
          <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              ابدأ تجربة التسوق مع {brandName}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              اكتشف أحدث التشكيلات والعروض الحصرية المتاحة اليوم بأفضل الأسعار.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/products">
                <Button size="lg">{settings.heroPrimaryCtaText || "تسوّق الآن"}</Button>
              </Link>
              <Link to="/offers">
                <Button size="lg" variant="outline">
                  {settings.heroSecondaryCtaText || "شاهد العروض"}
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
