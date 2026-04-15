// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, pass) =>
    signInWithEmailAndPassword(auth, email, pass);

  const signup = (email, pass) =>
    createUserWithEmailAndPassword(auth, email, pass);

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {/* ⚠️ !loading evita parpadeo al recargar con sesión activa */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
