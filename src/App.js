// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LibrosPage from "./pages/LibrosPage";
import PaginasPage from "./pages/PaginasPage"; // ← NUEVO Sprint 2
import PracticarPage from "./pages/PracticarPage";
import HistorialPage from "./pages/HistorialPage";
import "./styles/global.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", fontSize: "14px" },
          }}
        />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas con Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/libros" replace />} />
            <Route path="libros" element={<LibrosPage />} />
            {/* ── NUEVO Sprint 2: páginas de un libro ── */}
            <Route path="libros/:libroId/paginas" element={<PaginasPage />} />
            <Route path="practicar" element={<PracticarPage />} />
            <Route path="historial" element={<HistorialPage />} />
          </Route>

          {/* Catch-all — siempre al final */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
