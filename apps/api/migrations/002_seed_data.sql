-- Seed Data for Blueprint Generator
-- Migration: 002_seed_data.sql
-- Created: 2026-02-05

-- Insert default templates
INSERT INTO templates (id, name, description, icon, category, default_description, project_name_template) VALUES
('web-app-starter', 'Web Application', 'Full-stack web application with modern tech stack', '🚀', 'web', 'A modern web application with user authentication, database integration, and responsive design.', '{projectName}-web-app'),
('mobile-app', 'Mobile Application', 'Cross-platform mobile application', '📱', 'mobile', 'Cross-platform mobile application with offline support and native integrations.', '{projectName}-mobile'),
('api-service', 'API Service', 'RESTful API service with authentication', '⚡', 'api', 'Scalable RESTful API service with authentication, documentation, and monitoring.', '{projectName}-api'),
('microservice', 'Microservice', 'Containerized microservice with CI/CD', '🔧', 'microservice', 'Containerized microservice with automated deployment, monitoring, and scaling.', '{projectName}-service'),
('saas-platform', 'SaaS Platform', 'Multi-tenant SaaS platform', '💼', 'saas', 'Multi-tenant SaaS platform with subscription management, analytics, and enterprise features.', '{projectName}-saas');

-- Insert template tech stack options
INSERT INTO template_tech_stack (id, template_id, name, category, is_default, sort_order) VALUES
-- Web Application defaults
('web-react', 'web-app-starter', 'React', 'frontend', 1, 1),
('web-nextjs', 'web-app-starter', 'Next.js', 'frontend', 0, 2),
('web-vue', 'web-app-starter', 'Vue.js', 'frontend', 0, 3),
('web-hono', 'web-app-starter', 'Hono', 'backend', 1, 1),
('web-express', 'web-app-starter', 'Express', 'backend', 0, 2),
('web-postgresql', 'web-app-starter', 'PostgreSQL', 'database', 1, 1),
('web-mongodb', 'web-app-starter', 'MongoDB', 'database', 0, 2),
('web-vercel', 'web-app-starter', 'Vercel', 'hosting', 1, 1),
('web-cloudflare', 'web-app-starter', 'Cloudflare', 'hosting', 0, 2),
('web-tailwind', 'web-app-starter', 'Tailwind CSS', 'styling', 1, 1),

-- Mobile Application defaults
('mobile-react-native', 'mobile-app', 'React Native', 'frontend', 1, 1),
('mobile-flutter', 'mobile-app', 'Flutter', 'frontend', 0, 2),
('mobile-expo', 'mobile-app', 'Expo', 'backend', 1, 1),
('mobile-firebase', 'mobile-app', 'Firebase', 'database', 1, 1),
('mobile-aws', 'mobile-app', 'AWS', 'hosting', 1, 1),

-- API Service defaults
('api-hono', 'api-service', 'Hono', 'backend', 1, 1),
('api-express', 'api-service', 'Express', 'backend', 0, 2),
('api-fastify', 'api-service', 'Fastify', 'backend', 0, 3),
('api-postgresql', 'api-service', 'PostgreSQL', 'database', 1, 1),
('api-mongodb', 'api-service', 'MongoDB', 'database', 0, 2),
('api-redis', 'api-service', 'Redis', 'database', 0, 3),
('api-railway', 'api-service', 'Railway', 'hosting', 1, 1),
('api-aws', 'api-service', 'AWS', 'hosting', 0, 2),

-- Microservice defaults
('ms-hono', 'microservice', 'Hono', 'backend', 1, 1),
('ms-docker', 'microservice', 'Docker', 'hosting', 1, 1),
('ms-kubernetes', 'microservice', 'Kubernetes', 'hosting', 0, 2),
('ms-postgresql', 'microservice', 'PostgreSQL', 'database', 1, 1),
('ms-redis', 'microservice', 'Redis', 'database', 0, 2),
('ms-prometheus', 'microservice', 'Prometheus', 'testing', 1, 1),

-- SaaS Platform defaults
('saas-nextjs', 'saas-platform', 'Next.js', 'frontend', 1, 1),
('saas-hono', 'saas-platform', 'Hono', 'backend', 1, 1),
('saas-postgresql', 'saas-platform', 'PostgreSQL', 'database', 1, 1),
('saas-stripe', 'saas-platform', 'Stripe', 'ai', 1, 1),
('saas-aws', 'saas-platform', 'AWS', 'hosting', 1, 1),
('saas-datadog', 'saas-platform', 'Datadog', 'testing', 0, 1);

-- Insert template features
INSERT INTO template_features (id, template_id, feature, sort_order) VALUES
-- Web Application features
('web-auth-1', 'web-app-starter', 'User Authentication & Authorization', 1),
('web-db-1', 'web-app-starter', 'Database Integration', 2),
('web-resp-1', 'web-app-starter', 'Responsive Design', 3),
('web-api-1', 'web-app-starter', 'REST API Endpoints', 4),
('web-test-1', 'web-app-starter', 'Unit & Integration Tests', 5),

-- Mobile Application features
('mobile-auth-1', 'mobile-app', 'User Authentication', 1),
('mobile-offline-1', 'mobile-app', 'Offline Support', 2),
('mobile-push-1', 'mobile-app', 'Push Notifications', 3),
('mobile-camera-1', 'mobile-app', 'Camera & Media Access', 4),
('mobile-gps-1', 'mobile-app', 'GPS & Location Services', 5),

-- API Service features
('api-auth-1', 'api-service', 'JWT Authentication', 1),
('api-docs-1', 'api-service', 'API Documentation', 2),
('api-rate-1', 'api-service', 'Rate Limiting', 3),
('api-log-1', 'api-service', 'Request Logging', 4),
('api-monitor-1', 'api-service', 'Health Monitoring', 5),

-- Microservice features
('ms-container-1', 'microservice', 'Docker Containerization', 1),
('ms-k8s-1', 'microservice', 'Kubernetes Deployment', 2),
('ms-cicd-1', 'microservice', 'CI/CD Pipeline', 3),
('ms-monitor-1', 'microservice', 'Monitoring & Logging', 4),
('ms-scaling-1', 'microservice', 'Auto-scaling Configuration', 5),

-- SaaS Platform features
('saas-multi-1', 'saas-platform', 'Multi-tenant Architecture', 1),
('saas-sub-1', 'saas-platform', 'Subscription Management', 2),
('saas-analytics-1', 'saas-platform', 'Analytics Dashboard', 3),
('saas-admin-1', 'saas-platform', 'Admin Panel', 4),
('saas-billing-1', 'saas-platform', 'Billing System', 5);