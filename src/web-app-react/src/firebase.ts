// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBge5X79VWTJWZNWC8ybHzVsFqTG9NtIN8",
  authDomain: "budgetwise-5a7ff.firebaseapp.com",
  projectId: "budgetwise-5a7ff",
  storageBucket: "budgetwise-5a7ff.firebasestorage.app",
  messagingSenderId: "422809625979",
  appId: "1:422809625979:web:27e14be4bbf12db1d0c9de",
  measurementId: "G-492MZRZFTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

export default app;