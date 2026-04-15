// src/components/libros/LibroCard.jsx
import { NIVELES_INGLES } from "../../utils/constants";
import "./LibroCard.css";

const LibroCard = ({ libro, onEdit, onDelete }) => {
  const nivelInfo = NIVELES_INGLES.find((n) => n.id === libro.nivel);

  return (
    <div className="libro-card">
      <div className="libro-card__emoji">{libro.portadaEmoji || "📘"}</div>
      <div className="libro-card__body">
        <h3 className="libro-card__title">{libro.nombre}</h3>
        {libro.descripcion && (
          <p className="libro-card__desc">{libro.descripcion}</p>
        )}
        <div className="libro-card__meta">
          {nivelInfo && (
            <span className={`badge-nivel ${nivelInfo.color}`}>
              {nivelInfo.label}
            </span>
          )}
          <span className="libro-card__pages">
            {libro.totalPaginas} página{libro.totalPaginas !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="libro-card__actions">
        <button
          className="libro-card__btn libro-card__btn--edit"
          onClick={() => onEdit(libro)}
          title="Editar libro"
        >
          ✏️
        </button>
        <button
          className="libro-card__btn libro-card__btn--delete"
          onClick={() => onDelete(libro.id)}
          title="Eliminar libro"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default LibroCard;
