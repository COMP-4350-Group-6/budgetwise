// React Authentication Context and Provider
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../shared/auth/firebase';
import { AuthService } from '../shared/auth/authService';
import { AuthContextType, AuthUser, AuthState } from '../shared/auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setAuthState({
        user: user as AuthUser | null,
        loading: false,
        error: null
      });
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await AuthService.signIn(email, password);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred during sign in'
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await AuthService.signUp(email, password);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred during sign up'
      }));
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await AuthService.signOut();
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred during sign out'
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      await AuthService.resetPassword(email);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An error occurred during password reset'
      }));
      throw error;
    }
  };

  const updateProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      await AuthService.updateProfile(displayName, photoURL);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An error occurred during profile update'
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>; // You can replace this with a proper loading component
    }
    
    if (!user) {
      return <div>Please sign in to access this page.</div>; // You can replace this with a redirect to login
    }
    
    return <Component {...props} />;
  };
};
