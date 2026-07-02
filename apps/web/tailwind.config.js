/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      /** Flexy says: Font sizes centralized here, not as arbitrary values in components! */
      fontSize: {
        "3xs": ["9px", { lineHeight: "1rem" }],
        "2xs": ["10px", { lineHeight: "1rem" }],
        "sm-xs": ["11px", { lineHeight: "1.25rem" }],
      },
      /** Flexy says: Common dimension tokens to eliminate arbitrary min/max values */
      minWidth: {
        2.5: "2.5rem",
        7: "28px",
        11: "44px",
        70: "280px",
      },
      minHeight: {
        11: "44px",
        35: "140px",
        100: "400px",
        150: "600px",
      },
      maxHeight: {
        "50vh": "50vh",
        "85vh": "85vh",
      },
      colors: {
        // Premium dark theme palette
        dark: {
          50: "#f7f7f8",
          100: "#ececee",
          200: "#d5d5d9",
          300: "#b0b0b8",
          400: "#b8c0cc",
          500: "#9ca3af",
          600: "#5a5a62",
          700: "#4d4d53",
          800: "#434348",
          900: "#1a1a1e",
          950: "#0d0d0f",
        },
        // Accent colors
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          pink: "#ec4899",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        sans: ["Inter", "Inter Fallback", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      /** Flexy says: Scale tokens to eliminate arbitrary hover:scale-[1.02] values */
      scale: {
        102: "1.02",
      },
      backdropBlur: {
        xs: "1px",
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "banner-enter": "banner-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "banner-enter": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient":
          "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
