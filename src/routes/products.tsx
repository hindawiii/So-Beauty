import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";

const productsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "المنتجات — So Beauty" },
      {
        name: "description",
        content: "تسوّق مجموعتنا الكاملة من منتجات العناية الطبيعية بالبشرة.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ProductsPage,
  errorComponent: ({ error }) => <div className="p-8 text-center">حدث خطأ: {error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">غير موجود</div>,
});

function ProductsPage() {
  const { q } = Route.useSearch();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {q ? `نتائج البحث عن: ${q}` : "جميع المنتجات"}
        </h1>
        <Suspense fallback={<div>جاري التحميل...</div>}>
          <List q={q} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function List({ q }: { q?: string }) {
  const { data } = useSuspenseQuery(productsQuery);
  const term = q?.trim().toLowerCase() ?? "";
  const rows = term
    ? data.filter((p) =>
        [p.name, p.description ?? "", p.category ?? ""].join(" ").toLowerCase().includes(term),
      )
    : data;
  if (!rows.length)
    return (
      <p className="text-muted-foreground">لا توجد منتجات مطابقة{term ? ` لـ "${q}"` : ""}.</p>
    );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rows.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
