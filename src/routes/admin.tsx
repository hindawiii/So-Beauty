import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Eye,
  DollarSign,
  Layers,
  ArrowUpDown,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  Star,
  Lock,
  Unlock,
  LogOut,
  KeyRound,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminListAllOrders, adminUpdateOrderStatus, SavedOrder } from "@/lib/orders.functions";
import { adminListAllProducts, adminUpdateProduct } from "@/lib/products.functions";
import { Product } from "@/lib/mock-products";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { getReviews } from "@/lib/reviews";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم وإدارة المتجر — So Beauty" },
      {
        name: "description",
        content:
          "إدارة شاملة لطلبات الشحن، تعديل حالات الطلبات ومتابعة مخزون منتجات متجر سو بيوتي.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<
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
    label: "جاري التجهيز",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircle2,
  },
  shipped: {
    label: "خرج للتوصيل",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Truck,
  },
  delivered: {
    label: "تم التسليم",
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

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");

  // Admin PIN Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("so_beauty_admin_auth") === "true";
    }
    return false;
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin === "2026" || cleanPin === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("so_beauty_admin_auth", "true");
      setPinError("");
      toast.success("مرحباً بك في لوحة الإدارة");
    } else {
      setPinError("رمز الدخول غير صحيح (الرمز الافتراضي: 2026)");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("so_beauty_admin_auth");
    setPinInput("");
    toast.info("تم قفل لوحة الإدارة وتسجيل الخروج");
  };

  // Orders State
  const fetchOrders = useServerFn(adminListAllOrders);
  const mutateOrderStatus = useServerFn(adminUpdateOrderStatus);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Products & Inventory State
  const fetchProducts = useServerFn(adminListAllProducts);
  const mutateProduct = useServerFn(adminUpdateProduct);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Reviews and Store Rating Metrics
  const [reviewsCount, setReviewsCount] = useState<number>(4);
  const [averageRating, setAverageRating] = useState<number>(5.0);

  // Load Data
  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const data = await fetchOrders();
      setOrders(data as SavedOrder[]);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      toast.error("فشل في تحميل الطلبات");
    } finally {
      setLoadingOrders(false);
    }
  }, [fetchOrders]);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await fetchProducts();
      setProducts(data as Product[]);
    } catch (err) {
      console.error("Failed to load admin products:", err);
      toast.error("فشل في تحميل قائمة المنتجات");
    } finally {
      setLoadingProducts(false);
    }
  }, [fetchProducts]);

  useEffect(() => {
    loadOrders();
    loadProducts();
    // Load reviews for KPI calculation
    getReviews()
      .then((items) => {
        if (items && items.length > 0) {
          setReviewsCount(items.length);
          const sum = items.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
          setAverageRating(Number((sum / items.length).toFixed(1)));
        }
      })
      .catch(() => {});
  }, [loadOrders, loadProducts]);

  // Order status updater
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await mutateOrderStatus({ data: { orderId, newStatus } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`تم تحديث حالة الطلب إلى "${STATUS_CONFIG[newStatus].label}" بنجاح`);
    } catch {
      toast.error("فشل تحديث حالة الطلب، يرجى المحاولة ثانية");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Product quick edit handler
  const handleStartEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditPrice(prod.price);
    setEditStock(prod.stock);
  };

  const handleSaveEditProduct = async (prodId: string) => {
    try {
      await mutateProduct({
        data: {
          id: prodId,
          price: Number(editPrice),
          stock: Number(editStock),
        },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === prodId ? { ...p, price: Number(editPrice), stock: Number(editStock) } : p,
        ),
      );
      setEditingProductId(null);
      toast.success("تم تحديث السعر والمخزون بنجاح ✨");
    } catch {
      toast.error("فشل حفظ التعديلات");
    }
  };

  const handleToggleProductStatus = async (prod: Product) => {
    const nextActive = !prod.is_active;
    try {
      await mutateProduct({
        data: {
          id: prod.id,
          is_active: nextActive,
        },
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, is_active: nextActive } : p)),
      );
      toast.success(nextActive ? `تم تفعيل عرض ${prod.name} بالمتجر` : `تم إيقاف عرض ${prod.name}`);
    } catch {
      toast.error("فشل تعديل حالة العرض");
    }
  };

  const handleToggleProductFeatured = async (prod: Product) => {
    const nextFeatured = !prod.is_featured;
    try {
      await mutateProduct({
        data: {
          id: prod.id,
          is_featured: nextFeatured,
        },
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, is_featured: nextFeatured } : p)),
      );
      toast.success(
        nextFeatured
          ? `تم تمييز "${prod.name}" في واجهة المتجر بنجاح ⭐`
          : `تم إلغاء تمييز "${prod.name}" من الواجهة`,
      );
    } catch {
      toast.error("فشل تعديل حالة التمييز");
    }
  };

  // Metrics calculations
  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total || 0), 0),
    [orders],
  );

  const pendingCount = useMemo(() => orders.filter((o) => o.status === "pending").length, [orders]);

  const lowStockCount = useMemo(() => products.filter((p) => p.stock <= 10).length, [products]);

  // Filtered Orders
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

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  // If not authenticated, show PIN Unlock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                لوحة إدارة متجر سو بيوتي
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                هذه المساحة مخصصة للإدارة للتحكم في شحنات الطلبات وتعديل المخزون والأسعار.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  رمز الدخول الإداري (PIN):
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError("");
                    }}
                    placeholder="أدخل رمز الدخول (الافتراضي: 2026)"
                    className="h-11 pe-10 text-center font-mono text-base tracking-widest"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>
                {pinError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  💡 تلميح: الرمز الافتراضي للتجربة هو{" "}
                  <strong className="font-mono text-primary font-bold">2026</strong>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-bold text-sm gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Unlock className="w-4 h-4" />
                <span>فتح لوحة التحكم</span>
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  العودة إلى واجهة المتجر الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Top Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>إدارة سو بيوتي الرسمية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">لوحة التحكم والإشراف</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              إدارة حركة الطلبات في السودان، تعديل مراحل الشحن، وضبط أسعار ومخزون المنتجات.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                loadOrders();
                loadProducts();
                toast.info("تم تحديث البيانات من الخادم");
              }}
              className="h-10 px-3.5 rounded-xl text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث البيانات</span>
            </Button>

            <Link to="/track-order">
              <Button
                variant="ghost"
                className="h-10 px-3.5 rounded-xl text-xs gap-1.5 text-primary"
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تتبع الشحنات</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-10 px-3 rounded-xl text-xs gap-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
              title="قفل لوحة الإدارة وتسجيل الخروج"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">قفل</span>
            </Button>
          </div>
        </div>

        {/* Top KPIs Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Revenue */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">إجمالي المبيعات النشطة</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {totalRevenue.toLocaleString("ar-EG")}{" "}
                <span className="text-xs font-normal text-slate-400">ج.م</span>
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>من الطلبات المؤكدة والمسلمة</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Orders Count */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">إجمالي عدد الطلبات</p>
              <h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3>
              <p className="text-[11px] text-slate-400 mt-1">مسجلة عبر المتجر وواتساب</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">طلبات بانتظار التأكيد</p>
              <h3 className="text-2xl font-bold text-amber-600">{pendingCount}</h3>
              <p className="text-[11px] text-amber-600/80 mt-1 font-medium">تحتاج تواصل وتجهيز</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">منتجات أوشكت على النفاد</p>
              <h3
                className={`text-2xl font-bold ${lowStockCount > 0 ? "text-rose-600" : "text-slate-900"}`}
              >
                {lowStockCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">الرصيد أقل من 10 قطع</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Average Rating & Reviews */}
          <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">متوسط تقييمات العملاء</p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl font-bold text-slate-900">{averageRating.toFixed(1)}</h3>
                <span className="text-xs text-amber-500 font-bold">★ / 5</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                بناءً على {reviewsCount} مراجعة معتمدة
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 mb-6 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "orders"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إدارة شحنات وطلبات الشراء ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "inventory"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والمخزون ({products.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-4">
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
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    orderStatusFilter === "all"
                      ? "bg-slate-800 text-white"
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
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
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
                      className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                        {/* Order ID & Customer */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{order.id.slice(0, 4)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {order.full_name}
                              </span>
                              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                {order.id.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 font-mono" dir="ltr">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {order.phone}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {order.city} — {order.shipping_address}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
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

                        {/* Status Switcher Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{conf.label}</span>
                          </span>

                          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
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
                                onClick={() => handleUpdateStatus(order.id, btn.key)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                  order.status === btn.key
                                    ? "bg-white text-slate-900 shadow-xs font-bold cursor-default"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>

                          {/* WhatsApp Customer direct button */}
                          <a
                            href={getWhatsAppChatUrl(
                              `مرحباً ${order.full_name}، نتواصل معكِ من متجر سو بيوتي بخصوص طلبكِ رقم #${order.id.slice(0, 8)} (${conf.label}).`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                          >
                            <WhatsAppEmblemIcon size={14} className="text-emerald-600" />
                            <span>واتساب</span>
                          </a>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="bg-slate-50/70 rounded-xl p-3">
                        <p className="text-xs font-bold text-slate-700 mb-2">محتويات الطلب:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {order.order_items?.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border border-slate-200/60 rounded-lg p-2 text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-800 truncate me-2">
                                {item.product_name}
                              </span>
                              <span className="text-slate-500 shrink-0 font-mono">
                                × {item.quantity} (
                                {(Number(item.unit_price) * item.quantity).toFixed(0)} ج.م)
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="mt-2 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2.5 py-1.5">
                            <strong>ملاحظة العميل:</strong> {order.notes}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-600">
                          <span>
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
        )}

        {/* TAB 2: INVENTORY MANAGEMENT */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            {/* Inventory Toolbar */}
            <div className="bg-card border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="ابحثي عن منتج بالاسم أو الفئة..."
                  className="ps-10 h-10 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>
                  إجمالي الكتالوج: <strong className="text-slate-800">{products.length}</strong>{" "}
                  منتج
                </span>
              </div>
            </div>

            {/* Inventory Products Table */}
            {loadingProducts ? (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">جاري تحميل قائمة المنتجات...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-card border border-slate-200/80 rounded-2xl p-8 text-center max-w-md mx-auto my-6">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">لا توجد منتجات مطابقة للبحث</h3>
              </div>
            ) : (
              <div className="bg-card border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                        <th className="py-3 px-4 text-start">المنتج</th>
                        <th className="py-3 px-4 text-start">الفئة</th>
                        <th className="py-3 px-4 text-start">السعر (ج.م)</th>
                        <th className="py-3 px-4 text-start">رصيد المخزون</th>
                        <th className="py-3 px-4 text-center">مميز</th>
                        <th className="py-3 px-4 text-start">حالة العرض</th>
                        <th className="py-3 px-4 text-end">إجراءات سريعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((prod) => {
                        const isEditing = editingProductId === prod.id;
                        const isLow = prod.stock <= 10;

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Product Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.image_url}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover bg-muted shrink-0 border border-slate-200/80"
                                />
                                <div>
                                  <Link
                                    to="/products/$id"
                                    params={{ id: prod.id }}
                                    className="font-bold text-slate-900 hover:text-primary transition-colors block"
                                  >
                                    {prod.name}
                                  </Link>
                                  <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                    {prod.description}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4 text-slate-600">
                              <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium">
                                {prod.category === "skincare"
                                  ? "عناية بالبشرة"
                                  : prod.category === "box"
                                    ? "بوكس عناية"
                                    : prod.category === "offer"
                                      ? "عرض توفير"
                                      : "ملحقات"}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(Number(e.target.value))}
                                  className="w-24 h-8 text-xs font-mono"
                                  min={0}
                                />
                              ) : (
                                <span>{prod.price} ج.م</span>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="py-3.5 px-4">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={editStock}
                                  onChange={(e) => setEditStock(Number(e.target.value))}
                                  className="w-20 h-8 text-xs font-mono"
                                  min={0}
                                />
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                                    prod.stock === 0
                                      ? "bg-rose-100 text-rose-700"
                                      : isLow
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {prod.stock === 0 && <XCircle className="w-3 h-3" />}
                                  {prod.stock > 0 && isLow && <AlertTriangle className="w-3 h-3" />}
                                  <span>{prod.stock} قطعة</span>
                                </span>
                              )}
                            </td>

                            {/* Featured Toggle */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleProductFeatured(prod)}
                                className={`p-1.5 rounded-lg transition-all inline-flex items-center gap-1 text-xs font-semibold ${
                                  prod.is_featured
                                    ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                                }`}
                                title={
                                  prod.is_featured
                                    ? "منتج مميز بالصفحة الرئيسية (انقر لإلغاء التمييز)"
                                    : "تمييز المنتج في صدارة المتجر"
                                }
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    prod.is_featured
                                      ? "fill-amber-400 text-amber-500"
                                      : "text-slate-400"
                                  }`}
                                />
                                <span className="hidden md:inline">
                                  {prod.is_featured ? "مميز" : "عادي"}
                                </span>
                              </button>
                            </td>

                            {/* Display status */}
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleProductStatus(prod)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                  prod.is_active
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {prod.is_active ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>معروض بالمتجر</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                    <span>مخفي حالياً</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-end">
                              {isEditing ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEditProduct(prod.id)}
                                    className="h-8 px-3 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>حفظ</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingProductId(null)}
                                    className="h-8 px-2 rounded-lg text-xs"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartEditProduct(prod)}
                                    className="h-8 px-2.5 rounded-lg text-xs gap-1 text-slate-700 hover:text-primary"
                                    title="تعديل السعر والمخزون"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">تعديل</span>
                                  </Button>
                                  <Link to="/products/$id" params={{ id: prod.id }} target="_blank">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-800"
                                      title="معاينة المنتج"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
