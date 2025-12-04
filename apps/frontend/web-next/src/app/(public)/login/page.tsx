"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/lib/config";
import { LoadingSpinner } from "@/components/ui";

/**
 * Login page - redirects to auth app or home.
 * - Authenticated users → /home
 * - Unauthenticated users → auth app login
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace("/home");
    } else {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, isLoading, router]);

  return <LoadingSpinner message="Redirecting..." />;
}
