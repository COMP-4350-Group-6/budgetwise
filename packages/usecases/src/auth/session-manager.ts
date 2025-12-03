import type { SessionPort, AuthProviderPort } from '@budget/ports';
import type { AuthState, AuthSession, AuthUser, AuthStateChangeCallback } from '@budget/schemas';

/**
 * In-memory session manager with reactive state.
 * Manages auth state and notifies subscribers of changes.
 */
export function makeSessionManager(provider: AuthProviderPort): SessionPort {
  let state: AuthState = { status: 'loading' };
  const subscribers = new Set<AuthStateChangeCallback>();

  function notifySubscribers() {
    subscribers.forEach((cb) => cb(state));
  }

  function setState(newState: AuthState) {
    state = newState;
    notifySubscribers();
  }

  return {
    getState(): AuthState {
      return state;
    },

    getUser(): AuthUser | null {
      return state.status === 'authenticated' ? state.session.user : null;
    },

    getAccessToken(): string | null {
      return state.status === 'authenticated' ? state.session.tokens.accessToken : null;
    },

    isAuthenticated(): boolean {
      return state.status === 'authenticated';
    },

    isLoading(): boolean {
      return state.status === 'loading';
    },

    subscribe(callback: AuthStateChangeCallback): () => void {
      subscribers.add(callback);
      // Immediately call with current state
      callback(state);
      return () => {
        subscribers.delete(callback);
      };
    },

    async initialize(): Promise<void> {
      setState({ status: 'loading' });
      
      try {
        const session = await provider.getSession();
        if (session) {
          setState({ status: 'authenticated', session });
        } else {
          setState({ status: 'unauthenticated' });
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setState({ status: 'unauthenticated' });
      }
    },

    setSession(session: AuthSession): void {
      setState({ status: 'authenticated', session });
    },

    clearSession(): void {
      setState({ status: 'unauthenticated' });
    },
  };
}
