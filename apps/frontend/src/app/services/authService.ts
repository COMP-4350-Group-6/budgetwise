import { authUsecases } from "@/lib/authContainer";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export const authService = {
  signup: async (email: string, password: string, name: string) => {
    await authUsecases.signUp({
      email,
      password,
      name,
      defaultCurrency: "CAD",
    });
    // For now, keep localStorage handling unchanged (no token set by Supabase directly here)
    return { id: "", email, name };
  },

  login: async (email: string, password: string) => {
    await authUsecases.signIn({ email, password });
    // Optionally mirror access token to localStorage for now if needed by apiClient
    try {
      const me = await authUsecases.getCurrentUser();
      return { id: me?.id || "", email: me?.email || email, name: me?.name || "" };
    } catch {
      return { id: "", email, name: "" };
    }
  },

  getMe: async (): Promise<UserProfile> => {
    const me = await authUsecases.getCurrentUser();
    if (!me) throw new Error("Not authenticated");
    return {
      id: me.id,
      email: me.email,
      name: me.name,
      createdAt: me.createdAt,
    };
  },

  logout: async () => {
    await authUsecases.signOut();
  },
};
