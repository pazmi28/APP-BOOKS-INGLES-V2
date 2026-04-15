// src/components/libros/LibroModal.jsx
import { useState } from "react";
import { NIVELES_INGLES, EMOJIS_LIBRO } from "../../utils/constants";
import "./LibroModal.css";

const LibroModal = ({ libro, onSave, onClose }) => {
  const [nombre, setNombre] = useState(libro?.nombre || "");
  const [nivel, setNivel] = useState(libro?.nivel || "b1");
  const [descripcion, setDescripcion] = useState(libro?.descripcion || "");
  const [portadaEmoji, setPortadaEmoji] = useState(libro?.portadaEmoji || "📘");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim()) {
      return;
    }
    setSaving(true);
    await onSave({ nombre: nombre.trim(), nivel, descripcion: descripcion.trim(), portadaEmoji });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {libro ? "Editar libro" : "Nuevo libro"}
          </h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {/* Emoji selector */}
          <div className="form-group">
            <label className="form-label">Icono del libro</label>
            <div className="emoji-selector">
              {EMOJIS_LIBRO.map((e) => (
                <button
                  key={e}
                  className={`emoji-btn ${portadaEmoji === e ? "emoji-btn--active" : ""}`}
                  onClick={() => setPortadaEmoji(e)}
                  type="button"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre del libro *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: English File B2, Headway..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={60}
            />
          </div>

          {/* Nivel */}
          <div className="form-group">
            <label className="form-label">Nivel del libro</label>
            <div className="nivel-selector">
              {NIVELES_INGLES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`nivel-btn ${nivel === n.id ? "nivel-btn--active" : ""} nivel-btn--${n.color}`}
                  onClick={() => setNivel(n.id)}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Ej: Libro de clase de la academia..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={150}
              rows={3}
            />
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !nombre.trim()}
          >
            {saving ? "Guardando..." : libro ? "Guardar cambios" : "Crear libro"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibroModal;
