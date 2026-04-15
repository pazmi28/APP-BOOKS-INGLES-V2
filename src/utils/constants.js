// src/utils/constants.js

export const NIVELES_INGLES = [
  { id: "a1", label: "A1", grupo: "basico", color: "a1" },
  { id: "a2", label: "A2", grupo: "basico", color: "a2" },
  { id: "b1", label: "B1", grupo: "intermedio", color: "b1" },
  { id: "b2", label: "B2", grupo: "intermedio", color: "b2" },
  { id: "c1", label: "C1", grupo: "avanzado", color: "c1" },
  { id: "c2", label: "C2", grupo: "avanzado", color: "c2" },
];

export const GRUPOS_NIVEL = [
  { id: "basico",     label: "Básico",      descripcion: "A1 – A2", niveles: ["a1", "a2"] },
  { id: "intermedio", label: "Intermedio",  descripcion: "B1 – B2", niveles: ["b1", "b2"] },
  { id: "avanzado",   label: "Avanzado",    descripcion: "C1 – C2", niveles: ["c1", "c2"] },
];

export const EMOJIS_LIBRO = ["📘", "📗", "📙", "📕", "📓", "📔", "📒", "📚"];

export const TIPO_PREGUNTA = {
  COMPRENSION:  "comprension",
  VOCABULARIO:  "vocabulario",
  GRAMATICA:    "gramatica",
};

export const TIPOS_PREGUNTA_LABEL = {
  [TIPO_PREGUNTA.COMPRENSION]: "Comprensión",
  [TIPO_PREGUNTA.VOCABULARIO]: "Vocabulario",
  [TIPO_PREGUNTA.GRAMATICA]:   "Gramática",
};

export const ESTADO_PAGINA = {
  PENDIENTE:   "pendiente",
  PRACTICADO:  "practicado",
};
