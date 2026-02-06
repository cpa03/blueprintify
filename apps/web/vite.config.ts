import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "framer-motion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
          ],
          editor: [
            "@uiw/react-codemirror",
            "@codemirror/lang-markdown",
            "@codemirror/theme-one-dark",
          ],
          utils: ["react-markdown", "jszip", "zustand"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    minify: "esbuild",
    target: "esnext",
    cssCodeSplit: true,
  },
  define: {
    __BUNDLE_ANALYZER__: process.env.ANALYZE === "true" ? "true" : "false",
  },
});
