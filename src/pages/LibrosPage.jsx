// src/pages/LibrosPage.jsx
import { useState } from "react";
import useLibros from "../hooks/useLibros";
import LibroCard from "../components/libros/LibroCard";
import LibroModal from "../components/libros/LibroModal";
import "./LibrosPage.css";

const LibrosPage = () => {
  const { libros, loading, addLibro, updateLibro, deleteLibro } = useLibros();
  const [showModal, setShowModal] = useState(false);
  const [editingLibro, setEditingLibro] = useState(null);

  const handleAdd = () => {
    setEditingLibro(null);
    setShowModal(true);
  };

  const handleEdit = (libro) => {
    setEditingLibro(libro);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    let result;
    if (editingLibro) {
      result = await updateLibro(editingLibro.id, data);
    } else {
      result = await addLibro(data);
    }
    if (result.success) setShowModal(false);
  };

  const handleDelete = async (id) => {
    await deleteLibro(id);
  };

  if (loading) {
    return (
      <div className="libros-loading">
        <div className="loading-spinner" />
        <p>Cargando libros...</p>
      </div>
    );
  }

  return (
    <div className="libros-page">
      <div className="libros-header">
        <div>
          <h1 className="libros-title">Mis libros</h1>
          <p className="libros-subtitle">
            {libros.length === 0
              ? "Añade tu primer libro para empezar"
              : `${libros.length} libro${libros.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          + Nuevo libro
        </button>
      </div>

      {libros.length === 0 ? (
        <div className="libros-empty">
          <div className="libros-empty-icon">📚</div>
          <h2>Sin libros todavía</h2>
          <p>Añade el primer libro para empezar a practicar inglés</p>
          <button className="btn-add" onClick={handleAdd}>
            + Añadir primer libro
          </button>
        </div>
      ) : (
        <div className="libros-grid">
          {libros.map((libro) => (
            <LibroCard
              key={libro.id}
              libro={libro}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <LibroModal
          libro={editingLibro}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default LibrosPage;
