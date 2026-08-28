// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "hireready-d08c2.firebaseapp.com",
  projectId: "hireready-d08c2",
  storageBucket: "hireready-d08c2.firebasestorage.app",
  messagingSenderId: "372121718321",
  appId: "1:372121718321:web:6a23746cea3f4652b10f10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); //App create

const auth = getAuth(app);//authentication enabled in app
const googleAuthProvider = new GoogleAuthProvider();

export { app, auth, googleAuthProvider };