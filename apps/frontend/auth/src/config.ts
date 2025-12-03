/**
 * Environment configuration for auth app.
 * 
 * Domains:
 * - auth.budgetwise.ca (this app)
 * - budgetwise.ca (main app)
 * - api.budgetwise.ca (API)
 */
export const config = {
  // API endpoint
  apiUrl: import.meta.env.VITE_API_URL || "https://api.budgetwise.ca",
  
  // Main app URL (redirect after login)
  mainAppUrl: import.meta.env.VITE_MAIN_APP_URL || "https://budgetwise.ca",
  
  // Supabase config (for auth adapter)
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  
  // Cookie domain (shared across subdomains)
  cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN || ".budgetwise.ca",
} as const;
