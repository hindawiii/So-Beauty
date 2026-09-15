import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listMyOrders } from "@/lib/orders.functions";
import { useCurrency } from "@/context/CurrencyContext";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "طلباتي — So Beauty" }] }),
  component: OrdersPage,
});

type Order = Awaited<ReturnType<typeof listMyOrders>>[number];

function OrdersPage() {
  const { formatPrice } = useCurrency();
  const load = useServerFn(listMyOrders);
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    load()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [load]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">طلباتي</h1>
        {orders === null ? (
          <p>جاري التحميل...</p>
        ) : orders.length === 0 ? (
          <p>لا توجد طلبات بعد.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="border rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-xs">#{o.id.slice(0, 8)}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{o.status}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {new Date(o.created_at).toLocaleDateString("ar")}
                </div>
                <ul className="text-sm space-y-1 mb-2">
                  {o.order_items?.map((i) => (
                    <li key={i.id}>
                      {i.product_name} × {i.quantity} —{" "}
                      {formatPrice(Number(i.unit_price) * i.quantity)}
                    </li>
                  ))}
                </ul>
                <div className="font-bold">الإجمالي: {formatPrice(Number(o.total))}</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
