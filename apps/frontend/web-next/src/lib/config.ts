/**
 * App configuration for cross-domain auth.
 * 
 * Domains:
 * - auth.budgetwise.ca (Vue auth app)
 * - budgetwise.ca (this app - Next.js)
 * - api.budgetwise.ca (API)
 */
export const config = {
  // Auth app URL (for redirects)
  authAppUrl: process.env.NEXT_PUBLIC_AUTH_APP_URL || "http://localhost:5173",
  
  // API URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
  
  // Cookie domain (shared across subdomains)
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".localhost",
} as const;

/**
 * Get the API URL. Ensures it has a protocol.
 */
export function getApiUrl(): string {
  const url = config.apiUrl;
  if (url.startsWith('http')) {
    return url;
  }
  return `http://${url}`;
}

/**
 * Get the login URL with optional redirect.
 */
export function getLoginUrl(redirectPath?: string): string {
  const baseUrl = config.authAppUrl.startsWith('http') 
    ? config.authAppUrl 
    : `http://${config.authAppUrl}`;
  const loginUrl = new URL("/login", baseUrl);
  if (redirectPath) {
    loginUrl.searchParams.set("redirect", redirectPath);
  }
  return loginUrl.toString();
}

/**
 * Get the signup URL with optional redirect.
 */
export function getSignupUrl(redirectPath?: string): string {
  const baseUrl = config.authAppUrl.startsWith('http') 
    ? config.authAppUrl 
    : `http://${config.authAppUrl}`;
  const signupUrl = new URL("/signup", baseUrl);
  if (redirectPath) {
    signupUrl.searchParams.set("redirect", redirectPath);
  }
  return signupUrl.toString();
}

/**
 * Get the logout URL.
 */
export function getLogoutUrl(): string {
  const baseUrl = config.authAppUrl.startsWith('http') 
    ? config.authAppUrl 
    : `http://${config.authAppUrl}`;
  return `${baseUrl}/logout`;
}
