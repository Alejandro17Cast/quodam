import {
  normalizeReadingMode
} from "./languageMode.js";


/* =========================================================
   QUODAM v4 — READING SESSION
   ---------------------------------------------------------
   Mantiene la aventura actual entre index.html
   y lectura.html.

   Una sesión puede contener:

   Español:
   [ lectura ES ]

   English:
   [ reading EN ]

   Mixto:
   [ lectura ES, reading EN ]

   o:

   [ reading EN, lectura ES ]
   ========================================================= */


const SESSION_KEY =
  "quodam-reading-session-v4";


const SESSION_VERSION =
  4;


/* =========================================================
   CREAR SESIÓN
   ========================================================= */

export function createReadingSession({
  mode,
  readings
}) {
  const normalizedMode =
    normalizeReadingMode(
      mode
    );


  if (!normalizedMode) {
    throw new Error(
      `No se puede crear una sesión con el modo "${mode}".`
    );
  }


  const validReadings =
    validateSessionReadings(
      normalizedMode,
      readings
    );


  const session = {
    version:
      SESSION_VERSION,

    mode:
      normalizedMode,

    readings:
      validReadings,

    currentIndex:
      0,

    createdAt:
      Date.now()
  };


  saveSession(
    session
  );


  return session;
}


/* =========================================================
   RECUPERAR SESIÓN
   ========================================================= */

export function getReadingSession() {
  try {
    const raw =
      window.sessionStorage.getItem(
        SESSION_KEY
      );


    if (!raw) {
      return null;
    }


    const session =
      JSON.parse(
        raw
      );


    if (
      !isValidStoredSession(
        session
      )
    ) {
      clearReadingSession();

      return null;
    }


    return session;

  } catch (error) {
    console.warn(
      "Quodam no pudo recuperar la sesión de lectura:",
      error
    );


    return null;
  }
}


/* =========================================================
   LECTURA ACTUAL
   ========================================================= */

export function getCurrentSessionReading() {
  const session =
    getReadingSession();


  if (!session) {
    return null;
  }


  return (
    session.readings[
      session.currentIndex
    ] ??
    null
  );
}


/* =========================================================
   BUSCAR UNA LECTURA EN LA SESIÓN
   ========================================================= */

export function getSessionReadingById(
  readingId
) {
  const id =
    normalizeReadingId(
      readingId
    );


  if (!id) {
    return null;
  }


  const session =
    getReadingSession();


  if (!session) {
    return null;
  }


  return (
    session.readings.find(
      (reading) =>
        reading.id ===
        id
    ) ??
    null
  );
}


/* =========================================================
   SINCRONIZAR POSICIÓN POR ID
   ========================================================= */

export function setSessionCurrentReadingById(
  readingId
) {
  const id =
    normalizeReadingId(
      readingId
    );


  if (!id) {
    return null;
  }


  const session =
    getReadingSession();


  if (!session) {
    return null;
  }


  const index =
    session.readings.findIndex(
      (reading) =>
        reading.id ===
        id
    );


  if (
    index <
    0
  ) {
    return null;
  }


  session.currentIndex =
    index;


  saveSession(
    session
  );


  return session.readings[
    index
  ];
}


/* =========================================================
   SIGUIENTE LECTURA
   ========================================================= */

export function getNextSessionReading() {
  const session =
    getReadingSession();


  if (!session) {
    return null;
  }


  return (
    session.readings[
      session.currentIndex +
      1
    ] ??
    null
  );
}


/* =========================================================
   AVANZAR
   ========================================================= */

export function advanceReadingSession() {
  const session =
    getReadingSession();


  if (!session) {
    return null;
  }


  const nextIndex =
    session.currentIndex +
    1;


  if (
    nextIndex >=
    session.readings.length
  ) {
    return null;
  }


  session.currentIndex =
    nextIndex;


  saveSession(
    session
  );


  return session.readings[
    nextIndex
  ];
}


/* =========================================================
   LIMPIAR
   ========================================================= */

export function clearReadingSession() {
  try {
    window.sessionStorage.removeItem(
      SESSION_KEY
    );

  } catch (error) {
    console.warn(
      "No se pudo limpiar la sesión de lectura:",
      error
    );
  }
}


/* =========================================================
   VALIDAR LECTURAS
   ========================================================= */

function validateSessionReadings(
  mode,
  readings
) {
  if (
    !Array.isArray(
      readings
    ) ||
    readings.length ===
      0
  ) {
    throw new Error(
      "La sesión debe contener lecturas."
    );
  }


  const cleanReadings =
    readings.map(
      (reading) => {

        if (
          !reading ||
          typeof reading !==
            "object" ||
          Array.isArray(
            reading
          )
        ) {
          throw new Error(
            "La sesión contiene una lectura inválida."
          );
        }


        const id =
          normalizeReadingId(
            reading.id
          );


        if (!id) {
          throw new Error(
            "Una lectura de la sesión no tiene ID."
          );
        }


        if (
          reading.language !==
            "es" &&
          reading.language !==
            "en"
        ) {
          throw new Error(
            `La lectura "${id}" no tiene idioma válido.`
          );
        }


        return {
          ...reading,

          id
        };
      }
    );


  if (
    mode ===
    "mixed"
  ) {
    if (
      cleanReadings.length !==
      2
    ) {
      throw new Error(
        "Una sesión mixta debe contener exactamente dos lecturas."
      );
    }


    const languages =
      new Set(
        cleanReadings.map(
          (reading) =>
            reading.language
        )
      );


    if (
      !languages.has(
        "es"
      ) ||
      !languages.has(
        "en"
      )
    ) {
      throw new Error(
        "Una sesión mixta necesita una lectura en español y una en inglés."
      );
    }


    return cleanReadings;
  }


  if (
    cleanReadings.length !==
    1
  ) {
    throw new Error(
      "Una sesión de un idioma debe contener una sola lectura."
    );
  }


  if (
    cleanReadings[0].language !==
    mode
  ) {
    throw new Error(
      "El idioma de la lectura no coincide con el modo."
    );
  }


  return cleanReadings;
}


/* =========================================================
   VALIDAR SESIÓN GUARDADA
   ========================================================= */

function isValidStoredSession(
  session
) {
  if (
    !session ||
    typeof session !==
      "object"
  ) {
    return false;
  }


  if (
    session.version !==
    SESSION_VERSION
  ) {
    return false;
  }


  if (
    !normalizeReadingMode(
      session.mode
    )
  ) {
    return false;
  }


  if (
    !Array.isArray(
      session.readings
    ) ||
    session.readings.length ===
      0
  ) {
    return false;
  }


  if (
    !Number.isInteger(
      session.currentIndex
    ) ||
    session.currentIndex <
      0 ||
    session.currentIndex >=
      session.readings.length
  ) {
    return false;
  }


  return true;
}


/* =========================================================
   GUARDAR SESIÓN
   ========================================================= */

function saveSession(
  session
) {
  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(
        session
      )
    );

  } catch (error) {
    /*
     * No bloqueamos la navegación.
     * lectura.html todavía tendrá un fallback.
     */
    console.warn(
      "Quodam no pudo guardar la sesión de lectura:",
      error
    );
  }
}


/* =========================================================
   NORMALIZAR ID
   ========================================================= */

function normalizeReadingId(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }


  const normalized =
    value.trim();


  return normalized ||
    null;
}