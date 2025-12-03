import { config } from '@/config';

/**
 * Creates an API fetch function that uses HttpOnly cookies for auth.
 * Cookies are automatically sent with credentials: 'include'.
 */
export function useApiFetch() {
  const API_BASE_URL = config.apiUrl;

  /**
   * Make an authenticated API request.
   * Cookies are sent automatically for auth.
   */
  async function apiFetch<T = Record<string, unknown>>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Send HttpOnly cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || error?.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  return { apiFetch };
}
