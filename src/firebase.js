import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8Gb7XkQo4yDgI0TskA0P2yr7O8tgZpWQ",
  authDomain: "portfolio-2d4ae.firebaseapp.com",
  projectId: "portfolio-2d4ae",
  storageBucket: "portfolio-2d4ae.firebasestorage.app",
  messagingSenderId: "929271375882",
  appId: "1:929271375882:web:d26741576432ebb82357f3",
  measurementId: "G-NBKJ5MHCL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
