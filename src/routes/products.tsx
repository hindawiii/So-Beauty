import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";
import {
  SlidersHorizontal,
  Sparkles,
  XCircle,
  ArrowUpDown,
  Search,
  X,
  RotateCcw,
  Check,
  Tag,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const productsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: () => listProducts({ data: {} }),
});

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "متجر المنتجات — So Beauty" },
      {
        name: "description",
        content:
          "تسوّقي مجموعتنا الكاملة من منتجات العناية الطبيعية بالبشرة وبوكسات الجمال مع خيارات التصفية والترتيب.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ProductsPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-rose-600">
      حدث خطأ أثناء تحميل المنتجات: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">الصفحة غير موجودة</div>,
});

function ProductsPage() {
  const { q, category: initialCategory } = Route.useSearch();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">جاري تحميل قائمة المنتجات...</p>
            </div>
          }
        >
          <ProductCatalog q={q} initialCategory={initialCategory} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

type SortOption = "default" | "price-asc" | "price-desc" | "discount" | "name-asc";

function ProductCatalog({ q, initialCategory }: { q?: string; initialCategory?: string }) {
  const { data: allProducts } = useSuspenseQuery(productsQuery);

  // States
  const [searchQuery, setSearchQuery] = useState<string>(q || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyOffers, setOnlyOffers] = useState<boolean>(initialCategory === "offers");

  // Derive maximum product price in the catalog
  const maxCatalogPrice = useMemo(() => {
    if (!allProducts.length) return 100000;
    const highest = Math.max(...allProducts.map((p) => Number(p.price) || 0));
    return Math.ceil(highest / 5000) * 5000 || 100000;
  }, [allProducts]);

  const [priceRange, setPriceRange] = useState<number>(maxCatalogPrice);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [allProducts]);

  // Active filters count (excluding default values)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (onlyInStock) count++;
    if (onlyOffers) count++;
    if (priceRange < maxCatalogPrice) count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedCategory, onlyInStock, onlyOffers, priceRange, maxCatalogPrice, searchQuery]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("default");
    setOnlyInStock(false);
    setOnlyOffers(false);
    setPriceRange(maxCatalogPrice);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Search query filter
    const term = searchQuery.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        [p.name, p.description ?? "", p.category ?? ""].join(" ").toLowerCase().includes(term),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "offers") {
        list = list.filter(
          (p) => p.original_price != null && Number(p.original_price) > Number(p.price),
        );
      } else {
        list = list.filter((p) => p.category === selectedCategory);
      }
    }

    // Offers only toggle
    if (onlyOffers && selectedCategory !== "offers") {
      list = list.filter(
        (p) => p.original_price != null && Number(p.original_price) > Number(p.price),
      );
    }

    // Stock availability filter
    if (onlyInStock) {
      list = list.filter((p) => (p.stock != null ? Number(p.stock) > 0 : true));
    }

    // Price ceiling filter
    list = list.filter((p) => Number(p.price) <= priceRange);

    // Sorting
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "discount":
        list.sort((a, b) => {
          const discA = a.original_price ? Number(a.original_price) - Number(a.price) : 0;
          const discB = b.original_price ? Number(b.original_price) - Number(b.price) : 0;
          return discB - discA;
        });
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
      case "default":
      default:
        // Keep natural sequence (or by ID/featured)
        break;
    }

    return list;
  }, [allProducts, searchQuery, selectedCategory, onlyOffers, onlyInStock, priceRange, sortBy]);

  return (
    <div className="space-y-8">
      {/* Catalog Title & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-1 rounded-full">
              متجر So Beauty
            </span>
            <span className="text-xs text-slate-400">• عناية طبيعية 100%</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {searchQuery
              ? `نتائج البحث عن "${searchQuery}"`
              : selectedCategory !== "all"
                ? `منتجات قسم ${selectedCategory}`
                : "جميع منتجات العناية بالبشرة"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            اكتشفي خيارات متجرنا المصممة لتمنح بشرتكِ النضارة، التغذية، والإشراقة الصحية.
          </p>
        </div>

        {/* Products Counter Badge */}
        <div className="text-xs text-slate-600 font-semibold whitespace-nowrap bg-slate-100/80 px-3.5 py-2 rounded-xl self-start md:self-auto border border-slate-200/60">
          عرض <strong className="text-slate-900">{filteredProducts.length}</strong> من أصل{" "}
          {allProducts.length} منتج
        </div>
      </div>

      {/* Main Search & Control Bar */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Real-time search box */}
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="ابحثي باسم المنتج أو المكونات أو القسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 pe-10 h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label="مسح نص البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="relative shrink-0 flex items-center">
            <ArrowUpDown className="absolute start-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="ترتيب المنتجات"
              className="h-11 ps-10 pe-8 bg-slate-50/50 hover:bg-slate-100/60 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer w-full sm:w-auto"
            >
              <option value="default">الترتيب: الافتراضي والمميز</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="discount">الأعلى خصماً وتوفيراً</option>
              <option value="name-asc">أبجدياً (أ - ي)</option>
            </select>
          </div>

          {/* Mobile Filters Trigger (Drawer) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-11 rounded-xl gap-2 font-semibold text-xs sm:text-sm lg:hidden border-slate-200 shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>الفلاتر المتقدمة</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ms-1">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-6 overflow-y-auto">
              <SheetHeader className="text-start border-b pb-4 mb-6">
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  خيارات التصفية
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 text-slate-800">
                {/* Mobile: Categories */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    الأقسام والتصنيفات
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        selectedCategory === "all"
                          ? "bg-primary text-white"
                          : "bg-muted text-slate-700"
                      }`}
                    >
                      الكل ({allProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("offers")}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        selectedCategory === "offers"
                          ? "bg-rose-600 text-white"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      العروض والتخفيضات
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCategory(c)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          selectedCategory === c
                            ? "bg-primary text-white"
                            : "bg-muted text-slate-700"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile: Price range slider */}
                <div className="border-t pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      الحد الأقصى للسعر
                    </h4>
                    <span className="text-xs font-bold text-primary">
                      {priceRange.toLocaleString("ar-EG")} ج.م
                    </span>
                  </div>
                  <Slider
                    value={[priceRange]}
                    max={maxCatalogPrice}
                    min={5000}
                    step={2500}
                    onValueChange={(val) => setPriceRange(val[0])}
                    className="py-3"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>5,000 ج.م</span>
                    <span>{maxCatalogPrice.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                </div>

                {/* Mobile: Toggles */}
                <div className="border-t pt-5 space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-muted/40 transition-colors">
                    <span className="text-xs font-semibold">المتوفر في المخزون فقط</span>
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-muted/40 transition-colors">
                    <span className="text-xs font-semibold">المنتجات المخفضة فقط 🔥</span>
                    <input
                      type="checkbox"
                      checked={onlyOffers}
                      onChange={(e) => setOnlyOffers(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-2">
                  <SheetClose asChild>
                    <Button className="w-full h-11 rounded-xl font-semibold text-xs">
                      عرض النتائج ({filteredProducts.length})
                    </Button>
                  </SheetClose>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      onClick={handleResetFilters}
                      className="w-full text-xs text-slate-500 hover:text-slate-800"
                    >
                      إعادة تعيين جميع الفلاتر
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Filter Pills (Desktop & Tablet Horizontal Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap min-h-[38px] ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 hover:bg-muted text-slate-700"
            }`}
          >
            الكل ({allProducts.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("offers")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[38px] ${
              selectedCategory === "offers"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            العروض والتخفيضات
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap min-h-[38px] ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 hover:bg-muted text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Toggles Row (Desktop) */}
        <div className="hidden lg:flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center gap-3">
            {/* In-stock toggle */}
            <button
              type="button"
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-2 min-h-[36px] ${
                onlyInStock
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  onlyInStock ? "bg-emerald-600" : "bg-slate-300"
                }`}
              />
              المتوفر في المخزون فقط
            </button>

            {/* Offers toggle */}
            <button
              type="button"
              onClick={() => setOnlyOffers(!onlyOffers)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold border transition-all flex items-center gap-2 min-h-[36px] ${
                onlyOffers
                  ? "bg-rose-50 border-rose-400 text-rose-800"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              المنتجات المخفضة فقط
            </button>
          </div>

          {/* Desktop Price Slider Filter */}
          <div className="flex items-center gap-3 w-72">
            <span className="text-slate-500 whitespace-nowrap text-[11px] font-medium">
              حتى:{" "}
              <strong className="text-slate-800">{priceRange.toLocaleString("ar-EG")} ج.م</strong>
            </span>
            <Slider
              value={[priceRange]}
              max={maxCatalogPrice}
              min={5000}
              step={2500}
              onValueChange={(val) => setPriceRange(val[0])}
              className="flex-1 py-1"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-3 rounded-2xl border border-slate-200/60 text-xs">
          <span className="text-slate-500 font-medium me-1">الفلاتر المطبقة:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium">
              بحث: "{searchQuery}"
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-destructive"
                aria-label="إلغاء البحث"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium">
              القسم: {selectedCategory === "offers" ? "العروض" : selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="hover:text-destructive"
                aria-label="إلغاء تصفية القسم"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyInStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              المتوفر بالمخزون
              <button
                type="button"
                onClick={() => setOnlyInStock(false)}
                className="hover:text-destructive"
                aria-label="إلغاء شرط التوفر"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyOffers && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              الخصومات فقط
              <button
                type="button"
                onClick={() => setOnlyOffers(false)}
                className="hover:text-destructive"
                aria-label="إلغاء شرط الخصم"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {priceRange < maxCatalogPrice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium">
              السعر حتى: {priceRange.toLocaleString("ar-EG")} ج.م
              <button
                type="button"
                onClick={() => setPriceRange(maxCatalogPrice)}
                className="hover:text-destructive"
                aria-label="إلغاء تصفية السعر"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-7 px-2.5 ms-auto"
          >
            <RotateCcw className="w-3 h-3 me-1" />
            مسح الكل
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-card border border-slate-200/80 rounded-3xl p-8 sm:p-14 text-center my-6 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">لا توجد منتجات تطابق خياراتكِ</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            جربي تعديل خيارات البحث، توسيع نطاق السعر، أو مسح الفلاتر لعرض كافة المنتجات المتوفرة.
          </p>
          <Button
            onClick={handleResetFilters}
            className="rounded-xl h-11 px-6 text-xs font-semibold gap-2 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة تعيين جميع الفلاتر
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
