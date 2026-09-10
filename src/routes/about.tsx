import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Sparkles, ShieldCheck, HeartHandshake, Target, Eye } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import natural from "@/assets/natural-collection.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — So Beauty" },
      {
        name: "description",
        content: "تعرّفي على قصة سو بيوتي، رسالتنا ورؤيتنا في تقديم عناية طبيعية راقية لبشرتك.",
      },
      { property: "og:title", content: "من نحن — So Beauty" },
      { property: "og:description", content: "قصة سو بيوتي: عناية طبيعية بمكوّنات نقيّة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { Icon: Leaf, title: "مكوّنات طبيعية", desc: "خلاصات نباتية نقيّة بلا مواد كيميائية قاسية." },
  { Icon: ShieldCheck, title: "جودة مضمونة", desc: "منتجات أصلية 100% مختبرة بعناية." },
  { Icon: Sparkles, title: "نتائج ملموسة", desc: "تركيبات فعّالة تمنح بشرتك إشراقة حقيقية." },
  { Icon: HeartHandshake, title: "خدمة صادقة", desc: "دعم قريب من عملائنا في كل خطوة." },
];

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary/5 py-14 md:py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary font-bold mb-3 tracking-wide">من نحن</p>
              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                قصّة <span style={{ fontFamily: "var(--font-latin)" }}>So Beauty</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                سو بيوتي علامة سودانية وُلدت من إيمانٍ عميق بأن جمال البشرة يبدأ من الطبيعة. نختار
                مكوّناتنا بعناية، ونقدّم لكِ منتجات عناية راقية تجمع بين النقاء النباتي والفعالية
                العلمية، لتنعمي ببشرة صحيّة ومشرقة كل يوم.
              </p>
            </div>
            <img src={natural} alt="So Beauty" className="rounded-3xl w-full shadow-lg" />
          </div>
        </section>

        {/* Mission / Vision */}
        <section className="container mx-auto px-4 py-14 grid md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-2xl p-8">
            <Target className="w-10 h-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-3">رسالتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نجعل العناية الطبيعية بالبشرة تجربةً يومية سهلة وممتعة لكل امرأة، عبر منتجات موثوقة
              بأسعار عادلة وخدمة تليق بكِ.
            </p>
          </div>
          <div className="bg-card border rounded-2xl p-8">
            <Eye className="w-10 h-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-3">رؤيتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نكون الوجهة الأولى في السودان لمنتجات العناية الطبيعية، ونصنع مجتمعًا يحتفي بجمال
              البشرة الحقيقي.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 pb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">قيمنا</h2>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">ابدئي رحلتك مع سو بيوتي</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              اكتشفي مجموعتنا من منتجات العناية الطبيعية واختاري ما يناسب بشرتك.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/products">
                <Button size="lg">تسوّقي الآن</Button>
              </Link>
              <Link to="/boxes">
                <Button size="lg" variant="outline">
                  بوكسات العناية
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
