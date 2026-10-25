import React from "react";
import { TrendingUp, DollarSign, ShoppingBag, Clock, Layers, Star } from "lucide-react";

interface AdminMetricsOverviewProps {
  totalRevenue: number;
  ordersCount: number;
  pendingCount: number;
  lowStockCount: number;
  averageRating: number;
  reviewsCount: number;
  onReviewsClick: () => void;
}

export function AdminMetricsOverview({
  totalRevenue,
  ordersCount,
  pendingCount,
  lowStockCount,
  averageRating,
  reviewsCount,
  onReviewsClick,
}: AdminMetricsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {/* 1. Revenue */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1 truncate">إجمالي المبيعات النشطة</p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {totalRevenue.toLocaleString("ar-EG")}{" "}
            <span className="text-xs font-normal text-slate-400">ج.م</span>
          </h3>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span className="truncate">طلبات مؤكدة ومسلمة</span>
          </p>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 ms-2">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 2. Orders Count */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1 truncate">إجمالي عدد الطلبات</p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {ordersCount}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 truncate">مسجلة عبر المتجر وواتساب</p>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ms-2">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 3. Pending Orders */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1 truncate">طلبات بانتظار التأكيد</p>
          <h3 className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
            {pendingCount}
          </h3>
          <p className="text-[11px] text-amber-600/80 mt-1 font-medium truncate">
            تحتاج تواصل وتجهيز
          </p>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 ms-2">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 4. Low Stock */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1 truncate">
            منتجات قاربت على النفاد
          </p>
          <h3
            className={`text-xl sm:text-2xl font-bold tracking-tight ${lowStockCount > 0 ? "text-rose-600" : "text-slate-900"}`}
          >
            {lowStockCount}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 truncate">الرصيد 10 قطع أو أقل</p>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 ms-2">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 5. Average Rating & Reviews */}
      <div
        onClick={onReviewsClick}
        className="bg-card border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between sm:col-span-2 md:col-span-1 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all"
        title="انقر لفتح وإدارة تقييمات وآراء العملاء"
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1 truncate">متوسط تقييمات المتجر</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {averageRating.toFixed(1)}
            </h3>
            <span className="text-xs text-amber-500 font-bold">★ / 5</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1 truncate font-medium">
            بناءً على {reviewsCount} مراجعة (إدارة)
          </p>
        </div>
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 ms-2">
          <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
        </div>
      </div>
    </div>
  );
}
