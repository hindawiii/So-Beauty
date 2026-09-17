import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";

const offersQuery = queryOptions({
  queryKey: ["products", "offers"],
  queryFn: () => listProducts({ data: { category: "offer" } }),
});

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "العروض الحصرية والتخفيضات — أقوى الصفقات" },
      { name: "description", content: "أحدث العروض الحصرية والخصومات الخاصة لفترة محدودة." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(offersQuery),
  component: Page,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-8">غير موجود</div>,
});

function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">أقوى العروض</h1>
        <Suspense fallback={<div>...</div>}>
          <Grid />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function Grid() {
  const { data } = useSuspenseQuery(offersQuery);
  if (!data.length) return <p>لا توجد عروض حاليًا.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
