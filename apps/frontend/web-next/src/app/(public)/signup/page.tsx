"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSignupUrl } from "@/lib/config";
import { LoadingSpinner } from "@/components/ui";

/**
 * Signup page - redirects to auth app or home.
 * - Authenticated users → /home
 * - Unauthenticated users → auth app signup
 */
export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace("/home");
    } else {
      window.location.href = getSignupUrl();
    }
  }, [isAuthenticated, isLoading, router]);

  return <LoadingSpinner message="Redirecting..." />;
}
