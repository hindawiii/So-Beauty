import React, { useMemo } from "react";
import {
  Bell,
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  PhoneCall,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SavedOrder } from "@/lib/orders.functions";
import { getCustomerWhatsAppUrl, formatOrderWhatsAppSummary } from "@/lib/whatsapp";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: typeof Clock }
> = {
  pending: {
    label: "قيد المراجعة",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  confirmed: {
    label: "تم التأكيد والتجهيز",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircle2,
  },
  shipped: {
    label: "في طريق التوصيل",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Truck,
  },
  delivered: {
    label: "تم الاستلام بنجاح",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "ملغي",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
};

interface AdminOrdersTabProps {
  orders: SavedOrder[];
  loadingOrders: boolean;
  pendingCount: number;
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (s: string) => void;
  updatingOrderId: string | null;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  storeName: string;
}

export function AdminOrdersTab({
  orders,
  loadingOrders,
  pendingCount,
  orderSearch,
  setOrderSearch,
  orderStatusFilter,
  setOrderStatusFilter,
  updatingOrderId,
  onUpdateStatus,
  storeName,
}: AdminOrdersTabProps) {
  // Filtered Orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesFilter = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const q = orderSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.full_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.city.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  return (
    <div className="space-y-4">
      {/* Live Pending Orders Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>
                  يوجد {pendingCount} {pendingCount === 1 ? "طلب جديد" : "طلبات جديدة"} بانتظار
                  المراجعة والتجهيز
                </span>
              </h4>
              <p className="text-xs text-amber-800/90 mt-0.5">
                تفضلي بالتواصل مع العملاء عبر واتساب أو الهاتف لتأكيد مواعيد التسليم وخصم المخزون.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setOrderStatusFilter(orderStatusFilter === "pending" ? "all" : "pending")
              }
              className="h-9 px-3.5 text-xs font-bold border-amber-300 text-amber-950 bg-white hover:bg-amber-100/60 cursor-pointer shadow-xs"
            >
              {orderStatusFilter === "pending"
                ? "عرض كل الطلبات"
                : `فلترة الطلبات المعلقة (${pendingCount})`}
            </Button>
          </div>
        </div>
      )}

      {/* Orders Toolbar */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="ابحثي برقم الطلب، اسم العميل، الهاتف، أو المدينة..."
            className="ps-10 h-10 rounded-xl text-sm"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1 me-1">
            <Filter className="w-3 h-3" />
            الحالة:
          </span>
          <button
            type="button"
            onClick={() => setOrderStatusFilter("all")}
            className={`px-3.5 py-2 min-h-[38px] rounded-xl font-semibold transition-colors cursor-pointer ${
              orderStatusFilter === "all"
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الكل ({orders.length})
          </button>
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((st) => {
            const cnt = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3.5 py-2 min-h-[38px] rounded-xl font-semibold transition-colors cursor-pointer ${
                  orderStatusFilter === st
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {STATUS_CONFIG[st].label} ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table / Cards */}
      {loadingOrders ? (
        <div className="text-center py-16 bg-card border rounded-2xl">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">جاري تحميل سجل الطلبات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-slate-200/80 rounded-2xl p-10 text-center max-w-md mx-auto my-6">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">لا توجد طلبات مطابقة</h3>
          <p className="text-xs text-slate-500 mb-4">
            جربي تغيير عبارة البحث أو اختيار تصفية حالة أخرى.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOrderSearch("");
              setOrderStatusFilter("all");
            }}
            className="rounded-xl text-xs"
          >
            إعادة ضبط التصفية
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = conf.icon;
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 space-y-3.5"
              >
                {/* Top Header: Customer Info + Current Status Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  {/* Order ID & Customer */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-primary/20">
                      #{order.id.slice(0, 4)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {order.full_name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {order.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span
                          className="flex items-center gap-1 font-mono font-medium text-slate-700"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {order.phone}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-none">
                            {order.city} — {order.shipping_address}
                          </span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleDateString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Current Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 shadow-2xs ${conf.bg} ${conf.text} ${conf.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{conf.label}</span>
                    </span>
                  </div>
                </div>

                {/* Middle Row: Status Transition Switcher + Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                  {/* Status Switcher Pills */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      تحديث حالة الطلب:
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                      {(
                        [
                          { key: "pending", label: "مراجعة" },
                          { key: "confirmed", label: "تجهيز" },
                          { key: "shipped", label: "توصيل" },
                          { key: "delivered", label: "تسليم" },
                          { key: "cancelled", label: "إلغاء" },
                        ] as const
                      ).map((btn) => (
                        <button
                          key={btn.key}
                          type="button"
                          disabled={isUpdating || order.status === btn.key}
                          onClick={() => onUpdateStatus(order.id, btn.key)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] ${
                            order.status === btn.key
                              ? "bg-slate-900 text-white shadow-xs font-bold cursor-default dark:bg-white dark:text-slate-900"
                              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/60"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Direct Contact Action Buttons (Mobile-first Touch Target >= 40px) */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 shrink-0">
                    {/* WhatsApp Direct */}
                    <a
                      href={getCustomerWhatsAppUrl(
                        order.phone,
                        `مرحباً ${order.full_name} 🌸، نتواصل معكِ من إدارة متجر ${storeName} بخصوص طلبكِ رقم #${order.id.slice(0, 8).toUpperCase()} (${conf.label}).\nالعنوان: ${order.city} - ${order.shipping_address}\nالمبلغ الإجمالي: ${Number(order.total).toFixed(0)} ج.م (الدفع عند الاستلام).\nنود تأكيد موعد الشحن والتسليم معكِ، شكراً لاختياركِ لنا!`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title="مراسلة العميل مباشرة عبر واتساب"
                    >
                      <WhatsAppEmblemIcon size={16} className="text-white shrink-0" />
                      <span>واتساب</span>
                    </a>

                    {/* Phone Direct Call */}
                    <a
                      href={`tel:${order.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-bold transition-all cursor-pointer"
                      title="اتصال هاتفي مباشر بالعميل"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>اتصال</span>
                    </a>

                    {/* Copy Order Summary Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const summary = formatOrderWhatsAppSummary({
                          orderId: order.id,
                          fullName: order.full_name,
                          phone: order.phone,
                          city: order.city,
                          shippingAddress: order.shipping_address,
                          notes: order.notes,
                          items: order.order_items.map((it) => ({
                            name: it.product_name,
                            quantity: it.quantity,
                            price: Number(it.unit_price),
                          })),
                          total: Number(order.total).toFixed(0),
                          storeName: storeName,
                        });
                        navigator.clipboard.writeText(summary);
                        toast.success("تم نسخ ملخص الطلب بالكامل للحافظة بنجاح!");
                      }}
                      className="inline-flex items-center justify-center gap-1 h-10 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      title="نسخ ملخص الطلب لمشاركته مع مندوب التوصيل"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">نسخ الملخص</span>
                    </button>
                  </div>
                </div>

                {/* Items Ordered List */}
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-2">محتويات الطلب:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/60 rounded-lg p-2 text-xs flex items-center justify-between shadow-2xs"
                      >
                        <span className="font-medium text-slate-800 truncate me-2">
                          {item.product_name}
                        </span>
                        <span className="text-slate-500 shrink-0 font-mono">
                          × {item.quantity} ({(Number(item.unit_price) * item.quantity).toFixed(0)}{" "}
                          ج.م)
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-2.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <strong>ملاحظة العميل:</strong> {order.notes}
                    </div>
                  )}

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-2.5 border-t border-slate-200/70 text-slate-600">
                    <span className="text-slate-400 text-[11px]">
                      تنعكس الحالة تلقائياً للعميلة في صفحة تتبع الطلبات برقم الهاتف أو الكود
                    </span>
                    <span className="font-bold text-sm text-primary">
                      الإجمالي: {Number(order.total).toFixed(0)} ج.م
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
