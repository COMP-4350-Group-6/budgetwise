// React Authentication Hooks
import { useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SignInCredentials, SignUpCredentials } from '../../shared/auth/types';

export const useSignIn = () => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (credentials: SignInCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await signIn(credentials.email, credentials.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  return { execute, loading, error };
};

export const useSignUp = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (credentials: SignUpCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await signUp(credentials.email, credentials.password, credentials.displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signUp]);

  return { execute, loading, error };
};

export const useSignOut = () => {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  return { execute, loading, error };
};

export const usePasswordReset = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetPassword]);

  return { execute, loading, error, success };
};

export const useProfileUpdate = () => {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (displayName?: string, photoURL?: string) => {
    try {
      setLoading(true);
      setError(null);
      await updateProfile(displayName, photoURL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateProfile]);

  return { execute, loading, error };
};
