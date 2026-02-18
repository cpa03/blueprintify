import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithms: ["gzip", "brotliCompress"],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    modulePreload: false,
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        manualChunks: (id) => {
          // React core - always needed
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react/jsx")
          ) {
            return "vendor";
          }

          // CodeMirror - editor only
          if (
            id.includes("node_modules/@codemirror/") ||
            id.includes("node_modules/@lezer/") ||
            id.includes("node_modules/@uiw/react-codemirror")
          ) {
            return "codemirror";
          }

          // Syntax highlighter - markdown rendering only
          if (
            id.includes("node_modules/react-syntax-highlighter") ||
            id.includes("node_modules/prismjs")
          ) {
            return "syntax-highlighter";
          }

          // Markdown - only needed for preview
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/remark-") ||
            id.includes("node_modules/rehype-") ||
            id.includes("node_modules/mdast-") ||
            id.includes("node_modules/micromark") ||
            id.includes("node_modules/unist-") ||
            id.includes("node_modules/vfile") ||
            id.includes("node_modules/trim-lines") ||
            id.includes("node_modules/escape-string-regexp") ||
            id.includes("node_modules/stringify-entities") ||
            id.includes("node_modules/character-entities") ||
            id.includes("node_modules/property-information") ||
            id.includes("node_modules/space-separated-tokens") ||
            id.includes("node_modules/comma-separated-tokens") ||
            id.includes("node_modules/hast-") ||
            id.includes("node_modules/ccount") ||
            id.includes("node_modules/parse-entities") ||
            id.includes("node_modules/decode-named-character-reference") ||
            id.includes("node_modules/devlop") ||
            id.includes("node_modules/markdown-table") ||
            id.includes("node_modules/gfm-")
          ) {
            return "markdown";
          }

          // Animation library
          if (id.includes("node_modules/framer-motion")) {
            return "animation";
          }

          // State management
          if (id.includes("node_modules/zustand")) {
            return "zustand";
          }

          // Radix UI components
          if (id.includes("node_modules/@radix-ui/")) {
            return "radix-ui";
          }

          // Utility libraries
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/dompurify") ||
            id.includes("node_modules/jszip")
          ) {
            return "utils";
          }
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? "";
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return "assets/img/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: (chunkInfo) => {
          // Keep chunk names readable for debugging
          const name = chunkInfo.name || "chunk";
          return `assets/${name}-[hash].js`;
        },
        entryFileNames: "assets/[name]-[hash].js",
        // Optimize chunk loading
        inlineDynamicImports: false,
        hoistTransitiveImports: true,
      },
    },
    chunkSizeWarningLimit: 700,
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
    target: "es2020",
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
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
      ],
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
