import { app } from "./app";

// Cloudflare Workers export with environment support
interface Env {
  SUPABASE_JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENROUTER_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Make environment available globally for container initialization
    // This is a workaround for the singleton pattern with Cloudflare Workers
    (globalThis as any).__ENV__ = env;
    
    return app.fetch(request, env);
  },
};
