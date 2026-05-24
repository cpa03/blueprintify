import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { compression } from "vite-plugin-compression2";

const DEV_SERVER_PORT = parseInt(process.env.VITE_DEV_SERVER_PORT || "3000", 10);
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || "http://localhost:8787";

/**
 * Vite plugin to preload CSS for early fetch while keeping it render-blocking.
 * The preload ensures the CSS download starts as early as possible.
 * Keeping the stylesheet sync prevents CLS from unstyled content during React hydration.
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
      // Preload for early fetch + keep stylesheet sync to prevent CLS
      return `<link rel="preload" as="style"${crossorigin} href="${href}">\n    <link rel="stylesheet"${attributes}>`;
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
    const lazyChunks = ["codemirror", "markdown", "syntaxHighlighter"];
    return html.replace(
      new RegExp(
        `<link rel="modulepreload"[^>]*href="[^"]*(?:${lazyChunks.join("|")})-[^"]*\\.js"[^>]*>`,
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
      threshold: 1024,
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "zustand",
      "clsx",
      "framer-motion",
      "react-markdown",
      "remark-gfm",
      "rehype-highlight",
    ],
    esbuildOptions: {
      target: "es2022",
    },
  },
  server: {
    port: DEV_SERVER_PORT,
    host: true,
    strictPort: true,
    hmr: {
      clientPort: DEV_SERVER_PORT,
      overlay: true,
    },
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
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
        tryCatchDeoptimization: false,
      },
      output: {
        // Note: CodeMirror, markdown, and syntaxHighlighter are intentionally NOT manually chunked
        // to allow dynamic imports in LazyCodeMirror/LazyMarkdownRenderer to create
        // natural separate chunks for better lazy loading and smaller initial bundles
        manualChunks: {
          vendor: ["react", "react-dom"],
          animation: ["framer-motion"],
          zustand: ["zustand"],
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
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        passes: 2,
        dead_code: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        typeofs: true,
      },
      format: {
        comments: false,
      },
      mangle: {
        safari10: true,
      },
    },
    cssMinify: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    target: "ES2022",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules/", "e2e/", "dist/"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "dist/"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
