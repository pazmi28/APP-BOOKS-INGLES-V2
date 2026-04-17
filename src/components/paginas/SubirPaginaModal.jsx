// src/components/paginas/SubirPaginaModal.jsx
import { useState, useRef } from "react";
import { procesarPagina } from "../../services/aiService";
import { GRUPOS_NIVEL, TIPOS_PREGUNTA_LABEL } from "../../utils/constants";
import "./SubirPaginaModal.css";

const PASOS = {
  UPLOAD: "upload",
  PROCESANDO: "procesando",
  PREVIEW: "preview",
  GUARDANDO: "guardando",
};

const MODOS = {
  API: "api",
  MANUAL: "manual",
};

// ── Prompt maestro para Gemini web ──────────────────────────────────────────
const buildPromptManual = (nivelLibro) =>
  `Eres un asistente de aprendizaje de inglés. Analiza la imagen adjunta de una página de un libro de texto de inglés.

Tu tarea es:
1. EXTRAER todo el texto en inglés que aparece en la imagen (OCR). Incluye títulos, párrafos, ejercicios y diálogos. Si hay texto en español, inclúyelo tal cual.
2. TRADUCIR al español el contenido principal en inglés.
3. GENERAR preguntas de práctica en tres niveles de dificultad adaptadas al contenido. El nivel del libro es "${nivelLibro || "b1"}".

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin backticks ni bloques de código. Usa exactamente esta estructura:

{
  "textoOriginal": "texto completo extraído de la imagen",
  "traduccion": "traducción al español del contenido principal",
  "preguntas": {
    "basico": [
      { "pregunta": "...", "tipo": "comprension", "respuestaSugerida": "..." },
      { "pregunta": "...", "tipo": "comprension", "respuestaSugerida": "..." },
      { "pregunta": "...", "tipo": "comprension", "respuestaSugerida": "..." }
    ],
    "intermedio": [
      { "pregunta": "...", "tipo": "vocabulario", "respuestaSugerida": "..." },
      { "pregunta": "...", "tipo": "vocabulario", "respuestaSugerida": "..." },
      { "pregunta": "...", "tipo": "vocabulario", "respuestaSugerida": "..." }
    ],
    "avanzado": [
      { "pregunta": "...", "tipo": "gramatica", "respuestaSugerida": "..." },
      { "pregunta": "...", "tipo": "gramatica", "respuestaSugerida": "..." },
      { "pregunta": "...", "tipo": "gramatica", "respuestaSugerida": "..." }
    ]
  }
}

Genera exactamente 3 preguntas por nivel (9 en total).
Tipos válidos: "comprension", "vocabulario", "gramatica".
Básico = comprensión directa · Intermedio = vocabulario en contexto · Avanzado = análisis gramatical.`;

// ── Validación del JSON pegado ───────────────────────────────────────────────
const validarJSON = (texto) => {
  try {
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false, error: "No se encontró un objeto JSON válido." };
    const data = JSON.parse(match[0]);
    if (!data.textoOriginal) return { ok: false, error: 'Falta el campo "textoOriginal".' };
    if (!data.traduccion) return { ok: false, error: 'Falta el campo "traduccion".' };
    if (!data.preguntas) return { ok: false, error: 'Falta el campo "preguntas".' };
    if (!data.preguntas.basico?.length) return { ok: false, error: 'Falta "preguntas.basico" o está vacío.' };
    if (!data.preguntas.intermedio?.length) return { ok: false, error: 'Falta "preguntas.intermedio" o está vacío.' };
    if (!data.preguntas.avanzado?.length) return { ok: false, error: 'Falta "preguntas.avanzado" o está vacío.' };
    return { ok: true, data };
  } catch {
    return { ok: false, error: "JSON inválido. Revisa que no falten llaves o comillas." };
  }
};

const SubirPaginaModal = ({ libro, numeroPagina, onSave, onClose }) => {
  const [modo, setModo] = useState(MODOS.API);
  const [paso, setPaso] = useState(PASOS.UPLOAD);

  // Modo API
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Modo Manual
  const [jsonTexto, setJsonTexto] = useState("");
  const [promptCopiado, setPromptCopiado] = useState(false);

  // Compartido
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [tabActivo, setTabActivo] = useState("basico");

  const isBusy = paso === PASOS.PROCESANDO || paso === PASOS.GUARDANDO;

  // ── Modo API: manejo de imagen ───────────────────────────────────────────
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
      setImageBase64(dataUrl.split(",")[1]);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => procesarImagen(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); procesarImagen(e.dataTransfer.files[0]); };

  const handleProcesarAPI = async () => {
    if (!imageBase64) return;
    setPaso(PASOS.PROCESANDO);
    setError(null);
    try {
      const data = await procesarPagina(imageBase64, imageMime, libro.nivel);
      setResultado(data);
      setPaso(PASOS.PREVIEW);
    } catch (err) {
      setError(err.message || "Error al procesar la imagen con IA. Inténtalo de nuevo.");
      setPaso(PASOS.UPLOAD);
    }
  };

  // ── Modo Manual: copiar prompt y procesar JSON ───────────────────────────
  const handleCopiarPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildPromptManual(libro.nivel));
      setPromptCopiado(true);
      setTimeout(() => setPromptCopiado(false), 2500);
    } catch {
      setError("No se pudo copiar. Selecciona el texto manualmente.");
    }
  };

  const handleProcesarManual = () => {
    setError(null);
    const { ok, data, error: err } = validarJSON(jsonTexto);
    if (!ok) { setError(err); return; }
    setResultado(data);
    setPaso(PASOS.PREVIEW);
  };

  // ── Guardar ──────────────────────────────────────────────────────────────
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
    setJsonTexto("");
    setError(null);
    setPaso(PASOS.UPLOAD);
  };

  const handleCambiarModo = (nuevoModo) => {
    if (isBusy) return;
    setModo(nuevoModo);
    setError(null);
    setResultado(null);
    setPaso(PASOS.UPLOAD);
  };

  const promptManual = buildPromptManual(libro.nivel);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal spm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal__header">
          <div>
            <h2 className="modal__title">{libro.portadaEmoji} Añadir página {numeroPagina}</h2>
            <p className="spm-subtitle">{libro.nombre}</p>
          </div>
          <button className="modal__close" onClick={onClose} disabled={isBusy}>✕</button>
        </div>

        {/* Selector de modo — solo visible en paso UPLOAD */}
        {paso === PASOS.UPLOAD && (
          <div className="spm-modo-selector">
            <button
              className={`spm-modo-btn ${modo === MODOS.API ? "spm-modo-btn--active" : ""}`}
              onClick={() => handleCambiarModo(MODOS.API)}
            >
              📷 Procesar con API
            </button>
            <button
              className={`spm-modo-btn ${modo === MODOS.MANUAL ? "spm-modo-btn--active" : ""}`}
              onClick={() => handleCambiarModo(MODOS.MANUAL)}
            >
              📋 Pegar JSON manual
            </button>
          </div>
        )}

        {/* Barra de progreso — solo en modo API */}
        {modo === MODOS.API && paso !== PASOS.UPLOAD && (
          <div className="spm-progress">
            {["Subir foto", "Procesar con IA", "Revisar y guardar"].map((label, i) => {
              const pasoIdx = [PASOS.UPLOAD, PASOS.PROCESANDO, PASOS.PREVIEW].indexOf(paso);
              const done = i < pasoIdx || paso === PASOS.GUARDANDO;
              const active = i === pasoIdx;
              return (
                <div key={label} className={`spm-progress__step ${done ? "spm-progress__step--done" : ""} ${active ? "spm-progress__step--active" : ""}`}>
                  <div className="spm-progress__dot">{done ? "✓" : i + 1}</div>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="modal__body spm-body">

          {/* ── MODO API: Upload ── */}
          {modo === MODOS.API && paso === PASOS.UPLOAD && (
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
                    <p className="spm-dropzone__text">Arrastra la foto aquí o <span>haz clic para seleccionar</span></p>
                    <p className="spm-dropzone__hint">JPG, PNG o WebP · máx. 10 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: "none" }} />
              {imagePreview && (
                <button className="spm-btn-change" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  🔄 Cambiar imagen
                </button>
              )}
              {error && <p className="spm-error">{error}</p>}
            </div>
          )}

          {/* ── MODO API: Procesando ── */}
          {modo === MODOS.API && paso === PASOS.PROCESANDO && (
            <div className="spm-procesando">
              <div className="spm-procesando__spinner"><div className="spm-spinner" /></div>
              <h3>Procesando con IA…</h3>
              <p>Extrayendo texto, traduciendo y generando preguntas</p>
              <div className="spm-procesando__steps">
                <div className="spm-procesando__step spm-procesando__step--active">🔍 Leyendo la imagen (OCR)</div>
                <div className="spm-procesando__step">🌐 Traduciendo al español</div>
                <div className="spm-procesando__step">❓ Generando preguntas MCER</div>
              </div>
            </div>
          )}

          {/* ── MODO MANUAL: Pegar JSON ── */}
          {modo === MODOS.MANUAL && paso === PASOS.UPLOAD && (
            <div className="spm-manual">
              {/* Instrucciones */}
              <div className="spm-manual__instrucciones">
                <p className="spm-manual__intro">
                  Usa <strong>Gemini web</strong> (gratuito) para procesar la imagen y obtén el JSON.
                  Luego pégalo aquí.
                </p>
                <ol className="spm-manual__pasos">
                  <li>Copia el prompt de abajo</li>
                  <li>Ve a <a href="https://gemini.google.com" target="_blank" rel="noreferrer">gemini.google.com</a> y sube la foto de la página</li>
                  <li>Pega el prompt y envía</li>
                  <li>Copia la respuesta JSON y pégala aquí abajo</li>
                </ol>
              </div>

              {/* Prompt copiable */}
              <div className="spm-manual__prompt-box">
                <div className="spm-manual__prompt-header">
                  <span className="spm-manual__prompt-label">📝 Prompt para Gemini</span>
                  <button
                    className={`spm-manual__copy-btn ${promptCopiado ? "spm-manual__copy-btn--done" : ""}`}
                    onClick={handleCopiarPrompt}
                  >
                    {promptCopiado ? "✅ Copiado" : "📋 Copiar prompt"}
                  </button>
                </div>
                <div className="spm-manual__prompt-text">{promptManual}</div>
              </div>

              {/* Área JSON */}
              <div className="spm-manual__json-area">
                <label className="spm-manual__json-label">
                  📥 Pega aquí el JSON de Gemini
                </label>
                <textarea
                  className="spm-manual__textarea"
                  placeholder='{ "textoOriginal": "...", "traduccion": "...", "preguntas": { ... } }'
                  value={jsonTexto}
                  onChange={(e) => { setJsonTexto(e.target.value); setError(null); }}
                  rows={8}
                  spellCheck={false}
                />
                {error && <p className="spm-error">{error}</p>}
              </div>
            </div>
          )}

          {/* ── PREVIEW (compartido API y Manual) ── */}
          {paso === PASOS.PREVIEW && resultado && (
            <div className="spm-preview">
              <div className="spm-section">
                <h3 className="spm-section__title">📄 Texto extraído</h3>
                <div className="spm-text-box spm-text-box--english">{resultado.textoOriginal}</div>
              </div>
              <div className="spm-section">
                <h3 className="spm-section__title">🌐 Traducción al español</h3>
                <div className="spm-text-box spm-text-box--spanish">{resultado.traduccion}</div>
              </div>
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
                      <span className="spm-tab__count">{resultado.preguntas?.[g.id]?.length || 0}</span>
                    </button>
                  ))}
                </div>
                <div className="spm-preguntas">
                  {(resultado.preguntas?.[tabActivo] || []).map((p, i) => (
                    <div key={i} className="spm-pregunta">
                      <div className="spm-pregunta__header">
                        <span className="spm-pregunta__num">{i + 1}</span>
                        <span className="spm-pregunta__tipo">{TIPOS_PREGUNTA_LABEL[p.tipo] || p.tipo}</span>
                      </div>
                      <p className="spm-pregunta__texto">{p.pregunta}</p>
                      {p.respuestaSugerida && <p className="spm-pregunta__respuesta">💡 {p.respuestaSugerida}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Guardando ── */}
          {paso === PASOS.GUARDANDO && (
            <div className="spm-procesando">
              <div className="spm-procesando__spinner"><div className="spm-spinner" /></div>
              <h3>Guardando en Firebase…</h3>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer spm-footer">
          {paso === PASOS.UPLOAD && modo === MODOS.API && (
            <>
              <button className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn-primary" onClick={handleProcesarAPI} disabled={!imageBase64}>
                🤖 Procesar con IA
              </button>
            </>
          )}
          {paso === PASOS.UPLOAD && modo === MODOS.MANUAL && (
            <>
              <button className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn-primary" onClick={handleProcesarManual} disabled={!jsonTexto.trim()}>
                ✅ Verificar y previsualizar
              </button>
            </>
          )}
          {paso === PASOS.PREVIEW && (
            <>
              <button className="btn-secondary" onClick={handleReintentar}>
                🔄 {modo === MODOS.API ? "Repetir con otra foto" : "Volver a pegar"}
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
