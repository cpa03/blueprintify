export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
  RATE_LIMIT_KV?: KVNamespace;
  API_KEY_KV?: KVNamespace;
}
