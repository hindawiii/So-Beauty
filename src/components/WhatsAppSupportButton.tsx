import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { X, GripVertical, Send, Sparkles, Minus, CheckCircle2 } from "lucide-react";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { WhatsAppOrganicIcon, WhatsAppEmblemIcon } from "@/components/icons/WhatsAppOrganicIcon";

const STORAGE_KEY = "so_beauty_wa_bubble_pos";
const STORAGE_MINIMIZED_KEY = "so_beauty_wa_minimized";

export function WhatsAppSupportButton() {
  const { language, isRTL } = useLanguage();
  const isAr = language === "ar";
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<string>("");
  const [windowDimensions, setWindowDimensions] = useState({ width: 390, height: 844 });
  const [showTeaser, setShowTeaser] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  // Safely retrieve router pathname for smart context awareness
  const routerState = useRouterState();
  const pathname = routerState?.location?.pathname || "/";

  // Context-aware dynamic inquiries based on current page
  const quickInquiries = useMemo(() => {
    if (pathname.includes("/products/")) {
      return isAr
        ? [
            { id: "product-usage", text: "استفسار عن طريقة استخدام هذا المنتج 🧴" },
            { id: "product-skin", text: "هل يناسب نوع بشرتي ومشاكلها؟ 🌸" },
            { id: "shipping", text: "موعد التوصيل والشحن لمدينتي 🚚" },
          ]
        : [
            { id: "product-usage", text: "How to use this product for best results? 🧴" },
            { id: "product-skin", text: "Is it suitable for my skin type? 🌸" },
            { id: "shipping", text: "Delivery schedule and shipping cost 🚚" },
          ];
    }

    if (pathname.includes("/cart") || pathname.includes("/checkout")) {
      return isAr
        ? [
            { id: "checkout-help", text: "مساعدة في إتمام الطلب وتأكيد الحجز 🛍️" },
            { id: "payment-options", text: "استفسار عن الدفع عند الاستلام 💵" },
            { id: "shipping-speed", text: "هل يتوفر شحن سريع وفوري؟ ⚡" },
          ]
        : [
            { id: "checkout-help", text: "Need help completing my order 🛍️" },
            { id: "payment-options", text: "Cash on delivery details 💵" },
            { id: "shipping-speed", text: "Express same-day delivery options ⚡" },
          ];
    }

    return isAr
      ? [
          { id: "skin", text: "استشارة مجانية لنوع بشرتي 🧴" },
          { id: "shipping", text: "استفسار عن الشحن وموعد التوصيل 🚚" },
          { id: "offers", text: "الاستفسار عن البوكسات والعروض 🔥" },
        ]
      : [
          { id: "skin", text: "Free consultation for my skin type 🧴" },
          { id: "shipping", text: "Inquiry about shipping & delivery 🚚" },
          { id: "offers", text: "Inquiry about sets & hot offers 🔥" },
        ];
  }, [pathname, isAr]);

  // Context-aware dynamic teaser message
  const teaserMessage = useMemo(() => {
    if (pathname.includes("/products/")) {
      return isAr
        ? "استشارة فورية حول طريقة الاستخدام والنتائج؟ ✨"
        : "Questions about usage & results? ✨";
    }
    if (pathname.includes("/cart") || pathname.includes("/checkout")) {
      return isAr ? "مساعدة في إتمام طلبكِ وحجز التوصيل 🛍️" : "Help completing your order? 🛍️";
    }
    return isAr
      ? "استشارة مجانية لبشرتكِ مع خبيرتنا الآن 🌸"
      : "Free skin consultation with our expert 🌸";
  }, [pathname, isAr]);

  // Position state: coordinates in pixels from top-left of viewport
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 600 });
  const [dockSide, setDockSide] = useState<"left" | "right">("left");

  // Drag tracking refs
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, hasMoved: false });

  const buttonRef = useRef<HTMLDivElement>(null);

  // Initialize position and saved preference on client mount
  useEffect(() => {
    setMounted(true);
    const winWidth = typeof window !== "undefined" ? window.innerWidth : 390;
    const winHeight = typeof window !== "undefined" ? window.innerHeight : 844;
    setWindowDimensions({ width: winWidth, height: winHeight });

    let initialX = isRTL ? 14 : winWidth - 66;
    let initialY = Math.max(120, winHeight - 88);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const clampedX = Math.min(Math.max(12, parsed.x), winWidth - 66);
          const clampedY = Math.min(Math.max(75, parsed.y), winHeight - 88);
          initialX = clampedX;
          initialY = clampedY;
        }
      }

      const savedMin = localStorage.getItem(STORAGE_MINIMIZED_KEY);
      if (savedMin === "true") {
        setIsMinimized(true);
      }
    } catch {
      // ignore
    }

    setPosition({ x: initialX, y: initialY });
    setDockSide(initialX < winWidth / 2 ? "left" : "right");
  }, [isRTL]);

  // Handle smart teaser timer: pops up after 1.8s, automatically dissolves after 3.5s
  useEffect(() => {
    if (!mounted || isMinimized || isExpanded) return;

    const showTimer = setTimeout(() => {
      setShowTeaser(true);

      const hideTimer = setTimeout(() => {
        setShowTeaser(false);
      }, 3500);

      return () => clearTimeout(hideTimer);
    }, 1800);

    return () => clearTimeout(showTimer);
  }, [mounted, pathname, isMinimized, isExpanded]);

  // Handle smart scroll behavior: dismiss teaser & subtly soften button on fast scroll down
  useEffect(() => {
    if (!mounted) return;

    let lastScrollY = window.scrollY;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      // Instantly dismiss any greeting teaser on scroll
      setShowTeaser(false);

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY = currentScrollY;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrollingDown(false);
      }, 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [mounted]);

  // Handle snapping on resize and track dimensions
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      setWindowDimensions({ width: winWidth, height: winHeight });

      setPosition((prev) => {
        const isNearLeft = prev.x < winWidth / 2;
        const targetX = isNearLeft ? 16 : Math.max(16, winWidth - 76);
        const targetY = Math.min(Math.max(75, prev.y), winHeight - 95);
        return { x: targetX, y: targetY };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setShowTeaser(false);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
      hasMoved: false,
    };

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (!dragRef.current.hasMoved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      dragRef.current.hasMoved = true;
      setShowTeaser(false);
    }

    if (dragRef.current.hasMoved) {
      const winWidth = windowDimensions.width;
      const winHeight = windowDimensions.height;

      const newX = Math.min(Math.max(12, dragRef.current.initialPosX + dx), winWidth - 72);
      const newY = Math.min(Math.max(75, dragRef.current.initialPosY + dy), winHeight - 90);

      setPosition({ x: newX, y: newY });
      setDockSide(newX < winWidth / 2 ? "left" : "right");
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (dragRef.current.hasMoved) {
      const winWidth = windowDimensions.width;
      const winHeight = windowDimensions.height;
      const isNearLeft = position.x < winWidth / 2;
      const snappedX = isNearLeft ? 16 : Math.max(16, winWidth - 76);
      const clampedY = Math.min(Math.max(75, position.y), winHeight - 95);

      const finalPos = { x: snappedX, y: clampedY };
      setPosition(finalPos);
      setDockSide(isNearLeft ? "left" : "right");

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
      } catch {
        // ignore
      }
    } else {
      if (isMinimized) {
        setIsMinimized(false);
        try {
          localStorage.setItem(STORAGE_MINIMIZED_KEY, "false");
        } catch {
          // ignore
        }
      } else {
        setIsExpanded((prev) => !prev);
      }
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    setShowTeaser(false);
    setIsMinimized(true);
    try {
      localStorage.setItem(STORAGE_MINIMIZED_KEY, "true");
    } catch {
      // ignore
    }
  };

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const winWidth = windowDimensions.width;
    const winHeight = windowDimensions.height;
    const defaultX = isRTL ? 16 : winWidth - 76;
    const defaultY = winHeight - 110;
    const finalPos = { x: defaultX, y: defaultY };
    setPosition(finalPos);
    setDockSide(defaultX < winWidth / 2 ? "left" : "right");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const { getWhatsAppUrl } = useStoreSettings();

  const startChat = useCallback(
    (customText?: string) => {
      const defaultMsg = isAr
        ? "مرحباً بكِ 🌸، أود استشارتكم حول المنتجات وتفاصيل التوصيل."
        : "Hello 🌸, I would like to inquire about products and delivery details.";
      const message = customText || selectedInquiry || defaultMsg;
      const url = getWhatsAppUrl(message);
      window.open(url, "_blank", "noopener,noreferrer");
      setIsExpanded(false);
    },
    [selectedInquiry, getWhatsAppUrl, isAr],
  );

  // Calculate Popover Position relative to the <aside> container
  const popoverLayout = useMemo(() => {
    const winWidth = windowDimensions.width;
    const winHeight = windowDimensions.height;

    const popoverWidth = Math.min(340, winWidth - 28);
    const popoverHeight = 440;

    let targetLeftInViewport: number;
    if (dockSide === "left") {
      targetLeftInViewport = Math.max(14, Math.min(position.x, winWidth - popoverWidth - 14));
    } else {
      targetLeftInViewport = Math.max(
        14,
        Math.min(position.x + 58 - popoverWidth, winWidth - popoverWidth - 14),
      );
    }

    const relativeX = targetLeftInViewport - position.x;

    const spaceAbove = position.y - 75;
    const openDownwards = spaceAbove < 380 && position.y + 60 + popoverHeight <= winHeight - 20;

    let relativeY: number;
    if (openDownwards) {
      relativeY = 66;
    } else {
      const idealTopInViewport = position.y - popoverHeight - 12;
      const clampedTopInViewport = Math.max(75, idealTopInViewport);
      relativeY = clampedTopInViewport - position.y;
    }

    return {
      relativeX,
      relativeY,
      width: popoverWidth,
      openDownwards,
    };
  }, [position.x, position.y, dockSide, windowDimensions.width, windowDimensions.height]);

  // SSR Fallback: Identical circular 58px organic bubble to eliminate layout shifts & frozen text
  if (!mounted) {
    return (
      <aside
        suppressHydrationWarning
        aria-label={isAr ? "الدعم السريع عبر واتساب" : "Quick Support via WhatsApp"}
        className="fixed bottom-6 end-6 z-50 select-none pointer-events-auto"
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute top-1 end-1 z-10 flex h-3.5 w-3.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
          </span>
          <WhatsAppOrganicIcon
            size={58}
            className="filter drop-shadow-md hover:drop-shadow-xl transition-all"
          />
        </div>
      </aside>
    );
  }

  return (
    <aside
      suppressHydrationWarning
      aria-label={isAr ? "الدعم السريع عبر واتساب" : "Quick Support via WhatsApp"}
      className="fixed z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Smart Contextual Teaser Tooltip: Gentle 3.5s speech bubble */}
      {showTeaser && !isExpanded && !isMinimized && !isDragging && (
        <div
          role="status"
          aria-live="polite"
          onClick={() => {
            setShowTeaser(false);
            setIsExpanded(true);
          }}
          className="absolute top-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer flex items-center gap-2 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-white/15 text-xs font-medium max-w-[240px] animate-in fade-in zoom-in-95 duration-200 transition-all z-40 hover:bg-slate-900"
          style={{
            left: dockSide === "left" ? "66px" : "auto",
            right: dockSide === "right" ? "66px" : "auto",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="truncate leading-relaxed">{teaserMessage}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
            className="ms-1 p-0.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
            title={isAr ? "إغلاق التلميح" : "Dismiss"}
            aria-label={isAr ? "إغلاق التلميح" : "Dismiss"}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick Chat Popover Window with Mathematical Viewport Clamping */}
      {isExpanded && !isMinimized && (
        <div
          className="absolute bg-card border border-slate-200/90 rounded-3xl shadow-2xl p-5 z-50 text-slate-800 transition-all duration-300 animate-in fade-in zoom-in-95 touch-auto"
          style={{
            left: `${popoverLayout.relativeX}px`,
            top: `${popoverLayout.relativeY}px`,
            width: `${popoverLayout.width}px`,
            maxWidth: "calc(100vw - 28px)",
            transformOrigin: `${dockSide === "left" ? "left" : "right"} ${
              popoverLayout.openDownwards ? "top" : "bottom"
            }`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <WhatsAppOrganicIcon size={28} showShadow={false} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                  {isAr ? "خبيرة العناية So Beauty" : "So Beauty Care Specialist"}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold truncate">
                  {isAr ? "متصلة للرد على استفساركِ الآن" : "Online to answer your inquiry"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleMinimize}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title={isAr ? "تصغير إلى الحافة" : "Minimize to edge"}
                aria-label={isAr ? "تصغير إلى الحافة" : "Minimize to edge"}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title={isAr ? "إغلاق النافذة" : "Close window"}
                aria-label={isAr ? "إغلاق النافذة" : "Close window"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Friendly Greeting Bubble */}
          <div className="my-3.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isAr ? "أهلاً بكِ في عائلة سو بيوتي 🌸" : "Welcome to the So Beauty family 🌸"}
              </span>
            </div>
            <p className="m-0 text-slate-600">
              {isAr
                ? "كيف يمكننا مساعدتكِ اليوم؟ اختاري موضوع استفساركِ أو تواصلي معنا مباشرة عبر واتساب."
                : "How can we help you today? Choose an inquiry topic or connect directly via WhatsApp."}
            </p>
          </div>

          {/* Quick Inquiry Options */}
          <div className="space-y-1.5 mb-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
              {isAr ? "استفسارات شائعة سريعة:" : "Common Quick Inquiries:"}
            </span>
            {quickInquiries.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setSelectedInquiry(q.text);
                  startChat(q.text);
                }}
                className={`w-full text-start p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                  selectedInquiry === q.text
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white hover:bg-emerald-50/60 border-slate-200/80 text-slate-700"
                }`}
              >
                <span className="truncate">{q.text}</span>
                <Send
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isRTL ? "rotate-180" : ""
                  } ${selectedInquiry === q.text ? "text-white" : "text-slate-500"}`}
                />
              </button>
            ))}
          </div>

          {/* Main Action Button */}
          <Button
            onClick={() => startChat()}
            className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <WhatsAppEmblemIcon size={18} className="text-white" />
            <span>{isAr ? "محادثة مباشرة على واتساب" : "Direct Chat on WhatsApp"}</span>
          </Button>

          {/* Footer hint & Reset position button */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isAr ? "رد سريع وفوري" : "Instant direct reply"}</span>
            </span>
            <button
              type="button"
              onClick={resetPosition}
              className="text-slate-400 hover:text-emerald-700 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {isAr ? "إعادة ضبط الموضع" : "Reset position"}
            </button>
          </div>
        </div>
      )}

      {/* The Floating Bubble Button */}
      <div
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`group relative flex items-center cursor-grab active:cursor-grabbing transition-all touch-none duration-200 ${
          isDragging ? "scale-105 opacity-95" : "hover:scale-105"
        } ${isScrollingDown ? "opacity-65 scale-90" : "opacity-100 scale-100"}`}
        title={
          isAr
            ? "اسحبي الزر لأي مكان، أو انقري لفتح المحادثة"
            : "Drag anywhere, or click to open chat"
        }
        aria-label={
          isAr ? "تواصل مع خبيرة العناية عبر واتساب" : "Chat with care specialist on WhatsApp"
        }
      >
        {isMinimized ? (
          /* Minimized Edge Pill Mode */
          <div
            className={`flex items-center gap-1.5 bg-[#25D366] text-white py-2 px-3 rounded-full shadow-lg border-2 border-white transition-all ${
              dockSide === "left" ? "rounded-s-none ps-2" : "rounded-e-none pe-2"
            }`}
          >
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping absolute" />
              <WhatsAppEmblemIcon size={18} className="text-white relative" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">
              {isAr ? "واتساب" : "WhatsApp"}
            </span>
          </div>
        ) : (
          /* Full Organic Droplet Floating Bubble */
          <div className="relative flex items-center">
            {/* Grip handle indicator */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-slate-800/70 text-white rounded-md text-[9px] pointer-events-none ${
                dockSide === "left" ? "-end-4" : "-start-4"
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Bubble Button with Organic Soft Curves */}
            <button
              type="button"
              className="relative flex items-center justify-center focus:outline-none transition-transform"
              aria-expanded={isExpanded}
            >
              {/* Green online pulse indicator */}
              <span className="absolute top-1 end-1 z-10 flex h-3.5 w-3.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
              </span>

              {isExpanded ? (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl border-2 border-white transition-all">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" />
                </div>
              ) : (
                <WhatsAppOrganicIcon
                  size={windowDimensions.width < 640 ? 50 : 56}
                  className="filter drop-shadow-md hover:drop-shadow-xl transition-all"
                />
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
