import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "قائمة المفضلة — المنتجات المحفوظة" },
      {
        name: "description",
        content: "استعرض منتجاتك المفضلة التي قمت بحفظها للتسوق والشراء لاحقاً بكل سهولة.",
      },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, clear, count } = useWishlist();
  const { add } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      add({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
      });
    });
    toast.success(`تمت إضافة جميع المنتجات (${items.length}) إلى سلة التسوق! 🛍️`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {/* Spacious Top Back Navigation Bar */}
        <div className="mb-8 flex items-center justify-between gap-4 pb-4 border-b border-border/60">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-primary" />
            <span>العودة لمتابعة التسوق</span>
          </Link>
          <span className="text-xs text-muted-foreground font-medium">المنتجات المحفوظة</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">قائمة المفضلة</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              المنتجات التي قمتِ بحفظها لتتذكريها وتطلبيها في أي وقت.
            </p>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                onClick={handleAddAllToCart}
                className="rounded-xl gap-2 h-10 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                إضافة الكل إلى السلة
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 h-10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                تفريغ القائمة
              </Button>
            </div>
          )}
        </div>

        {/* Clear Confirmation Prompt */}
        {showClearConfirm && (
          <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-destructive">
            <span className="text-sm font-semibold">
              هل أنتِ متأكدة من رغبتكِ في مسح جميع المنتجات من قائمة المفضلة؟
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  clear();
                  setShowClearConfirm(false);
                  toast.success("تم مسح قائمة المفضلة بنجاح");
                }}
                className="rounded-xl h-9 px-4 text-xs font-semibold"
              >
                نعم، مسح الكل
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

        {count === 0 ? (
          /* Empty State */
          <div className="bg-card border border-slate-200/80 rounded-3xl p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              قائمتكِ المفضلة فارغة حالياً
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              لم تقومي بحفظ أي منتج حتى الآن. اضغطي على علامة القلب 🤍 في أي منتج لتضيفيه إلى قائمة
              مفضلتكِ وتعودي إليه لاحقاً.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/products">
                <Button className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  تصفحي منتجاتنا
                </Button>
              </Link>
              <Link to="/boxes">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  بوكسات العناية
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
              <span>
                عرض <strong className="text-slate-900">{count}</strong> منتج محفوظ
              </span>
              <Link
                to="/products"
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>استكشاف المزيد</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((it) => (
                <ProductCard
                  key={it.id}
                  product={{
                    id: it.id,
                    name: it.name,
                    price: it.price,
                    original_price: it.original_price,
                    image_url: it.image_url,
                    category: it.category,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
