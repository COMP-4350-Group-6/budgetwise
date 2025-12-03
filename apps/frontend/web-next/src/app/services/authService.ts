/**
 * Auth service for use outside React components.
 * Uses the API directly with HttpOnly cookies.
 * 
 * For React components, prefer using hooks:
 * - useAuth() for auth status
 * - useAuthClient() for auth operations
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "Request failed");
  }

  return data;
}

export const authService = {
  signup: async (email: string, password: string, name: string) => {
    const data = await authFetch<{ user: UserProfile }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        defaultCurrency: "CAD",
      }),
    });

    return data.user;
  },

  login: async (email: string, password: string) => {
    const data = await authFetch<{ user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return data.user;
  },

  getMe: async (): Promise<UserProfile> => {
    const data = await authFetch<{ user: UserProfile }>("/auth/me");
    return data.user;
  },

  logout: async () => {
    await authFetch<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },
};
