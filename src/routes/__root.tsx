import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";
import { WhatsAppSupportButton } from "@/components/WhatsAppSupportButton";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { StoreSettingsProvider } from "@/context/StoreSettingsContext";
import { LanguageProvider } from "@/context/LanguageContext";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "سو بيوتي (So Beauty) — متجر منتجات العناية الطبيعية بالبشرة" },
      {
        name: "description",
        content:
          "متجر سو بيوتي لمنتجات العناية الطبيعية بالبشرة في السودان — تشكيلة مختارة من السيرومات والمرطبات الطبيعية مع الدفع عند الاستلام والشحن السريع لجميع المدن.",
      },
      { name: "author", content: "So Beauty — سو بيوتي" },
      {
        property: "og:title",
        content: "سو بيوتي (So Beauty) — متجر منتجات العناية الطبيعية بالبشرة",
      },
      {
        property: "og:description",
        content:
          "متجر سو بيوتي لمنتجات العناية الطبيعية بالبشرة في السودان — تشكيلة مختارة من السيرومات والمرطبات الطبيعية مع الدفع عند الاستلام والشحن السريع لجميع المدن.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=El+Messiri:wght@500;600;700&family=Playfair+Display:wght@600;700;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Track page transitions and preserve last visited non-detail route for smart return
  useEffect(() => {
    const handleNavigation = () => {
      const fullPath = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith("/products/")) {
        sessionStorage.setItem("so_beauty_last_page", fullPath);
      }
    };

    handleNavigation();
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, [router.state.location.pathname, router.state.location.search]);

  // Spatial Memory & Precision Anchor Scroll Engine:
  // Returns user to the EXACT product card and exact pixel position with zero delay and immunity to layout shifts.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const currentUrlKey = window.location.pathname + window.location.search;
    const scrollKey = `so_beauty_scroll_${currentUrlKey}`;

    // 1. Precise Anchor-Based Restoration
    const restoreExactPosition = () => {
      const lastProductId = sessionStorage.getItem("so_beauty_last_product_id");
      let restoredViaElement = false;

      if (lastProductId) {
        const targetElement = document.getElementById(`product-${lastProductId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ block: "center", behavior: "instant" });
          restoredViaElement = true;
          // Clean up product anchor once successfully targeted
          sessionStorage.removeItem("so_beauty_last_product_id");
        }
      }

      if (!restoredViaElement) {
        const savedScroll = sessionStorage.getItem(scrollKey);
        if (savedScroll) {
          const targetY = parseInt(savedScroll, 10);
          if (!isNaN(targetY) && targetY > 0) {
            window.scrollTo({ top: targetY, behavior: "instant" });
          }
        }
      }
    };

    // Execute immediately in current microtask
    restoreExactPosition();

    // Re-verify in next animation frame to defeat asynchronous image layout shifts
    const rafId = requestAnimationFrame(() => {
      restoreExactPosition();
    });

    // Secondary layout check after micro-hydration (120ms)
    const timeoutId = setTimeout(() => {
      restoreExactPosition();
    }, 120);

    // 2. Track scroll changes passively & store instantly before unload
    let scrollDebounce: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      }, 40);
    };

    const handleSaveScroll = () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleSaveScroll);
    window.addEventListener("pagehide", handleSaveScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleSaveScroll);
      window.removeEventListener("pagehide", handleSaveScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      clearTimeout(scrollDebounce);
    };
  }, [router.state.location.pathname, router.state.location.search]);

  useEffect(() => {
    const { data: sub } = authClient.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <StoreSettingsProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <Outlet />
            <WhatsAppSupportButton />
            <Toaster position="top-center" richColors />
          </CurrencyProvider>
        </LanguageProvider>
      </StoreSettingsProvider>
    </QueryClientProvider>
  );
}
