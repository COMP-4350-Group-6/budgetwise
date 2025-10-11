// Firestore database configuration and initialization
import { getFirestore } from "firebase/firestore";
import app from "../auth/firebase";

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default db;
