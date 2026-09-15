import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes fresh data
        gcTime: 1000 * 60 * 15, // 15 minutes garbage collection in memory
        refetchOnWindowFocus: false, // Prevent distracting lag when switching tabs
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent", // Instantly prefetch on hover or touchstart
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 1000 * 60 * 5,
  });

  return router;
};
