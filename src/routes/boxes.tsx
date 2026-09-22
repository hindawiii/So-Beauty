import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { PackageOpen, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const boxesQuery = queryOptions({
  queryKey: ["products", "box"],
  queryFn: () => listProducts({ data: { category: "box" } }),
});

export const Route = createFileRoute("/boxes")({
  head: () => ({
    meta: [
      { title: "البوكسات والمجموعات المتكاملة — العروض الحصرية" },
      { name: "description", content: "باقات ومجموعات متكاملة بأفضل الأسعار وأعلى قيمة." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(boxesQuery),
  component: Page,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-rose-600">{error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">404</div>,
});

function Page() {
  const { settings } = useStoreSettings();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Banner */}
        <div className="mb-8 md:mb-10 text-center sm:text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("boxes.title")}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
          >
            {t("boxes.title")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            {t("boxes.subtitle")}
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          <Grid />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-3 animate-pulse">
          <div className="aspect-square rounded-xl bg-muted/60 mb-3" />
          <div className="h-4 bg-muted/70 rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted/50 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function Grid() {
  const { data } = useSuspenseQuery(boxesQuery);
  const { t, isRTL } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t("boxes.emptyTitle")}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          {t("boxes.emptyDesc")}
        </p>
        <Link to="/products">
          <Button className="rounded-full px-6 h-11 min-h-[44px] text-xs sm:text-sm font-bold gap-2 cursor-pointer">
            <span>{t("boxes.browseAll")}</span>
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {data.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
