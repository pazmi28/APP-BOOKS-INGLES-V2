// src/components/paginas/SubirPaginaModal.jsx
import { useState, useRef } from "react";
import { procesarPagina } from "../../services/aiService";
import { GRUPOS_NIVEL, TIPO_PREGUNTA, TIPOS_PREGUNTA_LABEL } from "../../utils/constants";
import "./SubirPaginaModal.css";

const PASOS = {
  UPLOAD: "upload",
  PROCESANDO: "procesando",
  PREVIEW: "preview",
  GUARDANDO: "guardando",
};

const SubirPaginaModal = ({ libro, numeroPagina, onSave, onClose }) => {
  const [paso, setPaso] = useState(PASOS.UPLOAD);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [tabActivo, setTabActivo] = useState("basico");
  const fileInputRef = useRef(null);

  // ── Manejo de imagen ────────────────────────────────────────────────────────
  const procesarImagen = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Solo se aceptan imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar los 10 MB.");
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      // Extraer base64 puro (sin prefijo data:...;base64,)
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => procesarImagen(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    procesarImagen(e.dataTransfer.files[0]);
  };

  // ── Llamada a la IA ─────────────────────────────────────────────────────────
  const handleProcesar = async () => {
    if (!imageBase64) return;
    setPaso(PASOS.PROCESANDO);
    setError(null);
    try {
      const data = await procesarPagina(imageBase64, imageMime, libro.nivel);
      setResultado(data);
      setPaso(PASOS.PREVIEW);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al procesar la imagen con IA. Inténtalo de nuevo.");
      setPaso(PASOS.UPLOAD);
    }
  };

  // ── Guardar en Firebase ─────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setPaso(PASOS.GUARDANDO);
    await onSave({
      numero: numeroPagina,
      textoOriginal: resultado.textoOriginal,
      traduccion: resultado.traduccion,
      preguntas: resultado.preguntas,
    });
  };

  const handleReintentar = () => {
    setResultado(null);
    setImagePreview(null);
    setImageBase64(null);
    setImageMime(null);
    setError(null);
    setPaso(PASOS.UPLOAD);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal spm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <div>
            <h2 className="modal__title">
              {libro.portadaEmoji} Añadir página {numeroPagina}
            </h2>
            <p className="spm-subtitle">{libro.nombre}</p>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            disabled={paso === PASOS.PROCESANDO || paso === PASOS.GUARDANDO}
          >
            ✕
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="spm-progress">
          {["Subir foto", "Procesar con IA", "Revisar y guardar"].map((label, i) => {
            const pasoIdx = [PASOS.UPLOAD, PASOS.PROCESANDO, PASOS.PREVIEW].indexOf(paso);
            const done = i < pasoIdx || paso === PASOS.GUARDANDO;
            const active = i === pasoIdx;
            return (
              <div key={label} className={`spm-progress__step ${done ? "spm-progress__step--done" : ""} ${active ? "spm-progress__step--active" : ""}`}>
                <div className="spm-progress__dot">
                  {done ? "✓" : i + 1}
                </div>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="modal__body spm-body">
          {/* ── PASO 1: Upload ── */}
          {paso === PASOS.UPLOAD && (
            <div className="spm-upload">
              <div
                className={`spm-dropzone ${dragOver ? "spm-dropzone--over" : ""} ${imagePreview ? "spm-dropzone--has-image" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Página a procesar" className="spm-preview-img" />
                ) : (
                  <div className="spm-dropzone__placeholder">
                    <div className="spm-dropzone__icon">📷</div>
                    <p className="spm-dropzone__text">
                      Arrastra la foto aquí o <span>haz clic para seleccionar</span>
                    </p>
                    <p className="spm-dropzone__hint">JPG, PNG o WebP · máx. 10 MB</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {imagePreview && (
                <button
                  className="spm-btn-change"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  🔄 Cambiar imagen
                </button>
              )}

              {error && <p className="spm-error">{error}</p>}
            </div>
          )}

          {/* ── PASO 2: Procesando ── */}
          {paso === PASOS.PROCESANDO && (
            <div className="spm-procesando">
              <div className="spm-procesando__spinner">
                <div className="spm-spinner" />
              </div>
              <h3>Procesando con IA…</h3>
              <p>Extrayendo texto, traduciendo y generando preguntas</p>
              <div className="spm-procesando__steps">
                <div className="spm-procesando__step spm-procesando__step--active">🔍 Leyendo la imagen (OCR)</div>
                <div className="spm-procesando__step">🌐 Traduciendo al español</div>
                <div className="spm-procesando__step">❓ Generando preguntas MCER</div>
              </div>
            </div>
          )}

          {/* ── PASO 3: Preview ── */}
          {paso === PASOS.PREVIEW && resultado && (
            <div className="spm-preview">
              {/* Texto original */}
              <div className="spm-section">
                <h3 className="spm-section__title">📄 Texto extraído</h3>
                <div className="spm-text-box spm-text-box--english">
                  {resultado.textoOriginal}
                </div>
              </div>

              {/* Traducción */}
              <div className="spm-section">
                <h3 className="spm-section__title">🌐 Traducción al español</h3>
                <div className="spm-text-box spm-text-box--spanish">
                  {resultado.traduccion}
                </div>
              </div>

              {/* Preguntas por nivel */}
              <div className="spm-section">
                <h3 className="spm-section__title">❓ Preguntas generadas</h3>
                <div className="spm-tabs">
                  {GRUPOS_NIVEL.map((g) => (
                    <button
                      key={g.id}
                      className={`spm-tab spm-tab--${g.id} ${tabActivo === g.id ? "spm-tab--active" : ""}`}
                      onClick={() => setTabActivo(g.id)}
                    >
                      {g.label}
                      <span className="spm-tab__count">
                        {resultado.preguntas?.[g.id]?.length || 0}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="spm-preguntas">
                  {(resultado.preguntas?.[tabActivo] || []).map((p, i) => (
                    <div key={i} className="spm-pregunta">
                      <div className="spm-pregunta__header">
                        <span className="spm-pregunta__num">{i + 1}</span>
                        <span className="spm-pregunta__tipo">
                          {TIPOS_PREGUNTA_LABEL[p.tipo] || p.tipo}
                        </span>
                      </div>
                      <p className="spm-pregunta__texto">{p.pregunta}</p>
                      {p.respuestaSugerida && (
                        <p className="spm-pregunta__respuesta">
                          💡 {p.respuestaSugerida}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Guardando ── */}
          {paso === PASOS.GUARDANDO && (
            <div className="spm-procesando">
              <div className="spm-procesando__spinner">
                <div className="spm-spinner" />
              </div>
              <h3>Guardando en Firebase…</h3>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer spm-footer">
          {paso === PASOS.UPLOAD && (
            <>
              <button className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={handleProcesar}
                disabled={!imageBase64}
              >
                🤖 Procesar con IA
              </button>
            </>
          )}
          {paso === PASOS.PREVIEW && (
            <>
              <button className="btn-secondary" onClick={handleReintentar}>
                🔄 Repetir con otra foto
              </button>
              <button className="btn-primary" onClick={handleGuardar}>
                💾 Guardar página
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubirPaginaModal;
