# Cloudflare Terraform Configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

# Staging Environment
resource "cloudflare_workers_account" "staging" {
  account_id = var.account_id
}

resource "cloudflare_worker" "api_staging" {
  name    = "blueprint-generator-api-staging"
  content = file("${path.root}/../apps/api/dist/index.js")
}

resource "cloudflare_pages_project" "web_staging" {
  account_id = var.account_id
  name       = "blueprint-generator-web-staging"
  production_branch = "develop"
}

# Production Environment
resource "cloudflare_workers_account" "production" {
  account_id = var.account_id
}

resource "cloudflare_worker" "api_production" {
  name    = "blueprint-generator-api"
  content = file("${path.root}/../apps/api/dist/index.js")
}

resource "cloudflare_pages_project" "web_production" {
  account_id = var.account_id
  name       = "blueprint-generator-web"
  production_branch = "main"
}

# DNS Records
resource "cloudflare_record" "api_staging" {
  zone_id = var.cloudflare_zone_id
  name    = "api-staging"
  value   = "${cloudflare_worker.api_staging.name}.workers.dev"
  type    = "CNAME"
  ttl     = 3600
}

resource "cloudflare_record" "api_production" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  value   = "${cloudflare_worker.api_production.name}.workers.dev"
  type    = "CNAME"
  ttl     = 3600
}

resource "cloudflare_record" "web_production" {
  zone_id = var.cloudflare_zone_id
  name    = "app"
  value   = "${cloudflare_pages_project.web_production.name}.pages.dev"
  type    = "CNAME"
  ttl     = 3600
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for DNS records"
  type        = string
}

# Monitoring and Analytics
resource "cloudflare_account_rule" "security_headers" {
  account_id = var.account_id
  name       = "security-headers"
  action     = "set_config"
  expression = "http.request.full_uri contains \"blueprint-generator\""
  action_parameters {
    set_config {
      headers = {
        "Content-Security-Policy" = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        "X-Frame-Options" = "DENY"
        "X-Content-Type-Options" = "nosniff"
        "Referrer-Policy" = "strict-origin-when-cross-origin"
      }
    }
  }
}