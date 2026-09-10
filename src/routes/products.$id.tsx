import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getProduct } from "@/lib/products.functions";
import { resolveProductImage } from "@/lib/product-images";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await getProduct({ data: { id } });
      if (!p) throw notFound();
      return p;
    },
  });

export const Route = createFileRoute("/products/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.id)),
  head: () => ({ meta: [{ title: "منتج — So Beauty" }] }),
  component: Page,
  errorComponent: ({ error }) => <div className="p-8 text-center">{error.message}</div>,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 p-8 text-center">
        <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
        <Link to="/products" className="text-primary underline">
          عودة
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Suspense fallback={<div>...</div>}>
          <Detail />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(id));
  const { add } = useCart();
  const price = Number(p.price);
  const original = p.original_price != null ? Number(p.original_price) : null;
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <img
        src={resolveProductImage(p.image_url)}
        alt={p.name}
        className="w-full aspect-square object-cover rounded-2xl"
      />
      <div>
        <h1 className="text-3xl font-bold mb-3">{p.name}</h1>
        <p className="text-muted-foreground mb-6">{p.description}</p>
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-bold text-primary">{price} ج.م</span>
          {original && original > price && (
            <span className="text-lg text-muted-foreground line-through">{original} ج.م</span>
          )}
        </div>
        <Button
          size="lg"
          onClick={() => {
            add({ id: p.id, name: p.name, price, image_url: p.image_url });
            toast.success("أُضيف إلى السلة");
          }}
        >
          أضف إلى السلة
        </Button>
      </div>
    </div>
  );
}
