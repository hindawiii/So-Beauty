import { Link } from "@tanstack/react-router";
import {
  Home,
  Store,
  Info,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  HeartHandshake,
} from "lucide-react";
import { useStoreSettings } from "@/context/StoreSettingsContext";

export function SiteFooter() {
  const { settings } = useStoreSettings();

  // Column 2: Shopping & Catalog discovery
  const catalogLinks = [
    { to: "/", label: "الصفحة الرئيسية", Icon: Home },
    { to: "/products", label: "تصفح الكتالوج بالكامل", Icon: Store },
    { to: "/products", label: "العناية الطبيعية بالبشرة", Icon: Sparkles },
    { to: "/products", label: "أحدث العروض والبكجات", Icon: Truck },
  ] as const;

  // Column 3: Customer Care, Delivery & Trust
  const customerCareLinks = [
    { to: "/track-order", label: "تتبع شحنتك المباشرة", Icon: Truck },
    { to: "/about", label: "من نحن وقصة المتجر", Icon: Info },
    { to: "/privacy", label: "سياسة الخصوصية وسرية البيانات", Icon: ShieldCheck },
    { to: "/terms", label: "الشروط والأحكام وسياسة الشراء", Icon: RotateCcw },
  ] as const;

  const contactItems = [
    { text: settings.storeAddress || "أم درمان – شارع الوادي", Icon: MapPin, dir: "rtl" as const },
    { text: settings.supportPhone || "+249 900 776 688", Icon: Phone, dir: "ltr" as const },
    {
      text: settings.supportEmail || "sobeauty.one@gmail.com",
      Icon: MessageCircle,
      dir: "ltr" as const,
    },
  ];

  return (
    <footer
      className="text-primary-foreground mt-16 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black) 0%, color-mix(in srgb, var(--primary) 95%, black) 45%, color-mix(in srgb, var(--primary) 75%, black) 100%)",
      }}
    >
      {/* Subtle Luxury Ambient Glows */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* 
        Fluid Responsive Grid System:
        - Mobile (<640px): 1 Column (stacked vertically with optimal spacing)
        - Tablet (640px - 1024px): 2 Columns (balanced 2x2 grid)
        - Desktop (>=1024px): 4 Columns (luxurious horizontal spread as in benchmark)
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 xl:gap-12">
          {/* Column 1: Brand Identity & Mission */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
            <div className="bg-white rounded-2xl px-5 py-3.5 mb-4 shadow-md inline-block">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-10 w-auto object-contain mx-auto sm:mx-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <h3
                    className="text-2xl font-bold text-primary tracking-tight"
                    style={{ fontFamily: "var(--font-latin)" }}
                  >
                    {settings.storeName.split("-")[1]?.trim() || "So Beauty"}
                  </h3>
                  <p
                    className="text-[11px] text-muted-foreground mt-0.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {settings.tagline || "سو بيوتي · عناية طبيعية"}
                  </p>
                </>
              )}
            </div>

            <h4
              className="text-base sm:text-lg font-bold mb-2.5 text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {settings.aboutTitle || "روائع العناية"}
            </h4>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-sm sm:max-w-none">
              {settings.aboutDescription ||
                "نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع منتجاتنا أصلية بنسبة 100% ومضمونة."}
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>منتجات أصلية معتمدة 100%</span>
            </div>
          </div>

          {/* Column 2: Discover & Shop */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
            <h4
              className="text-base sm:text-lg font-bold mb-4 sm:mb-5 text-white flex items-center gap-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Sparkles className="w-4 h-4 text-white/80 shrink-0 hidden sm:inline" />
              <span>تسوّق واكتشف</span>
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm w-full">
              {catalogLinks.map(({ to, label, Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="flex items-center gap-2.5 text-white/85 hover:text-white hover:translate-x-[-2px] transition-all justify-center sm:justify-start group"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
            <h4
              className="text-base sm:text-lg font-bold mb-4 sm:mb-5 text-white flex items-center gap-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <HeartHandshake className="w-4 h-4 text-white/80 shrink-0 hidden sm:inline" />
              <span>خدمة العملاء</span>
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm w-full">
              {customerCareLinks.map(({ to, label, Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="flex items-center gap-2.5 text-white/85 hover:text-white hover:translate-x-[-2px] transition-all justify-center sm:justify-start group"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social Channels */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
            <h4
              className="text-base sm:text-lg font-bold mb-4 sm:mb-5 text-white flex items-center gap-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <MessageCircle className="w-4 h-4 text-white/80 shrink-0 hidden sm:inline" />
              <span>قنوات التواصل</span>
            </h4>

            <ul className="space-y-3.5 text-xs sm:text-sm w-full">
              {contactItems.map(({ text, Icon, dir }) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 justify-center sm:justify-start text-white/85"
                >
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span dir={dir} className="hover:text-white transition-colors">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 sm:mt-6">
              <span className="text-[11px] text-white/70 block mb-2 font-medium">
                تابعنا عبر السوشيال ميديا:
              </span>
              <div className="flex gap-2.5 justify-center sm:justify-start">
                <a
                  href="#"
                  aria-label="instagram"
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="facebook"
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Bar: Copyright & Payment Security */}
      <div className="border-t border-white/15 py-5 px-4 relative bg-black/10">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start text-xs text-white/80">
          <p>
            © {new Date().getFullYear()} {settings.storeName || "المتجر الإلكتروني"}. جميع الحقوق
            محفوظة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/70">
            <Link
              to="/privacy"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              سياسة الخصوصية
            </Link>
            <span>•</span>
            <Link
              to="/terms"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              الشروط والأحكام
            </Link>
            <span>•</span>
            <span>الدفع عند الاستلام</span>
            <span>•</span>
            <span>توصيل سريع</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
