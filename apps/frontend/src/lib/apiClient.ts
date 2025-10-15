import { authClient } from "./authContainer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function apiFetch<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {},
  authRequired: boolean = false
): Promise<T> {
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
    console.log("Making authenticated request to:", endpoint);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  return res.json() as Promise<T>;
}
