import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Heart,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronLeft,
  Gift,
  Crown,
  Quote,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LuxeSearchModal } from "@/components/LuxeSearchModal";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { SandboxPreviewBanner } from "@/components/SandboxPreviewBanner";

export function SiteHeader() {
  const { settings } = useStoreSettings();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { t } = useLanguage();

  const nav = [
    { to: "/", label: t("nav.home"), highlight: false },
    { to: "/offers", label: t("nav.offers"), highlight: false },
    { to: "/products", label: t("nav.skinCare"), highlight: false },
    { to: "/boxes", label: t("nav.giftBoxes"), highlight: false },
    { to: "/track-order", label: t("nav.trackOrder"), highlight: false },
  ] as const;

  // Render contextual icon matching the chosen banner theme
  const renderBannerIcon = () => {
    const iconType = settings.bannerIcon || "sparkles";
    const className = "w-3.5 h-3.5 shrink-0 opacity-95";
    switch (iconType) {
      case "gift":
        return <Gift className={className} />;
      case "truck":
        return <Truck className={className} />;
      case "crown":
        return <Crown className={className} />;
      case "shield":
        return <ShieldCheck className={className} />;
      case "quote":
        return <Quote className={className} />;
      case "none":
        return null;
      case "sparkles":
      default:
        return <Sparkles className={className} />;
    }
  };

  const hasLine1 = Boolean(settings.bannerNotice?.trim());
  const hasLine2 = Boolean(settings.bannerSubNotice?.trim());
  const showBanner = hasLine1 || hasLine2;

  return (
    <>
      <SandboxPreviewBanner />
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/70 shadow-2xs">
        {/* Top Promo Banner - Fully dynamic auto-collapsing (1 line or 2 lines or hidden) */}
        {showBanner && (
          <div
            className={`bg-primary text-primary-foreground text-center px-3 sm:px-4 text-[11px] sm:text-xs tracking-wide transition-all duration-200 ${
              hasLine1 && hasLine2 ? "py-2 sm:py-2" : "py-1.5"
            }`}
          >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center">
              {hasLine1 && (
                <div className="flex items-center justify-center gap-1.5 font-bold">
                  {renderBannerIcon()}
                  <span>{settings.bannerNotice}</span>
                </div>
              )}

              {hasLine1 && hasLine2 && <span className="opacity-60 hidden md:inline">•</span>}

              {hasLine2 && (
                <div className="opacity-95 flex items-center justify-center flex-wrap gap-1 text-[10.5px] sm:text-xs">
                  <span>{settings.bannerSubNotice}</span>
                  <Link
                    to="/products"
                    className="underline font-bold ms-1 hover:opacity-100 decoration-1 underline-offset-2 transition-opacity"
                  >
                    تسوّقي الآن
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Row: Optimized Spacious Layout across Mobile, Tablet, and Desktop */}
        <div className="container mx-auto px-2.5 sm:px-6 h-15 sm:h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Left/Start: Official Brand Identity (Supports Logo Image or Typographic Wordmark) */}
          <Link to="/" className="shrink-0 text-start flex items-center group py-0.5 select-none">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col justify-center">
                <span
                  className="text-base sm:text-xl md:text-2xl font-black text-primary tracking-tight leading-none transition-transform group-hover:scale-102"
                  style={{ fontFamily: "var(--font-latin)" }}
                >
                  {settings.storeName.split("-")[1]?.trim() || settings.storeName}
                </span>
                <span
                  className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 tracking-normal leading-tight mt-0.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {settings.storeName.split("-")[0]?.trim() || settings.storeName}
                </span>
              </div>
            )}
          </Link>

          {/* Center: Luxe Interactive Search Bar for Tablets & Desktops (Eliminates empty vacuum) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full h-10 px-4 rounded-full bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/60 hover:border-primary/40 transition-all flex items-center justify-between text-xs cursor-pointer shadow-2xs group"
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                <span>{t("header.searchPlaceholder")}</span>
              </span>
              <span className="text-[10px] bg-background/80 px-2 py-0.5 rounded-md border border-border/50 text-muted-foreground font-mono">
                {t("common.search")}
              </span>
            </button>
          </div>

          {/* Dynamic spacer for mobile/small screens */}
          <div className="flex-1 md:hidden" />

          {/* Right/End: Responsive Grouped Actions (Adaptive to prevent any horizontal overflow) */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
            {/* 1. Luxe Search Lens Icon (Shown on mobile & tablets < md) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/60 hover:bg-primary/10 text-slate-700 dark:text-slate-200 hover:text-primary border border-border/70 hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group shrink-0"
              aria-label="بحث في المنتجات"
              title="بحث في المتجر"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="sr-only">بحث في المتجر</span>
            </button>

            {/* 2. Desktop Utility Group: Order Tracking (>= lg) */}
            <div className="hidden lg:flex items-center ps-1">
              <Link
                to="/track-order"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-muted/70 transition-colors border border-transparent hover:border-border/60 cursor-pointer"
                title={t("header.trackOrderBtn")}
              >
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>{t("header.trackOrderBtn")}</span>
              </Link>
            </div>

            {/* 3. Global Language Switcher (Pill for Mobile & Desktop) */}
            <div className="flex items-center shrink-0">
              <LanguageSwitcher />
            </div>

            {/* 4. Smart Currency Switcher: Available on Mobile, Tablet & Desktop */}
            <div className="flex items-center shrink-0">
              <CurrencySwitcher />
            </div>

            {/* 5. Wishlist Link (Restored on ALL devices including mobile) */}
            <Link
              to="/wishlist"
              className="relative p-1.5 sm:p-2 md:p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:text-rose-600 hover:bg-muted/70 transition-colors inline-flex cursor-pointer shrink-0"
              aria-label={t("header.wishlistCount")}
              title={t("header.wishlistCount")}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-75" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -start-0.5 bg-rose-500 text-white text-[10px] font-extrabold min-w-4 h-4 sm:min-w-4.5 sm:h-4.5 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 6. Shopping Cart Button (Always visible on Mobile, Tablet & PC) */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2 md:p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-muted/70 transition-colors cursor-pointer shrink-0"
              aria-label={t("header.cartCount")}
              title={t("header.cartCount")}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-75" />
              {count > 0 && (
                <span className="absolute -top-0.5 -start-0.5 bg-primary text-primary-foreground text-[10px] font-extrabold min-w-4 h-4 sm:min-w-4.5 sm:h-4.5 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {count}
                </span>
              )}
            </Link>

            {/* 6. Login / Account Controls: Protected strictly between Cart and Hamburger Menu */}
            {email ? (
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <Link
                  to="/account"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-muted/70 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors cursor-pointer"
                  aria-label="حسابي"
                  title={`حسابي (${email})`}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button
                  onClick={async () => {
                    await queryClient.cancelQueries();
                    queryClient.clear();
                    await supabase.auth.signOut();
                    navigate({ to: "/", replace: true });
                  }}
                  className="hidden sm:inline-flex p-2 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  aria-label="تسجيل الخروج"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="shrink-0 flex items-center">
                {/* Mobile (< sm): Sleek compact circular user icon button */}
                <Link
                  to="/auth"
                  className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
                  aria-label="تسجيل الدخول"
                  title="تسجيل الدخول"
                >
                  <User className="w-4 h-4" />
                </Link>

                {/* Tablet & Desktop (>= sm): Full pill button with text */}
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex items-center"
                  aria-label="تسجيل الدخول"
                  title="تسجيل الدخول أو إنشاء حساب"
                >
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-bold px-3 sm:px-4 h-8 sm:h-9 cursor-pointer shadow-xs gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>دخول</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* 7. Mobile / Tablet Menu Toggle Button (< md) - At the very end of header */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-muted text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Category Nav for Desktop */}
        <nav className="hidden md:block border-t border-border/60 bg-background/50">
          <div className="container mx-auto px-4 h-11 flex items-center justify-center gap-8 overflow-x-auto">
            {nav.map((n, idx) => (
              <Link
                key={idx}
                to={n.to}
                className={`text-xs sm:text-sm font-bold whitespace-nowrap transition-colors py-1 border-b-2 border-transparent hover:border-primary hover:text-primary ${
                  n.highlight ? "text-primary" : "text-slate-700 dark:text-slate-300"
                }`}
                activeProps={{ className: "text-primary border-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Drawer Navigation */}
        {open && (
          <nav className="md:hidden border-t border-border/80 bg-background/98 backdrop-blur-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4 text-start">
              {/* Language & Store Settings for Mobile Drawer */}
              <LanguageSwitcher variant="drawer" />

              {/* Quick Links Group */}
              <div className="space-y-1">
                {nav.map((n, idx) => (
                  <Link
                    key={idx}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between text-sm font-semibold py-2.5 px-3 rounded-xl hover:bg-muted text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <span>{n.label}</span>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rtl:rotate-0 rotate-180" />
                  </Link>
                ))}

                {/* Wishlist Link for Mobile */}
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between text-sm font-semibold py-2.5 px-3 rounded-xl hover:bg-muted text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>قائمة المفضلة</span>
                  </span>
                  {wishlistCount > 0 ? (
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rtl:rotate-0 rotate-180" />
                  )}
                </Link>
              </div>

              {/* Account & Administration for Mobile */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                {!email ? (
                  <Link to="/auth" onClick={() => setOpen(false)} className="block w-full">
                    <Button className="w-full h-11 rounded-xl text-xs font-bold">
                      تسجيل الدخول / إنشاء حساب جديد
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-xl hover:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>حسابي الشخصي</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">{email}</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-xl hover:bg-muted"
                    >
                      <span>سجل طلباتي السابقة</span>
                      <ChevronLeft className="w-4 h-4 text-muted-foreground rtl:rotate-0 rotate-180" />
                    </Link>

                    <button
                      onClick={async () => {
                        setOpen(false);
                        await queryClient.cancelQueries();
                        queryClient.clear();
                        await supabase.auth.signOut();
                        navigate({ to: "/", replace: true });
                      }}
                      className="flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors w-full text-start"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}

        {/* Luxe Search Lens Modal Overlay */}
        <LuxeSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      </header>
    </>
  );
}
