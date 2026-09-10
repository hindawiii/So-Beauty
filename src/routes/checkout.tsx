import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/hooks/useCart";
import { createOrder, getMyProfile } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowLeft,
  PackageCheck,
} from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "إتمام الشراء — So Beauty" }] }),
  component: CheckoutPage,
});

type CompletedOrderInfo = {
  orderId: string;
  total: number;
  fullName: string;
  phone: string;
  city: string;
  shippingAddress: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  isGuest: boolean;
};

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const submit = useServerFn(createOrder);
  const loadProfile = useServerFn(getMyProfile);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    shipping_address: "",
    city: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);

  // Check auth state and load user profile if authenticated
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      if (data?.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email });
        loadProfile()
          .then((p) => {
            if (p && isMounted) {
              setForm((f) => ({
                ...f,
                full_name: p.full_name || f.full_name,
                phone: p.phone || f.phone,
                shipping_address: p.address || f.shipping_address,
                city: p.city || f.city,
              }));
            }
          })
          .catch(() => {});
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("السلة فارغة، يرجى إضافة منتجات أولاً");
      return;
    }

    setLoading(true);
    const orderItemsSnapshot = items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));

    try {
      const res = await submit({
        data: {
          full_name: form.full_name,
          phone: form.phone,
          city: form.city,
          shipping_address: form.shipping_address,
          notes: form.notes ? form.notes : undefined,
          items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        },
      });

      clear();
      toast.success("تم تأكيد طلبك بنجاح وسنقوم بتجهيزه فوراً!");

      setCompletedOrder({
        orderId: res.orderId,
        total: res.total,
        fullName: form.full_name,
        phone: form.phone,
        city: form.city,
        shippingAddress: form.shipping_address,
        items: orderItemsSnapshot,
        isGuest: res.isGuest,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء معالجة الطلب";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // --- ORDER SUCCESS VIEW ---
  if (completedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              شكراً لك! تم استلام طلبك بنجاح
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              رقم الطلب:{" "}
              <span className="font-mono font-bold text-foreground">
                #{completedOrder.orderId.slice(0, 8).toUpperCase()}
              </span>
            </p>

            <div className="bg-muted/40 rounded-xl p-4 text-start text-sm space-y-2 mb-6 border border-border/50">
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">العميل:</span>
                <span>
                  {completedOrder.fullName} ({completedOrder.phone})
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">عنوان التوصيل:</span>
                <span>
                  {completedOrder.city} - {completedOrder.shippingAddress}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">طريقة الدفع:</span>
                <span className="text-primary font-semibold">الدفع عند الاستلام (COD)</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border/60 pt-2 text-base">
                <span>المبلغ الإجمالي:</span>
                <span className="text-primary">{completedOrder.total.toFixed(2)} ج.م</span>
              </div>
            </div>

            <div className="border border-border/60 rounded-xl p-4 text-start mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                المنتجات المطلوبة ({completedOrder.items.length})
              </h3>
              <div className="space-y-2">
                {completedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {it.name}{" "}
                      <span className="text-muted-foreground text-xs font-medium">
                        × {it.quantity}
                      </span>
                    </span>
                    <span className="font-medium">{(it.price * it.quantity).toFixed(2)} ج.م</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products" className="w-full sm:w-auto">
                <Button className="w-full h-11 px-6 font-medium gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  متابعة التسوق
                </Button>
              </Link>
              {!completedOrder.isGuest && (
                <Link to="/orders" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full h-11 px-6 font-medium gap-2">
                    <PackageCheck className="w-4 h-4" />
                    عرض سجل طلباتي
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // --- EMPTY CART VIEW ---
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/20">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-16 text-center max-w-lg">
          <div className="bg-card border border-border/80 rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold mb-2">سلة المشتريات فارغة</h1>
            <p className="text-muted-foreground text-sm mb-6">
              يرجى إضافة بعض المنتجات الطبيعية إلى سلتك قبل المتابعة لصفحة إتمام الطلب.
            </p>
            <Link to="/products">
              <Button className="h-11 px-6 gap-2">
                <ArrowLeft className="w-4 h-4" />
                تصفح المنتجات الآن
              </Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Heading & Trust Signals */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">إتمام الطلب</h1>
            <p className="text-sm text-muted-foreground mt-1">
              شحن سريع ومجاني للطلبات المؤكدة مع ميزة الدفع عند الاستلام
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-card border border-border/80 rounded-lg p-2.5 px-3">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" /> توصيل سريع
            </span>
            <span className="w-px h-3.5 bg-border" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> دفع عند الاستلام
            </span>
          </div>
        </div>

        {/* User / Guest Status Notice */}
        {currentUser ? (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl p-3.5 px-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>أهلاً بك! تم تسجيل الدخول بحسابك (سيتم حفظ الطلب في سجلك تلقائياً).</span>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-primary/5 border border-primary/20 text-primary-foreground rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary shrink-0" />
              <span>
                <strong>الشراء المباشر كزائر متاح:</strong> يمكنك إكمال طلبك فوراً بدون الحاجة
                لتسجيل حساب.
              </span>
            </div>
            <Link
              to="/auth"
              search={{ redirect: "/checkout" }}
              className="text-primary text-xs sm:text-sm font-semibold hover:underline shrink-0"
            >
              لديك حساب بالفعل؟ سجّل الدخول
            </Link>
          </div>
        )}

        <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-semibold border-b border-border/60 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                بيانات الشحن والتوصيل
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-sm font-medium">
                    الاسم الكامل <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    required
                    placeholder="مثال: سارة محمد"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="h-11 text-start"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    رقم الهاتف المحمول <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    placeholder="مثال: 01012345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11 text-start font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-medium">
                  المحافظة / المدينة <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  required
                  placeholder="مثال: القاهرة، مدينة نصر"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="h-11 text-start"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shipping_address" className="text-sm font-medium">
                  العنوان بالتفصيل (اسم الشارع، رقم العقار، رقم الشقة){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="shipping_address"
                  required
                  rows={2}
                  placeholder="مثال: شارع النصر، عمارة 15، الدور الرابع، شقة 8"
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                  className="resize-none text-start min-h-[72px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
                  ملاحظات إضافية للتوصيل (اختياري)
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="أي تعليمات للمندوب، موعد مفضل للتسليم، إلخ."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="resize-none text-start min-h-[64px]"
                />
              </div>
            </div>
          </div>

          {/* Order Summary Box (1 col) */}
          <div className="space-y-6">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-4 border-b border-border/60 pb-3 flex items-center justify-between">
                <span>ملخص الطلب</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({items.length} منتج)
                </span>
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pe-1 mb-4 divide-y divide-border/40">
                {items.map((i) => (
                  <div
                    key={i.id}
                    className="pt-2 first:pt-0 flex items-center justify-between text-sm gap-2"
                  >
                    <div className="truncate">
                      <div className="font-medium text-foreground truncate">{i.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {i.quantity} × {i.price.toFixed(2)} ج.م
                      </div>
                    </div>
                    <span className="font-semibold text-foreground shrink-0">
                      {(i.price * i.quantity).toFixed(2)} ج.م
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>قيمة المنتجات</span>
                  <span>{total.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الشحن والتوصيل</span>
                  <span className="text-emerald-600 font-medium">مجاناً</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border/60">
                  <span>الإجمالي النهائي</span>
                  <span className="text-primary text-lg">{total.toFixed(2)} ج.م</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>الدفع نقداً عند استلام الشحنة ومعاينتها</span>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium mt-5 gap-2"
                disabled={loading || items.length === 0}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    جاري تأكيد الطلب...
                  </span>
                ) : (
                  <span>تأكيد وإرسال الطلب</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
