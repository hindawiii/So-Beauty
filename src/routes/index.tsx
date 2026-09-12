import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
  Star,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import heroProducts from "@/assets/hero-products.jpg";
import natural from "@/assets/natural-collection.jpg";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";
import skinHydrated from "@/assets/skin-hydrated.jpg";
import skinBalanced from "@/assets/skin-balanced.jpg";
import skinFirm from "@/assets/skin-firm.jpg";
import skinGlow from "@/assets/skin-glow.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";
import { Button } from "@/components/ui/button";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { getReviews, Review, INITIAL_REVIEWS } from "@/lib/reviews";

const featuredQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "So Beauty — العناية الطبيعية بالبشرة" },
      { name: "description", content: "منتجات عناية طبيعية للبشرة مستوحاة من نقاء الطبيعة." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery),
  component: Index,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">غير موجود</div>,
});

const features = [
  { icon: Sparkles, title: "نتائج فعّالة", desc: "منتجات مصنوعة بعناية لأفضل النتائج." },
  { icon: Truck, title: "شحن سريع", desc: "توصيل طلبك في أسرع وقت." },
  { icon: CreditCard, title: "دفع آمن", desc: "ادفع عند الاستلام أو أونلاين." },
  { icon: ShieldCheck, title: "أصلية 100%", desc: "نضمن جودة وأصالة كل منتج." },
];

function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary/5 py-12 md:py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                جمالكِ الطبيعي يبدأ من هنا
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                اكتشفي مجموعة{" "}
                <span
                  className="font-semibold text-primary"
                  style={{ fontFamily: "var(--font-latin)" }}
                >
                  So Beauty
                </span>{" "}
                من منتجات العناية الطبيعية بالبشرة — نقاء نباتي وإشراقة تدوم.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/products">
                  <Button size="lg">تسوّق الآن</Button>
                </Link>
                <Link to="/offers">
                  <Button size="lg" variant="outline">
                    شاهد العروض
                  </Button>
                </Link>
              </div>
            </div>
            <img src={heroProducts} alt="So Beauty products" className="rounded-3xl w-full" />
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="text-center p-4">
              <f.icon className="w-10 h-10 mx-auto text-primary mb-3" />
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">منتجاتنا</h2>
            <Link to="/products" className="text-primary font-semibold flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <Suspense fallback={<div>...</div>}>
            <FeaturedProducts />
          </Suspense>
        </section>

        <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center bg-primary/5 rounded-3xl">
          <img src={natural} alt="مجموعة طبيعية" className="rounded-2xl w-full" />
          <div>
            <h2 className="text-3xl font-bold mb-3 text-primary">Natural Bloom</h2>
            <p className="text-muted-foreground mb-4">
              مكوّنات نباتية 100% مستخلصة بعناية لتمنحك بشرة نضرة وصحية.
            </p>
            <Link to="/boxes">
              <Button>اكتشف البوكسات</Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">اختاري بشرتك</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: skinHydrated, label: "بشرة مرطبة", tone: "oklch(0.25 0.05 240)" },
              { img: skinBalanced, label: "بشرة موحّدة", tone: "oklch(0.22 0.08 150)" },
              { img: skinFirm, label: "بشرة مشدودة", tone: "oklch(0.28 0.08 300)" },
              { img: skinGlow, label: "بشرة مشرقة", tone: "oklch(0.35 0.15 25)" },
            ].map((c) => (
              <Link
                key={c.label}
                to="/products"
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={c.img}
                  alt={c.label}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute bottom-0 inset-x-0 py-3 px-4 text-white text-center font-bold text-sm md:text-base"
                  style={{ background: c.tone }}
                >
                  {c.label}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">قبل وبعد</h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div>
              <img src={beforeImg} alt="قبل" className="rounded-2xl w-full" />
              <p className="text-center mt-2 font-bold">قبل</p>
            </div>
            <div>
              <img src={afterImg} alt="بعد" className="rounded-2xl w-full" />
              <p className="text-center mt-2 font-bold">بعد</p>
            </div>
          </div>
        </section>

        <CustomerReviewsSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  const loadReviews = useCallback(async () => {
    try {
      const data = await getReviews();
      if (data && data.length > 0) {
        setReviews(data);
      }
    } catch {
      // fallback handled gracefully
    }
  }, []);

  useEffect(() => {
    loadReviews();
    const handleAdded = () => {
      loadReviews();
    };
    window.addEventListener("so_beauty_review_added", handleAdded);
    return () => window.removeEventListener("so_beauty_review_added", handleAdded);
  }, [loadReviews]);

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">آراء عملائنا</h2>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-sm text-slate-600">
            تجارب حقيقية لعميلاتنا مع منتجات سو بيوتي الطبيعية للعناية بالبشرة
          </p>
        </div>
        <AddReviewDialog onReviewAdded={loadReviews} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((t) => (
          <div
            key={t.id || t.name}
            className="bg-card p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {t.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    تجربة موثوقة
                  </span>
                )}
              </div>
              <p className="mb-4 text-slate-700 text-sm leading-relaxed font-normal">"{t.body}"</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">— {t.name}</span>
              <span className="text-xs text-slate-400">تقييم معتمد</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { data } = useSuspenseQuery(featuredQuery);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.slice(0, 8).map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
