import { Link } from "@tanstack/react-router";
import { Home, Store, Info, Phone, MapPin, MessageCircle, Facebook, Instagram } from "lucide-react";

export function SiteFooter() {
  const quickLinks = [
    { to: "/", label: "الرئيسية", Icon: Home },
    { to: "/products", label: "المتجر", Icon: Store },
    { to: "/about", label: "من نحن", Icon: Info },
    { to: "/account", label: "تواصل معنا", Icon: Phone },
  ] as const;

  const contact = [
    { text: "أم درمان — شارع الوادي", Icon: MapPin, dir: "rtl" as const },
    { text: "+249 900 776 688", Icon: Phone, dir: "ltr" as const },
    { text: "sobeauty.one@gmail.com", Icon: MessageCircle, dir: "ltr" as const },
  ];

  return (
    <footer
      className="text-primary-foreground mt-16 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.35 0.14 330) 0%, oklch(0.42 0.15 320) 45%, oklch(0.48 0.12 300) 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 relative">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-start">
          <div className="bg-white rounded-2xl px-6 py-4 mb-5 shadow-lg inline-block">
            <h3
              className="text-2xl font-bold text-primary tracking-tight"
              style={{ fontFamily: "var(--font-latin)" }}
            >
              So Beauty
            </h3>
            <p
              className="text-xs text-muted-foreground mt-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              سو بيوتي · عناية طبيعية
            </p>
          </div>
          <h4 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            روائع العناية
          </h4>
          <p className="text-sm opacity-90 leading-relaxed max-w-xs">
            نسعى لتقديم أفضل منتجات العناية الطبيعية بالبشرة بأسعار تنافسية وجودة عالية. جميع
            منتجاتنا أصلية بنسبة 100%.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-start">
          <h4 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-display)" }}>
            روابط سريعة
          </h4>
          <ul className="space-y-3 text-sm">
            {quickLinks.map(({ to, label, Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center gap-3 hover:opacity-80 justify-center md:justify-start"
                >
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start text-center md:text-start">
          <h4 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-display)" }}>
            معلومات التواصل
          </h4>
          <ul className="space-y-4 text-sm w-full max-w-xs">
            {contact.map(({ text, Icon, dir }) => (
              <li key={text} className="flex items-center gap-3 justify-center md:justify-start">
                <Icon className="w-4 h-4 shrink-0 opacity-80" />
                <span dir={dir}>{text}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 mt-6 justify-center md:justify-start w-full max-w-xs">
            <a
              href="#"
              aria-label="instagram"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="facebook"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs opacity-80 relative">
        © {new Date().getFullYear()} So Beauty · سو بيوتي. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
