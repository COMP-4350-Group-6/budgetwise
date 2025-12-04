"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { WebAuthApiContainerType } from "@budget/composition-web-auth-api";
import type { AuthUser, AuthState } from "@budget/schemas";
import { LoadingSpinner } from "@/components/ui";

/** Auth client type derived from container */
type AuthClient = WebAuthApiContainerType["authClient"];

// Context for the auth client
const AuthContext = createContext<AuthClient | null>(null);

/**
 * Provider component that initializes auth and provides context.
 * Should be placed at the root of the app to provide auth globally.
 */
export function AuthProvider({ 
  children, 
  authClient 
}: { 
  children: ReactNode; 
  authClient: AuthClient;
}) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    authClient.initialize().then(() => setInitialized(true));
  }, [authClient]);

  if (!initialized) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <AuthContext.Provider value={authClient}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to get the full auth client for auth operations.
 * Use this when you need to perform auth actions, not just check status.
 */
export function useAuthClient(): AuthClient {
  const authClient = useContext(AuthContext);
  
  if (!authClient) {
    throw new Error('useAuthClient must be used within an AuthProvider');
  }

  return authClient;
}

/**
 * Hook for checking auth status (lighter weight).
 * Use this when you only need to know if user is authenticated.
 */
export function useAuth() {
  const authClient = useContext(AuthContext);
  
  if (!authClient) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [isAuthenticated, setIsAuthenticated] = useState(authClient.isAuthenticated());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(authClient.getUser());

  useEffect(() => {
    const unsubscribe = authClient.subscribe((state: AuthState) => {
      setIsAuthenticated(state.status === 'authenticated');
      setIsLoading(state.status === 'loading');
      setUser(state.status === 'authenticated' ? state.session.user : null);
    });
    return unsubscribe;
  }, [authClient]);

  const logout = useCallback(async () => {
    await authClient.logout();
  }, [authClient]);

  return { isAuthenticated, isLoading, user, logout };
}
