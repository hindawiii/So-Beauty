import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Plus,
  ShieldCheck,
  Search,
  MessageSquare,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  Eye,
  RefreshCw,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Review,
  getAllAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
  adminAddManualReview,
  isSeedReviewsEnabled,
  toggleSeedReviews,
} from "@/lib/reviews";

export function AdminReviewsManagerTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "all",
  );
  const [seedReviewsActive, setSeedReviewsActive] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Manual Review Form State
  const [manualName, setManualName] = useState("");
  const [manualRating, setManualRating] = useState(5);
  const [manualBody, setManualBody] = useState("");
  const [manualProduct, setManualProduct] = useState("");
  const [manualVerified, setManualVerified] = useState(true);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAdminReviews();
      setReviews(data);
      setSeedReviewsActive(isSeedReviewsEnabled());
    } catch {
      toast.error("تعذر تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("so_beauty_review_added", handleUpdate);
    window.addEventListener("so_beauty_review_updated", handleUpdate);
    window.addEventListener("so_beauty_review_deleted", handleUpdate);
    window.addEventListener("so_beauty_seed_reviews_toggled", handleUpdate);

    return () => {
      window.removeEventListener("so_beauty_review_added", handleUpdate);
      window.removeEventListener("so_beauty_review_updated", handleUpdate);
      window.removeEventListener("so_beauty_review_deleted", handleUpdate);
      window.removeEventListener("so_beauty_seed_reviews_toggled", handleUpdate);
    };
  }, [loadData]);

  // Handle Approving a review
  const handleApprove = async (id: string, name: string) => {
    try {
      await approveReview(id);
      toast.success(`تم اعتماد ونشر تقييم "${name}" بنجاح في المتجر! ✨`);
      loadData();
    } catch {
      toast.error("حدث خطأ أثناء اعتماد التقييم");
    }
  };

  // Handle Rejecting a review
  const handleReject = async (id: string, name: string) => {
    try {
      await rejectReview(id);
      toast.info(`تم تعليق/رفض تقييم "${name}" وإخفاؤه من واجهة المتجر.`);
      loadData();
    } catch {
      toast.error("حدث خطأ أثناء تعليق التقييم");
    }
  };

  // Handle Deleting a review
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف تقييم العميل "${name}" نهائياً؟`)) {
      try {
        await deleteReview(id);
        toast.success("تم حذف التقييم نهائياً");
        loadData();
      } catch {
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  // Handle Toggling Seed Reviews
  const handleToggleSeed = async () => {
    const next = !seedReviewsActive;
    setSeedReviewsActive(next);
    await toggleSeedReviews(next);
    if (next) {
      toast.success("تم تفعيل إظهار آراء التأسيس التلقائية في المتجر 🌟");
    } else {
      toast.info("تم إخفاء آراء التأسيس التلقائية، يظهر فقط تقييمات العملاء المعتمدة 🔒");
    }
  };

  // Submit manual review
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualBody.trim()) {
      toast.error("يرجى ملء اسم العميل ونص التقييم أولاً");
      return;
    }

    setIsSubmittingManual(true);
    try {
      await adminAddManualReview({
        name: manualName.trim(),
        rating: manualRating,
        body: manualBody.trim(),
        product_name: manualProduct.trim() || undefined,
        is_verified: manualVerified,
      });

      toast.success("تمت إضافة التقييم الموثق ونشره بنجاح في المتجر! 🎉");
      setManualName("");
      setManualBody("");
      setManualProduct("");
      setManualRating(5);
      setManualVerified(true);
      setIsAddModalOpen(false);
      loadData();
    } catch {
      toast.error("فشل إضافة التقييم");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Calculations & KPIs
  const totalReviewsCount = reviews.length;
  const pendingCount = reviews.filter(
    (r) => r.status === "pending" || r.is_approved === false,
  ).length;
  const approvedCount = reviews.filter(
    (r) => r.is_approved !== false && r.status !== "pending" && r.status !== "rejected",
  ).length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  const averageRating = useMemo(() => {
    const approved = reviews.filter(
      (r) => r.is_approved !== false && r.status !== "pending" && r.status !== "rejected",
    );
    if (approved.length === 0) return "5.0";
    const sum = approved.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / approved.length).toFixed(1);
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Status Filter
      if (statusFilter === "pending") {
        if (r.status !== "pending" && r.is_approved !== false) return false;
      } else if (statusFilter === "approved") {
        if (r.is_approved === false || r.status === "pending" || r.status === "rejected")
          return false;
      } else if (statusFilter === "rejected") {
        if (r.status !== "rejected") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesBody = r.body.toLowerCase().includes(q);
        const matchesProduct = r.product_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesBody && !matchesProduct) return false;
      }

      return true;
    });
  }, [reviews, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header Card & Seed Reviews Toggle */}
      <div className="bg-card border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>مركز إدارة ومراجعة آراء وتقييمات العملاء</span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  نظام التوثيق والقبول
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            راجع تقييمات العملاء الجديدة واعتمدها لتظهر فوراً على الموقع، أو علّق التقييمات
            المشبوهة، وتحكم في آراء التأسيس التلقائية لتعزيز ثقة المشترين الجدد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Seed Reviews Toggle Card */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>آراء التأسيس التلقائية</span>
              </p>
              <p className="text-[10px] text-slate-400">4 آراء موثقة لبناء الثقة</p>
            </div>
            <button
              type="button"
              onClick={handleToggleSeed}
              className={`p-1 rounded-xl transition-colors cursor-pointer ${
                seedReviewsActive ? "text-emerald-600" : "text-slate-400"
              }`}
              title={seedReviewsActive ? "آراء التأسيس مفعّلة" : "آراء التأسيس معطلة"}
            >
              {seedReviewsActive ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 rounded-xl text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تقييم موثق يدوياً</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={loadData}
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-slate-600 hover:text-slate-900"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 mb-1">إجمالي التقييمات</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{totalReviewsCount}</h3>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-card border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-amber-700 mb-1">بانتظار المراجعة والاعتماد</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-amber-600">{pendingCount}</h3>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-card border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-700 mb-1">معتمدة ومنشورة بالمتجر</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-emerald-600">{approvedCount}</h3>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-card border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 mb-1">متوسط التقييم العام</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-1">
              <span>{averageRating}</span>
              <span className="text-xs text-amber-500">★</span>
            </h3>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            الكل ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700 hover:bg-amber-100/50"
            }`}
          >
            <span>بانتظار المراجعة</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:bg-emerald-100/50"
            }`}
          >
            المعتمدة والمنشورة ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "rejected"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-700 hover:bg-rose-100/50"
            }`}
          >
            المرفوضة/المعلقة ({rejectedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم العميل، المنتج أو التقييم..."
            className="h-9 text-xs rounded-xl pe-8 text-start"
          />
          <Search className="w-4 h-4 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Reviews Cards List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          <span>جاري تحميل التقييمات...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-card border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">لا توجد تقييمات مطابقة لهذا الفلتر</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === "pending"
              ? "رائع! لا توجد أي تقييمات جديدة معلقة بحاجة لمراجعة حالياً."
              : "لم يتم العثور على تقييمات تطابق كلمات البحث المكتوبة."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const isPending = rev.status === "pending" || rev.is_approved === false;
            const isRejected = rev.status === "rejected";
            const isApproved = !isPending && !isRejected;

            return (
              <div
                key={rev.id}
                className={`bg-card border rounded-2xl p-4 sm:p-5 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending
                    ? "border-amber-300 bg-amber-50/20"
                    : isRejected
                      ? "border-rose-200 bg-rose-50/10 opacity-75"
                      : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {/* Left/Main Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rev.name}</span>

                    {rev.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>مشترية مؤكدة</span>
                      </span>
                    )}

                    {rev.is_seed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>رأي تأسيس تلقائي</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>قيد المراجعة</span>
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>معتمد ومنشور</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>مرفوض / معلق</span>
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 ms-auto md:ms-0 font-mono">
                      {new Date(rev.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  {/* Rating Stars & Product Tag */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    {rev.product_name && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg truncate max-w-xs">
                        {rev.product_name}
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">{rev.body}</p>
                </div>

                {/* Right / Actions Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {isPending || isRejected ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApprove(rev.id, rev.name)}
                      className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اعتماد ونشر ✅</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(rev.id, rev.name)}
                      className="h-9 px-3 rounded-xl text-xs font-bold gap-1 text-amber-700 border-amber-200 hover:bg-amber-50 cursor-pointer"
                      title="تعليق التقييم وإخفاؤه من المتجر"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>تعليق / إخفاء</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rev.id, rev.name)}
                    className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="حذف التقييم نهائياً"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Review Creation Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader className="text-start mb-4">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <span>إضافة ونشر تقييم موثق يدوياً</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              أدخل تقييم عميل حقيقي ورد إليك عبر واتساب أو الهاتف لتوثيقه ونشره فوراً في المتجر.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateManual} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">اسم العميل / المشترية</label>
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="مثال: ليلى عثمان أو أم أحمد"
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                اسم المنتج المرتبط (اختياري)
              </label>
              <Input
                value={manualProduct}
                onChange={(e) => setManualProduct(e.target.value)}
                placeholder="مثال: سيروم فيتامين سي أو بوكس العناية"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">التقييم بالنجوم</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setManualRating(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= manualRating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ms-2 font-mono">
                  {manualRating} من 5 نجوم
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">نص التقييم والتجربة</label>
              <Textarea
                value={manualBody}
                onChange={(e) => setManualBody(e.target.value)}
                placeholder="اكتب تفاصيل تجربة العميل الإيجابية مع المنتج..."
                className="min-h-[100px] text-xs rounded-xl"
                required
              />
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={manualVerified}
                onChange={(e) => setManualVerified(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-xs font-semibold text-slate-800">
                إضافة شارة "مشترية مؤكدة Verified"
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="h-10 px-4 rounded-xl text-xs"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingManual}
                className="h-10 px-5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                حفظ ونشر التقييم فوراً ✨
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
