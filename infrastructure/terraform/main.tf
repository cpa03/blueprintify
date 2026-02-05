# Terraform Configuration for Blueprint Generator Infrastructure
# This file defines the cloud infrastructure as code

terraform {
  required_version = ">= 1.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  # Store state in Cloudflare R2 for reliability
  backend "s3" {
    bucket = "blueprint-generator-tf-state"
    key    = "terraform.tfstate"
    region = "auto"
    endpoint = "https://r2.cloudflarestorage.com"
    
    # These should be set as environment variables
    # access_key = var.aws_access_key
    # secret_key = var.aws_secret_key
  }
}

# Cloudflare provider configuration
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Variables
variable "cloudflare_api_token" {
  description = "Cloudflare API token with necessary permissions"
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "domain" {
  description = "Main domain for the application"
  type        = string
  default     = "blueprint-generator.dev"
}

# R2 Storage for Terraform State
resource "cloudflare_r2_bucket" "tf_state" {
  account_id = var.account_id
  name       = "blueprint-generator-tf-state"
  location   = "auto"
}

# Cloudflare Workers
resource "cloudflare_worker_script" "api_staging" {
  account_id = var.account_id
  name       = "blueprint-generator-api-staging"
  content    = file("${path.module}/../apps/api/dist/index.js")
  
  # Bind secrets (these will be set via Wrangler, not Terraform)
  # But we can define the structure here
}

resource "cloudflare_worker_script" "api_production" {
  account_id = var.account_id
  name       = "blueprint-generator-api-prod"
  content    = file("${path.module}/../apps/api/dist/index.js")
}

# Cloudflare Pages for Web Application
resource "cloudflare_pages_project" "web_staging" {
  account_id = var.account_id
  name       = "blueprint-generator-staging"
  production_branch = "main"
  
  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
    root_dir       = "apps/web"
  }
}

resource "cloudflare_pages_project" "web_production" {
  account_id = var.account_id
  name       = "blueprint-generator"
  production_branch = "main"
  
  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
    root_dir       = "apps/web"
  }
}

# DNS Records
resource "cloudflare_record" "api_staging" {
  zone_id = data.cloudflare_zone.main.id
  name    = "api-staging"
  value   = "blueprint-generator-api-staging.workers.dev"
  type    = "CNAME"
  ttl     = 3600
}

resource "cloudflare_record" "api_production" {
  zone_id = data.cloudflare_zone.main.id
  name    = "api"
  value   = "blueprint-generator-api-prod.workers.dev"
  type    = "CNAME"
  ttl     = 3600
}

resource "cloudflare_record" "staging" {
  zone_id = data.cloudflare_zone.main.id
  name    = "staging"
  value   = "blueprint-generator-staging.pages.dev"
  type    = "CNAME"
  ttl     = 3600
}

# Data source for the main domain zone
data "cloudflare_zone" "main" {
  name = var.domain
}

# KV Storage for caching and session management
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.account_id
  title      = "blueprint-generator-cache"
}

# D1 Database (if needed)
resource "cloudflare_d1_database" "main" {
  account_id = var.account_id
  name       = "blueprint-generator-db"
  # This is optional - only needed if using D1
}

# Analytics and Monitoring
resource "cloudflare analytics_engine" "main" {
  account_id = var.account_id
}

# Access control for production endpoints
resource "cloudflare_access_policy" "production_api" {
  account_id     = var.account_id
  application_id = cloudflare_access_rule.production_api.id
  name           = "Allow Production API Access"
  precedence     = 100
  decision       = "allow"

  include {
    email = ["team@blueprint-generator.dev"]
  }
}

resource "cloudflare_access_rule" "production_api" {
  account_id = var.account_id
  type       = "application"
  value      = "blueprint-generator-api-prod.workers.dev"
}

# Rate limiting for API endpoints
resource "cloudflare_rate_limit" "api" {
  account_id = var.account_id
  zone_id    = data.cloudflare_zone.main.id
  threshold  = 1000
  period     = 60

  match {
    request {
      url_pattern = "*api*"
      schemes     = ["HTTP", "HTTPS"]
      methods     = ["GET", "POST", "PUT", "DELETE"]
    }
  }

  action {
    mode    = "simulate" # Change to "ban" for production
    timeout = 3600
  }
}

# Custom domain SSL certificates (automatically managed by Cloudflare)
# This section ensures proper SSL configuration for all domains

# Output important values
output "staging_api_url" {
  description = "Staging API endpoint"
  value       = "https://blueprint-generator-api-staging.workers.dev"
}

output "production_api_url" {
  description = "Production API endpoint" 
  value       = "https://blueprint-generator-api-prod.workers.dev"
}

output "staging_web_url" {
  description = "Staging web application URL"
  value       = "https://staging.blueprint-generator.dev"
}

output "production_web_url" {
  description = "Production web application URL"
  value       = "https://blueprint-generator.dev"
}

output "kv_namespace_id" {
  description = "KV namespace ID for caching"
  value       = cloudflare_workers_kv_namespace.cache.id
}

output "d1_database_id" {
  description = "D1 database ID"
  value       = cloudflare_d1_database.main.id
}