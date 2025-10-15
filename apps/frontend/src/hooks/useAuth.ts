"use client";

import { useEffect, useState } from "react";
import { authUsecases } from "@/lib/authContainer";

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
        const me = await authUsecases.getCurrentUser();
        if (me) setUser({ id: me.id, email: me.email, name: me.name });
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
