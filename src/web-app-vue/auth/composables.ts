// Vue Authentication Hooks/Composables
import { ref, computed } from 'vue';
import { useAuth } from './useAuth';
import { SignInCredentials, SignUpCredentials } from '../../shared/auth/types';

export const useSignIn = () => {
  const { signIn } = useAuth();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (credentials: SignInCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      await signIn(credentials);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useSignUp = () => {
  const { signUp } = useAuth();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (credentials: SignUpCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      await signUp(credentials);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign up failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const useSignOut = () => {
  const { signOut } = useAuth();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async () => {
    try {
      loading.value = true;
      error.value = null;
      await signOut();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

export const usePasswordReset = () => {
  const { resetPassword } = useAuth();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  const execute = async (email: string) => {
    try {
      loading.value = true;
      error.value = null;
      success.value = false;
      await resetPassword(email);
      success.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error, success };
};

export const useProfileUpdate = () => {
  const { updateProfile } = useAuth();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async (displayName?: string, photoURL?: string) => {
    try {
      loading.value = true;
      error.value = null;
      await updateProfile(displayName, photoURL);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile update failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { execute, loading, error };
};

// Route guard composable
export const useAuthGuard = () => {
  const { user, loading, isAuthenticated } = useAuth();

  const requireAuth = computed(() => {
    if (loading.value) return 'loading';
    if (!isAuthenticated.value) return 'unauthorized';
    return 'authorized';
  });

  return { requireAuth, user, loading, isAuthenticated };
};
