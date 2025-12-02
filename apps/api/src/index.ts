import { makeContainer } from "@budget/composition-cloudflare-worker";
import { createApp } from "./app";
import { createAppDeps } from "./deps";

// Cloudflare Workers environment
interface Env {
  SUPABASE_JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENROUTER_API_KEY?: string;
}

// Cached instances for the worker isolate lifetime.
// These persist across requests until the isolate is recycled.
let cachedApp: ReturnType<typeof createApp> | null = null;
let cachedContainer: ReturnType<typeof makeContainer> | null = null;

/**
 * Initialize or return the cached Hono app.
 * The app, deps, and container are all created once per isolate.
 */
function getApp(env: Env): ReturnType<typeof createApp> {
  if (!cachedApp) {
    cachedContainer = makeContainer({
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
      OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
    });
    const deps = createAppDeps(cachedContainer);
    cachedApp = createApp(deps);
  }
  return cachedApp;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const app = getApp(env);
    return app.fetch(request, env);
  },
};
