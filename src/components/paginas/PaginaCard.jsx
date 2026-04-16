// src/components/paginas/PaginaCard.jsx
import { useState } from "react";
import { GRUPOS_NIVEL, TIPOS_PREGUNTA_LABEL } from "../../utils/constants";
import "./PaginaCard.css";

const PaginaCard = ({ pagina, onDelete }) => {
  const [expandida, setExpandida] = useState(false);
  const [tabActivo, setTabActivo] = useState("basico");

  const totalPreguntas =
    (pagina.preguntas?.basico?.length || 0) +
    (pagina.preguntas?.intermedio?.length || 0) +
    (pagina.preguntas?.avanzado?.length || 0);

  return (
    <div className={`pag-card ${expandida ? "pag-card--expanded" : ""}`}>
      {/* Header siempre visible */}
      <div className="pag-card__header" onClick={() => setExpandida((v) => !v)}>
        <div className="pag-card__num">
          <span className="pag-card__num-label">Pág.</span>
          <span className="pag-card__num-value">{pagina.numero}</span>
        </div>
        <div className="pag-card__info">
          <p className="pag-card__excerpt">
            {pagina.textoOriginal?.slice(0, 100)}
            {pagina.textoOriginal?.length > 100 ? "…" : ""}
          </p>
          <div className="pag-card__meta">
            <span className="pag-card__badge">❓ {totalPreguntas} preguntas</span>
            {GRUPOS_NIVEL.map((g) => {
              const count = pagina.preguntas?.[g.id]?.length || 0;
              return count > 0 ? (
                <span key={g.id} className={`pag-card__badge pag-card__badge--${g.id}`}>
                  {g.descripcion}: {count}
                </span>
              ) : null;
            })}
          </div>
        </div>
        <div className="pag-card__toggle">
          {expandida ? "▲" : "▼"}
        </div>
      </div>

      {/* Contenido expandible */}
      {expandida && (
        <div className="pag-card__body">
          {/* Textos */}
          <div className="pag-card__textos">
            <div className="pag-card__texto">
              <h4 className="pag-card__texto-label">📄 Texto original</h4>
              <div className="pag-card__texto-content pag-card__texto-content--en">
                {pagina.textoOriginal}
              </div>
            </div>
            <div className="pag-card__texto">
              <h4 className="pag-card__texto-label">🌐 Traducción</h4>
              <div className="pag-card__texto-content pag-card__texto-content--es">
                {pagina.traduccion}
              </div>
            </div>
          </div>

          {/* Preguntas */}
          <div className="pag-card__preguntas-section">
            <h4 className="pag-card__texto-label">❓ Preguntas</h4>
            <div className="pag-card__tabs">
              {GRUPOS_NIVEL.map((g) => (
                <button
                  key={g.id}
                  className={`pag-card__tab pag-card__tab--${g.id} ${tabActivo === g.id ? "pag-card__tab--active" : ""}`}
                  onClick={() => setTabActivo(g.id)}
                >
                  {g.label}
                  <span className="pag-card__tab-count">
                    {pagina.preguntas?.[g.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
            <div className="pag-card__preguntas">
              {(pagina.preguntas?.[tabActivo] || []).map((p, i) => (
                <div key={i} className="pag-card__pregunta">
                  <div className="pag-card__pregunta-header">
                    <span className="pag-card__pregunta-num">{i + 1}</span>
                    <span className="pag-card__pregunta-tipo">
                      {TIPOS_PREGUNTA_LABEL[p.tipo] || p.tipo}
                    </span>
                  </div>
                  <p className="pag-card__pregunta-texto">{p.pregunta}</p>
                  {p.respuestaSugerida && (
                    <p className="pag-card__pregunta-respuesta">
                      💡 {p.respuestaSugerida}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="pag-card__actions">
            <button
              className="pag-card__btn-delete"
              onClick={() => onDelete(pagina.id)}
              title="Eliminar página"
            >
              🗑️ Eliminar página
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaCard;
