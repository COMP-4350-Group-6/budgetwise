import { authClient } from "./authContainer";

// API v1 routes - these get the /v1 prefix
const V1_ROUTES = ['/transactions', '/categories', '/budgets'];

export async function apiFetch<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {},
  authRequired: boolean = false
): Promise<T> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  
  // Add /v1 prefix for versioned API routes
  const isV1Route = V1_ROUTES.some(route => endpoint.startsWith(route));
  const fullEndpoint = isV1Route ? `/v1${endpoint}` : endpoint;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authRequired) {
    // Get token directly from Supabase session
    const token = await authClient.getSessionToken();
    if (!token) {
      console.error("No authentication token available");
      throw new Error("Authentication required - please log in again");
    }
    headers["Authorization"] = `Bearer ${token}`;
    console.log("Making authenticated request to:", fullEndpoint);
  }

  const res = await fetch(`${API_BASE_URL}${fullEndpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("API request failed:", {
      endpoint,
      status: res.status,
      error,
    });
    throw new Error(error?.error || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json().catch(() => undefined) as Promise<T>;
}
