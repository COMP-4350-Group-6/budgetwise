"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiFetch<User>("/auth/me", { method: "GET" }, true);
        setUser(res);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    const token = localStorage.getItem("accessToken");
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
