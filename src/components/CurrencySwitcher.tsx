import { useState, useRef, useEffect } from "react";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/CurrencyContext";
import { ChevronDown, Globe, Search, X } from "lucide-react";

export function CurrencySwitcher() {
  const { currency, setCurrency, currencyConfig } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
  });

  // Calculate exact position directly below the trigger button
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = Math.min(225, window.innerWidth - 24);

      // In RTL, we want the dropdown to align with the button and stay fully inside the screen
      let left = rect.left + rect.width / 2 - dropdownWidth / 2;

      // Safe bounds padding
      const padding = 12;
      if (left < padding) {
        left = padding;
      } else if (left + dropdownWidth > window.innerWidth - padding) {
        left = window.innerWidth - padding - dropdownWidth;
      }

      setCoords({
        top: rect.bottom + 8,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const allKeys = Object.keys(CURRENCIES) as CurrencyCode[];
  // Put USD as the very first currency in the list
  const currencyKeys: CurrencyCode[] = ["USD", ...allKeys.filter((code) => code !== "USD")];

  const filteredCurrencies = currencyKeys.filter((code) => {
    const item = CURRENCIES[code];
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.nameAr.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.symbolAr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative inline-block text-start">
      <button
        ref={buttonRef}
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-2.5 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted/90 text-slate-800 dark:text-slate-100 transition-all border border-border/60 hover:border-border cursor-pointer active:scale-95 shrink-0"
        aria-label="تغيير العملة"
        title={`تغيير العملة الحالية (${currencyConfig.nameAr})`}
      >
        <span
          suppressHydrationWarning
          className="text-sm leading-none"
          role="img"
          aria-label={currencyConfig.country}
        >
          {currencyConfig.flag}
        </span>
        <span
          suppressHydrationWarning
          className="font-mono font-bold tracking-tight text-[11px] sm:text-xs"
        >
          {currencyConfig.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 opacity-60 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: coords.left !== undefined ? `${coords.left}px` : "auto",
            width: "min(225px, calc(100vw - 24px))",
          }}
          className="rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Header - Slim, Luxe, Exact Title 'عملات الدولة' */}
          <div className="px-3 py-1.5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>عملات الدولة</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
              {filteredCurrencies.length}
            </span>
          </div>

          {/* Quick Filter Input - Slim & Crisp */}
          <div className="px-2 py-1.5 border-b border-border/40">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-muted-foreground absolute start-2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالدولة أو الرمز..."
                className="w-full bg-muted/50 text-[11px] text-foreground placeholder:text-muted-foreground/70 rounded-lg ps-7 pe-6 py-1 outline-none border border-border/40 focus:border-primary/50 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute end-1.5 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  aria-label="مسح البحث"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Currency List - Balanced Slim Spacing with safe compact gap */}
          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-border/20 overscroll-contain">
            {filteredCurrencies.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">
                لا توجد عملة تطابق بحثك
              </div>
            ) : (
              filteredCurrencies.map((code) => {
                const item = CURRENCIES[code];
                const isSelected = item.code === currency;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setCurrency(code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-start transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-slate-800 dark:text-slate-200 hover:bg-muted/70"
                    }`}
                  >
                    {/* Flag & Country Name */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="text-base leading-none shrink-0"
                        role="img"
                        aria-label={item.country}
                      >
                        {item.flag}
                      </span>
                      <span className="font-semibold text-xs text-foreground truncate">
                        {item.country}
                      </span>
                    </div>

                    {/* Currency Code & Symbol Badge - Tightened safe spacing */}
                    <div className="flex items-center gap-1 shrink-0 ms-2">
                      <span className="text-[11px] font-mono font-bold text-primary/90">
                        {item.code}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        ({item.symbolAr})
                      </span>
                      {isSelected && (
                        <span className="text-primary text-[10px] font-bold bg-primary/20 w-4 h-4 rounded-full flex items-center justify-center ms-0.5">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
