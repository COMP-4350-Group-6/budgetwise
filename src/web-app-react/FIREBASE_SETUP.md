# BudgetWise React App - Firebase Setup Guide

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `budgetwise` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on "Get started" if you haven't set up authentication yet
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### Step 3: Get Firebase Configuration

1. In your Firebase project console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (`</>`) to add a web app
5. Enter app nickname: `budgetwise-web`
6. **Do NOT** check "Also set up Firebase Hosting" (we'll do this later if needed)
7. Click "Register app"
8. Copy the `firebaseConfig` object that appears

### Step 4: Update Firebase Configuration

1. Open `src/firebase.ts` in your React app
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 5: Test the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser to `http://localhost:3000`

3. You should see the login page. Try creating a new account:
   - Click "Sign up"
   - Enter a valid email and password
   - Click "Sign Up"

4. After successful signup, you should be redirected to the dashboard

5. Test logout by clicking the "Logout" button

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx          # Login/Signup form
│   ├── Auth.css          # Auth component styles
│   ├── Dashboard.tsx     # Main dashboard
│   └── Dashboard.css     # Dashboard styles
├── contexts/
│   └── AuthContext.tsx   # Authentication context provider
├── firebase.ts           # Firebase configuration
├── App.tsx              # Main app with routing
└── App.css              # Global styles
```

## Features Implemented

✅ **Email/Password Authentication**
- User registration
- User login
- User logout
- Protected routes

✅ **Responsive Design**
- Mobile-friendly interface
- Clean, modern UI

✅ **Routing**
- Automatic redirects based on auth state
- Protected dashboard route

## Next Steps

After Firebase setup is complete, you can:

1. **Add Firestore Database** for storing user data
2. **Implement Budget Tracking** features
3. **Add Transaction Management**
4. **Create CSV Upload functionality**
5. **Build Spending Analysis** components

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Make sure you copied the correct API key from Firebase console

2. **"Firebase: Error (auth/email-already-in-use)"**
   - The email is already registered. Try logging in instead

3. **"Firebase: Error (auth/weak-password)"**
   - Password must be at least 6 characters long

4. **App doesn't start**
   - Make sure you're in the correct directory: `src/web-app-react`
   - Run `npm install` if dependencies are missing

### Getting Help:

- Check the browser console for detailed error messages
- Verify your Firebase configuration in the console
- Ensure Authentication is properly enabled in Firebase
