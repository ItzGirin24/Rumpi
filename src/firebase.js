// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";



const firebaseConfig = {
  apiKey: "AIzaSyDjjrqOfkdmjMxkExx9a5dqbFVpJpgcppM",
  authDomain: "watshapp-edcff.firebaseapp.com",
  projectId: "watshapp-edcff",
  storageBucket: "watshapp-edcff.firebasestorage.app",
  messagingSenderId: "628314800067",
  appId: "1:628314800067:web:f66bba277b0afab0888776",
  measurementId: "G-ZRP8527RQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
export const rtdb = getDatabase(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
