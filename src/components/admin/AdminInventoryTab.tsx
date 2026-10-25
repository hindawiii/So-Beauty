import React, { useState, useMemo } from "react";
import {
  Search,
  PackagePlus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Package,
  Star,
  Edit3,
  Eye,
  CheckCircle2,
  XCircle,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/mock-products";

interface AdminInventoryTabProps {
  products: Product[];
  loadingProducts: boolean;
  productSearch: string;
  setProductSearch: (s: string) => void;
  productCategoryFilter: string;
  setProductCategoryFilter: (s: string) => void;
  catalogLayoutMode: "grid" | "table";
  setCatalogLayoutMode: (mode: "grid" | "table") => void;
  onOpenAddProduct: () => void;
  onOpenEditFullProduct: (prod: Product) => void;
  onToggleProductFeatured: (prod: Product) => Promise<void>;
  onToggleProductStatus: (prod: Product) => Promise<void>;
  onSaveQuickEdit: (prodId: string, price: number, stock: number) => Promise<void>;
}

export function AdminInventoryTab({
  products,
  loadingProducts,
  productSearch,
  setProductSearch,
  productCategoryFilter,
  setProductCategoryFilter,
  catalogLayoutMode,
  setCatalogLayoutMode,
  onOpenAddProduct,
  onOpenEditFullProduct,
  onToggleProductFeatured,
  onToggleProductStatus,
  onSaveQuickEdit,
}: AdminInventoryTabProps) {
  // Quick inline edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  const handleStartEdit = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditPrice(prod.price);
    setEditStock(prod.stock);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleSaveEdit = async (prodId: string) => {
    await onSaveQuickEdit(prodId, editPrice, editStock);
    setEditingProductId(null);
  };

  // Filtered Products computation
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
        (productCategoryFilter === "featured" && p.is_featured) ||
        (productCategoryFilter === "low_stock" && p.stock <= 10) ||
        (productCategoryFilter === "inactive" && !p.is_active) ||
        p.category === productCategoryFilter;

      return matchesQuery && matchesCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  return (
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
              onClick={onOpenAddProduct}
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
          <h3 className="text-sm font-bold text-slate-800">لا توجد منتجات مطابقة لهذا التصفية</h3>
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
                    onClick={() => onOpenEditFullProduct(prod)}
                    className="flex-1 h-9 rounded-xl text-xs gap-1.5 text-slate-700 hover:text-primary hover:border-primary/50 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-primary" />
                    <span>تعديل شامل</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => onToggleProductFeatured(prod)}
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
        /* COMPACT MANAGEMENT VIEW: RESPONSIVE CARDS ON MOBILE & TABLE ON TABLET/DESKTOP */
        <div>
          {/* Mobile Grouped Cards View (hidden on md+) */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((prod) => {
              const isEditing = editingProductId === prod.id;
              const isLow = prod.stock <= 10;

              return (
                <div
                  key={`mobile-prod-${prod.id}`}
                  className="bg-card border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  {/* Top: Image, Name, Category */}
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0 border border-slate-200/80"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 truncate block">
                          {prod.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleProductFeatured(prod)}
                          className={`p-1 rounded-lg shrink-0 ${
                            prod.is_featured
                              ? "text-amber-500"
                              : "text-slate-300 hover:text-slate-500"
                          }`}
                          title={prod.is_featured ? "إلغاء التمييز" : "تمييز"}
                        >
                          <Star className={`w-4 h-4 ${prod.is_featured ? "fill-amber-400" : ""}`} />
                        </button>
                      </div>
                      <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium mt-0.5">
                        {prod.category === "skincare"
                          ? "عناية بالبشرة"
                          : prod.category === "box"
                            ? "بوكس عناية"
                            : prod.category === "offer"
                              ? "عرض توفير"
                              : "ملحقات"}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Price, Stock, Display Status */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">السعر:</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full h-8 text-xs font-mono mt-1"
                          min={0}
                        />
                      ) : (
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {prod.price} ج.م
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">المخزون:</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-full h-8 text-xs font-mono mt-1"
                          min={0}
                        />
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs mt-0.5 ${
                            prod.stock === 0
                              ? "bg-rose-100 text-rose-700"
                              : isLow
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {prod.stock} قطعة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onToggleProductStatus(prod)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        prod.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
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

                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(prod.id)}
                            className="h-8 px-3 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-8 px-2 rounded-lg text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenEditFullProduct(prod)}
                            className="h-8 px-2.5 rounded-lg text-xs gap-1 text-primary border-primary/30"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل شامل</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(prod)}
                            className="h-8 px-2 rounded-lg text-xs text-slate-500"
                          >
                            سريع
                          </Button>

                          <a
                            href={`/products/${prod.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800"
                            title="معاينة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (hidden on mobile) */}
          <div className="hidden md:block bg-card border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
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
                              <span className="font-bold text-slate-900 block">{prod.name}</span>
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
                              className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-md text-xs ${
                                prod.stock === 0
                                  ? "bg-rose-100 text-rose-700"
                                  : isLow
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {prod.stock} قطعة
                            </span>
                          )}
                        </td>

                        {/* Featured Star */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleProductFeatured(prod)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              prod.is_featured
                                ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                                : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                            }`}
                            title={prod.is_featured ? "إلغاء التمييز" : "تمييز بالصفحة الأولى"}
                          >
                            <Star
                              className={`w-4 h-4 ${prod.is_featured ? "fill-amber-400" : ""}`}
                            />
                          </button>
                        </td>

                        {/* Active Status */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => onToggleProductStatus(prod)}
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
                                onClick={() => handleSaveEdit(prod.id)}
                                className="h-8 px-3 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>حفظ</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
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
                                onClick={() => onOpenEditFullProduct(prod)}
                                className="h-8 px-2.5 rounded-lg text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5"
                                title="تعديل شامل لجميع بيانات وتفاصيل المنتج"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل شامل</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(prod)}
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
        </div>
      )}
    </div>
  );
}
