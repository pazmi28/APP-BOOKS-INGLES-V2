// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./AuthPages.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) {
      toast.error("Rellena todos los campos");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/libros");
    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "Ese email ya está registrado"
          : "Error al crear la cuenta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🎓</div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Empieza a aprender con tu libro</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
