// Vue Authentication Composable
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../shared/auth/firebase';
import { AuthService } from '../../shared/auth/authService';
import { AuthUser, AuthState, SignInCredentials, SignUpCredentials } from '../../shared/auth/types';

// Global auth state
const authState = ref<AuthState>({
  user: null,
  loading: true,
  error: null
});

// Auth state management
let unsubscribe: (() => void) | null = null;

export const useAuth = () => {
  // Computed properties
  const user = computed(() => authState.value.user);
  const loading = computed(() => authState.value.loading);
  const error = computed(() => authState.value.error);
  const isAuthenticated = computed(() => !!authState.value.user);

  // Auth methods
  const signIn = async (credentials: SignInCredentials): Promise<void> => {
    try {
      authState.value.loading = true;
      authState.value.error = null;
      await AuthService.signIn(credentials.email, credentials.password);
    } catch (err) {
      authState.value.error = err instanceof Error ? err.message : 'Sign in failed';
      throw err;
    }
  };

  const signUp = async (credentials: SignUpCredentials): Promise<void> => {
    try {
      authState.value.loading = true;
      authState.value.error = null;
      await AuthService.signUp(credentials.email, credentials.password, credentials.displayName);
    } catch (err) {
      authState.value.error = err instanceof Error ? err.message : 'Sign up failed';
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      authState.value.loading = true;
      authState.value.error = null;
      await AuthService.signOut();
    } catch (err) {
      authState.value.error = err instanceof Error ? err.message : 'Sign out failed';
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      authState.value.error = null;
      await AuthService.resetPassword(email);
    } catch (err) {
      authState.value.error = err instanceof Error ? err.message : 'Password reset failed';
      throw err;
    }
  };

  const updateProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
    try {
      authState.value.error = null;
      await AuthService.updateProfile(displayName, photoURL);
    } catch (err) {
      authState.value.error = err instanceof Error ? err.message : 'Profile update failed';
      throw err;
    }
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    if (unsubscribe) return; // Already initialized

    unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      authState.value = {
        user: user as AuthUser | null,
        loading: false,
        error: null
      };
    });
  };

  // Cleanup auth state listener
  const cleanupAuth = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    
    // Lifecycle
    initializeAuth,
    cleanupAuth
  };
};

// Vue plugin for global auth access
export const authPlugin = {
  install(app: any) {
    const auth = useAuth();
    app.provide('auth', auth);
    app.config.globalProperties.$auth = auth;
  }
};
