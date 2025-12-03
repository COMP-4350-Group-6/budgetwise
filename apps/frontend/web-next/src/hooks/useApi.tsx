"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { getApiUrl } from "@/lib/config";

// ============================================================================
// API Fetch Function Type
// ============================================================================

// API v1 routes - these get the /v1 prefix
const V1_ROUTES = ['/transactions', '/categories', '/budgets'];

export type ApiFetchFn = <T = Record<string, unknown>>(
  endpoint: string,
  options?: RequestInit,
  authRequired?: boolean
) => Promise<T>;

// ============================================================================
// API Context
// ============================================================================

const ApiContext = createContext<ApiFetchFn | null>(null);

/**
 * Creates an apiFetch function that uses HttpOnly cookies for auth.
 */
function createApiFetch(): ApiFetchFn {
  return async function apiFetch<T = Record<string, unknown>>(
    endpoint: string,
    options: RequestInit = {},
    authRequired: boolean = false
  ): Promise<T> {
    const API_BASE_URL = getApiUrl();
    
    // Add /v1 prefix for versioned API routes
    const isV1Route = V1_ROUTES.some(route => endpoint.startsWith(route));
    const fullEndpoint = isV1Route ? `/v1${endpoint}` : endpoint;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${API_BASE_URL}${fullEndpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("API request failed:", {
        endpoint,
        status: res.status,
        error,
      });
      
      if (res.status === 401 && authRequired) {
        throw new Error("Authentication required - please log in again");
      }
      
      throw new Error(error?.error || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json().catch(() => undefined) as Promise<T>;
  };
}

// ============================================================================
// Provider & Hook
// ============================================================================

/**
 * Provider that creates a stable apiFetch function.
 */
export function ApiProvider({ children }: { children: ReactNode }) {
  // Memoize the fetch function so it's stable across renders
  const apiFetch = useMemo(() => createApiFetch(), []);

  return (
    <ApiContext.Provider value={apiFetch}>
      {children}
    </ApiContext.Provider>
  );
}

/**
 * Hook to get the apiFetch function.
 */
export function useApiFetch(): ApiFetchFn {
  const apiFetch = useContext(ApiContext);
  
  if (!apiFetch) {
    throw new Error('useApiFetch must be used within an ApiProvider');
  }

  return apiFetch;
}
