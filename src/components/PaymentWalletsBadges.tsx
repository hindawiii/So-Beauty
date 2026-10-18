import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function PaymentWalletsBadges({
  variant = "footer",
}: {
  variant?: "footer" | "checkout" | "compact";
}) {
  const { isRTL } = useLanguage();

  const wallets = [
    // Row 1: National & Arab Wallets (4 essential)
    {
      id: "bankak",
      nameAr: "بنكك",
      nameEn: "Bankak",
      fullName: "محفظة بنكك — بنك الخرطوم",
      color: "border-emerald-600/40 bg-emerald-950/40 text-emerald-300",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#007A3D" />
          <path
            d="M8 22V10L16 6L24 10V22L16 26L8 22Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M16 11V21M11 14L21 18M11 18L21 14"
            stroke="#FFD100"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "cashi",
      nameAr: "كاشي",
      nameEn: "Cashi",
      fullName: "ماي كاشي السودان (MyCashi)",
      color: "border-teal-500/40 bg-teal-950/40 text-teal-300",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#0D9488" />
          <circle cx="16" cy="16" r="9" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M12 16H20M16 12V20" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "mada",
      nameAr: "مدى",
      nameEn: "Mada",
      fullName: "شبكة مدى للمدفوعات السعودية",
      color: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#065F46" />
          <path
            d="M8 12C11 12 13 14.5 13 18C13 21.5 11 24 8 24"
            stroke="#34D399"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19 12C22 12 24 14.5 24 18C24 21.5 22 24 19 24"
            stroke="#6EE7B7"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "cod",
      nameAr: "نقداً",
      nameEn: "Cash",
      fullName: "الدفع نقداً عند الاستلام (COD)",
      color: "border-emerald-400/40 bg-emerald-950/40 text-emerald-200",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#047857" />
          <rect x="7" y="11" width="18" height="11" rx="2" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="16" cy="16.5" r="2.8" stroke="#FDE68A" strokeWidth="1.6" />
        </svg>
      ),
    },

    // Row 2: Global & Digital Wallets (4 essential)
    {
      id: "apple-pay",
      nameAr: "Apple",
      nameEn: "Apple",
      fullName: "Apple Pay",
      color: "border-slate-400/40 bg-slate-900/60 text-white",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#000000" />
          <path
            d="M17.5 13.5C18.2 12.6 18.7 11.4 18.5 10.2C17.5 10.3 16.2 10.9 15.5 11.8C14.9 12.5 14.4 13.8 14.6 14.9C15.8 15 16.9 14.3 17.5 13.5ZM18.6 15.2C16.9 15.1 15.6 16.2 14.8 16.2C13.9 16.2 12.8 15.3 11.5 15.3C9.7 15.3 8 16.4 7 18.2C5 21.8 6.5 27 8.4 29.8C9.3 31.1 10.4 32.6 11.8 32.5C13.2 32.4 13.7 31.6 15.3 31.6C16.9 31.6 17.4 32.5 18.8 32.5C20.3 32.5 21.3 31.1 22.2 29.8C23.3 28.3 23.7 26.8 23.8 26.7C23.7 26.6 20.8 25.5 20.8 22C20.8 19 23.2 17.6 23.3 17.5C21.9 15.4 19.8 15.2 18.6 15.2Z"
            fill="#FFFFFF"
            transform="scale(0.8) translate(4, 2)"
          />
        </svg>
      ),
    },
    {
      id: "google-pay",
      nameAr: "Google",
      nameEn: "Google",
      fullName: "Google Pay (G-Pay)",
      color: "border-slate-500/40 bg-slate-900/60 text-slate-200",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#1E293B" />
          <path
            d="M12 16C12 13.8 13.8 12 16 12C17.2 12 18.2 12.5 18.9 13.2L17.2 14.9C16.9 14.6 16.5 14.4 16 14.4C15.1 14.4 14.4 15.1 14.4 16C14.4 16.9 15.1 17.6 16 17.6C16.6 17.6 17 17.3 17.3 17C17.5 16.8 17.6 16.4 17.7 16H16V14H19.9C20 14.3 20 14.6 20 15C20 17.4 18.4 19.2 16 19.2C13.8 19.2 12 17.4 12 15.2"
            fill="#4285F4"
          />
        </svg>
      ),
    },
    {
      id: "cards",
      nameAr: "بطاقات",
      nameEn: "Cards",
      fullName: "فيزا وماستركارد (Visa & Mastercard)",
      color: "border-blue-500/40 bg-blue-950/40 text-blue-300",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#1E3A8A" />
          <circle cx="13" cy="16" r="6" fill="#EB001B" fillOpacity="0.9" />
          <circle cx="19" cy="16" r="6" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      ),
    },
    {
      id: "paypal",
      nameAr: "PayPal",
      nameEn: "PayPal",
      fullName: "باي بال (PayPal العالمي)",
      color: "border-sky-500/40 bg-sky-950/40 text-sky-300",
      icon: (
        <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none">
          <rect width="32" height="32" rx="8" fill="#003087" />
          <path
            d="M12 9H17C19.2 9 20.5 10.3 20 12.5C19.5 14.8 17.8 16 15.5 16H13.2L12 23H9.5L12 9Z"
            fill="#0079C1"
          />
          <path
            d="M14.5 12H19.5C21.7 12 23 13.3 22.5 15.5C22 17.8 20.3 19 18 19H15.7L14.5 26H12L14.5 12Z"
            fill="#00457C"
            fillOpacity="0.8"
          />
        </svg>
      ),
    },
  ];

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-1.5 justify-center">
        {wallets.map((w) => (
          <div
            key={w.id}
            title={w.fullName}
            className="p-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 transition-transform hover:scale-105"
          >
            {w.icon}
          </div>
        ))}
      </div>
    );
  }

  // Exactly 2 strictly organized rows (4 in row 1, 4 in row 2):
  // Row 1: National & Arab Wallets (بنكك • كاشي • مدى • نقداً)
  // Row 2: Global Cards & Digital Wallets (Apple • Google • بطاقات • PayPal)
  const row1 = wallets.slice(0, 4);
  const row2 = wallets.slice(4, 8);

  return (
    <div className="w-full max-w-md mx-auto space-y-1.5 sm:space-y-2">
      {/* Row 1: Regional & Arab Wallets (Grid of 4 - will never wrap) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {row1.map((w) => (
          <div
            key={w.id}
            title={w.fullName}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1 min-h-[26px] sm:min-h-[28px] rounded-lg border text-[10px] sm:text-[11px] font-bold transition-all duration-200 hover:scale-102 hover:shadow-xs cursor-default truncate ${w.color}`}
          >
            {w.icon}
            <span className="text-white tracking-wide truncate">{isRTL ? w.nameAr : w.nameEn}</span>
          </div>
        ))}
      </div>

      {/* Row 2: Global Cards & Wallets (Grid of 4 - will never wrap) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {row2.map((w) => (
          <div
            key={w.id}
            title={w.fullName}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1 min-h-[26px] sm:min-h-[28px] rounded-lg border text-[10px] sm:text-[11px] font-bold transition-all duration-200 hover:scale-102 hover:shadow-xs cursor-default truncate ${w.color}`}
          >
            {w.icon}
            <span className="text-white tracking-wide truncate">{isRTL ? w.nameAr : w.nameEn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
