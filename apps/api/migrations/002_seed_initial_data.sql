-- Migration: 002_seed_initial_data
-- Description: Seed initial tech stack options and templates
-- Created: 2026-02-05
-- Database: Cloudflare D1 (SQLite)

-- Run this migration with: wrangler d1 execute blueprintify-db --file=migrations/002_seed_initial_data.sql

-- ===== Seed Tech Stack Options =====

-- Frontend technologies
INSERT INTO tech_stack_options (name, category) VALUES 
('React', 'frontend'),
('Vue.js', 'frontend'),
('Next.js', 'frontend'),
('Svelte', 'frontend'),
('Angular', 'frontend'),
('Astro', 'frontend');

-- Backend technologies
INSERT INTO tech_stack_options (name, category) VALUES 
('Hono', 'backend'),
('Express', 'backend'),
('Fastify', 'backend'),
('NestJS', 'backend'),
('Django', 'backend'),
('FastAPI', 'backend');

-- Database technologies
INSERT INTO tech_stack_options (name, category) VALUES 
('PostgreSQL', 'database'),
('MySQL', 'database'),
('MongoDB', 'database'),
('Supabase', 'database'),
('Cloudflare D1', 'database'),
('PlanetScale', 'database');

-- Hosting platforms
INSERT INTO tech_stack_options (name, category) VALUES 
('Cloudflare', 'hosting'),
('Vercel', 'hosting'),
('Netlify', 'hosting'),
('AWS', 'hosting'),
('Railway', 'hosting'),
('Fly.io', 'hosting');

-- Styling technologies
INSERT INTO tech_stack_options (name, category) VALUES 
('Tailwind CSS', 'styling'),
('Styled Components', 'styling'),
('CSS Modules', 'styling'),
('Sass/SCSS', 'styling');

-- Testing frameworks
INSERT INTO tech_stack_options (name, category) VALUES 
('Jest', 'testing'),
('Vitest', 'testing'),
('Cypress', 'testing'),
('Playwright', 'testing');

-- AI/ML technologies
INSERT INTO tech_stack_options (name, category) VALUES 
('OpenAI', 'ai'),
('Anthropic', 'ai'),
('Hugging Face', 'ai'),
('TensorFlow', 'ai');

-- ===== Seed Templates =====

-- Full-Stack Web App Template
INSERT INTO templates (id, name, description, icon, project_name, default_description, category) VALUES 
('template-fullstack-webapp', 'Full-Stack Web Application', 'A complete web application with frontend, backend, database, and authentication', '🌐', 'my-webapp', 'A modern full-stack web application with React frontend, Node.js backend, PostgreSQL database, and user authentication', 'web-development');

-- API Service Template
INSERT INTO templates (id, name, description, icon, project_name, default_description, category) VALUES 
('template-api-service', 'REST API Service', 'A scalable REST API service with documentation and testing', '🔌', 'my-api', 'A professional REST API service built with Express.js, including comprehensive documentation, testing suite, and deployment configuration', 'api-development');

-- Static Site Template
INSERT INTO templates (id, name, description, icon, project_name, default_description, category) VALUES 
('template-static-site', 'Static Website', 'A fast, modern static website with SEO optimization', '📄', 'my-site', 'A blazing-fast static website using Next.js with static generation, optimized for performance and search engines', 'static-site');

-- Mobile App Template
INSERT INTO templates (id, name, description, icon, project_name, default_description, category) VALUES 
('template-mobile-app', 'Mobile Application', 'A cross-platform mobile application with native features', '📱', 'my-app', 'A cross-platform mobile application using React Native with access to device features and offline capabilities', 'mobile-development');

-- E-commerce Template
INSERT INTO templates (id, name, description, icon, project_name, default_description, category) VALUES 
('template-ecommerce', 'E-commerce Platform', 'A complete e-commerce platform with payment processing', '🛒', 'my-store', 'A full-featured e-commerce platform with product catalog, shopping cart, payment processing, and order management', 'e-commerce');

-- SaaS Template
INSERT INTO templates (id, name, description, icon, project_name, default_description, category) VALUES 
('template-saas', 'SaaS Application', 'A multi-tenant SaaS application with subscription management', '☁️', 'my-saas', 'A scalable SaaS application with multi-tenant architecture, subscription billing, and user management', 'saas');

-- ===== Associate Tech Stack with Templates =====

-- Full-Stack Web App Tech Stack
INSERT INTO template_tech_stack (template_id, tech_stack_id, version) VALUES 
('template-fullstack-webapp', (SELECT id FROM tech_stack_options WHERE name = 'React'), '18.0+'),
('template-fullstack-webapp', (SELECT id FROM tech_stack_options WHERE name = 'Hono'), '4.0+'),
('template-fullstack-webapp', (SELECT id FROM tech_stack_options WHERE name = 'PostgreSQL'), '15+'),
('template-fullstack-webapp', (SELECT id FROM tech_stack_options WHERE name = 'Tailwind CSS'), '3.0+'),
('template-fullstack-webapp', (SELECT id FROM tech_stack_options WHERE name = 'Vitest'), '1.0+'),
('template-fullstack-webapp', (SELECT id FROM tech_stack_options WHERE name = 'Cloudflare'), 'latest');

-- API Service Tech Stack
INSERT INTO template_tech_stack (template_id, tech_stack_id, version) VALUES 
('template-api-service', (SELECT id FROM tech_stack_options WHERE name = 'Hono'), '4.0+'),
('template-api-service', (SELECT id FROM tech_stack_options WHERE name = 'PostgreSQL'), '15+'),
('template-api-service', (SELECT id FROM tech_stack_options WHERE name = 'Jest'), '29.0+'),
('template-api-service', (SELECT id FROM tech_stack_options WHERE name = 'Cloudflare'), 'latest');

-- Static Site Tech Stack
INSERT INTO template_tech_stack (template_id, tech_stack_id, version) VALUES 
('template-static-site', (SELECT id FROM tech_stack_options WHERE name = 'Next.js'), '14.0+'),
('template-static-site', (SELECT id FROM tech_stack_options WHERE name = 'Tailwind CSS'), '3.0+'),
('template-static-site', (SELECT id FROM tech_stack_options WHERE name = 'Vercel'), 'latest'),
('template-static-site', (SELECT id FROM tech_stack_options WHERE name = 'Vitest'), '1.0+');

-- Mobile App Tech Stack
INSERT INTO template_tech_stack (template_id, tech_stack_id, version) VALUES 
('template-mobile-app', (SELECT id FROM tech_stack_options WHERE name = 'React'), '18.0+'),
('template-mobile-app', (SELECT id FROM tech_stack_options WHERE name = 'Styled Components'), '6.0+'),
('template-mobile-app', (SELECT id FROM tech_stack_options WHERE name = 'FastAPI'), '0.100+'),
('template-mobile-app', (SELECT id FROM tech_stack_options WHERE name = 'PostgreSQL'), '15+'),
('template-mobile-app', (SELECT id FROM tech_stack_options WHERE name = 'Cypress'), '13.0+'),
('template-mobile-app', (SELECT id FROM tech_stack_options WHERE name = 'AWS'), 'latest');

-- E-commerce Tech Stack
INSERT INTO template_tech_stack (template_id, tech_stack_id, version) VALUES 
('template-ecommerce', (SELECT id FROM tech_stack_options WHERE name = 'Next.js'), '14.0+'),
('template-ecommerce', (SELECT id FROM tech_stack_options WHERE name = 'Stripe'), 'latest'),
('template-ecommerce', (SELECT id FROM tech_stack_options WHERE name = 'PostgreSQL'), '15+'),
('template-ecommerce', (SELECT id FROM tech_stack_options WHERE name = 'Tailwind CSS'), '3.0+'),
('template-ecommerce', (SELECT id FROM tech_stack_options WHERE name = 'Vercel'), 'latest');

-- SaaS Tech Stack
INSERT INTO template_tech_stack (template_id, tech_stack_id, version) VALUES 
('template-saas', (SELECT id FROM tech_stack_options WHERE name = 'Next.js'), '14.0+'),
('template-saas', (SELECT id FROM tech_stack_options WHERE name = 'Supabase'), 'latest'),
('template-saas', (SELECT id FROM tech_stack_options WHERE name = 'Stripe'), 'latest'),
('template-saas', (SELECT id FROM tech_stack_options WHERE name = 'Tailwind CSS'), '3.0+'),
('template-saas', (SELECT id FROM tech_stack_options WHERE name = 'Vercel'), 'latest');

-- ===== Add Template Features =====

-- Full-Stack Web App Features
INSERT INTO blueprint_features (blueprint_id, feature) VALUES 
('template-fullstack-webapp', 'User authentication and authorization'),
('template-fullstack-webapp', 'Database schema design and migrations'),
('template-fullstack-webapp', 'RESTful API endpoints'),
('template-fullstack-webapp', 'Real-time updates with WebSockets'),
('template-fullstack-webapp', 'File upload functionality'),
('template-fullstack-webapp', 'Email notifications'),
('template-fullstack-webapp', 'Error handling and logging'),
('template-fullstack-webapp', 'Testing suite (unit and integration)'),
('template-fullstack-webapp', 'Docker containerization'),
('template-fullstack-webapp', 'CI/CD pipeline setup');

-- API Service Features
INSERT INTO blueprint_features (blueprint_id, feature) VALUES 
('template-api-service', 'OpenAPI/Swagger documentation'),
('template-api-service', 'Request validation and sanitization'),
('template-api-service', 'Rate limiting and throttling'),
('template-api-service', 'API key authentication'),
('template-api-service', 'Comprehensive error handling'),
('template-api-service', 'Database connection pooling'),
('template-api-service', 'API versioning'),
('template-api-service', 'Logging and monitoring'),
('template-api-service', 'Load testing setup'),
('template-api-service', 'Security best practices');

-- Static Site Features
INSERT INTO blueprint_features (blueprint_id, feature) VALUES 
('template-static-site', 'Static site generation'),
('template-static-site', 'SEO optimization'),
('template-static-site', 'Progressive Web App (PWA)'),
('template-static-site', 'Image optimization'),
('template-static-site', 'Content management system'),
('template-static-site', 'Analytics integration'),
('template-static-site', 'Contact forms'),
('template-static-site', 'Blog functionality'),
('template-static-site', 'Search functionality'),
('template-static-site', 'Performance optimization');

-- Mobile App Features
INSERT INTO blueprint_features (blueprint_id, feature) VALUES 
('template-mobile-app', 'Cross-platform compatibility'),
('template-mobile-app', 'Native device integration'),
('template-mobile-app', 'Offline functionality'),
('template-mobile-app', 'Push notifications'),
('template-mobile-app', 'Biometric authentication'),
('template-mobile-app', 'Offline data synchronization'),
('template-mobile-app', 'App store deployment'),
('template-mobile-app', 'Performance monitoring'),
('template-mobile-app', 'Crash reporting'),
('template-mobile-app', 'A/B testing framework');

-- E-commerce Features
INSERT INTO blueprint_features (blueprint_id, feature) VALUES 
('template-ecommerce', 'Product catalog management'),
('template-ecommerce', 'Shopping cart functionality'),
('template-ecommerce', 'Payment processing'),
('template-ecommerce', 'Order management'),
('template-ecommerce', 'Inventory tracking'),
('template-ecommerce', 'Customer accounts'),
('template-ecommerce', 'Product reviews and ratings'),
('template-ecommerce', 'Search and filtering'),
('template-ecommerce', 'Wishlist functionality'),
('template-ecommerce', 'Discount and coupon system');

-- SaaS Features
INSERT INTO blueprint_features (blueprint_id, feature) VALUES 
('template-saas', 'Multi-tenant architecture'),
('template-saas', 'Subscription billing'),
('template-saas', 'User management system'),
('template-saas', 'Role-based access control'),
('template-saas', 'Analytics dashboard'),
('template-saas', 'API rate limiting'),
('template-saas', 'Data backup and recovery'),
('template-saas', 'Compliance and security'),
('template-saas', 'Customer support tools'),
('template-saas', 'Feature flag management');