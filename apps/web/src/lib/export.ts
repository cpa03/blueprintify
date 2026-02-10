import JSZip from "jszip";
import type { TechStackItemType } from "@blueprint/shared";
import {
  EXPORT_CONFIG,
  README_TEMPLATE,
  DEFAULT_PROJECT_NAME,
} from "../config/constants";

interface ExportFiles {
  blueprint: string;
  tasks: string;
  projectName: string;
  techStack: TechStackItemType[];
  description: string;
  features: string[];
}

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  description?: string;
  main?: string;
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function exportAsZip(files: ExportFiles): Promise<void> {
  const zip = new JSZip();
  const projectName = files.projectName || DEFAULT_PROJECT_NAME;

  await generateProjectStructure(zip, files);

  const docsFolder = zip.folder(".docs");
  if (!docsFolder) {
    throw new Error("Failed to create docs folder");
  }

  if (files.blueprint) {
    docsFolder.file("blueprint.md", files.blueprint);
  }

  if (files.tasks) {
    docsFolder.file("task.md", files.tasks);
  }

  docsFolder.file("README.md", README_TEMPLATE(projectName));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: EXPORT_CONFIG.ZIP_COMPRESSION_LEVEL },
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function generateProjectStructure(
  zip: JSZip,
  files: ExportFiles,
): Promise<void> {
  const { techStack, projectName, description, features } = files;
  const normalizedProjectName = (projectName || DEFAULT_PROJECT_NAME)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const techStackNames = techStack.map((item) => item.name.toLowerCase());

  const isReact =
    techStackNames.includes("react") || techStackNames.includes("next.js");
  const isNode =
    techStackNames.includes("node.js") ||
    techStackNames.includes("express") ||
    techStackNames.includes("hono");
  const isPython =
    techStackNames.includes("python") ||
    techStackNames.includes("django") ||
    techStackNames.includes("flask");
  const _isStatic = !isReact && !isNode && !isPython;

  if (isReact) {
    await generateReactProject(
      zip,
      normalizedProjectName,
      description,
      features,
      techStack,
    );
  } else if (isNode) {
    await generateNodeProject(
      zip,
      normalizedProjectName,
      description,
      features,
      techStack,
    );
  } else if (isPython) {
    await generatePythonProject(
      zip,
      normalizedProjectName,
      description,
      features,
      techStack,
    );
  } else {
    await generateStaticProject(
      zip,
      normalizedProjectName,
      description,
      features,
      techStack,
    );
  }
}

async function generateReactProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  techStack: TechStackItemType[],
): Promise<void> {
  const isNextJS = techStack.some(
    (item) => item.name.toLowerCase() === "next.js",
  );
  const _isTypeScript = techStack.some(
    (item) => item.name.toLowerCase() === "typescript",
  );
  const isTailwind = techStack.some(
    (item) => item.name.toLowerCase() === "tailwind css",
  );
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
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          next: "14.0.0",
        }
      : {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
    devDependencies: isNextJS
      ? {
          "@types/node": "^20",
          "@types/react": "^18",
          "@types/react-dom": "^18",
          autoprefixer: "^10.0.1",
          eslint: "^8",
          "eslint-config-next": "14.0.0",
          postcss: "^8",
          tailwindcss: "^3.3.0",
          typescript: "^5",
        }
      : {
          "@types/react": "^18.2.43",
          "@types/react-dom": "^18.2.17",
          "@vitejs/plugin-react": "^4.2.1",
          eslint: "^8.55.0",
          "eslint-plugin-react": "^7.33.2",
          "eslint-plugin-react-hooks": "^4.6.0",
          "eslint-plugin-react-refresh": "^0.4.5",
          typescript: "^5.2.2",
          vite: "^5.0.8",
        },
  };

  if (isTailwind && !isNextJS) {
    const currentDevDeps = packageJson.devDependencies ?? {};
    packageJson.devDependencies = {
      ...currentDevDeps,
      tailwindcss: "^3.3.0",
      autoprefixer: "^10.4.16",
      postcss: "^8.4.32",
    };
  }

  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  if (isNextJS) {
    zip.file(
      "next.config.js",
      `/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;`,
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
};`,
    );

    zip.file(
      "postcss.config.js",
      `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
    );

    const appFolder = zip.folder("app");
    if (appFolder) {
      appFolder.file(
        "layout.tsx",
        generateNextLayout(projectName, description),
      );
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
})`,
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
}`,
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
}`,
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
};`,
      );

      zip.file(
        "postcss.config.js",
        `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
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

  zip.file(
    "README.md",
    generateProjectReadme(projectName, description, features, "React"),
  );
}

async function generateNodeProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  techStack: TechStackItemType[],
): Promise<void> {
  const isHono = techStack.some((item) => item.name.toLowerCase() === "hono");
  const isExpress = techStack.some(
    (item) => item.name.toLowerCase() === "express",
  );
  const isTypeScript = techStack.some(
    (item) => item.name.toLowerCase() === "typescript",
  );

  const packageJson: PackageJson = {
    name: projectName,
    version: "1.0.0",
    description: description,
    main: isTypeScript ? "dist/index.js" : "src/index.js",
    scripts: {
      dev: isTypeScript ? "tsx watch src/index.ts" : "node src/index.js",
      build: isTypeScript ? "tsc" : "echo 'No build step needed'",
      start: isTypeScript ? "node dist/index.js" : "node src/index.js",
      test: "jest",
    },
    dependencies: isHono
      ? {
          hono: "^3.11.0",
        }
      : isExpress
        ? {
            express: "^4.18.2",
          }
        : undefined,
    devDependencies: isTypeScript
      ? {
          "@types/node": "^20.0.0",
          tsx: "^4.6.0",
          typescript: "^5.0.0",
          jest: "^29.0.0",
          "@types/jest": "^29.0.0",
        }
      : {
          jest: "^29.0.0",
          "@types/jest": "^29.0.0",
        },
  };

  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  if (isTypeScript) {
    zip.file(
      "tsconfig.json",
      `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`,
    );
  }

  const srcFolder = zip.folder("src");
  if (srcFolder) {
    if (isHono) {
      srcFolder.file("index.ts", generateHonoIndex(projectName, features));
    } else if (isExpress) {
      srcFolder.file("index.ts", generateExpressIndex(projectName, features));
    } else {
      srcFolder.file("index.js", generateBasicNodeIndex(projectName, features));
    }
  }

  const testsFolder = zip.folder("tests");
  if (testsFolder) {
    testsFolder.file("api.test.js", generateAPITests());
  }

  zip.file(
    "README.md",
    generateProjectReadme(projectName, description, features, "Node.js"),
  );
}

async function generatePythonProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  techStack: TechStackItemType[],
): Promise<void> {
  const isDjango = techStack.some(
    (item) => item.name.toLowerCase() === "django",
  );
  const isFlask = techStack.some((item) => item.name.toLowerCase() === "flask");

  const requirements = isDjango
    ? "Django>=4.2.0\ndjangorestframework>=3.14.0\npython-decouple>=3.8"
    : isFlask
      ? "Flask>=2.3.0\nFlask-RESTful>=0.3.10\npython-decouple>=3.8"
      : "fastapi>=0.104.0\nuvicorn>=0.24.0\npydantic>=2.5.0";

  zip.file("requirements.txt", requirements);

  if (isDjango) {
    zip.file("manage.py", generateDjangoManagePy(projectName));

    const configFolder = zip.folder(projectName.replace(/-/g, "_"));
    if (configFolder) {
      configFolder.file("__init__.py", "");
      configFolder.file("settings.py", generateDjangoSettings(projectName));
      configFolder.file("urls.py", generateDjangoURLs());
      configFolder.file("wsgi.py", generateDjangoWSGI(projectName));
    }

    const appFolder = zip.folder("app");
    if (appFolder) {
      appFolder.file("__init__.py", "");
      appFolder.file("models.py", generateDjangoModels(features));
      appFolder.file("views.py", generateDjangoViews(features));
      appFolder.file("urls.py", generateDjangoAppURLs());
    }
  } else if (isFlask) {
    const srcFolder = zip.folder("src");
    if (srcFolder) {
      srcFolder.file("app.py", generateFlaskApp(projectName, features));
      srcFolder.file("models.py", generateFlaskModels(features));
    }
  } else {
    const srcFolder = zip.folder("src");
    if (srcFolder) {
      srcFolder.file("main.py", generateFastAPIIndex(projectName, features));
      srcFolder.file("models.py", generateFastAPIModels(features));
    }
  }

  zip.file(
    "README.md",
    generateProjectReadme(projectName, description, features, "Python"),
  );
}

async function generateStaticProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  _techStack: TechStackItemType[],
): Promise<void> {
  void _techStack;
  zip.file(
    "index.html",
    generateStaticHTML(projectName, description, features),
  );
  zip.file("style.css", generateStaticCSS());
  zip.file("script.js", generateStaticJS(features));

  zip.file(
    "README.md",
    generateProjectReadme(projectName, description, features, "Static Site"),
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = `${EXPORT_CONFIG.COPY_TEXTAREA_OFFSET}px`;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

export function formatForIDE(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function generateNextLayout(projectName: string, description: string): string {
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

function generateNextPage(features: string[]): string {
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

function generateGlobalCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;`;
}

function generateHeaderComponent(): string {
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

function generateMainTSX(_isTailwind: boolean): string {
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

function generateAppTSX(features: string[], isTailwind: boolean): string {
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

function generateIndexCSS(isTailwind: boolean): string {
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

function generateAppCSS(): string {
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

function generateViteEnvDTS(): string {
  return `/// <reference types="vite/client" />`;
}

function generateViteSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;
}

function generateProjectReadme(
  projectName: string,
  description: string,
  features: string[],
  techStack: string,
): string {
  return `# ${projectName}

${description}

## Features

${features.map((feature) => `- ${feature}`).join("\n")}

## Tech Stack

- ${techStack}

## Getting Started

### Prerequisites

- Node.js 18+ (for JavaScript/TypeScript projects)
- Python 3.8+ (for Python projects)

### Installation

\`\`\`bash
npm install  # or: yarn install
pip install -r requirements.txt
\`\`\`

### Development

\`\`\`bash
npm run dev  # or: yarn dev
python src/main.py  # or: python manage.py runserver (Django)
\`\`\`

### Build

\`\`\`bash
npm run build  # or: yarn build
\`\`\`

## Project Structure

\`\`\`
.
├── src/                 # Source code
├── public/              # Static assets (if applicable)
├── tests/               # Test files
├── docs/                # Documentation
└── README.md            # This file
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
`;
}

function generateHonoIndex(projectName: string, features: string[]): string {
  return `import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ 
    message: 'Welcome to ${projectName} API',
    features: ${JSON.stringify(features)}
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app`;
}

function generateExpressIndex(projectName: string, features: string[]): string {
  return `import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ${projectName} API',
    features: ${JSON.stringify(features)}
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})

export default app`;
}

function generateBasicNodeIndex(
  projectName: string,
  features: string[],
): string {
  return `const http = require('http')

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  
  if (req.url === '/') {
    res.end(JSON.stringify({ 
      message: 'Welcome to ${projectName}',
      features: ${JSON.stringify(features)}
    }))
  } else if (req.url === '/health') {
    res.end(JSON.stringify({ status: 'ok' }))
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`;
}

function generateAPITests(): string {
  return `const request = require('supertest')

describe('API Tests', () => {
  test('GET /', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
    
    expect(response.body).toHaveProperty('message')
  })

  test('GET /health', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
    
    expect(response.body.status).toBe('ok')
  })
})`;
}

function generateDjangoManagePy(projectName: string): string {
  return `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${projectName.replace(/-/g, "_")}.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`;
}

function generateDjangoSettings(projectName: string): string {
  return `from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = '${projectName.replace(/-/g, "_")}.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = '${projectName.replace(/-/g, "_")}.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
`;
}

function generateDjangoURLs(): string {
  return `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('app.urls')),
]`;
}

function generateDjangoWSGI(projectName: string): string {
  return `import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${projectName.replace(/-/g, "_")}.settings')

application = get_wsgi_application()
`;
}

function generateDjangoModels(_features: string[]): string {
  void _features;
  return `from django.db import models

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Feature(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
`;
}

function generateDjangoViews(_features: string[]): string {
  void _features;
  return `from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Project, Feature

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})
`;
}

function generateDjangoAppURLs(): string {
  return `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'features', views.FeatureViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check),
]
`;
}

function generateFlaskApp(projectName: string, features: string[]): string {
  return `from flask import Flask, jsonify
from flask_restful import Api, Resource
from decouple import config

app = Flask(__name__)
api = Api(app)

class HealthCheck(Resource):
    def get(self):
        return {'status': 'ok'}

class ProjectInfo(Resource):
    def get(self):
        return {
            'name': '${projectName}',
            'features': ${JSON.stringify(features)}
        }

api.add_resource(HealthCheck, '/health')
api.add_resource(ProjectInfo, '/')

if __name__ == '__main__':
    app.run(debug=config('DEBUG', default=True, cast=bool))
`;
}

function generateFlaskModels(_features: string[]): string {
  void _features;
  return `from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    features = db.relationship('Feature', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Feature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'completed': self.completed,
            'project_id': self.project_id,
            'created_at': self.created_at.isoformat()
        }
`;
}

function generateFastAPIIndex(projectName: string, features: string[]): string {
  return `from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="${projectName}", description="${projectName} API")

class Project(BaseModel):
    name: str
    description: str
    features: List[str]

@app.get("/")
async def root():
    return {
        "message": "Welcome to ${projectName} API",
        "features": ${JSON.stringify(features)}
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/project", response_model=Project)
async def get_project():
    return Project(
        name="${projectName}",
        description="${projectName} API",
        features=${JSON.stringify(features)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
}

function generateFastAPIModels(_features: string[]): string {
  void _features;
  return `from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FeatureBase(BaseModel):
    name: str
    completed: bool = False

class FeatureCreate(FeatureBase):
    pass

class Feature(FeatureBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: str

class ProjectCreate(ProjectBase):
    features: List[FeatureCreate] = []

class Project(ProjectBase):
    id: int
    features: List[Feature] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
`;
}

function generateStaticHTML(
  projectName: string,
  description: string,
  features: string[],
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="container">
                <h1>${projectName}</h1>
            </div>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h2>${description}</h2>
                <p>A modern web application built with best practices.</p>
            </div>
        </section>

        <section class="features">
            <div class="container">
                <h3>Features</h3>
                <div class="feature-grid">
                    ${features
                      .map(
                        (feature) => `<div class="feature-card">
                        <h4>${feature}</h4>
                        <p>Implementation of ${feature} functionality.</p>
                    </div>`,
                      )
                      .join("")}
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 ${projectName}. All rights reserved.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
}

function generateStaticCSS(): string {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

header {
    background: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

nav h1 {
    padding: 1rem 0;
    color: #2563eb;
    font-size: 1.5rem;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.features {
    padding: 4rem 0;
    background: #f8fafc;
}

.features h3 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 3rem;
    color: #1e293b;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-card h4 {
    color: #2563eb;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.feature-card p {
    color: #64748b;
}

footer {
    background: #1e293b;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

@media (max-width: 768px) {
    .hero h2 {
        font-size: 2rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}`;
}

function generateStaticJS(features: string[]): string {
  return `document.addEventListener('DOMContentLoaded', function() {
    console.log('${features.length > 0 ? features[0] : "Project"} loaded successfully!');
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});
`;
}
