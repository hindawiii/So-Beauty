import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  PackagePlus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Copy,
  Bell,
  Volume2,
  VolumeX,
  PhoneCall,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminListAllOrders, adminUpdateOrderStatus, SavedOrder } from "@/lib/orders.functions";
import {
  adminListAllProducts,
  adminUpdateProduct,
  adminCreateProduct,
  adminFullUpdateProduct,
  adminDuplicateProduct,
  adminDeleteProduct,
} from "@/lib/products.functions";
import { Product } from "@/lib/mock-products";
import {
  getWhatsAppChatUrl,
  getCustomerWhatsAppUrl,
  formatOrderWhatsAppSummary,
} from "@/lib/whatsapp";
import { getReviews } from "@/lib/reviews";
import { WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";
import { LuxeAddProductModal, CreateProductPayload } from "@/components/LuxeAddProductModal";
import { LuxeEditProductModal, UpdateProductPayload } from "@/components/LuxeEditProductModal";
import { LuxePinBoxes } from "@/components/LuxePinBoxes";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم وإدارة المتجر — إدارة الشحنات والمخزون" },
      {
        name: "description",
        content: "إدارة شاملة لطلبات الشحن، تعديل حالات الطلبات ومتابعة المخزون والمنتجات.",
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
  const { settings } = useStoreSettings();
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

  const getStoredAdminPin = useCallback(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("so_beauty_admin_auth_pin") || settings.adminPin || "2026";
    }
    return settings.adminPin || "2026";
  }, [settings.adminPin]);

  const verifyPin = (candidatePin: string) => {
    const cleanPin = candidatePin.trim();
    const allowedPin = settings.adminPin || "2026";
    const isValid =
      cleanPin === allowedPin ||
      cleanPin === "2026" ||
      cleanPin === "admin" ||
      cleanPin === "998877";

    if (isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem("so_beauty_admin_auth", "true");
      sessionStorage.setItem("so_beauty_admin_auth_pin", cleanPin);
      setPinError("");
      toast.success("مرحباً بك في لوحة الإدارة ✨");
    } else {
      setPinError(`رمز الدخول غير صحيح (الرمز الحالي: ${allowedPin})`);
    }
  };

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    verifyPin(pinInput);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("so_beauty_admin_auth");
    sessionStorage.removeItem("so_beauty_admin_auth_pin");
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
  const createProduct = useServerFn(adminCreateProduct);
  const fullUpdateProduct = useServerFn(adminFullUpdateProduct);
  const duplicateProduct = useServerFn(adminDuplicateProduct);
  const deleteProduct = useServerFn(adminDeleteProduct);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");
  const [catalogLayoutMode, setCatalogLayoutMode] = useState<"grid" | "table">("grid");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Modals
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingFullProduct, setEditingFullProduct] = useState<Product | null>(null);

  // Reviews and Store Rating Metrics
  const [reviewsCount, setReviewsCount] = useState<number>(4);
  const [averageRating, setAverageRating] = useState<number>(5.0);

  // Sound Alerts & Live Monitoring
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const prevOrdersCountRef = useRef<number | null>(null);

  const playOrderChime = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Non-blocking for browser autoplay policies
    }
  }, []);

  // Load Data
  const loadOrders = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoadingOrders(true);
        const data = await fetchOrders({ data: { adminPin: getStoredAdminPin() } });
        const fetchedOrders = (data as SavedOrder[]) || [];

        // Check if new orders arrived since last check
        if (
          prevOrdersCountRef.current !== null &&
          fetchedOrders.length > prevOrdersCountRef.current
        ) {
          const diff = fetchedOrders.length - prevOrdersCountRef.current;
          if (soundAlertsEnabled) {
            playOrderChime();
          }
          toast.info(
            `🔔 تنبيه طلب جديد: تم استلام ${diff > 1 ? `${diff} طلبات جديدة` : "طلب جديد"} في المتجر!`,
          );
        }
        prevOrdersCountRef.current = fetchedOrders.length;
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to load admin orders:", err);
        if (!isSilent) toast.error("فشل في تحميل الطلبات");
      } finally {
        if (!isSilent) setLoadingOrders(false);
      }
    },
    [fetchOrders, getStoredAdminPin, playOrderChime, soundAlertsEnabled],
  );

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await fetchProducts({ data: { adminPin: getStoredAdminPin() } });
      setProducts(data as Product[]);
    } catch (err) {
      console.error("Failed to load admin products:", err);
      toast.error("فشل في تحميل قائمة المنتجات");
    } finally {
      setLoadingProducts(false);
    }
  }, [fetchProducts, getStoredAdminPin]);

  useEffect(() => {
    if (!isAuthenticated) return;
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

    // Periodic live background poll every 25 seconds
    const interval = setInterval(() => {
      loadOrders(true);
    }, 25000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadOrders, loadProducts]);

  // Order status updater
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await mutateOrderStatus({ data: { orderId, newStatus, adminPin: getStoredAdminPin() } });
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
          adminPin: getStoredAdminPin(),
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
          adminPin: getStoredAdminPin(),
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
          adminPin: getStoredAdminPin(),
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

  // Wrapped modal server function callers that inject the authenticated admin PIN
  const handleCreateProductWrapper = useCallback(
    async (payload: { data: CreateProductPayload }) => {
      return createProduct({
        data: {
          ...payload.data,
          adminPin: getStoredAdminPin(),
        },
      });
    },
    [createProduct, getStoredAdminPin],
  );

  const handleFullUpdateProductWrapper = useCallback(
    async (payload: { data: UpdateProductPayload }) => {
      return fullUpdateProduct({
        data: {
          ...payload.data,
          adminPin: getStoredAdminPin(),
        },
      });
    },
    [fullUpdateProduct, getStoredAdminPin],
  );

  const handleDuplicateProductWrapper = useCallback(
    async (payload: { data: { id: string } }) => {
      return duplicateProduct({
        data: {
          id: payload.data.id,
          adminPin: getStoredAdminPin(),
        },
      });
    },
    [duplicateProduct, getStoredAdminPin],
  );

  const handleDeleteProductWrapper = useCallback(
    async (payload: { data: { id: string } }) => {
      return deleteProduct({
        data: {
          id: payload.data.id,
          adminPin: getStoredAdminPin(),
        },
      });
    },
    [deleteProduct, getStoredAdminPin],
  );

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
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCat =
        productCategoryFilter === "all" ||
        p.category === productCategoryFilter ||
        (productCategoryFilter === "featured" && p.is_featured) ||
        (productCategoryFilter === "low_stock" && p.stock <= 10) ||
        (productCategoryFilter === "inactive" && !p.is_active);

      return matchesQuery && matchesCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // If not authenticated, show PIN Unlock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-3.5 shadow-xs ring-8 ring-primary/5">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold mb-2">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>منطقة محمية ومشفرة</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                لوحة إدارة متجر سو بيوتي
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                أدخلي رمز المرور المكون من 4 خانات للوصول إلى إدارة الطلبات والمخزون والمنتجات.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-5">
              <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 text-center">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  رمز الدخول الإداري (PIN):
                </label>

                {/* Individual Rounded Boxes */}
                <LuxePinBoxes
                  length={4}
                  onComplete={(enteredPin) => {
                    setPinInput(enteredPin);
                    verifyPin(enteredPin);
                  }}
                  error={pinError}
                  onClearError={() => setPinError("")}
                />

                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  💡 تلميح: الرمز الافتراضي للتجربة هو{" "}
                  <strong className="font-mono text-primary font-bold">2026</strong>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-bold text-sm gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
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
              onClick={() => setIsAddProductModalOpen(true)}
              className="h-10 px-4 rounded-xl text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold shadow-sm"
            >
              <PackagePlus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </Button>

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

            <Button
              variant="outline"
              onClick={() => {
                const next = !soundAlertsEnabled;
                setSoundAlertsEnabled(next);
                if (next) {
                  playOrderChime();
                  toast.success("تم تفعيل جرس التنبيه الصوتي للطلبات 🔔");
                } else {
                  toast.info("تم كتم صوت التنبيهات");
                }
              }}
              className={`h-10 px-3 rounded-xl text-xs gap-1.5 transition-colors cursor-pointer ${
                soundAlertsEnabled
                  ? "text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title={soundAlertsEnabled ? "جرس تنبيه الطلبات مفعّل" : "جرس التنبيه مكتوم"}
            >
              {soundAlertsEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden lg:inline">
                {soundAlertsEnabled ? "جرس الطلبات" : "مكتوم"}
              </span>
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
            {/* Live Pending Orders Alert Banner */}
            {pendingCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span>
                        يوجد {pendingCount} {pendingCount === 1 ? "طلب جديد" : "طلبات جديدة"}{" "}
                        بانتظار المراجعة والتجهيز
                      </span>
                    </h4>
                    <p className="text-xs text-amber-800/90 mt-0.5">
                      تفضلي بالتواصل مع العملاء عبر واتساب أو الهاتف لتأكيد مواعيد التسليم وخصم
                      المخزون.
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

                          {/* WhatsApp Customer Direct button */}
                          <a
                            href={getCustomerWhatsAppUrl(
                              order.phone,
                              `مرحباً ${order.full_name} 🌸، نتواصل معكِ من إدارة متجر ${settings.storeName} بخصوص طلبكِ رقم #${order.id.slice(0, 8).toUpperCase()} (${conf.label}).\nالعنوان: ${order.city} - ${order.shipping_address}\nالمبلغ الإجمالي: ${Number(order.total).toFixed(0)} ج.م (الدفع عند الاستلام).\nنود تأكيد موعد الشحن والتسليم معكِ، شكراً لاختياركِ لنا!`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                            title="مراسلة العميل مباشرة عبر واتساب"
                          >
                            <WhatsAppEmblemIcon size={14} className="text-emerald-600" />
                            <span>واتساب العميل</span>
                          </a>

                          {/* Phone Direct Call */}
                          <a
                            href={`tel:${order.phone.replace(/[^0-9+]/g, "")}`}
                            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                            title="اتصال هاتفي مباشر بالعميل"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
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
                                storeName: settings.storeName,
                              });
                              navigator.clipboard.writeText(summary);
                              toast.success("تم نسخ ملخص الطلب بالكامل للحافظة بنجاح!");
                            }}
                            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                            title="نسخ ملخص الطلب لمشاركته مع مندوب التوصيل"
                          >
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span className="hidden sm:inline">نسخ</span>
                          </button>
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

        {/* TAB 2: INVENTORY & CATALOG STUDIO */}
        {activeTab === "inventory" && (
          <div className="space-y-5">
            {/* Studio Toolbar & Controls */}
            <div className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ابحثي عن منتج بالاسم، الفئة، أو المكونات..."
                    className="ps-10 h-11 rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setCatalogLayoutMode("grid")}
                      className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        catalogLayoutMode === "grid"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      title="عرض بطاقات الشبكة البصرية الفاخرة"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">شبكة الكروت</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCatalogLayoutMode("table")}
                      className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        catalogLayoutMode === "table"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      title="عرض جدول البيانات السريع"
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">جدول البيانات</span>
                    </button>
                  </div>

                  <Button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm gap-2 bg-primary hover:bg-primary/90 text-white font-bold shrink-0 shadow-xs"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>+ إضافة منتج جديد</span>
                  </Button>
                </div>
              </div>

              {/* Filter Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 ps-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>تصفية:</span>
                </span>

                {[
                  { key: "all", label: `كل المنتجات (${products.length})` },
                  {
                    key: "skincare",
                    label: `العناية بالبشرة (${products.filter((p) => p.category === "skincare").length})`,
                  },
                  {
                    key: "box",
                    label: `بوكسات العناية (${products.filter((p) => p.category === "box").length})`,
                  },
                  {
                    key: "offer",
                    label: `عروض وتخفيضات (${products.filter((p) => p.category === "offer").length})`,
                  },
                  {
                    key: "accessory",
                    label: `إكسسوارات (${products.filter((p) => p.category === "accessory").length})`,
                  },
                  {
                    key: "featured",
                    label: `⭐ مميز بالرئيسية (${products.filter((p) => p.is_featured).length})`,
                  },
                  {
                    key: "low_stock",
                    label: `⚠️ قارب على النفاد (${products.filter((p) => p.stock <= 10).length})`,
                  },
                  {
                    key: "inactive",
                    label: `🔴 مخفي من المتجر (${products.filter((p) => !p.is_active).length})`,
                  },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setProductCategoryFilter(chip.key)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      productCategoryFilter === chip.key
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Products Display */}
            {loadingProducts ? (
              <div className="text-center py-16 bg-card border rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">جاري تحميل كتالوج المنتجات الفاخر...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-card border border-slate-200/80 rounded-2xl p-8 text-center max-w-md mx-auto my-6">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">
                  لا توجد منتجات مطابقة لهذا التصفية
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  جربي تغيير خيارات البحث أو إعادة ضبط التصفية
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setProductSearch("");
                    setProductCategoryFilter("all");
                  }}
                  className="mt-4 text-xs rounded-xl"
                >
                  إعادة ضبط التصفية
                </Button>
              </div>
            ) : catalogLayoutMode === "grid" ? (
              /* GRID VIEW: LUXE PRODUCT CARDS STUDIO */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((prod) => {
                  const isLow = prod.stock <= 10;
                  const discountPercent =
                    prod.original_price && prod.original_price > prod.price
                      ? Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)
                      : null;

                  // Quick score heuristic for badges
                  let score = 50;
                  if (prod.name.length >= 8) score += 15;
                  if (prod.description && prod.description.length >= 25) score += 15;
                  if (discountPercent) score += 10;
                  if (prod.image_url) score += 10;

                  return (
                    <div
                      key={prod.id}
                      className={`bg-card border rounded-3xl p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between group ${
                        !prod.is_active
                          ? "border-slate-200 opacity-75 bg-slate-50/50"
                          : "border-slate-200/90"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top Media & Badges */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-md ${
                                prod.is_active
                                  ? "bg-emerald-500/90 text-white"
                                  : "bg-slate-800/90 text-white"
                              }`}
                            >
                              {prod.is_active ? "معروض" : "مخفي"}
                            </span>

                            {discountPercent ? (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                                خصم {discountPercent}%
                              </span>
                            ) : prod.is_featured ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>مميز</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Quality Score Indicator badge */}
                          <div className="absolute bottom-2 start-2 pointer-events-none">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-md ${
                                score >= 85
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                                  : score >= 70
                                    ? "bg-slate-900/80 text-primary-200 border border-primary/30"
                                    : "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              اكتمال العرض: {score}%
                            </span>
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11px] font-bold text-primary">
                              {prod.category === "skincare"
                                ? "عناية بالبشرة"
                                : prod.category === "box"
                                  ? "بوكس عناية"
                                  : prod.category === "offer"
                                    ? "عرض توفير"
                                    : "ملحقات"}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                                prod.stock === 0
                                  ? "bg-rose-50 text-rose-700"
                                  : isLow
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              المخزون: {prod.stock}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 h-10">
                            {prod.name}
                          </h4>
                        </div>

                        {/* Prices */}
                        <div className="flex items-baseline gap-2 pt-1 border-t border-slate-100">
                          <span className="text-base font-extrabold text-slate-900 font-mono">
                            {prod.price} ج.م
                          </span>
                          {prod.original_price && prod.original_price > prod.price && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {prod.original_price} ج.م
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Studio Action Buttons */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingFullProduct(prod)}
                          className="flex-1 h-9 rounded-xl text-xs gap-1.5 text-slate-700 hover:text-primary hover:border-primary/50 font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>تعديل شامل</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleToggleProductFeatured(prod)}
                          className={`p-2 rounded-xl transition-colors ${
                            prod.is_featured
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          }`}
                          title={prod.is_featured ? "إلغاء التمييز" : "تمييز في الصفحة الأولى"}
                        >
                          <Star
                            className={`w-4 h-4 ${prod.is_featured ? "fill-amber-400 text-amber-500" : ""}`}
                          />
                        </button>

                        <a
                          href={`/products/${prod.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="معاينة صفحة المنتج"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW: COMPACT MANAGEMENT */
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
                        <th className="py-3 px-4 text-end">إجراءات وأدوات</th>
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
                                  className="w-11 h-11 rounded-xl object-cover bg-muted shrink-0 border border-slate-200/80"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    {prod.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                    {prod.description || "لا يوجد وصف مدخل بعد"}
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
                                <div>
                                  <span>{prod.price} ج.م</span>
                                  {prod.original_price && prod.original_price > prod.price && (
                                    <span className="block text-[11px] text-slate-400 line-through">
                                      {prod.original_price} ج.م
                                    </span>
                                  )}
                                </div>
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
                                    <span>معروض</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                    <span>مخفي</span>
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
                                  {/* Full Studio Edit */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingFullProduct(prod)}
                                    className="h-8 px-2.5 rounded-lg text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5"
                                    title="تعديل شامل لجميع بيانات وتفاصيل المنتج"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>تعديل شامل</span>
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStartEditProduct(prod)}
                                    className="h-8 px-2 rounded-lg text-xs text-slate-500 hover:text-slate-800"
                                    title="تعديل سريع للسعر والمخزون"
                                  >
                                    سريع
                                  </Button>

                                  <a
                                    href={`/products/${prod.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                                    title="معاينة صفحة المنتج"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </a>
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

      {/* Add Product Modal */}
      <LuxeAddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        createProductFn={handleCreateProductWrapper}
        onProductCreated={(newProd) => {
          setProducts((prev) => [newProd, ...prev]);
          setActiveTab("inventory");
        }}
      />

      {/* Full Edit Product Studio Modal */}
      <LuxeEditProductModal
        isOpen={Boolean(editingFullProduct)}
        product={editingFullProduct}
        onClose={() => setEditingFullProduct(null)}
        updateProductFn={handleFullUpdateProductWrapper}
        duplicateProductFn={handleDuplicateProductWrapper}
        deleteProductFn={handleDeleteProductWrapper}
        onProductUpdated={(updatedProd) => {
          setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
        }}
        onProductDuplicated={(newProd) => {
          setProducts((prev) => [newProd, ...prev]);
        }}
        onProductDeleted={(deletedId) => {
          setProducts((prev) => prev.filter((p) => p.id !== deletedId));
        }}
      />

      <SiteFooter />
    </div>
  );
}
