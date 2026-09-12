import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  GripVertical,
  Send,
  Sparkles,
  Minus,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "so_beauty_wa_bubble_pos";
const STORAGE_MINIMIZED_KEY = "so_beauty_wa_minimized";

const QUICK_INQUIRIES = [
  { id: "skin", text: "استشارة مجانية لنوع بشرتي 🧴" },
  { id: "shipping", text: "استفسار عن الشحن وموعد التوصيل 🚚" },
  { id: "offers", text: "الاستفسار عن البوكسات والعروض 🔥" },
];

export function WhatsAppSupportButton() {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<string>("");

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

  const startChat = useCallback(
    (customText?: string) => {
      const message =
        customText ||
        selectedInquiry ||
        "مرحباً سو بيوتي 🌸، أود استشارتكم حول المنتجات الطبيعية وتفاصيل التوصيل.";
      const url = getWhatsAppChatUrl(message);
      window.open(url, "_blank", "noopener,noreferrer");
      setIsExpanded(false);
    },
    [selectedInquiry],
  );

  // SSR Fallback (before client hydration)
  if (!mounted) {
    return (
      <aside aria-label="الدعم السريع عبر واتساب" className="fixed bottom-6 end-6 z-40">
        <div className="flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg">
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="text-sm font-medium">واتساب سو بيوتي</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="الدعم السريع عبر واتساب"
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
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  خبيرة العناية So Beauty
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[11px] text-emerald-700 font-medium">
                  متصلة للرد على استفساركِ الآن
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMinimize}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                title="تصغير إلى الحافة"
                aria-label="تصغير إلى الحافة"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                title="إغلاق النافذة"
                aria-label="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Friendly Greeting Bubble */}
          <div className="my-3.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>أهلاً بكِ في عائلة سو بيوتي 🌸</span>
            </div>
            كيف يمكننا مساعدتكِ اليوم؟ اختاري موضوع استفساركِ أو تواصلي معنا مباشرة عبر واتساب.
          </div>

          {/* Quick Inquiry Options */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              استفسارات شائعة سريعة:
            </span>
            {QUICK_INQUIRIES.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setSelectedInquiry(q.text);
                  startChat(q.text);
                }}
                className={`w-full text-start p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                  selectedInquiry === q.text
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white hover:bg-emerald-50/60 border-slate-200/80 text-slate-700"
                }`}
              >
                <span>{q.text}</span>
                <Send
                  className={`w-3.5 h-3.5 transition-transform ${
                    selectedInquiry === q.text ? "text-white" : "text-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Main Action Button */}
          <Button
            onClick={() => startChat()}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>محادثة مباشرة على واتساب</span>
          </Button>

          {/* Footer hint */}
          <p className="text-[10px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>رد فوري • يمكنكِ سحب الزر لأي مكان في الشاشة</span>
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
        className={`group relative flex items-center cursor-grab active:cursor-grabbing transition-shadow ${
          isDragging ? "scale-105 shadow-2xl opacity-90" : "hover:scale-105 shadow-xl"
        }`}
        title="اسحبي الزر لأي مكان، أو انقري لفتح المحادثة"
        aria-label="تواصل مع خبيرة العناية عبر واتساب"
      >
        {isMinimized ? (
          /* Minimized Edge Pill Mode */
          <div
            className={`flex items-center gap-1.5 bg-emerald-600 text-white py-2 px-3 rounded-full shadow-lg border-2 border-white transition-all ${
              dockSide === "left" ? "rounded-s-none ps-2" : "rounded-e-none pe-2"
            }`}
          >
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping absolute" />
              <MessageCircle className="w-4 h-4 fill-current relative" />
            </div>
            <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">واتساب</span>
          </div>
        ) : (
          /* Full Circular Draggable Floating Bubble */
          <div className="relative flex items-center">
            {/* Grip handle indicator */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-slate-800/70 text-white rounded-md text-[9px] pointer-events-none ${
                dockSide === "left" ? "-end-4" : "-start-4"
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Bubble Circle */}
            <button
              type="button"
              className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 border-2 border-white transition-colors"
              aria-expanded={isExpanded}
            >
              {/* Green online pulse indicator */}
              <span className="absolute top-0.5 end-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
              </span>

              {isExpanded ? (
                <X className="w-6 h-6 transition-transform duration-200 rotate-90 group-hover:rotate-0" />
              ) : (
                <MessageCircle className="w-7 h-7 fill-current" />
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
