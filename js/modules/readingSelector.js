import {
  randomItem
} from "../utils/random.js";


/* =========================================================
   QUODAM — READING SELECTOR
   ---------------------------------------------------------
   Responsabilidades:
   - Cargar lecturas.
   - Validar lecturas.
   - Elegir lecturas visuales para la ruleta.
   - Elegir el ganador SIN REPETIR hasta completar
     todo el catálogo.

   IMPORTANTE:
   Las lecturas que pasan rápidamente durante la ruleta
   NO cuentan como "ya vistas".
   Solo la lectura ganadora entra al historial.
   ========================================================= */


/* =========================================================
   HISTORIAL PERSISTENTE
   ========================================================= */

const READING_HISTORY_PREFIX =
  "quodam-reading-history-v4";


/*
 * Historial de respaldo en memoria.
 *
 * Cada idioma tiene su propio espacio.
 */
const memoryHistories =
  new Map();


/* =========================================================
   CARGAR TODAS LAS LECTURAS
   ========================================================= */

export async function loadReadings(
  indexPath
) {
  const indexURL =
    new URL(
      indexPath,
      window.location.href
    );


  const indexResponse =
    await fetch(
      indexURL
    );


  if (
    !indexResponse.ok
  ) {
    throw new Error(
      `No se pudo cargar el índice de lecturas: ${indexURL}`
    );
  }


  const readingPaths =
    await indexResponse.json();


  if (
    !Array.isArray(
      readingPaths
    )
  ) {
    throw new Error(
      "El índice de lecturas debe ser un arreglo."
    );
  }


  const readingURLs =
    readingPaths.map(
      (path) =>
        new URL(
          path,
          indexURL
        )
    );


  const results =
    await Promise.allSettled(
      readingURLs.map(
        (url) =>
          loadReading(
            url
          )
      )
    );


  const readings =
    [];


  results.forEach(
    (
      result,
      index
    ) => {
      if (
        result.status ===
        "fulfilled"
      ) {
        readings.push(
          result.value
        );

        return;
      }


      console.warn(
        "Quodam ignoró una lectura que no pudo cargarse:",
        readingURLs[index].href,
        result.reason
      );
    }
  );


  const activeReadings =
    readings.filter(
      (reading) =>
        Boolean(
          reading.active
        )
    );


  if (
    activeReadings.length ===
    0
  ) {
    throw new Error(
      "No existe ninguna lectura válida y activa."
    );
  }


  /*
   * Limpiamos del historial IDs que ya no existen
   * o que corresponden a lecturas desactivadas.
   */
  pruneReadingHistory(
    activeReadings
  );


  return activeReadings;
}


/* =========================================================
   CARGAR UNA LECTURA
   ========================================================= */

async function loadReading(
  url
) {
  const response =
    await fetch(
      url
    );


  if (
    !response.ok
  ) {
    throw new Error(
      `No se encontró la lectura (${response.status}).`
    );
  }


  const reading =
    await response.json();


  validateReading(
    reading,
    url.href
  );


  /*
   * Normalizamos los datos esenciales una vez.
   */
  reading.id =
    reading.id.trim();


  reading.title =
    reading.title.trim();


  return reading;
}


/* =========================================================
   VALIDAR LECTURA
   ========================================================= */

function validateReading(
  reading,
  source
) {
  if (
    !reading ||
    typeof reading !==
      "object" ||
    Array.isArray(
      reading
    )
  ) {
    throw new Error(
      `${source} no contiene una lectura válida.`
    );
  }


  if (
    typeof reading.id !==
      "string" ||
    reading.id.trim().length ===
      0
  ) {
    throw new Error(
      `${source} no contiene un "id" válido.`
    );
  }


  if (
    typeof reading.title !==
      "string" ||
    reading.title.trim().length ===
      0
  ) {
    throw new Error(
      `${source} no contiene un "title" válido.`
    );
  }


  if (
    !Array.isArray(
      reading.lines
    )
  ) {
    throw new Error(
      `${source}: "lines" debe ser un arreglo.`
    );
  }


  const validLines =
    reading.lines.filter(
      (line) =>
        typeof line ===
          "string" &&
        line.trim().length >
          0
    );


  if (
    validLines.length ===
    0
  ) {
    throw new Error(
      `${source} no contiene líneas de lectura válidas.`
    );
  }
}


/* =========================================================
   SELECCIÓN GANADORA SIN REPETICIONES
   ========================================================= */

/*
 * ESTA es la función que debe usar main.js para elegir
 * la lectura definitiva.
 *
 * Ejemplo con A, B, C, D:
 *
 * ciclo:
 * C → A → D → B
 *
 * Hasta que no salen las cuatro, ninguna puede repetirse.
 *
 * Al comenzar un nuevo ciclo:
 * - se limpia el historial;
 * - se evita, cuando sea posible, que la última del ciclo
 *   anterior sea inmediatamente la primera del nuevo.
 */
export function selectFinalReading(
  readings,
  previousReadingId = null
) {
  validateReadingCollection(
    readings
  );
const historyKey =
  getHistoryKey(
    readings
  );

  if (
    readings.length ===
    1
  ) {
    const onlyReading =
      readings[0];


    saveReadingHistory(
  historyKey,
  [
    onlyReading.id
  ]
);


    return onlyReading;
  }


  const validIds =
    new Set(
      readings.map(
        (reading) =>
          reading.id
      )
    );


  let history =
  getReadingHistory(
    historyKey
  )
    .filter(
        (id) =>
          validIds.has(
            id
          )
      );


  const usedIds =
    new Set(
      history
    );


  let candidates =
    readings.filter(
      (reading) =>
        !usedIds.has(
          reading.id
        )
    );


  /*
   * Todos ya aparecieron:
   * comenzamos un ciclo nuevo.
   */
  if (
    candidates.length ===
    0
  ) {
    history =
      [];


    const normalizedPreviousId =
      normalizeReadingId(
        previousReadingId
      );


    /*
     * Evitamos repetir inmediatamente la última lectura
     * del ciclo anterior cuando hay alternativas.
     */
    candidates =
      normalizedPreviousId
        ? readings.filter(
            (reading) =>
              reading.id !==
              normalizedPreviousId
          )
        : [
            ...readings
          ];


    /*
     * Protección defensiva.
     */
    if (
      candidates.length ===
      0
    ) {
      candidates =
        [
          ...readings
        ];
    }
  }


  const selected =
    randomItem(
      candidates
    );


  if (!selected) {
    throw new Error(
      "No se pudo seleccionar una lectura final."
    );
  }


  /*
   * La lectura queda registrada desde el momento en que
   * se convierte en ganadora de la ruleta.
   */
  const nextHistory = [
    ...history,
    selected.id
  ];


  saveReadingHistory(
  historyKey,
  nextHistory
);


  console.info(
    "HISTORIAL QUODAM:",
    {
      selected:
        selected.id,

      used:
        nextHistory,

      remaining:
        readings
          .map(
            (reading) =>
              reading.id
          )
          .filter(
            (id) =>
              !nextHistory.includes(
                id
              )
          )
    }
  );


  return selected;
}


/* =========================================================
   SELECCIÓN ALEATORIA NORMAL
   ---------------------------------------------------------
   Esta función NO toca el historial persistente.
   Se utiliza para lecturas pasajeras de la ruleta.
   ========================================================= */

export function selectRandomReading(
  readings,
  previousReadingId = null
) {
  validateReadingCollection(
    readings
  );


  if (
    readings.length ===
    1
  ) {
    return readings[0];
  }


  const normalizedPreviousId =
    normalizeReadingId(
      previousReadingId
    );


  const candidates =
    normalizedPreviousId
      ? readings.filter(
          (reading) =>
            reading.id !==
            normalizedPreviousId
        )
      : readings;


  return randomItem(
    candidates.length >
      0
      ? candidates
      : readings
  );
}


/* =========================================================
   SELECCIONAR UNA DISTINTA
   ---------------------------------------------------------
   Tampoco afecta el historial.
   ========================================================= */

export function selectDifferentReading(
  readings,
  currentReadingId = null
) {
  validateReadingCollection(
    readings
  );


  if (
    readings.length ===
    1
  ) {
    return readings[0];
  }


  const normalizedCurrentId =
    normalizeReadingId(
      currentReadingId
    );


  const candidates =
    normalizedCurrentId
      ? readings.filter(
          (reading) =>
            reading.id !==
            normalizedCurrentId
        )
      : readings;


  return randomItem(
    candidates.length >
      0
      ? candidates
      : readings
  );
}


/* =========================================================
   CONSULTAR HISTORIAL
   ---------------------------------------------------------
   Útil para depuración o una futura interfaz de progreso.
   ========================================================= */

export function getUsedReadingIds(
  language = null
) {
  if (
    language ===
      "es" ||
    language ===
      "en"
  ) {
    return [
      ...getReadingHistory(
        createHistoryKey(
          language
        )
      )
    ];
  }


  return {
    es:
      [
        ...getReadingHistory(
          createHistoryKey(
            "es"
          )
        )
      ],

    en:
      [
        ...getReadingHistory(
          createHistoryKey(
            "en"
          )
        )
      ]
  };
}


/* =========================================================
   REINICIAR HISTORIAL
   ---------------------------------------------------------
   No hace falta llamarla normalmente.
   Quodam reinicia automáticamente después de mostrar todas.
   ========================================================= */

export function resetReadingHistory(
  language = null
) {
  /*
   * Reiniciar solamente un idioma.
   */
  if (
    language ===
      "es" ||
    language ===
      "en"
  ) {
    const historyKey =
      createHistoryKey(
        language
      );


    memoryHistories.delete(
      historyKey
    );


    try {
      window.localStorage.removeItem(
        historyKey
      );

    } catch (error) {
      console.warn(
        `No se pudo limpiar el historial "${language}":`,
        error
      );
    }


    return;
  }


  /*
   * Reiniciar ambos.
   */
  const keys = [
    createHistoryKey(
      "es"
    ),

    createHistoryKey(
      "en"
    )
  ];


  keys.forEach(
    (historyKey) => {

      memoryHistories.delete(
        historyKey
      );


      try {
        window.localStorage.removeItem(
          historyKey
        );

      } catch (error) {
        console.warn(
          "No se pudo limpiar un historial de Quodam:",
          error
        );
      }

    }
  );
}


/* =========================================================
   LIMPIAR IDs ANTIGUOS DEL HISTORIAL
   ========================================================= */

function pruneReadingHistory(
  readings
) {
  const historyKey =
    getHistoryKey(
      readings
    );


  const validIds =
    new Set(
      readings.map(
        (reading) =>
          reading.id
      )
    );


  const history =
    getReadingHistory(
      historyKey
    );


  const cleaned =
    history.filter(
      (id) =>
        validIds.has(
          id
        )
    );


  if (
    cleaned.length !==
    history.length
  ) {
    saveReadingHistory(
      historyKey,
      cleaned
    );
  }
}


/* =========================================================
   LEER HISTORIAL
   ========================================================= */

function getReadingHistory(
  historyKey
) {
  const memoryHistory =
    memoryHistories.get(
      historyKey
    ) ?? [];


  try {
    const raw =
      window.localStorage.getItem(
        historyKey
      );


    if (!raw) {
      return [
        ...memoryHistory
      ];
    }


    const parsed =
      JSON.parse(
        raw
      );


    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [
        ...memoryHistory
      ];
    }


    const cleanHistory =
      [
        ...new Set(
          parsed
            .map(
              normalizeReadingId
            )
            .filter(
              Boolean
            )
        )
      ];


    memoryHistories.set(
      historyKey,
      cleanHistory
    );


    return [
      ...cleanHistory
    ];

  } catch (error) {
    console.warn(
      "No se pudo leer el historial persistente de Quodam:",
      error
    );


    return [
      ...memoryHistory
    ];
  }
}


/* =========================================================
   GUARDAR HISTORIAL
   ========================================================= */

function saveReadingHistory(
  historyKey,
  ids
) {
  const cleanHistory =
    [
      ...new Set(
        (
          Array.isArray(
            ids
          )
            ? ids
            : []
        )
          .map(
            normalizeReadingId
          )
          .filter(
            Boolean
          )
      )
    ];


  memoryHistories.set(
    historyKey,
    cleanHistory
  );


  try {
    window.localStorage.setItem(
      historyKey,
      JSON.stringify(
        cleanHistory
      )
    );

  } catch (error) {
    console.warn(
      "No se pudo guardar el historial persistente de Quodam:",
      error
    );
  }
}

/* =========================================================
   CLAVE DE HISTORIAL SEGÚN CATÁLOGO
   ========================================================= */

function getHistoryKey(
  readings
) {
  const languages =
    new Set(
      readings
        .map(
          (reading) =>
            reading?.language
        )
        .filter(
          (language) =>
            language ===
              "es" ||
            language ===
              "en"
        )
    );


  /*
   * Catálogo de un único idioma.
   */
  if (
    languages.size ===
    1
  ) {
    const [
      language
    ] =
      languages;


    return createHistoryKey(
      language
    );
  }


  /*
   * Compatibilidad temporal con las lecturas
   * antiguas o con colecciones sin language.
   */
  return `${READING_HISTORY_PREFIX}-legacy`;
}


/* =========================================================
   CREAR CLAVE
   ========================================================= */

function createHistoryKey(
  language
) {
  return `${READING_HISTORY_PREFIX}-${language}`;
}

/* =========================================================
   VALIDAR COLECCIÓN
   ========================================================= */

function validateReadingCollection(
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
      "No existen lecturas disponibles."
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


  return normalized.length >
    0
      ? normalized
      : null;
}
