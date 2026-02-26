import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { compression } from "vite-plugin-compression2";
import { visualizer } from "rollup-plugin-visualizer";

const isAnalyze = process.env.ANALYZE === "true";

const DEV_SERVER_PORT = parseInt(process.env.VITE_DEV_SERVER_PORT || "3000", 10);
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || "http://localhost:8787";

/**
 * Vite plugin to make CSS load asynchronously
 * This prevents render-blocking by using the media="print" trick
 */
const asyncCssPlugin = (): Plugin => ({
  name: "async-css",
  transformIndexHtml(html) {
    return html.replace(/<link rel="stylesheet"([^>]*)>/g, (match, attributes) => {
      if (attributes.includes("media=") || attributes.includes('rel="preload"')) {
        return match;
      }
      return `<link rel="stylesheet"${attributes} media="print" onload="this.media='all'; this.onload=null;">`;
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

export default defineConfig({
  plugins: [
    react(),
    asyncCssPlugin(),
    removeLazyPreloadPlugin(),
    compression({
      algorithms: ["gzip", "brotliCompress"],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "clsx"],
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
        manualChunks: {
          vendor: ["react", "react-dom"],
          codemirror: [
            "@uiw/react-codemirror",
            "@codemirror/lang-markdown",
            "@codemirror/theme-one-dark",
          ],
          markdown: ["react-markdown", "remark-gfm", "rehype-highlight"],
          syntaxHighlighter: ["react-syntax-highlighter"],
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
    chunkSizeWarningLimit: 500,
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
