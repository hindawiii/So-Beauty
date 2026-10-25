// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    rollupConfig: {
      onwarn(
        warning: { code?: string; message?: string },
        warn: (w: { code?: string; message?: string }) => void,
      ) {
        if (
          warning?.code === "MODULE_LEVEL_DIRECTIVE" ||
          String(warning?.message || "").includes("MODULE_LEVEL_DIRECTIVE") ||
          String(warning?.message || "").includes("use client")
        ) {
          return;
        }
        warn(warning);
      },
    },
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    prerender: {
      routes: ["/"],
    },
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 3000,
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        onwarn(
          warning: { code?: string; message?: string },
          warn: (w: { code?: string; message?: string }) => void,
        ) {
          if (
            warning?.code === "MODULE_LEVEL_DIRECTIVE" ||
            String(warning?.message || "").includes("MODULE_LEVEL_DIRECTIVE") ||
            String(warning?.message || "").includes("use client")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
