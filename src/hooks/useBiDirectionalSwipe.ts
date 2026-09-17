import { useRef, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

export interface SwipeHandlersOptions {
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
  /** Minimum horizontal delta (px) required to trigger a swipe. Default 45px */
  threshold?: number;
  /** Maximum time (ms) allowed for swipe gesture. Default 800ms */
  maxDuration?: number;
  /** Disabled state */
  disabled?: boolean;
}

export function useBiDirectionalSwipe({
  onSwipeNext,
  onSwipePrev,
  threshold = 45,
  maxDuration = 800,
  disabled = false,
}: SwipeHandlersOptions) {
  const { isRTL } = useLanguage();

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isScrollingVertical = useRef<boolean>(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || e.touches.length !== 1) return;

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isScrollingVertical.current = false;
    },
    [disabled],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || touchStartX.current === null || touchStartY.current === null) return;
      if (isScrollingVertical.current) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const deltaX = currentX - touchStartX.current;
      const deltaY = currentY - touchStartY.current;

      // Strict Vertical Angle Lock:
      // If vertical movement is greater than horizontal, immediately unlock vertical scroll
      // and do NOT intercept user navigation.
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        isScrollingVertical.current = true;
      }
    },
    [disabled],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (
        disabled ||
        isScrollingVertical.current ||
        touchStartX.current === null ||
        touchStartY.current === null ||
        touchStartTime.current === null
      ) {
        touchStartX.current = null;
        touchStartY.current = null;
        touchStartTime.current = null;
        isScrollingVertical.current = false;
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const duration = Date.now() - touchStartTime.current;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Reset coordinates
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      isScrollingVertical.current = false;

      // Ensure gesture was quick and predominantly horizontal
      if (duration > maxDuration) return;
      if (Math.abs(deltaY) >= Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < threshold) return;

      if (isRTL) {
        // In RTL:
        // Swiping Finger Right-to-Left (deltaX < 0) => Advance to Next Tab
        // Swiping Finger Left-to-Right (deltaX > 0) => Return to Previous Tab
        if (deltaX < 0) {
          onSwipeNext?.();
        } else {
          onSwipePrev?.();
        }
      } else {
        // In LTR:
        // Swiping Finger Right-to-Left (deltaX < 0) => Advance to Next Tab
        // Swiping Finger Left-to-Right (deltaX > 0) => Return to Previous Tab
        if (deltaX < 0) {
          onSwipeNext?.();
        } else {
          onSwipePrev?.();
        }
      }
    },
    [disabled, isRTL, threshold, maxDuration, onSwipeNext, onSwipePrev],
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
