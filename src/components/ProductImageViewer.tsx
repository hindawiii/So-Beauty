import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ProductImageViewerProps {
  src: string;
  alt: string;
  isOutOfStock?: boolean;
}

export function ProductImageViewer({ src, alt, isOutOfStock = false }: ProductImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  // Gesture tracking refs
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const startPanRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchTimeRef = useRef<number>(0);

  // Reset zoom state
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  // Sync isZoomed with scale
  useEffect(() => {
    setIsZoomed(scale > 1.05);
  }, [scale]);

  // Touch handlers attached with passive: false to prevent background scrolling when zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Multi-touch pinch start
        e.preventDefault();
        setIsPinching(true);
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        initialDistanceRef.current = dist;
        initialScaleRef.current = scale;
      } else if (e.touches.length === 1) {
        // Double tap detection
        const now = Date.now();
        const timeDiff = now - lastTouchTimeRef.current;
        lastTouchTimeRef.current = now;

        if (timeDiff < 300) {
          e.preventDefault();
          // Toggle zoom on double tap
          if (scale > 1.2) {
            resetZoom();
          } else {
            setScale(2.5);
            setPosition({ x: 0, y: 0 });
          }
          return;
        }

        // Single touch pan if already zoomed
        if (scale > 1) {
          startPanRef.current = {
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y,
          };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current !== null) {
        // Pinching
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const factor = currentDist / initialDistanceRef.current;
        const newScale = Math.min(Math.max(initialScaleRef.current * factor, 1), 3.5);
        setScale(newScale);
      } else if (e.touches.length === 1 && scale > 1 && startPanRef.current) {
        // Panning when zoomed
        e.preventDefault();
        const maxPan = (scale - 1) * 120;
        const newX = e.touches[0].clientX - startPanRef.current.x;
        const newY = e.touches[0].clientY - startPanRef.current.y;
        setPosition({
          x: Math.min(Math.max(newX, -maxPan), maxPan),
          y: Math.min(Math.max(newY, -maxPan), maxPan),
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistanceRef.current = null;
        setIsPinching(false);
      }
      if (e.touches.length === 0) {
        startPanRef.current = null;
        if (scale < 1.1) {
          resetZoom();
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [scale, position, resetZoom]);

  return (
    <div className="relative w-full select-none">
      {/* Interactive Touch Stage */}
      <div
        ref={containerRef}
        className="relative aspect-square w-full bg-slate-50 dark:bg-slate-900/40 rounded-3xl overflow-hidden border border-border/80 shadow-sm p-4 sm:p-6 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        aria-label="صورة المنتج، يمكنك التكبير باللمس بإصبعيك أو النقر المزدوج"
      >
        <img
          src={src}
          alt={alt}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isPinching ? "none" : "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
            transformOrigin: "center center",
            willChange: "transform",
          }}
          className={`w-full h-full max-h-[440px] object-contain rounded-2xl pointer-events-none ${
            isOutOfStock ? "grayscale opacity-75" : ""
          }`}
          loading="lazy"
        />
      </div>

      {/* Manual Desktop / Tablet Zoom Buttons */}
      <div className="flex items-center justify-end gap-1.5 mt-2 px-1">
        <button
          type="button"
          onClick={() => setScale((prev) => Math.min(prev + 0.5, 3.5))}
          className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xs flex items-center gap-1"
          title="تكبير"
          aria-label="تكبير صورة المنتج"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">تكبير</span>
        </button>
        <button
          type="button"
          onClick={() => setScale((prev) => Math.max(prev - 0.5, 1))}
          disabled={scale <= 1}
          className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          title="تصغير"
          aria-label="تصغير صورة المنتج"
        >
          <ZoomOut className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">تصغير</span>
        </button>
        {isZoomed && (
          <button
            type="button"
            onClick={resetZoom}
            className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="إعادة تعيين"
            aria-label="إعادة تعيين حجم الصورة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">إعادة ضبط</span>
          </button>
        )}
      </div>
    </div>
  );
}
