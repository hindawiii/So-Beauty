import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
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
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LuxeSearchModal } from "@/components/LuxeSearchModal";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { SandboxPreviewBanner } from "@/components/SandboxPreviewBanner";
import { getLocalizedSetting } from "@/lib/product-localization";

export function SiteHeader() {
  const { settings } = useStoreSettings();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeNoticeIdx, setActiveNoticeIdx] = useState(0);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [wishlistBouncing, setWishlistBouncing] = useState(false);
  const prevCount = useRef(count);
  const prevWishlistCount = useRef(wishlistCount);

  // Trigger smooth agile spring hop animation when counts increase
  useEffect(() => {
    if (count > 0 && count !== prevCount.current) {
      setCartBouncing(true);
      const timer = setTimeout(() => setCartBouncing(false), 500);
      prevCount.current = count;
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    if (wishlistCount > 0 && wishlistCount !== prevWishlistCount.current) {
      setWishlistBouncing(true);
      const timer = setTimeout(() => setWishlistBouncing(false), 500);
      prevWishlistCount.current = wishlistCount;
      return () => clearTimeout(timer);
    }
    prevWishlistCount.current = wishlistCount;
  }, [wishlistCount]);

  const triggerCartHop = () => {
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 500);
  };

  const triggerWishlistHop = () => {
    setWishlistBouncing(true);
    setTimeout(() => setWishlistBouncing(false), 500);
  };

  useEffect(() => {
    authClient.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = authClient.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { t, language } = useLanguage();

  const nav = [
    { to: "/", label: t("nav.home"), highlight: false },
    { to: "/offers", label: t("nav.offers"), highlight: false },
    { to: "/products", label: t("nav.skinCare"), highlight: false },
    { to: "/boxes", label: t("nav.giftBoxes"), highlight: false },
    { to: "/track-order", label: t("nav.trackOrder"), highlight: false },
  ] as const;

  // Render contextual icon matching the chosen banner theme (stars removed per user request)
  const renderBannerIcon = () => {
    const iconType = settings.bannerIcon;
    if (!iconType || iconType === "none" || iconType === "sparkles") {
      return null;
    }
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
      default:
        return null;
    }
  };

  const localizedBannerNotice = getLocalizedSetting(
    settings.bannerNotice,
    language,
    settings.bannerNotice_en,
  );
  const localizedBannerSubNotice = getLocalizedSetting(
    settings.bannerSubNotice,
    language,
    settings.bannerSubNotice_en,
  );
  const hasLine1 = Boolean(localizedBannerNotice?.trim());
  const hasLine2 = Boolean(localizedBannerSubNotice?.trim());
  const showBanner = hasLine1 || hasLine2;

  useEffect(() => {
    if (!hasLine1 || !hasLine2) return;
    const interval = setInterval(() => {
      setActiveNoticeIdx((prev) => (prev === 0 ? 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [hasLine1, hasLine2]);

  const currentAnnouncementText =
    activeNoticeIdx === 0
      ? localizedBannerNotice || t("header.topAnnouncement")
      : localizedBannerSubNotice || localizedBannerNotice || t("header.topAnnouncement");

  return (
    <>
      <SandboxPreviewBanner />
      <header className="sticky top-0 z-40 bg-background/98 border-b border-border/70 shadow-2xs">
        {/* Single Slim Unified Utility & Promo Bar (Streamlined ~32px) */}
        <div className="bg-primary text-primary-foreground text-[11px] sm:text-xs tracking-wide transition-all duration-200 select-none border-b border-white/10">
          <div className="container mx-auto px-2.5 sm:px-6 h-8 sm:h-8.5 flex items-center justify-between gap-2">
            {/* Promo Announcement Ticker (Clean and text-focused, no stars) */}
            <div className="flex-1 flex items-center justify-start sm:justify-center overflow-hidden min-w-0">
              <div className="flex items-center gap-1.5 font-medium truncate max-w-full transition-opacity duration-300">
                {renderBannerIcon()}
                <span suppressHydrationWarning className="truncate text-[10.5px] sm:text-xs">
                  {currentAnnouncementText}
                </span>
              </div>
            </div>

            {/* Language & Currency Switchers */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <LanguageSwitcher variant="topbar" />
              <CurrencySwitcher variant="topbar" />
              <Link
                to="/track-order"
                className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-white/90 hover:text-white transition-opacity ms-1"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t("header.trackOrderBtn")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Row: Optimized Spacious Layout across Mobile, Tablet, and Desktop */}
        <div className="container mx-auto px-2.5 sm:px-6 h-15 sm:h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Start/Right (RTL): Mobile Hamburger Menu Button + Brand Identity */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            {/* Mobile / Tablet Menu Toggle Button (< md) - Placed at the START (Right in Arabic RTL) */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full hover:bg-muted text-slate-800 dark:text-slate-100 transition-colors cursor-pointer shrink-0 active:scale-95"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
              title={open ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Official Brand Identity (Logo Image or Typographic Wordmark) */}
            <Link
              to="/"
              className="shrink-0 text-start flex items-center group py-0.5 select-none min-w-0"
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col justify-center min-w-0">
                  <span
                    className="text-base sm:text-xl md:text-2xl font-black text-primary tracking-tight leading-none transition-transform group-hover:scale-102 truncate"
                    style={{
                      fontFamily:
                        language === "ar"
                          ? "var(--font-brand-arabic), 'El Messiri', serif"
                          : "var(--font-latin), 'Playfair Display', serif",
                      fontDisplay: "swap",
                    }}
                  >
                    {language === "ar"
                      ? settings.storeName.split("-")[0]?.trim() || "سو بيوتي"
                      : settings.storeName_en || "So Beauty"}
                  </span>
                  <span
                    className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 tracking-normal leading-tight mt-0.5 truncate"
                    style={{
                      fontFamily:
                        language === "ar"
                          ? "var(--font-latin), 'Playfair Display', serif"
                          : "var(--font-brand-arabic), 'El Messiri', serif",
                    }}
                  >
                    {language === "ar"
                      ? settings.storeName.split("-")[1]?.trim() || "So Beauty"
                      : settings.tagline_en || "Pure Botanical Care"}
                  </span>
                </div>
              )}
            </Link>
          </div>

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

          {/* End/Left (RTL): Smart Unified Control Capsule Dock (Search, Wishlist, Cart, User) */}
          <div className="flex items-center p-1 sm:p-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 shadow-2xs gap-1 sm:gap-1.5 shrink-0">
            {/* 1. Luxe Search Lens Icon (Shown on mobile & tablets < md inside capsule) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden relative flex items-center justify-center w-8.5 h-8.5 min-w-[36px] min-h-[36px] rounded-full bg-background/80 hover:bg-primary/10 text-slate-700 dark:text-slate-200 hover:text-primary transition-all duration-200 cursor-pointer group shrink-0 active:scale-95"
              aria-label={t("common.search")}
              title={t("common.search")}
            >
              <Search className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="sr-only">{t("common.search")}</span>
            </button>

            {/* 2. Wishlist Link inside Capsule */}
            <Link
              to="/wishlist"
              onClick={triggerWishlistHop}
              className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 min-w-[36px] min-h-[36px] rounded-full bg-background/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition-all duration-200 cursor-pointer group shrink-0 active:scale-95"
              aria-label={t("header.wishlistCount")}
              title={t("header.wishlistCount")}
            >
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-105" />
              {wishlistCount > 0 && (
                <span
                  className={`absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white font-mono font-black text-[9px] leading-none flex items-center justify-center shadow-xs ring-1.5 ring-background z-20 pointer-events-none select-none ${
                    wishlistBouncing ? "animate-agile-hop" : "animate-continuous-hop"
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* 3. Shopping Cart Button inside Capsule */}
            <Link
              to="/cart"
              onClick={triggerCartHop}
              className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 min-w-[36px] min-h-[36px] rounded-full bg-background/80 hover:bg-primary/10 text-slate-700 dark:text-slate-200 hover:text-primary transition-all duration-200 cursor-pointer group shrink-0 active:scale-95"
              aria-label={t("header.cartCount")}
              title={t("header.cartCount")}
            >
              <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-105" />
              {count > 0 && (
                <span
                  className={`absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground font-mono font-black text-[9px] leading-none flex items-center justify-center shadow-xs ring-1.5 ring-background z-20 pointer-events-none select-none ${
                    cartBouncing ? "animate-agile-hop" : "animate-continuous-hop"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>

            {/* Subtle Vertical Divider */}
            <div className="h-4 w-px bg-slate-300/80 dark:bg-slate-700/80 mx-0.5 shrink-0" />

            {/* 4. Login / Account Controls inside Capsule */}
            {email ? (
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to="/account"
                  className="flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 min-w-[36px] min-h-[36px] rounded-full bg-background/80 hover:bg-primary/10 text-slate-700 dark:text-slate-200 hover:text-primary transition-all duration-200 cursor-pointer active:scale-95"
                  aria-label={t("header.myAccount")}
                  title={`${t("header.myAccount")} (${email})`}
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={async () => {
                    await queryClient.cancelQueries();
                    queryClient.clear();
                    await authClient.auth.signOut();
                    navigate({ to: "/", replace: true });
                  }}
                  className="hidden sm:inline-flex p-1.5 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer min-w-[32px] min-h-[32px] items-center justify-center active:scale-95"
                  aria-label={t("header.logout")}
                  title={t("header.logout")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="shrink-0 flex items-center">
                {/* Mobile (< sm): Sleek compact circular user icon inside capsule */}
                <Link
                  to="/auth"
                  className="sm:hidden flex items-center justify-center w-8.5 h-8.5 min-w-[36px] min-h-[36px] rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  aria-label={t("header.login")}
                  title={t("header.login")}
                >
                  <User className="w-4 h-4" />
                </Link>

                {/* Tablet & Desktop (>= sm): Full pill button with text */}
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex items-center"
                  aria-label={t("header.login")}
                  title={t("header.loginOrCreate")}
                >
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-bold px-3.5 h-8 cursor-pointer shadow-xs gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t("header.login")}</span>
                  </Button>
                </Link>
              </div>
            )}
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
                    className="flex items-center justify-between text-sm font-semibold py-2.5 px-3 rounded-xl hover:bg-muted text-slate-800 dark:text-slate-200 transition-colors min-h-[44px]"
                  >
                    <span>{n.label}</span>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rtl:rotate-0 rotate-180" />
                  </Link>
                ))}

                {/* Wishlist Link for Mobile */}
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between text-sm font-semibold py-2.5 px-3 rounded-xl hover:bg-muted text-slate-800 dark:text-slate-200 transition-colors min-h-[44px]"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{t("header.wishlistCount")}</span>
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
                    <Button className="w-full h-11 rounded-xl text-xs font-bold cursor-pointer">
                      {t("header.loginOrCreate")}
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-muted min-h-[44px]"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>{t("header.myAccount")}</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">{email}</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-muted min-h-[44px]"
                    >
                      <span>{t("header.orderHistory")}</span>
                      <ChevronLeft className="w-4 h-4 text-muted-foreground rtl:rotate-0 rotate-180" />
                    </Link>

                    <button
                      onClick={async () => {
                        setOpen(false);
                        await queryClient.cancelQueries();
                        queryClient.clear();
                        await authClient.auth.signOut();
                        navigate({ to: "/", replace: true });
                      }}
                      className="flex items-center justify-between text-xs font-semibold py-2.5 px-3 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors w-full text-start min-h-[44px] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>{t("header.logout")}</span>
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
