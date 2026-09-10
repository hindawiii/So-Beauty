import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingCart, User, LogOut, Menu, X, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { count } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const nav = [
    { to: "/", label: "الرئيسية", highlight: false },
    { to: "/offers", label: "العروض", highlight: false },
    { to: "/products", label: "العناية بالبشرة", highlight: false },
    { to: "/boxes", label: "بوكسات العناية", highlight: false },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
      {/* Top promo banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-[11px] sm:text-xs tracking-wide">
        <p className="font-semibold">عناية طبيعية بكل تفاصيل بشرتك</p>
        <p className="opacity-90 hidden sm:block mt-0.5">
          من الترطيب إلى الإشراقة، اكتشفي ما يناسب بشرتك بكبسة واحدة.{" "}
          <Link to="/products" className="underline font-semibold">
            تسوّقي الآن
          </Link>
        </p>
      </div>

      {/* Main row */}
      <div className="container mx-auto px-4 h-16 md:h-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-6">
        <Link to="/" className="shrink-0 leading-tight text-start">
          <span
            className="block text-xl md:text-2xl font-bold text-primary"
            style={{ fontFamily: "var(--font-latin)" }}
          >
            So Beauty
          </span>
          <span
            className="block text-[11px] md:text-xs text-muted-foreground -mt-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            سو بيوتي
          </span>
        </Link>

        <form
          className="relative min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/products", search: q.trim() ? { q: q.trim() } : {} });
          }}
          role="search"
        >
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="بحث في المنتجات"
            placeholder="ابحثي عن منتج، ماركة، فئة..."
            className="w-full h-10 md:h-11 bg-muted rounded-full ps-10 pe-4 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </form>

        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {email ? (
            <>
              <Link
                to="/account"
                className="p-2 rounded-full hover:bg-muted hidden sm:inline-flex"
                aria-label="حسابي"
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={async () => {
                  await queryClient.cancelQueries();
                  queryClient.clear();
                  await supabase.auth.signOut();
                  navigate({ to: "/", replace: true });
                }}
                className="p-2 rounded-full hover:bg-muted"
                aria-label="خروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <Link
                to="/orders"
                className="px-2 text-xs font-semibold hover:text-primary hidden md:inline-flex"
              >
                طلباتي
              </Link>
            </>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex">
              <Button size="sm" className="rounded-full text-xs md:text-sm">
                تسجيل الدخول
              </Button>
            </Link>
          )}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted" aria-label="السلة">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -start-1 bg-primary text-primary-foreground text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden md:block border-t bg-background">
        <div className="container mx-auto px-4 h-12 flex items-center gap-6 overflow-x-auto">
          {nav.map((n, idx) => (
            <Link
              key={idx}
              to={n.to}
              className={`text-sm font-bold whitespace-nowrap transition-colors ${
                n.highlight ? "text-primary" : "hover:text-primary"
              }`}
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
            {nav.map((n, idx) => (
              <Link
                key={idx}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`text-sm font-semibold py-1 ${n.highlight ? "text-primary" : ""}`}
              >
                {n.label}
              </Link>
            ))}
            {!email && (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold py-1 text-primary"
              >
                تسجيل الدخول / إنشاء حساب
              </Link>
            )}
            {email && (
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold py-1"
              >
                حسابي
              </Link>
            )}
            {email && (
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold py-1"
              >
                طلباتي
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
