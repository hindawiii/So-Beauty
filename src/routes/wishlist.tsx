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
import { useLanguage } from "@/context/LanguageContext";

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
  const { t, isRTL } = useLanguage();
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
    toast.success(t("wishlist.addedAllSuccess").replace("{count}", String(items.length)));
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
            <span>{t("wishlist.backToShopping")}</span>
          </Link>
          <span className="text-xs text-muted-foreground font-medium">
            {t("header.wishlistCount")}
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                {t("wishlist.title")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("wishlist.subtitle")}
            </p>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                onClick={handleAddAllToCart}
                className="rounded-xl gap-2 h-10 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                {t("wishlist.moveAllToCart")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 h-10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t("wishlist.clearList")}
              </Button>
            </div>
          )}
        </div>

        {/* Clear Confirmation Prompt */}
        {showClearConfirm && (
          <div className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-destructive">
            <span className="text-sm font-semibold">{t("wishlist.clearConfirmText")}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  clear();
                  setShowClearConfirm(false);
                  toast.success(t("wishlist.clearedSuccess"));
                }}
                className="rounded-xl h-9 px-4 text-xs font-semibold"
              >
                {t("wishlist.clearConfirmYes")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl h-9 px-4 text-xs"
              >
                {t("common.cancel")}
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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {t("wishlist.emptyTitle")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {t("wishlist.emptyDesc")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/products">
                <Button className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  {t("wishlist.browseProducts")}
                </Button>
              </Link>
              <Link to="/boxes">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl font-semibold gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t("wishlist.careBoxes")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
              <span>{t("wishlist.viewingCount").replace("{count}", String(count))}</span>
              <Link
                to="/products"
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>{t("wishlist.exploreMore")}</span>
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
