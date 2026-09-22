import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

  const quickInquiries = useMemo(
    () =>
      isAr
        ? [
            { id: "skin", text: "استشارة مجانية لنوع بشرتي 🧴" },
            { id: "shipping", text: "استفسار عن الشحن وموعد التوصيل 🚚" },
            { id: "offers", text: "الاستفسار عن البوكسات والعروض 🔥" },
          ]
        : [
            { id: "skin", text: "Free consultation for my skin type 🧴" },
            { id: "shipping", text: "Inquiry about shipping & delivery 🚚" },
            { id: "offers", text: "Inquiry about sets & hot offers 🔥" },
          ],
    [isAr],
  );

  // Position state: coordinates in pixels from top-left of viewport
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 500 });
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
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let initialX = 20; // Default to left side in RTL (end)
    let initialY = winHeight - 110;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          // Validate within current window boundaries
          const clampedX = Math.min(Math.max(16, parsed.x), winWidth - 76);
          const clampedY = Math.min(Math.max(70, parsed.y), winHeight - 90);
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
  }, []);

  // Handle snapping on resize
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      setPosition((prev) => {
        const targetX = prev.x < winWidth / 2 ? 16 : winWidth - 76;
        const targetY = Math.min(Math.max(70, prev.y), winHeight - 90);
        return { x: targetX, y: targetY };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to primary button
    if (e.button !== 0) return;

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

    // Register movement if moved more than 5px
    if (!dragRef.current.hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      const newX = Math.min(Math.max(8, dragRef.current.initialPosX + dx), winWidth - 68);
      const newY = Math.min(Math.max(60, dragRef.current.initialPosY + dy), winHeight - 80);

      setPosition({ x: newX, y: newY });
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
      // Snap horizontally to nearest screen edge
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      const isNearLeft = position.x < winWidth / 2;
      const snappedX = isNearLeft ? 16 : winWidth - 72;
      const clampedY = Math.min(Math.max(70, position.y), winHeight - 90);

      const finalPos = { x: snappedX, y: clampedY };
      setPosition(finalPos);
      setDockSide(isNearLeft ? "left" : "right");

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
      } catch {
        // ignore
      }
    } else {
      // Was a pure click (no drag)
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
    setIsMinimized(true);
    try {
      localStorage.setItem(STORAGE_MINIMIZED_KEY, "true");
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

  // SSR Fallback (before client hydration)
  if (!mounted) {
    return (
      <aside
        suppressHydrationWarning
        aria-label={isAr ? "الدعم السريع عبر واتساب" : "Quick Support via WhatsApp"}
        className="fixed bottom-6 end-6 z-40"
      >
        <div className="flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg">
          <WhatsAppEmblemIcon size={20} className="text-white" />
          <span suppressHydrationWarning className="text-sm font-medium">
            {isAr ? "واتساب سو بيوتي" : "So Beauty WhatsApp"}
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      suppressHydrationWarning
      aria-label={isAr ? "الدعم السريع عبر واتساب" : "Quick Support via WhatsApp"}
      className="fixed z-50 select-none touch-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Quick Chat Popover Window */}
      {isExpanded && !isMinimized && (
        <div
          className={`absolute bottom-16 sm:bottom-20 w-[90vw] sm:w-84 max-w-sm bg-card border border-slate-200/90 rounded-3xl shadow-2xl p-5 z-50 text-slate-800 transition-all duration-300 animate-in fade-in zoom-in-95 ${
            dockSide === "left" ? "start-0" : "end-0"
          }`}
          style={{
            transformOrigin: dockSide === "left" ? "bottom left" : "bottom right",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <WhatsAppOrganicIcon size={28} showShadow={false} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {isAr ? "خبيرة العناية So Beauty" : "So Beauty Care Specialist"}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {isAr ? "متصلة للرد على استفساركِ الآن" : "Online to answer your inquiry"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
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
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isAr ? "أهلاً بكِ في عائلة سو بيوتي 🌸" : "Welcome to the So Beauty family 🌸"}
              </span>
            </div>
            {isAr
              ? "كيف يمكننا مساعدتكِ اليوم؟ اختاري موضوع استفساركِ أو تواصلي معنا مباشرة عبر واتساب."
              : "How can we help you today? Choose an inquiry topic or connect directly via WhatsApp."}
          </div>

          {/* Quick Inquiry Options */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
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
                <span>{q.text}</span>
                <Send
                  className={`w-3.5 h-3.5 transition-transform rtl:rotate-180 ${
                    selectedInquiry === q.text ? "text-white" : "text-slate-400"
                  }`}
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

          {/* Footer hint */}
          <p className="text-[10px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>
              {isAr
                ? "رد فوري • يمكنكِ سحب الزر لأي مكان في الشاشة"
                : "Instant reply • You can drag this bubble anywhere"}
            </span>
          </p>
        </div>
      )}

      {/* The Floating Bubble Button */}
      <div
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`group relative flex items-center cursor-grab active:cursor-grabbing transition-transform ${
          isDragging ? "scale-105 opacity-95" : "hover:scale-105"
        }`}
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
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl border-2 border-white transition-all">
                  <X className="w-6 h-6 transition-transform duration-200" />
                </div>
              ) : (
                <WhatsAppOrganicIcon
                  size={58}
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
