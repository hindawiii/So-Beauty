import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";
import { useStoreSettings } from "@/context/StoreSettingsContext";

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
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">غير موجود</div>,
});

function Page() {
  const { settings } = useStoreSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
        >
          البوكسات والمجموعات المتكاملة
        </h1>
        <Suspense fallback={<div>...</div>}>
          <Grid />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
function Grid() {
  const { data } = useSuspenseQuery(boxesQuery);
  if (!data.length) return <p>لا توجد بوكسات حاليًا.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
