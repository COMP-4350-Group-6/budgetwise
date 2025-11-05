// Shared container singleton for API routes
import { makeContainer } from "@budget/composition-cloudflare-worker";

// Environment interface for Cloudflare Workers
interface Env {
  OPENROUTER_API_KEY?: string;
  SUPABASE_JWT_SECRET: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

// Get environment from global context (set in index.ts)
function getEnv(): Env | undefined {
  return (globalThis as any).__ENV__;
}

// Lazy initialization - create container on first access with env
let cachedContainer: ReturnType<typeof makeContainer> | null = null;

function getContainerInstance() {
  if (!cachedContainer) {
    const env = getEnv();
    cachedContainer = makeContainer(env);
    console.log('Container initialized with Supabase:', !!env?.SUPABASE_URL);
  }
  return cachedContainer;
}

// Export container as a getter to ensure it's initialized with env
export const container = new Proxy({} as ReturnType<typeof makeContainer>, {
  get(target, prop) {
    const instance = getContainerInstance();
    return (instance as any)[prop];
  }
});