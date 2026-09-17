import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import {
  PackageCheck,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackOrder } from "@/lib/orders.functions";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { getDeliveryTimeEstimate } from "@/lib/shipping";
import { toast } from "sonner";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";

interface OrderResult {
  id: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  full_name: string;
  phone: string;
  shipping_address: string;
  city: string;
  created_at: string;
  order_items?: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

const STORAGE_LAST_SEARCH = "so_beauty_last_tracking_query";

export const Route = createFileRoute("/track-order")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "تتبع حالة الطلب والشحنة — الاستعلام الفوري" },
      {
        name: "description",
        content:
          "تابع خط سير شحنتك وموعد التوصيل المتوقع بكل سهولة باستخدام رقم الطلب أو رقم الهاتف.",
      },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const { q: initialQuery } = Route.useSearch();
  const [query, setQuery] = useState(initialQuery || "");
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<OrderResult[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LAST_SEARCH);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentQueries(parsed.slice(0, 3));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentQuery = useCallback((term: string) => {
    try {
      const trimmed = term.trim();
      if (!trimmed) return;
      setRecentQueries((prev) => {
        const updated = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, 3);
        localStorage.setItem(STORAGE_LAST_SEARCH, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSearch = useCallback(
    async (term: string) => {
      const clean = term.trim();
      if (!clean) {
        toast.error("يرجى إدخال رقم الطلب أو رقم الهاتف");
        return;
      }

      try {
        setLoading(true);
        setSearched(true);
        const res = await trackOrder({ data: { query: clean } });
        const orders = (res as OrderResult[]) || [];
        setResults(orders);
        if (orders.length > 0) {
          saveRecentQuery(clean);
          toast.success(`تم العثور على (${orders.length}) طلب مطابق 🌸`);
        }
      } catch {
        toast.error("حدث خطأ أثناء البحث عن الطلب، يرجى المحاولة لاحقاً");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [saveRecentQuery],
  );

  useEffect(() => {
    if (initialQuery?.trim()) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        {/* Spacious Top Back Navigation Bar */}
        <div className="mb-8 flex items-center justify-between gap-4 pb-4 border-b border-border/60">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-primary" />
            <span>العودة لمتجر المنتجات</span>
          </Link>
          <span className="text-xs text-muted-foreground font-medium">
            مركز تتبع الشحنات والطلبات
          </span>
        </div>

        {/* Header Hero */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-xs">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام التتبع المباشر للشحنات</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2.5">
            أين وصل طلبي؟
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 leading-relaxed">
            أدخلي رقم الطلب أو رقم هاتفكِ المسجل للتحقق من مرحلة التجهيز وموعد التوصيل المتوقع
            لمدينتكِ.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-card border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs mb-8 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="رقم الطلب (مثال: 83a3...) أو رقم الهاتف..."
                className="h-12 ps-10 pe-10 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white border-slate-200"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-7 rounded-xl font-semibold gap-2 shadow-xs shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الفحص...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  تتبع الشحنة
                </>
              )}
            </Button>
          </form>

          {/* Quick suggestions / Last searches */}
          {recentQueries.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-medium">عمليات بحث سابقة:</span>
              {recentQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    handleSearch(item);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-muted hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px]"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              جاري فحص وتحديث بيانات الطلب مع نظام الشحن...
            </p>
            <p className="text-xs text-slate-400 mt-1">لحظات قليلة ونعرض تفاصيل شحنتكِ 🌸</p>
          </div>
        )}

        {/* Empty / Not Found View */}
        {!loading && searched && results.length === 0 && (
          <div className="bg-card border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs my-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              لم نعثر على أي طلب مطابق
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              تأكدي من صحة رقم الطلب أو رقم الهاتف المكتوب. بإمكانكِ أيضاً مراسلة فريق خدمة العملاء
              عبر واتساب وسنساعدكِ فوراً في معرفة موقع طلبكِ.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setSearched(false);
                }}
                className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-semibold"
              >
                إعادة المحاولة
              </Button>
              <a
                href={getWhatsAppChatUrl(
                  `مرحباً سو بيوتي، أود الاستفسار عن حالة طلبي، رقم البحث: ${query}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2">
                  <MessageCircle className="w-4 h-4" />
                  مراسلة الدعم عبر واتساب
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Results Orders List */}
        {!loading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1">
              <span>
                تم العثور على <strong className="text-slate-900">{results.length}</strong> طلب
              </span>
              <button
                type="button"
                onClick={() => handleSearch(query)}
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                تحديث الحالة
              </button>
            </div>

            {results.map((order) => (
              <OrderTrackingCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function OrderTrackingCard({ order }: { order: OrderResult }) {
  const { formatPrice, formatBoth } = useCurrency();
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      key: "pending",
      stepNum: 1,
      label: "تم الاستلام",
      desc: "تم تسجيل الطلب بالنظام بنجاح",
      icon: Clock,
    },
    {
      key: "confirmed",
      stepNum: 2,
      label: "قيد التجهيز",
      desc: "فحص وتغليف مستحضرات العناية",
      icon: PackageCheck,
    },
    {
      key: "shipped",
      stepNum: 3,
      label: "خرج للتوصيل",
      desc: "مع مندوب الشحن لمدينتكِ",
      icon: Truck,
    },
    {
      key: "delivered",
      stepNum: 4,
      label: "تم التسليم",
      desc: "تم استلام الطلب بالكامل",
      icon: CheckCircle2,
    },
  ];

  const statusOrderMap: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 0,
  };

  const currentStep = statusOrderMap[order.status] ?? 1;
  const isCancelled = order.status === "cancelled";
  const formattedOrderId = order.id.slice(0, 8).toUpperCase();
  const deliveryEstimate = getDeliveryTimeEstimate(order.city);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    toast.success("تم نسخ رقم الطلب إلى الحافظة 📋");
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = `مرحباً سو بيوتي، أود الاستفسار حول حالة طلبي:
رقم الطلب: #${formattedOrderId}
الاسم: ${order.full_name}
المدينة: ${order.city}
الإجمالي: ${formatPrice(Number(order.total))}
الحالة الحالية: ${
    order.status === "pending"
      ? "قيد المراجعة"
      : order.status === "confirmed"
        ? "قيد التجهيز"
        : order.status === "shipped"
          ? "خرج للتوصيل"
          : order.status === "delivered"
            ? "تم التسليم"
            : "ملغي"
  }`;

  return (
    <div className="bg-card border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-xs transition-all hover:shadow-sm">
      {/* Order Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              رقم الطلب:
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-primary">
              #{formattedOrderId}
            </span>
            <button
              type="button"
              onClick={copyOrderId}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
              title="نسخ رقم الطلب بالكامل"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG")}</span>
          </div>
        </div>

        {/* Order Status Badge */}
        <div>
          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle className="w-4 h-4" />
              طلب ملغي
            </span>
          ) : order.status === "delivered" ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              تم التسليم بنجاح
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              {order.status === "pending" && "قيد المراجعة والاستلام"}
              {order.status === "confirmed" && "قيد التجهيز والتغليف"}
              {order.status === "shipped" && "خرج مع مندوب التوصيل"}
            </span>
          )}
        </div>
      </div>

      {/* City Delivery Estimate Banner */}
      {!isCancelled && (
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              التوصيل المتوقع إلى <strong className="font-bold">{order.city}</strong>:{" "}
              <span className="font-semibold text-amber-700">{deliveryEstimate}</span>
            </span>
          </div>
          <span className="text-[11px] text-amber-700/80 hidden sm:inline">الدفع عند الاستلام</span>
        </div>
      )}

      {/* Visual Timeline Pipeline */}
      {!isCancelled && (
        <div className="my-8">
          <div className="relative">
            {/* Background connecting bar */}
            <div className="hidden md:block absolute top-1/2 start-0 end-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
            {/* Active connecting bar */}
            <div
              className="hidden md:block absolute top-1/2 start-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700"
              style={{
                width: `${((Math.max(1, currentStep) - 1) / (steps.length - 1)) * 100}%`,
              }}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
              {steps.map((step) => {
                const isCompleted = currentStep >= step.stepNum;
                const isCurrent = currentStep === step.stepNum;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                        : isCompleted
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order Info & Address Breakdown */}
      <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 p-4 sm:p-5 rounded-2xl mb-6 text-xs sm:text-sm">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 text-slate-700">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">{order.city}</span>
              <span className="text-slate-500 block text-xs mt-0.5">{order.shipping_address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <span dir="ltr" className="font-semibold text-slate-900">
              {order.phone}
            </span>
            <span className="text-slate-400 text-xs">({order.full_name})</span>
          </div>
        </div>

        <div className="space-y-1.5 sm:text-end sm:border-s sm:border-slate-200 sm:ps-4 flex flex-col justify-center">
          <div className="text-slate-500 text-xs">طريقة السداد: الدفع نقداً عند الاستلام (COD)</div>
          <div className="text-base sm:text-lg font-bold text-primary" suppressHydrationWarning>
            المجموع الكلي: {formatPrice(Number(order.total))}
          </div>
        </div>
      </div>

      {/* Items list */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="border-t border-slate-100 pt-4 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            محتويات الشحنة ({order.order_items.length} منتجات)
          </h3>
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between text-slate-700"
              >
                <span className="font-medium">
                  {item.product_name}{" "}
                  <span className="text-primary font-bold ms-1">× {item.quantity}</span>
                </span>
                <span className="font-semibold text-slate-900" suppressHydrationWarning>
                  {formatPrice(Number(item.unit_price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick WhatsApp Support Help */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          هل تودين تعديل العنوان أو رقم الهاتف أو لديكِ استفسار؟
        </span>
        <a
          href={getWhatsAppChatUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors"
        >
          <WhatsAppEmblemIcon size={16} className="text-emerald-600" />
          <span>تواصل فوري برقم الطلب عبر واتساب</span>
        </a>
      </div>
    </div>
  );
}
