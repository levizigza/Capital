import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, Plugin, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { localSparkMockPlugin } from "./vite-local-spark-mock";

const projectRoot =
  process.env.PROJECT_ROOT || dirname(fileURLToPath(import.meta.url));

/** GitHub Pages project site: https://levizigza.github.io/Capital/ */
const pagesRepo =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ||
  process.env.VITE_PAGES_REPO ||
  "Capital";
const pagesBase =
  process.env.GITHUB_PAGES === "true" || process.env.VITE_PAGES_BASE
    ? process.env.VITE_PAGES_BASE || `/${pagesRepo}/`
    : "/";

/**
 * Runs last (enforce: "post") and uses configResolved to forcibly
 * override whatever the Spark plugin wrote into server.hmr / optimizeDeps,
 * so there is zero ambiguity about the final values.
 */
function localDevOverrides(): Plugin {
  return {
    name: "local-dev-overrides",
    apply: "serve",
    enforce: "post",
    configResolved(resolved) {
      // Force HMR onto the same port as the HTTP server so there is
      // exactly one listener the browser needs to reach.
      const hmr =
        typeof resolved.server.hmr === "object" ? resolved.server.hmr : {};
      hmr.protocol = "ws";
      hmr.host = "127.0.0.1";
      hmr.port = resolved.server.port;
      hmr.clientPort = resolved.server.port;
      hmr.overlay = false;
      resolved.server.hmr = hmr;

      // The fs retry patch (scripts/patch-fs-retry.cjs) now handles
      // transient OneDrive read errors, so dep discovery is safe.
    },
  };
}

// https://vite.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
  base: pagesBase,

  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },

  // Keep Vite's cache outside OneDrive so dep-optimisation reads never
  // hit cloud-only files.
  cacheDir: resolve(homedir(), ".vite-cache", "financial-literacy-g"),

  plugins: [
    localSparkMockPlugin(),
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
    localDevOverrides(),
  ],

  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },

  // ── Server config at the top level so it is the "user config" base.
  // Vite merges plugin configs INTO this; our values survive unless a
  // plugin explicitly overwrites the same key — and localDevOverrides
  // corrects that in configResolved anyway.
  server: {
    port: 5000,
    host: "0.0.0.0",
    strictPort: true,
    hmr: {
      protocol: "ws",
      // Client connects via whatever host the page was opened on (port forward friendly).
      clientPort: 5000,
      overlay: false,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
