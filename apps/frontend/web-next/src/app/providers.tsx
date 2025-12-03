"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ApiProvider } from "@/hooks/useApi";
import { ServicesProvider } from "@/hooks/useServices";
import { makeWebAuthApiContainer } from "@budget/composition-web-auth-api";
import { getApiUrl } from "@/lib/config";

// Create the auth container once (singleton at module level)
const authContainer = makeWebAuthApiContainer({
  apiUrl: getApiUrl(),
});

/**
 * Root providers component that sets up auth, API, and services contexts.
 * This is the composition root for the frontend.
 * 
 * Uses API-based auth with HttpOnly cookies for security.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider authClient={authContainer.authClient}>
      <ApiProvider>
        <ServicesProvider>
          {children}
        </ServicesProvider>
      </ApiProvider>
    </AuthProvider>
  );
}
