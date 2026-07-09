import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";
import { DEV_DEFAULTS, BYTE_CONVERSION, API_PROXY_PATH, BUILD_CONFIG } from "@blueprint/shared";

const DEV_SERVER_PORT = parseInt(
  process.env.VITE_DEV_SERVER_PORT || String(DEV_DEFAULTS.WEB_PORT),
  10
);
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || DEV_DEFAULTS.API_PROXY_TARGET;

/**
 * Vite plugin to preload CSS with high priority and load it asynchronously.
 * Inlines critical CSS prevents CLS, so the full stylesheet can be deferred.
 * The media="print" onload pattern loads CSS without blocking rendering,
 * then switches to "all" once loaded to apply styles.
 */
const preloadCssPlugin = (): Plugin => ({
  name: "preload-css",
  transformIndexHtml(html) {
    return html.replace(/<link rel="stylesheet"([^>]*)>/g, (match, attributes) => {
      if (attributes.includes("media=") || attributes.includes('rel="preload"')) {
        return match;
      }
      const hrefMatch = attributes.match(/href="([^"]+)"/);
      if (!hrefMatch) return match;
      const href = hrefMatch[1];
      const crossorigin = attributes.includes("crossorigin") ? " crossorigin" : "";
      const nonce = attributes.match(/nonce="([^"]+)"/)?.[1] || "";
      const nonceAttr = nonce ? ` nonce="${nonce}"` : "";
      // Preload with high priority + async stylesheet via media="print" onload trick
      // Critical CSS is inlined so the sync stylesheet is unnecessary for FCP
      return (
        `<link rel="preload" as="style"${crossorigin} href="${href}" fetchpriority="high">` +
        `\n    <link rel="stylesheet"${attributes} media="print"${nonceAttr} onload="this.media='all';this.onload=null">` +
        `\n    <noscript><link rel="stylesheet"${attributes}></noscript>`
      );
    });
  },
});

/**
 * Vite plugin to remove modulepreload for lazy-loaded chunks
 * Prevents eager loading of CodeMirror and other lazy components
 */
const removeLazyPreloadPlugin = (): Plugin => ({
  name: "remove-lazy-preload",
  transformIndexHtml(html) {
    // Omit modulepreload for lazy-loaded chunks used only by dynamic imports.
    // These are imported via React.lazy() and should not be eagerly preloaded.
    const lazyChunks = [
      "codemirror",
      "markdown",
      "syntaxHighlighter",
      "animation",
      "security",
      "wizard",
      "Toast",
      "ShowEditorButton",
      "KeyboardShortcutsModal",
      "PageScrollProgressBar",
      "ScrollToTop",
      "GenerationCelebration",
      "VercelAnalytics",
      "lazyLoad",
    ];
    if (!lazyChunks.length) return html;
    const escaped = lazyChunks.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return html.replace(
      new RegExp(
        `<link rel="modulepreload"[^>]*href="[^"]*(?:${escaped.join("|")})-[^"]*\\.js"[^>]*>`,
        "g"
      ),
      ""
    );
  },
});

const fetchPriorityPlugin = (): Plugin => ({
  name: "fetch-priority",
  transformIndexHtml(html) {
    return html.replace(
      /(<script[^>]*type="module"[^>]*crossorigin[^>]*)(><\/script>)/,
      '$1 fetchpriority="high"$2'
    );
  },
});

export default defineConfig({
  plugins: [
    react(),
    preloadCssPlugin(),
    removeLazyPreloadPlugin(),
    fetchPriorityPlugin(),
    compression({
      algorithms: ["gzip", "brotliCompress"],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: BYTE_CONVERSION.KB,
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "zustand",
      "clsx",
      // framer-motion, react-markdown, and remark-gfm are excluded because
      // they are lazy-loaded via dynamic import() and not needed in the
      // initial critical path, even during development.
    ],
  },
  server: {
    port: DEV_SERVER_PORT,
    host: true,
    strictPort: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      [API_PROXY_PATH]: {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(new RegExp(`^${API_PROXY_PATH}`), ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        annotations: true,
      },
      output: {
        // Note: CodeMirror, markdown, and syntaxHighlighter are intentionally NOT manually chunked
        // to allow dynamic imports in LazyCodeMirror/LazyMarkdownRenderer to create
        // natural separate chunks for better lazy loading and smaller initial bundles
        //
        // Split vendor into per-package chunks so tree-shaking can eliminate unused code
        // from each package independently and so cache invalidation is granular.
        // react-dom has ~35% unused code in client-only usage — isolating it prevents
        // that waste from bloating the other packages' cache keys.
        manualChunks(id: string) {
          if (id.includes("node_modules/react-dom")) return "vendor-react-dom";
          if (id.includes("node_modules/react/")) return "vendor-react";
          if (id.includes("node_modules/zustand")) return "vendor-zustand";
          if (id.includes("node_modules/scheduler")) return "vendor-scheduler";
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? "";
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return "assets/img/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    minify: BUILD_CONFIG.MINIFIER,
    terserOptions: BUILD_CONFIG.TERSER_OPTIONS,
    cssMinify: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    target: "ES2022",
    cssTarget: ["chrome111", "firefox114", "safari16.4", "edge111"],
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
