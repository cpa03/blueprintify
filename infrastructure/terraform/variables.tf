# Variables configuration for Terraform

# Required variables
variable "cloudflare_api_token" {
  description = "Cloudflare API token with necessary permissions"
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

# Optional variables with defaults
variable "domain" {
  description = "Main domain for the application"
  type        = string
  default     = "blueprint-generator.dev"
}

variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "staging"
  
  validation {
    condition = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "enable_access_control" {
  description = "Enable Cloudflare Access control for production"
  type        = bool
  default     = true
}

variable "enable_rate_limiting" {
  description = "Enable rate limiting for API endpoints"
  type        = bool
  default     = true
}

variable "rate_limit_threshold" {
  description = "Number of requests allowed per minute"
  type        = number
  default     = 1000
}

variable "allowed_emails" {
  description = "Email addresses allowed to access production resources"
  type        = list(string)
  default     = ["team@blueprint-generator.dev"]
}

# Monitoring and alerting variables
variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  sensitive   = true
  default     = ""
}

variable "enable_monitoring" {
  description = "Enable advanced monitoring and alerting"
  type        = bool
  default     = true
}

# Team and organizational variables
variable "team_name" {
  description = "Team name for resource tagging"
  type        = string
  default     = "blueprint-generator-team"
}

variable "cost_center" {
  description = "Cost center for billing purposes"
  type        = string
  default     = "engineering"
}

# Security variables
variable "enable_security_headers" {
  description = "Enable security headers on all endpoints"
  type        = bool
  default     = true
}

variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = [
    "https://blueprint-generator.dev",
    "https://staging.blueprint-generator.dev",
    "http://localhost:3000"
  ]
}