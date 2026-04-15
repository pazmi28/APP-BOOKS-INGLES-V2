// src/components/layout/Layout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Layout.css";

const NAV_ITEMS = [
  { to: "/libros",    icon: "📚", label: "Mis libros"  },
  { to: "/practicar", icon: "✏️", label: "Practicar"   },
  { to: "/historial", icon: "📋", label: "Historial"   },
];

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const userInitial = user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="layout">
      {/* ── Overlay mobile ── */}
      {menuOpen && (
        <div className="layout__overlay" onClick={closeMenu} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🎓</span>
          <div>
            <div className="sidebar__logo-title">EnglishTeacher</div>
            <div className="sidebar__logo-sub">AI · Aprende con tu libro</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`
              }
              onClick={closeMenu}
            >
              <span className="sidebar__nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">{userInitial}</div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Cerrar sesión">
            ⎋
          </button>
        </div>
      </aside>

      {/* ── Área principal ── */}
      <div className="layout__main">
        {/* Topbar mobile */}
        <header className="layout__topbar">
          <button
            className="layout__hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Abrir menú"
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
          <span className="layout__topbar-title">🎓 EnglishTeacher</span>
          <div className="layout__topbar-avatar">{userInitial}</div>
        </header>

        {/* Contenido de la página */}
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
