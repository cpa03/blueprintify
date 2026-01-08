import type { Template } from './types';

export const STARTER_TEMPLATES: Template[] = [
  {
    id: 'nextjs-saas',
    name: 'Next.js SaaS Boilerplate',
    description: 'Full-stack SaaS application with authentication, payments, and dashboard',
    icon: '🚀',
    projectName: 'my-saas-app',
    defaultDescription: 'A modern SaaS application with user authentication, subscription management, team collaboration, and a beautiful dashboard. Built for scale with Next.js and modern best practices.',
    techStack: [
      { name: 'Next.js', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'styling' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Vercel', category: 'hosting' }
    ],
    features: [
      'User authentication with OAuth providers',
      'Subscription billing with Stripe',
      'Team management and invitations',
      'Admin dashboard with analytics',
      'Email notifications',
      'Dark mode support'
    ]
  },
  {
    id: 'hono-cloudflare-api',
    name: 'Hono + Cloudflare Worker API',
    description: 'Edge-first API with zero cold starts and global distribution',
    icon: '⚡',
    projectName: 'edge-api',
    defaultDescription: 'A blazing-fast edge API built with Hono framework, deployed on Cloudflare Workers for zero cold starts and global low latency. Perfect for microservices and serverless architectures.',
    techStack: [
      { name: 'Hono', category: 'backend' },
      { name: 'TypeScript', category: 'backend' },
      { name: 'Cloudflare D1', category: 'database' },
      { name: 'Cloudflare', category: 'hosting' }
    ],
    features: [
      'RESTful API endpoints',
      'Request validation with Zod',
      'Rate limiting middleware',
      'CORS configuration',
      'JWT authentication',
      'OpenAPI documentation'
    ]
  },
  {
    id: 'chrome-extension',
    name: 'Chrome Extension',
    description: 'Modern browser extension with popup, content scripts, and background workers',
    icon: '🧩',
    projectName: 'my-extension',
    defaultDescription: 'A feature-rich Chrome extension with a polished popup interface, content script injection, background service workers, and cross-browser compatibility. Built with modern tooling.',
    techStack: [
      { name: 'React', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'styling' }
    ],
    features: [
      'Popup interface with React',
      'Content script injection',
      'Background service worker',
      'Chrome storage API integration',
      'Cross-browser manifest (V3)',
      'Hot reload development'
    ]
  },
  {
    id: 'cli-tool',
    name: 'CLI Tool',
    description: 'Node.js command-line application with interactive prompts',
    icon: '💻',
    projectName: 'my-cli',
    defaultDescription: 'A powerful command-line tool with subcommands, interactive prompts, beautiful output formatting, and configuration management. Designed for productivity and developer experience.',
    techStack: [
      { name: 'Node.js', category: 'backend' },
      { name: 'TypeScript', category: 'backend' }
    ],
    features: [
      'Subcommand architecture',
      'Interactive prompts',
      'Colorful output formatting',
      'Configuration file support',
      'Auto-generated help text',
      'Shell completion scripts'
    ]
  },
  {
    id: 'react-dashboard',
    name: 'React Admin Dashboard',
    description: 'Feature-rich admin panel with charts, tables, and CRUD operations',
    icon: '📊',
    projectName: 'admin-dashboard',
    defaultDescription: 'A comprehensive admin dashboard with data visualization, advanced data tables, user management, and real-time updates. Perfect for internal tools and back-office applications.',
    techStack: [
      { name: 'React', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'styling' },
      { name: 'Supabase', category: 'database' }
    ],
    features: [
      'Interactive data charts',
      'Sortable/filterable data tables',
      'User role management',
      'Real-time notifications',
      'Export to CSV/PDF',
      'Responsive mobile layout'
    ]
  },
  {
    id: 'fullstack-monorepo',
    name: 'Full-Stack Monorepo',
    description: 'Complete monorepo setup with shared packages, API, and web app',
    icon: '📦',
    projectName: 'my-monorepo',
    defaultDescription: 'A well-structured monorepo with shared TypeScript packages, API server, web application, and comprehensive tooling. Ideal for teams building complex applications with code sharing.',
    techStack: [
      { name: 'React', category: 'frontend' },
      { name: 'Hono', category: 'backend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'Tailwind CSS', category: 'styling' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Cloudflare', category: 'hosting' }
    ],
    features: [
      'NPM/Yarn workspaces',
      'Shared TypeScript types',
      'API with type-safe client',
      'End-to-end type safety',
      'Unified build pipeline',
      'Shared UI components'
    ]
  }
];
