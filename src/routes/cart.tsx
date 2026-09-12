import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/hooks/useCart";
import { resolveProductImage } from "@/lib/product-images";
import { FreeShippingProgressBar } from "@/components/FreeShippingProgressBar";
import { SUDAN_CITIES, getShippingFee, getDeliveryTimeEstimate } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة التسوق — So Beauty" },
      {
        name: "description",
        content: "راجعي مشترياتكِ من منتجات العناية بالبشرة، واستفيدي من عرض التوصيل المجاني.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, clear, total } = useCart();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [selectedCity, setSelectedCity] = useState("أم درمان");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const savedCity = localStorage.getItem("so_beauty_selected_city");
    if (savedCity) setSelectedCity(savedCity);
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("so_beauty_selected_city", city);
  };

  const shippingFee = getShippingFee(selectedCity, total);
  const finalTotal = total + shippingFee;
  const deliveryEstimate = getDeliveryTimeEstimate(selectedCity);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              سلة التسوق
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              راجعي المنتجات والكميات المختارة قبل المتابعة لإنهاء الطلب.
            </p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <Link to="/products">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-10 text-xs">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  متابعة التسوق
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 h-10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                تفريغ السلة
              </Button>
            </div>
          )}
        </div>

        {/* Clear Cart Confirmation Dialog */}
        {showClearConfirm && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-destructive">
            <span className="text-sm font-semibold">
              هل أنتِ متأكدة من رغبتكِ في حذف جميع المنتجات من السلة؟
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  clear();
                  setShowClearConfirm(false);
                  toast.success("تم تفريغ السلة بنجاح");
                }}
                className="rounded-xl h-9 px-4 text-xs font-semibold"
              >
                نعم، تفريغ السلة
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl h-9 px-4 text-xs"
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-card border border-slate-200/80 rounded-3xl p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              سلتكِ فارغة حالياً
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              لم تقومي بإضافة أي منتج بعد. تصفحي أحدث منتجات العناية بالبشرة وبوكسات الجمال المختارة
              لكِ.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/products">
                <Button className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  تصفح المنتجات الآن
                </Button>
              </Link>
              <Link to="/boxes">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold"
                >
                  بوكسات العناية
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left/Main Column: Free Shipping Bar & Products List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free Shipping Progress Indicator */}
              <FreeShippingProgressBar total={total} />

              {/* Items Card List */}
              <div className="bg-card border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs divide-y divide-slate-100">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col sm:flex-row gap-4 py-5 first:pt-0 last:pb-0 items-start sm:items-center"
                  >
                    <img
                      src={resolveProductImage(it.image_url)}
                      alt={it.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/products/$id"
                        params={{ id: it.id }}
                        className="font-bold text-slate-900 hover:text-primary transition-colors text-base block truncate"
                      >
                        {it.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary font-bold text-sm">
                          {Number(it.price).toFixed(2)} ج.م
                        </span>
                        <span className="text-xs text-slate-400">للقطعة</span>
                      </div>

                      {/* Quantity and Actions Bar */}
                      <div className="flex items-center justify-between gap-4 mt-3">
                        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-background">
                          <button
                            type="button"
                            onClick={() => setQty(it.id, it.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-bold text-xs sm:text-sm text-slate-900 select-none">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(it.id, it.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">
                            {(Number(it.price) * it.quantity).toFixed(2)} ج.م
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              remove(it.id);
                              toast.info(`تم حذف "${it.name}" من السلة`);
                            }}
                            className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            aria-label="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>دفع آمن عند الاستلام</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-slate-100">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>توصيل سريع لكافة المدن</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 border border-slate-100">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span>منتجات طبيعية ومضمونة 100%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & City Estimator */}
            <div className="bg-card border border-slate-200/80 rounded-3xl p-6 shadow-xs sticky top-24 space-y-5">
              <h2 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
                ملخص السلة
              </h2>

              {/* City Selection for Shipping */}
              <div className="space-y-2">
                <label
                  htmlFor="cart-shipping-city"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  مدينة الشحن والتوصيل:
                </label>
                <select
                  id="cart-shipping-city"
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {SUDAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.rate} ج.م)
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>المدة المتوقعة: {deliveryEstimate}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-sm pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>مجموع المنتجات:</span>
                  <span className="font-medium text-slate-900">{total.toFixed(2)} ج.م</span>
                </div>

                <div className="flex justify-between text-slate-600 items-center">
                  <span>تكلفة الشحن:</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                      مجاناً 🎉
                    </span>
                  ) : (
                    <span className="font-medium text-slate-900">{shippingFee.toFixed(2)} ج.م</span>
                  )}
                </div>

                <div className="flex justify-between font-bold text-base text-slate-900 pt-3 border-t border-slate-100">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary text-xl">{finalTotal.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full h-12 text-base font-semibold rounded-xl gap-2 shadow-xs"
                onClick={() => navigate({ to: "/checkout" })}
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Button>

              {!authed && (
                <p className="text-[11px] text-center text-slate-500">
                  ✨ يمكنكِ الشراء كزائر فوراً دون الحاجة لتسجيل حساب مسبق
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
