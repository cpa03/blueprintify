variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for DNS records"
  type        = string
}

variable "domain_name" {
  description = "Main domain name for the application"
  type        = string
  default     = "blueprintify.dev"
}