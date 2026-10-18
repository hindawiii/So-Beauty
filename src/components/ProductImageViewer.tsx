import React, { useState, useEffect, useCallback, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductImageViewerProps {
  src: string;
  alt: string;
  isOutOfStock?: boolean;
}

export function ProductImageViewer({ src, alt, isOutOfStock = false }: ProductImageViewerProps) {
  const { language, t } = useLanguage();
  const isAr = language === "ar";

  // Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [modalScale, setModalScale] = useState(1);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });

  // Touch gesture tracking for pinch-to-zoom and pan
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const initialModalPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  const resetModalZoom = useCallback(() => {
    setModalScale(1);
    setModalPos({ x: 0, y: 0 });
  }, []);

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
        resetModalZoom();
      }
    };
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, resetModalZoom]);

  const openLightbox = () => {
    resetModalZoom();
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    resetModalZoom();
  };

  // Pinch-to-zoom & Touch Pan Handlers inside Lightbox
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Two fingers: Pinch-to-zoom started
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = modalScale;
    } else if (e.touches.length === 1) {
      // Single finger: Drag/Pan or Double-tap
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double-tap detected: toggle zoom
        e.preventDefault();
        setModalScale((current) => (current > 1.2 ? 1 : 2.5));
        setModalPos({ x: 0, y: 0 });
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialModalPosRef.current = { ...modalPos };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Handle Pinch Zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = dist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(touchStartScaleRef.current * ratio, 1), 4);
      setModalScale(newScale);
    } else if (e.touches.length === 1 && modalScale > 1 && touchStartPosRef.current !== null) {
      // Handle Pan when zoomed in
      e.preventDefault();
      const deltaX = e.touches[0].clientX - touchStartPosRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartPosRef.current.y;
      setModalPos({
        x: initialModalPosRef.current.x + deltaX,
        y: initialModalPosRef.current.y + deltaY,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      touchStartDistRef.current = null;
    }
    if (e.touches.length === 0) {
      touchStartPosRef.current = null;
      // Snap back if scale ended up below 1
      if (modalScale <= 1.05) {
        setModalScale(1);
        setModalPos({ x: 0, y: 0 });
      }
    }
  };

  return (
    <div className="relative w-full select-none">
      {/* 
        Standard eCommerce Natural Stage:
        - Pure white clean studio background.
        - Full natural size display with zero edge clipping and minimal boundary padding.
        - Clicking the image does NOT trigger fullscreen; fullscreen is dedicated to the expand button.
        - Uses 'touch-pan-y' to guarantee ZERO scroll hijacking on mobile.
      */}
      <div className="relative aspect-square w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-center group touch-pan-y">
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain p-1.5 sm:p-2 transition-transform duration-300 group-hover:scale-[1.01] ${
            isOutOfStock ? "grayscale opacity-75" : ""
          }`}
          loading="lazy"
        />

        {/* Luxe Icon-Only Expand Trigger (Dedicated Fullscreen Activation) */}
        <button
          type="button"
          onClick={openLightbox}
          className="absolute bottom-3 end-3 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-md backdrop-blur-md transition-all group-hover:scale-110 cursor-pointer border border-white/20 active:scale-95"
          aria-label={t("reviews.fullscreenView")}
          title={t("reviews.fullscreenView")}
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 
        Pristine High-Fidelity Fullscreen Lightbox Modal with Pinch-To-Zoom Touch Gestures
      */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in-0 duration-200 touch-none select-none"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Control Bar with Clear Prominent Exit Button and Clean Layout */}
          <div
            className="absolute top-4 inset-x-3 sm:inset-x-6 z-60 flex items-center justify-between gap-3 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prominent High-Contrast Exit Button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/25 transition-all cursor-pointer active:scale-95 shadow-md shrink-0"
              title={t("reviews.closeFullscreen")}
              aria-label={t("reviews.closeFullscreen")}
            >
              <X className="w-5 h-5 text-white" />
              <span>{isAr ? "خروج" : "Exit"}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
              {modalScale > 1 && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 me-1">
                  {Math.round(modalScale * 100)}%
                </span>
              )}
              <button
                type="button"
                onClick={() => setModalScale((s) => Math.min(s + 0.5, 4))}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isAr ? "تكبير" : "Zoom In"}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalScale((s) => {
                    const next = Math.max(s - 0.5, 1);
                    if (next === 1) setModalPos({ x: 0, y: 0 });
                    return next;
                  });
                }}
                disabled={modalScale <= 1}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title={isAr ? "تصغير" : "Zoom Out"}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              {modalScale > 1 && (
                <button
                  type="button"
                  onClick={resetModalZoom}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={isAr ? "إعادة ضبط" : "Reset"}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Modal Image Viewport */}
          <div
            className="w-full h-full max-w-5xl max-h-[88vh] p-2 sm:p-4 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              style={{
                transform: `translate3d(${modalPos.x}px, ${modalPos.y}px, 0) scale(${modalScale})`,
                transition:
                  touchStartDistRef.current !== null || touchStartPosRef.current !== null
                    ? "none"
                    : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                transformOrigin: "center center",
                maxHeight: "88vh",
              }}
              className="object-contain max-w-full select-none cursor-grab active:cursor-grabbing"
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
