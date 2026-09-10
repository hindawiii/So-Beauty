import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/hooks/useCart";
import { resolveProductImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "السلة — So Beauty" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">سلة التسوق</h1>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">السلة فارغة</p>
            <Link to="/products">
              <Button>تصفّح المنتجات</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 p-4 border rounded-xl">
                  <img
                    src={resolveProductImage(it.image_url)}
                    alt={it.name}
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{it.name}</h3>
                    <p className="text-primary font-bold mt-1">{it.price} ج.م</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setQty(it.id, it.quantity - 1)}
                        className="p-1 border rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center">{it.quantity}</span>
                      <button
                        onClick={() => setQty(it.id, it.quantity + 1)}
                        className="p-1 border rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => remove(it.id)}
                        className="p-1 text-destructive ms-auto hover:opacity-80 transition-opacity"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border rounded-xl h-fit">
              <h2 className="font-bold text-lg mb-4">الملخص</h2>
              <div className="flex justify-between mb-2">
                <span>الإجمالي</span>
                <span className="font-bold">{total.toFixed(2)} ج.م</span>
              </div>
              <Button
                className="w-full mt-4 h-12 text-base font-medium"
                onClick={() => navigate({ to: "/checkout" })}
              >
                متابعة إتمام الطلب
              </Button>
              {!authed && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  الشراء كزائر متاح مباشرة دون اشتراط تسجيل الدخول
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
