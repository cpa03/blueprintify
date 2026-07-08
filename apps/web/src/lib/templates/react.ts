import type JSZip from "jszip";
import type { TechStackItemType } from "@blueprint/shared";
import { TEMPLATE_VERSIONS } from "@blueprint/shared";
import { PackageJson, generateProjectReadme } from "./shared";

export async function generateReactProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  techStack: TechStackItemType[]
): Promise<void> {
  const isNextJS = techStack.some((item) => item.name.toLowerCase() === "next.js");
  const _isTypeScript = techStack.some((item) => item.name.toLowerCase() === "typescript");
  const isTailwind = techStack.some((item) => item.name.toLowerCase() === "tailwind css");
  void _isTypeScript;

  const packageJson: PackageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    description: description,
    scripts: isNextJS
      ? {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint",
        }
      : {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
          lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        },
    dependencies: isNextJS
      ? {
          react: TEMPLATE_VERSIONS.REACT,
          "react-dom": TEMPLATE_VERSIONS.REACT_DOM,
          next: TEMPLATE_VERSIONS.NEXT,
        }
      : {
          react: TEMPLATE_VERSIONS.REACT,
          "react-dom": TEMPLATE_VERSIONS.REACT_DOM,
        },
    devDependencies: isNextJS
      ? {
          "@types/node": TEMPLATE_VERSIONS.AT_TYPES_NODE,
          "@types/react": TEMPLATE_VERSIONS.AT_TYPES_REACT,
          "@types/react-dom": TEMPLATE_VERSIONS.AT_TYPES_REACT_DOM,
          autoprefixer: TEMPLATE_VERSIONS.AUTOPREFIXER,
          eslint: TEMPLATE_VERSIONS.ESLINT,
          "eslint-config-next": TEMPLATE_VERSIONS.ESLINT_CONFIG_NEXT,
          postcss: TEMPLATE_VERSIONS.POSTCSS,
          tailwindcss: TEMPLATE_VERSIONS.TAILWIND,
          typescript: TEMPLATE_VERSIONS.TYPESCRIPT,
        }
      : {
          "@types/react": TEMPLATE_VERSIONS.AT_TYPES_REACT,
          "@types/react-dom": TEMPLATE_VERSIONS.AT_TYPES_REACT_DOM,
          "@vitejs/plugin-react": TEMPLATE_VERSIONS.VITE_REACT_PLUGIN,
          eslint: TEMPLATE_VERSIONS.ESLINT,
          "eslint-plugin-react": "^7.33.2",
          "eslint-plugin-react-hooks": "^4.6.0",
          "eslint-plugin-react-refresh": "^0.4.5",
          typescript: TEMPLATE_VERSIONS.TYPESCRIPT,
          vite: TEMPLATE_VERSIONS.VITE,
        },
  };

  if (isTailwind && !isNextJS) {
    const currentDevDeps = packageJson.devDependencies ?? {};
    packageJson.devDependencies = {
      ...currentDevDeps,
      tailwindcss: TEMPLATE_VERSIONS.TAILWIND,
      autoprefixer: TEMPLATE_VERSIONS.AUTOPREFIXER,
      postcss: TEMPLATE_VERSIONS.POSTCSS,
    };
  }

  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  if (isNextJS) {
    zip.file(
      "next.config.js",
      `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;`
    );

    zip.file(
      "tailwind.config.js",
      `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`
    );

    zip.file(
      "postcss.config.js",
      `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    );

    const appFolder = zip.folder("app");
    if (appFolder) {
      appFolder.file("layout.tsx", generateNextLayout(projectName, description));
      appFolder.file("page.tsx", generateNextPage(features));
      appFolder.file("globals.css", generateGlobalCSS());
    }

    const componentsFolder = zip.folder("components");
    if (componentsFolder) {
      componentsFolder.file("Header.tsx", generateHeaderComponent());
    }
  } else {
    zip.file(
      "vite.config.ts",
      `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
    );

    zip.file(
      "tsconfig.json",
      `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
    );

    zip.file(
      "tsconfig.node.json",
      `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`
    );

    if (isTailwind) {
      zip.file(
        "tailwind.config.js",
        `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`
      );

      zip.file(
        "postcss.config.js",
        `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
      );
    }

    const publicFolder = zip.folder("public");
    if (publicFolder) {
      publicFolder.file("vite.svg", generateViteSVG());
    }

    const srcFolder = zip.folder("src");
    if (srcFolder) {
      srcFolder.file("main.tsx", generateMainTSX(isTailwind));
      srcFolder.file("App.tsx", generateAppTSX(features, isTailwind));
      srcFolder.file("index.css", generateIndexCSS(isTailwind));
      srcFolder.file("App.css", generateAppCSS());
      srcFolder.file("vite-env.d.ts", generateViteEnvDTS());
    }
  }

  zip.file("README.md", generateProjectReadme(projectName, description, features, "React"));
}

export function generateNextLayout(projectName: string, description: string): string {
  return `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${projectName}',
  description: '${description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;
}

export function generateNextPage(features: string[]): string {
  return `export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to ${features.length > 0 ? features[0] : "your project"}
              </h1>
              <p className="text-gray-600">
                Get started by editing this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}`;
}

export function generateGlobalCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`;
}

export function generateHeaderComponent(): string {
  return `export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Project Header
        </h1>
      </div>
    </header>
  )
}`;
}

export function generateMainTSX(_isTailwind: boolean): string {
  void _isTailwind;
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
}

export function generateAppTSX(features: string[], isTailwind: boolean): string {
  const featureText = features.length > 0 ? features[0] : "your project";
  return `function App() {
  return (
    <div className="${isTailwind ? "min-h-screen bg-gray-50" : ""}">
      <div className="${isTailwind ? "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" : ""}">
        <div className="${isTailwind ? "px-4 py-6 sm:px-0" : ""}">
          <div className="${isTailwind ? "border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center" : ""}">
            <div className="text-center">
              <h1 className="${isTailwind ? "text-3xl font-bold text-gray-900 mb-4" : ""}">
                Welcome to ${featureText}
              </h1>
              <p className="${isTailwind ? "text-gray-600" : ""}">
                Get started by editing this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App`;
}

export function generateIndexCSS(isTailwind: boolean): string {
  if (isTailwind) {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;`;
  }
  return `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}`;
}

export function generateAppCSS(): string {
  return `.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2).logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}`;
}

export function generateViteEnvDTS(): string {
  return `/// <reference types="vite/client" />`;
}

export function generateViteSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;
}
