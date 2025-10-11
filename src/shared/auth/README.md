# Authentication Setup Guide

This document explains how to set up Firebase Authentication for the BudgetWise project.

## Project Structure

```
src/
├── shared/
│   └── auth/
│       ├── firebase.ts          # Firebase configuration and initialization
│       ├── authService.ts       # Authentication service methods
│       └── types.ts             # TypeScript types and interfaces
├── web-app-react/
│   └── auth/
│       ├── AuthContext.tsx     # React context provider
│       └── hooks.ts            # React authentication hooks
└── web-app-vue/
    └── auth/
        ├── useAuth.ts          # Vue authentication composable
        └── composables.ts      # Vue authentication composables
```

## Environment Setup

1. Copy `.env.example` to `.env.local` in your project root
2. Update the Firebase configuration values with your actual credentials

## React Integration

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Wrap app with AuthProvider
```tsx
import { AuthProvider } from './src/web-app-react/auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 3. Use authentication in components
```tsx
import { useAuth } from './src/web-app-react/auth/AuthContext';
import { useSignIn } from './src/web-app-react/auth/hooks';

function LoginComponent() {
  const { user, loading } = useAuth();
  const { execute: signIn, loading: signInLoading, error } = useSignIn();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn({ email, password });
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleSignIn(formData.get('email'), formData.get('password'));
    }}>
      {/* Login form */}
    </form>
  );
}
```

## Vue Integration

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Install the auth plugin
```ts
import { createApp } from 'vue';
import { authPlugin } from './src/web-app-vue/auth/useAuth';

const app = createApp(App);
app.use(authPlugin);
```

### 3. Use authentication in components
```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="user">Welcome, {{ user.email }}!</div>
  <form v-else @submit="handleSignIn">
    <!-- Login form -->
  </form>
</template>

<script setup lang="ts">
import { useAuth } from './src/web-app-vue/auth/useAuth';
import { useSignIn } from './src/web-app-vue/auth/composables';

const { user, loading } = useAuth();
const { execute: signIn, loading: signInLoading, error } = useSignIn();

const handleSignIn = async (email: string, password: string) => {
  try {
    await signIn({ email, password });
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};
</script>
```

## Available Methods

### Authentication Service
- `signIn(email, password)` - Sign in with email and password
- `signUp(email, password, displayName?)` - Create new user account
- `signOut()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `updateProfile(displayName?, photoURL?)` - Update user profile

### React Hooks
- `useAuth()` - Main authentication context
- `useSignIn()` - Sign in hook with loading/error states
- `useSignUp()` - Sign up hook with loading/error states
- `useSignOut()` - Sign out hook with loading/error states
- `usePasswordReset()` - Password reset hook with loading/error/success states
- `useProfileUpdate()` - Profile update hook with loading/error states

### Vue Composables
- `useAuth()` - Main authentication composable
- `useSignIn()` - Sign in composable with loading/error states
- `useSignUp()` - Sign up composable with loading/error states
- `useSignOut()` - Sign out composable with loading/error states
- `usePasswordReset()` - Password reset composable with loading/error/success states
- `useProfileUpdate()` - Profile update composable with loading/error states
- `useAuthGuard()` - Route guard composable for protected routes
