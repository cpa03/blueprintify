/**
 * Template Package Versions
 * Centralized source of truth for dependency version strings used in
 * project template generators. Ensures generated projects use consistent
 * version numbers and allows easy version bumps from a single location.
 * Flexy says: No hardcoded "^18.2.0" dependency versions in template generators!
 * Usage: import { TEMPLATE_VERSIONS } from "@blueprint/shared";
 *        TEMPLATE_VERSIONS.REACT
 */
export const TEMPLATE_VERSIONS = {
  /** React framework version */
  REACT: "^18.2.0",
  /** React DOM version */
  REACT_DOM: "^18.2.0",
  /** Next.js framework version */
  NEXT: "14.0.0",
  /** Vite build tool version */
  VITE: "^5.0.8",
  /** Vite React plugin version */
  VITE_REACT_PLUGIN: "^4.2.1",
  /** TypeScript (template) version */
  TYPESCRIPT: "^5.0.0",
  /** @types/node version for templates */
  AT_TYPES_NODE: "^20.0.0",
  /** @types/react version for templates */
  AT_TYPES_REACT: "^18",
  /** @types/react-dom version for templates */
  AT_TYPES_REACT_DOM: "^18.2.17",
  /** Tailwind CSS version for templates */
  TAILWIND: "^3.3.0",
  /** Autoprefixer version for templates */
  AUTOPREFIXER: "^10.4.16",
  /** PostCSS version for templates */
  POSTCSS: "^8.4.32",
  /** Express.js version for templates */
  EXPRESS: "^4.18.2",
  /** Hono framework version for templates */
  HONO: "^3.11.0",
  /** ESLint version for templates */
  ESLINT: "^8.55.0",
  /** eslint-config-next version for templates */
  ESLINT_CONFIG_NEXT: "14.0.0",
  /** tsx (TypeScript Execute) version for templates */
  TSX: "^4.6.0",
  /** Jest testing framework version for templates */
  JEST: "^29.0.0",
  /** @types/jest version for templates */
  AT_TYPES_JEST: "^29.0.0",
  /** Django framework version for Python templates */
  DJANGO: ">=4.2.0",
  /** Django REST framework version for Python templates */
  DJANGO_REST: ">=3.14.0",
  /** Flask framework version for Python templates */
  FLASK: ">=2.3.0",
  /** Flask-RESTful version for Python templates */
  FLASK_RESTFUL: ">=0.3.10",
  /** FastAPI version for Python templates */
  FASTAPI: ">=0.104.0",
  /** Uvicorn version for Python templates */
  UVICORN: ">=0.24.0",
  /** Pydantic version for Python templates */
  PYDANTIC: ">=2.5.0",
} as const;

/**
 * Template Generator CSS Color Values
 * Centralized source of truth for CSS color values used in
 * generated project types.
 * Flexy says: No hardcoded "#333" or "rgba(0,0,0,0.1)" in template CSS!
 * Usage: import { TEMPLATE_CSS_COLORS } from "@blueprint/shared";
 *        `color: ${TEMPLATE_CSS_COLORS.BODY_TEXT};`
 */
export const TEMPLATE_CSS_COLORS = {
  /** Body text color — dark gray for readability */
  BODY_TEXT: "#333" as const,
  /** Header background — white */
  HEADER_BG: "#fff" as const,
  /** Accent/primary blue — nav h1, feature card titles, link color */
  ACCENT_BLUE: "#2563eb" as const,
  /** Hero gradient start — soft purple-blue */
  HERO_GRADIENT_START: "#667eea" as const,
  /** Hero gradient end — deep purple */
  HERO_GRADIENT_END: "#764ba2" as const,
  /** Hero text color — white on gradient background */
  HERO_TEXT: "white" as const,
  /** Features section background — light gray */
  FEATURES_BG: "#f8fafc" as const,
  /** Section heading color — dark slate */
  SECTION_HEADING: "#1e293b" as const,
  /** Card body text — muted slate */
  CARD_TEXT: "#64748b" as const,
  /** Footer background — dark slate */
  FOOTER_BG: "#1e293b" as const,
  /** Card background — white */
  CARD_BG: "white" as const,

  /** React template: root background — dark */
  REACT_ROOT_BG: "#242424" as const,
  /** React template: link color — indigo */
  REACT_LINK: "#646cff" as const,
  /** React template: link hover color — slightly darker indigo */
  REACT_LINK_HOVER: "#535bf2" as const,
  /** React template: muted text — gray */
  REACT_MUTED_TEXT: "#888" as const,
  /** React template: logo shadow color — indigo with alpha */
  REACT_LOGO_SHADOW: "#646cffaa" as const,
  /** React template: react logo shadow — cyan with alpha */
  REACT_REACT_LOGO_SHADOW: "#61dafbaa" as const,
  /** React template: root text color — white with opacity */
  REACT_ROOT_TEXT: "rgba(255, 255, 255, 0.87)" as const,
} as const;

/**
 * Template Generator CSS Spacing & Sizing Values
 * Centralized source of truth for layout dimensions, spacing, font sizes,
 * border radii, and other CSS numeric values used in project template generators.
 * Flexy says: No hardcoded "1200px" container widths or "4rem" padding in templates!
 * Usage: import { TEMPLATE_CSS_VALUES } from "@blueprint/shared";
 *        `max-width: ${TEMPLATE_CSS_VALUES.CONTAINER_MAX_WIDTH_PX}px;`
 */
export const TEMPLATE_CSS_VALUES = {
  /** Container max-width in px */
  CONTAINER_MAX_WIDTH_PX: 1200,
  /** Container horizontal padding in px */
  CONTAINER_PADDING_X_PX: 20,
  /** Header z-index */
  HEADER_Z_INDEX: 100,
  /** Hero/feature section vertical padding in rem */
  SECTION_PADDING_Y_REM: 4,
  /** Hero heading font size in rem */
  HERO_H2_FONT_SIZE_REM: 2.5,
  /** Hero paragraph font size in rem */
  HERO_P_FONT_SIZE_REM: 1.2,
  /** Section heading font size in rem */
  SECTION_H3_FONT_SIZE_REM: 2,
  /** Feature grid gap in rem */
  GRID_GAP_REM: 2,
  /** Feature card padding in rem */
  CARD_PADDING_REM: 2,
  /** Feature card border radius in px */
  CARD_BORDER_RADIUS_PX: 8,
  /** Feature card title font size in rem */
  CARD_TITLE_FONT_SIZE_REM: 1.25,
  /** Footer padding vertical in rem */
  FOOTER_PADDING_Y_REM: 2,
  /** Mobile breakpoint in px */
  MOBILE_BREAKPOINT_PX: 768,
  /** Transition duration for feature-card hover in seconds */
  CARD_HOVER_TRANSITION_S: 0.2,
  /** Feature-card hover translateY offset in px (negative = moves up) */
  CARD_HOVER_TRANSLATE_Y_PX: -5,
  /** Feature-card box shadow horizontal offset in px */
  CARD_SHADOW_X_PX: 0,
  /** Feature-card box shadow vertical offset in px */
  CARD_SHADOW_Y_PX: 4,
  /** Feature-card box shadow blur radius in px */
  CARD_SHADOW_BLUR_PX: 6,
  /** Feature-card box shadow opacity */
  CARD_SHADOW_OPACITY: 0.1,
  /** Header box shadow horizontal offset in px */
  HEADER_SHADOW_X_PX: 0,
  /** Header box shadow vertical offset in px */
  HEADER_SHADOW_Y_PX: 2,
  /** Header box shadow blur radius in px */
  HEADER_SHADOW_BLUR_PX: 5,
  /** Header box shadow opacity */
  HEADER_SHADOW_OPACITY: 0.1,
  /** Nav heading font size in rem */
  NAV_H1_FONT_SIZE_REM: 1.5,
  /** Heading bottom margin in rem */
  HEADING_MARGIN_BOTTOM_REM: 1,
  /** Feature section heading bottom margin in rem */
  SECTION_HEADING_MARGIN_BOTTOM_REM: 3,
  /** Card title bottom margin in rem */
  CARD_TITLE_MARGIN_BOTTOM_REM: 1,
  /** Hero paragraph opacity */
  HERO_P_OPACITY: 0.9,
  /** Intersection observer threshold for scroll animations */
  INTERSECTION_THRESHOLD: 0.1,
  /** Intersection observer root margin for scroll animations */
  INTERSECTION_ROOT_MARGIN_PX: -50,
  /** Scroll animation transition duration in seconds */
  SCROLL_ANIMATION_DURATION_S: 0.5,
  /** Scroll animation initial offset in px (translated up) */
  SCROLL_INITIAL_OFFSET_PX: 20,
  /** Grid min column width in px */
  GRID_MIN_COLUMN_WIDTH_PX: 300,
  /** Feature section grid template (auto-fit, minmax) */
  GRID_TEMPLATE_COLUMNS: "repeat(auto-fit, minmax(300px, 1fr))" as const,
  /** Media query max-width value for tablet */
  RESPONSIVE_H2_FONT_SIZE_REM: 2,
  /** Hero mobile font-size in rem */
  HERO_MOBILE_H2_FONT_SIZE_REM: 2,

  /** React template: root max-width in px */
  REACT_ROOT_MAX_WIDTH_PX: 1280,
  /** React template: root padding in rem */
  REACT_ROOT_PADDING_REM: 2,
  /** React template: logo height in em */
  REACT_LOGO_HEIGHT_EM: 6,
  /** React template: logo padding in em */
  REACT_LOGO_PADDING_EM: 1.5,
  /** React template: logo button min-width in px */
  REACT_BUTTON_MIN_WIDTH_PX: 320,
  /** React template: logo button min-height in px */
  REACT_BUTTON_MIN_HEIGHT_PX: 100,
  /** React template: app header margin in rem */
  REACT_HEADER_MARGIN_REM: 2,
  /** React template: card padding in em */
  REACT_CARD_PADDING_EM: 2,
  /** React template: transition duration for logo hover in ms */
  REACT_LOGO_TRANSITION_MS: 300,
  /** React template: logo spin animation duration in seconds */
  REACT_LOGO_SPIN_DURATION_S: 20,
} as const;
