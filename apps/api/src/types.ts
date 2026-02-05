export interface Env {
  // OpenAI Configuration
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;

  // Environment Configuration
  ENVIRONMENT?: string;

  // Monitoring Configuration
  CF_RAY?: string;
  CF_REQUEST_ID?: string;
}
