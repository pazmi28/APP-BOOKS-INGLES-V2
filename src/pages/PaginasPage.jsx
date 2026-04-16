// src/pages/PaginasPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePaginas from "../hooks/usePaginas";
import useLibros from "../hooks/useLibros";
import PaginaCard from "../components/paginas/PaginaCard";
import SubirPaginaModal from "../components/paginas/SubirPaginaModal";
import { NIVELES_INGLES } from "../utils/constants";
import "./PaginasPage.css";

const PaginasPage = () => {
  const { libroId } = useParams();
  const navigate = useNavigate();
  const { getLibroById } = useLibros();
  const { paginas, loading, addPagina, deletePagina, getNextNumero } = usePaginas(libroId);
  const [showModal, setShowModal] = useState(false);

  const libro = getLibroById(libroId);
  const nivelInfo = libro ? NIVELES_INGLES.find((n) => n.id === libro.nivel) : null;

  const handleSave = async (data) => {
    const result = await addPagina(data);
    if (result.success) setShowModal(false);
  };

  if (loading) {
    return (
      <div className="pags-loading">
        <div className="loading-spinner" />
        <p>Cargando páginas…</p>
      </div>
    );
  }

  if (!libro) {
    return (
      <div className="pags-not-found">
        <p>Libro no encontrado.</p>
        <button className="btn-secondary" onClick={() => navigate("/libros")}>
          ← Volver a libros
        </button>
      </div>
    );
  }

  return (
    <div className="pags-page">
      {/* Breadcrumb */}
      <button className="pags-back" onClick={() => navigate("/libros")}>
        ← Mis libros
      </button>

      {/* Header */}
      <div className="pags-header">
        <div className="pags-header__book">
          <span className="pags-header__emoji">{libro.portadaEmoji}</span>
          <div>
            <h1 className="pags-title">{libro.nombre}</h1>
            <div className="pags-meta">
              {nivelInfo && (
                <span className={`badge-nivel ${nivelInfo.color}`}>{nivelInfo.label}</span>
              )}
              <span className="pags-count">
                {paginas.length} página{paginas.length !== 1 ? "s" : ""} añadida{paginas.length !== 1 ? "s" : ""}
              </span>
            </div>
            {libro.descripcion && (
              <p className="pags-desc">{libro.descripcion}</p>
            )}
          </div>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Añadir página
        </button>
      </div>

      {/* Lista de páginas */}
      {paginas.length === 0 ? (
        <div className="pags-empty">
          <div className="pags-empty__icon">📄</div>
          <h2>Sin páginas todavía</h2>
          <p>
            Sube la foto de una página del libro y la IA extraerá el texto,
            lo traducirá y generará preguntas de práctica automáticamente.
          </p>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            + Añadir primera página
          </button>
        </div>
      ) : (
        <div className="pags-list">
          {paginas.map((pagina) => (
            <PaginaCard
              key={pagina.id}
              pagina={pagina}
              onDelete={deletePagina}
            />
          ))}
        </div>
      )}

      {/* Modal de subida */}
      {showModal && (
        <SubirPaginaModal
          libro={libro}
          numeroPagina={getNextNumero()}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default PaginasPage;
