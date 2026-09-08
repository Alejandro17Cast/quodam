import {
  CONFIG
} from "../config.js";


/* =========================================================
   QUODAM v4 — LANGUAGE MODE
   ---------------------------------------------------------
   Responsable de:
   - Validar el modo de lectura.
   - Guardar el modo elegido durante la sesión.
   - Recuperar el modo entre páginas.
   - Indicar qué idiomas pertenecen a cada modo.
   ========================================================= */


const MODE_STORAGE_KEY =
  "quodam-reading-mode-v4";


export const READING_MODES =
  Object.freeze({
    SPANISH:
      CONFIG.modes.spanish,

    ENGLISH:
      CONFIG.modes.english,

    MIXED:
      CONFIG.modes.mixed
  });


/* =========================================================
   NORMALIZAR MODO
   ========================================================= */

export function normalizeReadingMode(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const normalized =
    value
      .trim()
      .toLowerCase();


  return isValidReadingMode(
    normalized
  )
    ? normalized
    : null;
}


/* =========================================================
   VALIDAR MODO
   ========================================================= */

export function isValidReadingMode(
  mode
) {
  return (
    mode ===
      READING_MODES.SPANISH ||
    mode ===
      READING_MODES.ENGLISH ||
    mode ===
      READING_MODES.MIXED
  );
}


/* =========================================================
   GUARDAR MODO
   ========================================================= */

export function saveReadingMode(
  mode
) {
  const normalized =
    normalizeReadingMode(
      mode
    );


  if (!normalized) {
    throw new Error(
      `Modo de lectura no válido: "${mode}".`
    );
  }


  try {
    window.sessionStorage.setItem(
      MODE_STORAGE_KEY,
      normalized
    );
  } catch (error) {
    console.warn(
      "Quodam no pudo guardar el modo de lectura:",
      error
    );
  }


  return normalized;
}


/* =========================================================
   RECUPERAR MODO
   ========================================================= */

export function getSavedReadingMode() {
  try {
    return normalizeReadingMode(
      window.sessionStorage.getItem(
        MODE_STORAGE_KEY
      )
    );
  } catch (error) {
    console.warn(
      "Quodam no pudo recuperar el modo de lectura:",
      error
    );

    return null;
  }
}


/* =========================================================
   LIMPIAR MODO
   ========================================================= */

export function clearReadingMode() {
  try {
    window.sessionStorage.removeItem(
      MODE_STORAGE_KEY
    );
  } catch (error) {
    console.warn(
      "Quodam no pudo limpiar el modo de lectura:",
      error
    );
  }
}


/* =========================================================
   IDIOMAS CORRESPONDIENTES AL MODO
   ========================================================= */

export function getModeLanguages(
  mode
) {
  const normalized =
    normalizeReadingMode(
      mode
    );


  switch (normalized) {

    case READING_MODES.SPANISH:
      return [
        "es"
      ];


    case READING_MODES.ENGLISH:
      return [
        "en"
      ];


    case READING_MODES.MIXED:
      return [
        "es",
        "en"
      ];


    default:
      throw new Error(
        `No se puede obtener idiomas para el modo "${mode}".`
      );
  }
}


/* =========================================================
   ETIQUETA DEL MODO
   ========================================================= */

export function getReadingModeLabel(
  mode
) {
  switch (
    normalizeReadingMode(
      mode
    )
  ) {

    case READING_MODES.SPANISH:
      return "Español";


    case READING_MODES.ENGLISH:
      return "English";


    case READING_MODES.MIXED:
      return "Mixto";


    default:
      return "";
  }
}