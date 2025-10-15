import { apiFetch } from "@/lib/apiClient";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export const authService = {
  signup: async (email: string, password: string, name: string) => {
    const body = { email, password, name };

    const res = await apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });

    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    return res.user;
  },

  login: async (email: string, password: string) => {
    const body = { email, password };

    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    return res.user;
  },

  getMe: async (): Promise<UserProfile> => {
    return apiFetch<UserProfile>("/auth/me", { method: "GET" }, true);
  },

  logout: async () => {
    await apiFetch("/auth/logout", { method: "POST" }, true);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
