import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, TrendingUp, Sparkles, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface LuxeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function LuxeSearchModal({ isOpen, onClose, initialQuery = "" }: LuxeSearchModalProps) {
  const { language, isRTL, t } = useLanguage();
  const isAr = language === "ar";
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const popularSearches = useMemo(
    () =>
      isAr
        ? [
            "سيروم الهيالورونيك",
            "كريم مرطب",
            "واقي شمس",
            "غسول للبشرة الحساسة",
            "فيتامين سي",
            "تونر مقشر",
          ]
        : [
            "Hyaluronic Serum",
            "Moisturizing Cream",
            "Sunscreen",
            "Gentle Cleanser",
            "Vitamin C",
            "Exfoliating Toner",
          ],
    [isAr],
  );

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      // Immediate autofocus with slight delay for modal transition
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/products", search: { q: query.trim() } });
      onClose();
    }
  };

  const handleSelectQuery = (term: string) => {
    navigate({ to: "/products", search: { q: term } });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="luxe-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 sm:pt-16 animate-in fade-in duration-200"
    >
      {/* Soft Luxe Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Luxe Search Card - Seamless on Mobile, Centered Palette on Desktop */}
      <div className="relative w-full sm:max-w-2xl bg-card border-b sm:border border-border/80 shadow-2xl rounded-b-3xl sm:rounded-3xl overflow-hidden backdrop-blur-2xl z-10 transition-all duration-200 animate-in slide-in-from-top-4 duration-200 max-h-[85vh] flex flex-col">
        {/* Search Header Form - Native & Clean */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-border/50 gap-2 shrink-0 bg-background/80"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="luxe-search-title"
            placeholder={
              isAr
                ? "ابحثي عن منتج، ماركة، أو عناية بالبشرة..."
                : "Search products, brands, or skincare..."
            }
            className="flex-1 bg-transparent text-xs sm:text-sm md:text-base text-foreground placeholder:text-muted-foreground/75 outline-none font-medium h-10 px-1"
            autoComplete="off"
            aria-label={isAr ? "ابحثي في متجر سو بيوتي" : "Search So Beauty Store"}
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              aria-label={isAr ? "مسح حقل البحث" : "Clear search"}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          {/* Direct Search Action Button */}
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-3.5 h-8 sm:h-9 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>{isAr ? "بحث" : "Search"}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
          </button>

          {/* Dismiss / Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 cursor-pointer"
            aria-label={isAr ? "إغلاق نافذة البحث" : "Close search dialog"}
            title={isAr ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Popular Searches & Quick Tags - Ergonomic & Scrollable */}
        <div className="p-3.5 sm:p-5 space-y-3 overflow-y-auto">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>{isAr ? "الأكثر بحثاً ورواجاً في المتجر:" : "Trending Searches:"}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {popularSearches.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuery(item)}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/40 text-foreground transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-primary/70 group-hover:text-primary transition-colors" />
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground">
            <span>
              {isAr ? "اضغطي على أي اقتراح أو زر بحث" : "Click any suggestion or submit search"}
            </span>
            <span className="hidden sm:inline">
              {isAr ? "اضغطي Esc للخروج السريع" : "Press Esc to close"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
