import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SmartBackButtonProps {
  fallbackTo?: string;
  label?: string;
  className?: string;
  iconType?: "chevron" | "arrow";
  onClick?: () => void;
}

interface SmartBackBarProps extends SmartBackButtonProps {
  title?: string;
  badge?: string;
  containerClassName?: string;
}

/**
 * Smart Back Button:
 * Returns the visitor to the exact previous page they were viewing using browser history.
 * If the user opened the page directly (e.g. from an external link or new tab),
 * it gracefully falls back to the home page "/" (or custom fallback), avoiding arbitrary redirects.
 */
export function SmartBackButton({
  fallbackTo = "/",
  label,
  className = "",
  iconType = "chevron",
  onClick,
}: SmartBackButtonProps) {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const handleBack = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (typeof window !== "undefined") {
      const lastVisited = sessionStorage.getItem("so_beauty_last_page");
      if (lastVisited && lastVisited !== window.location.pathname) {
        navigate({ to: lastVisited });
        return;
      }
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
    }
    navigate({ to: fallbackTo });
  };

  const defaultLabel = isRTL ? "رجوع" : "Back";
  const displayLabel = label || defaultLabel;

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-xl bg-muted/70 hover:bg-muted text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all hover:shadow-xs active:scale-95 cursor-pointer border border-border/50 select-none ${className}`}
      aria-label={displayLabel}
    >
      {iconType === "chevron" ? (
        <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowRight className="w-4 h-4 rtl:rotate-0 rotate-180 text-primary shrink-0 transition-transform" />
      )}
      <span>{displayLabel}</span>
    </button>
  );
}

/**
 * Smart Back Bar:
 * Generous, accessible header bar placed at the top of content pages with unified layout,
 * proper spacing, and optional page title/badge.
 */
export function SmartBackBar({
  title,
  badge,
  containerClassName = "",
  ...buttonProps
}: SmartBackBarProps) {
  return (
    <div
      className={`mb-6 sm:mb-8 flex items-center justify-between gap-4 pb-4 border-b border-border/60 ${containerClassName}`}
    >
      <SmartBackButton {...buttonProps} />
      <div className="flex items-center gap-2">
        {title && (
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
            {title}
          </span>
        )}
        {badge && (
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-full bg-muted/50 border border-border/40">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
