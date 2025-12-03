import { ref, computed, readonly, onMounted } from 'vue';
import { makeWebAuthApiContainer } from '@budget/composition-web-auth-api';
import type { AuthUser, AuthResult, AuthState, LoginInput, SignupInput } from '@budget/schemas';
import { config } from '@/config';

// Create the auth container (singleton)
let container: ReturnType<typeof makeWebAuthApiContainer> | null = null;

function getContainer() {
  if (!container) {
    container = makeWebAuthApiContainer({
      apiUrl: config.apiUrl,
    });
  }
  return container;
}

// Reactive state
const authState = ref<AuthState>({ status: 'loading' });
const isInitialized = ref(false);

/**
 * Vue composable for authentication.
 * Uses @budget/composition-web-auth-api with HttpOnly cookies.
 */
export function useAuth() {
  const isLoading = computed(() => authState.value.status === 'loading');
  const isAuthenticated = computed(() => authState.value.status === 'authenticated');
  const user = computed(() => 
    authState.value.status === 'authenticated' ? authState.value.session.user : null
  );

  /**
   * Initialize auth state on app start.
   */
  async function initialize() {
    if (isInitialized.value) return;
    
    const authContainer = getContainer();
    
    try {
      // Subscribe to auth state changes
      authContainer.authClient.subscribe((state: AuthState) => {
        authState.value = state;
      });
      
      // Initialize (checks session via /auth/me)
      await authContainer.authClient.initialize();
      isInitialized.value = true;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      authState.value = { status: 'unauthenticated' };
    }
  }

  /**
   * Login with email and password.
   */
  async function login(input: LoginInput): Promise<AuthResult<{ user: AuthUser }>> {
    const authContainer = getContainer();
    return authContainer.authClient.login(input);
  }

  /**
   * Signup with email, password, and name.
   */
  async function signup(input: SignupInput): Promise<AuthResult<{ user: AuthUser; requiresConfirmation: boolean }>> {
    const authContainer = getContainer();
    return authContainer.authClient.signup(input);
  }

  /**
   * Logout and clear session.
   */
  async function logout(): Promise<AuthResult<void>> {
    const authContainer = getContainer();
    return authContainer.authClient.logout();
  }

  /**
   * Redirect to main app after successful auth.
   */
  function redirectToMainApp(path = '/home') {
    const mainUrl = config.mainAppUrl.startsWith('http') 
      ? config.mainAppUrl 
      : `http://${config.mainAppUrl}`;
    window.location.href = `${mainUrl}${path}`;
  }

  return {
    // State
    authState: readonly(authState),
    isLoading,
    isAuthenticated,
    user,
    
    // Actions
    initialize,
    login,
    signup,
    logout,
    redirectToMainApp,
  };
}

// Re-export types from schemas
export type { AuthResult, LoginInput, SignupInput } from '@budget/schemas';
