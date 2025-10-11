// Authentication service with Firebase Auth methods
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User,
  AuthError as FirebaseAuthError
} from "firebase/auth";
import { auth } from "./firebase";

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error as FirebaseAuthError);
    }
  }

  /**
   * Create a new user account with email and password
   */
  static async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error as FirebaseAuthError);
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error as FirebaseAuthError);
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error as FirebaseAuthError);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(displayName?: string, photoURL?: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }
      
      await firebaseUpdateProfile(user, {
        displayName,
        photoURL
      });
    } catch (error) {
      throw this.handleAuthError(error as FirebaseAuthError);
    }
  }

  /**
   * Handle Firebase Auth errors and convert to user-friendly messages
   */
  private static handleAuthError(error: FirebaseAuthError): Error {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    const message = errorMessages[error.code] || error.message;
    return new Error(message);
  }
}
