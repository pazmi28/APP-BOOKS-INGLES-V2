// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ IMPORTANTE: Sustituye estos valores por los de tu proyecto Firebase
// Firebase Console → Configuración del proyecto → Tus apps → Config
const firebaseConfig = {
  apiKey: "AIzaSyBUXgGa_sfTd-QB6FnW6ryPYaZlxN193Mk",
  authDomain: "app-books-ingles-v2.firebaseapp.com",
  projectId: "app-books-ingles-v2",
  storageBucket: "app-books-ingles-v2.firebasestorage.app",
  messagingSenderId: "56089629200",
  appId: "1:56089629200:web:3e22e54797e6728ee2f095",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
