// src/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// Abstracción de IA — Gemini hoy, Claude API mañana.
// La API key de Gemini se lee de Firestore (colección config/gemini)
// para que nunca esté hardcodeada en el código ni en GitHub.
// ─────────────────────────────────────────────────────────────────────────────

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Cache en memoria — solo se lee Firestore una vez por sesión
let _geminiApiKey = null;

async function getGeminiKey() {
  if (_geminiApiKey) return _geminiApiKey;

  const snap = await getDoc(doc(db, "config", "gemini"));
  if (!snap.exists()) {
    throw new Error(
      "No se encontró la configuración de Gemini en Firestore. " +
      "Crea el documento config/gemini con el campo apiKey."
    );
  }
  const key = snap.data()?.apiKey;
  if (!key) {
    throw new Error(
      "El documento config/gemini existe pero no tiene el campo apiKey."
    );
  }
  _geminiApiKey = key;
  return key;
}

// ─── Prompt maestro ───────────────────────────────────────────────────────────
const buildPrompt = (nivelLibro) => `
Eres un asistente de aprendizaje de inglés. Analizarás la imagen de una página de un libro de texto de inglés.

Tu tarea es:
1. EXTRAER todo el texto en inglés que aparece en la imagen (OCR). Incluye títulos, párrafos, ejercicios, diálogos — todo el contenido textual. Si hay texto en español (instrucciones del ejercicio, etc.) también inclúyelo tal cual.
2. TRADUCIR al español el contenido principal en inglés.
3. GENERAR preguntas de práctica organizadas en tres niveles de dificultad adaptadas al contenido extraído. El nivel del libro es "${nivelLibro || "b1"}".

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, sin backticks. El JSON debe tener exactamente esta estructura:

{
  "textoOriginal": "texto completo extraído de la imagen",
  "traduccion": "traducción al español del contenido principal",
  "preguntas": {
    "basico": [
      {
        "pregunta": "enunciado de la pregunta",
        "tipo": "comprension",
        "respuestaSugerida": "respuesta esperada o pista"
      }
    ],
    "intermedio": [
      {
        "pregunta": "enunciado de la pregunta",
        "tipo": "vocabulario",
        "respuestaSugerida": "respuesta esperada o pista"
      }
    ],
    "avanzado": [
      {
        "pregunta": "enunciado de la pregunta",
        "tipo": "gramatica",
        "respuestaSugerida": "respuesta esperada o pista"
      }
    ]
  }
}

Genera exactamente 3 preguntas por nivel (9 en total).
Los tipos válidos son: "comprension", "vocabulario", "gramatica".
Adapta la dificultad: básico = comprensión directa, intermedio = vocabulario en contexto, avanzado = análisis gramatical o de uso.
`.trim();

// ─── Cliente Gemini ────────────────────────────────────────────────────────────
async function callGemini(imageBase64, mimeType, nivelLibro) {
  const apiKey = await getGeminiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
          {
            text: buildPrompt(nivelLibro),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error Gemini: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Respuesta vacía de Gemini");

  // Limpiar posibles backticks residuales y parsear JSON
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return parsed;
}

// ─── Interfaz pública ─────────────────────────────────────────────────────────
/**
 * Procesa una imagen de página de libro de texto.
 * @param {string} imageBase64 - Imagen en base64 (sin prefijo data:...)
 * @param {string} mimeType    - "image/jpeg" | "image/png" | "image/webp"
 * @param {string} nivelLibro  - "a1" | "a2" | "b1" | "b2" | "c1" | "c2"
 * @returns {{ textoOriginal, traduccion, preguntas }}
 */
export async function procesarPagina(imageBase64, mimeType, nivelLibro) {
  // En el futuro: swap a Claude API aquí sin tocar nada más
  return callGemini(imageBase64, mimeType, nivelLibro);
}
