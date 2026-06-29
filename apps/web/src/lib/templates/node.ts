import type JSZip from "jszip";
import type { TechStackItemType } from "@blueprint/shared";
import {
  HTTP_HEADERS,
  HTTP_HEADER_NAMES,
  HTTP_STATUS,
  TEMPLATE_NODE_PORT,
} from "@blueprint/shared";
import { PackageJson, generateProjectReadme } from "./shared";

export async function generateNodeProject(
  zip: JSZip,
  projectName: string,
  description: string,
  features: string[],
  techStack: TechStackItemType[]
): Promise<void> {
  const isHono = techStack.some((item) => item.name.toLowerCase() === "hono");
  const isExpress = techStack.some((item) => item.name.toLowerCase() === "express");
  const isTypeScript = techStack.some((item) => item.name.toLowerCase() === "typescript");

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
}`
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

  zip.file("README.md", generateProjectReadme(projectName, description, features, "Node.js"));
}

export function generateHonoIndex(projectName: string, features: string[]): string {
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

export function generateExpressIndex(projectName: string, features: string[]): string {
  return `import express from 'express'

const app = express()
const PORT = process.env.PORT || ${TEMPLATE_NODE_PORT}

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

export function generateBasicNodeIndex(projectName: string, features: string[]): string {
  return `const http = require('http')

const PORT = process.env.PORT || ${TEMPLATE_NODE_PORT}

const server = http.createServer((req, res) => {
  res.writeHead(${HTTP_STATUS.OK}, { '${HTTP_HEADER_NAMES.CONTENT_TYPE}': '${HTTP_HEADERS.CONTENT_TYPE_JSON}' })
  
  if (req.url === '/') {
    res.end(JSON.stringify({ 
      message: 'Welcome to ${projectName}',
      features: ${JSON.stringify(features)}
    }))
  } else if (req.url === '/health') {
    res.end(JSON.stringify({ status: 'ok' }))
  } else {
    res.writeHead(${HTTP_STATUS.NOT_FOUND})
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`;
}

export function generateAPITests(): string {
  return `const request = require('supertest')

describe('API Tests', () => {
  test('GET /', async () => {
    const response = await request(app)
      .get('/')
      .expect(${HTTP_STATUS.OK})
    
    expect(response.body).toHaveProperty('message')
  })

  test('GET /health', async () => {
    const response = await request(app)
      .get('/health')
      .expect(${HTTP_STATUS.OK})
    
    expect(response.body.status).toBe('ok')
  })
})`;
}
