import {
  CONFIG
} from "../config.js";


import {
  getModeLanguages,
  normalizeReadingMode
} from "./languageMode.js";


/* =========================================================
   QUODAM v4 — READING REPOSITORY
   ---------------------------------------------------------
   Responsable de:
   - Cargar catálogos completos.
   - Evitar múltiples solicitudes innecesarias.
   - Filtrar lecturas activas.
   - Filtrar lecturas disponibles para ruleta.
   - Separar español e inglés.
   ========================================================= */


/*
 * Cache en memoria.
 *
 * Una vez descargado un catálogo no volvemos
 * a solicitarlo durante la misma página.
 */
const catalogCache =
  new Map();


/* =========================================================
   CARGAR CATÁLOGO NORMAL
   ========================================================= */

export async function loadReadingCatalog(
  language,
  {
    wheelOnly = true
  } = {}
) {
  validateLanguage(
    language
  );


  const catalogPath =
    CONFIG.readingCatalogs[
      language
    ];


  if (!catalogPath) {
    throw new Error(
      `No existe catálogo configurado para "${language}".`
    );
  }


  const readings =
    await fetchCatalog(
      catalogPath
    );


  const validReadings =
    readings
      .filter(
        (reading) =>
          reading.active ===
            true &&
          reading.language ===
            language
      )
      .filter(
        (reading) =>
          !wheelOnly ||
          reading.wheelEligible ===
            true
      );


  if (
    validReadings.length ===
    0
  ) {
    throw new Error(
      `No existen lecturas disponibles para "${language}".`
    );
  }


  return validReadings;
}


/* =========================================================
   CARGAR LECTURAS SEGÚN MODO
   ========================================================= */

export async function loadReadingsForMode(
  mode
) {
  const normalizedMode =
    normalizeReadingMode(
      mode
    );


  if (!normalizedMode) {
    throw new Error(
      `Modo de lectura no válido: "${mode}".`
    );
  }


  const languages =
    getModeLanguages(
      normalizedMode
    );


  /*
   * Importante:
   *
   * En modo Mixto, español e inglés
   * se descargan EN PARALELO.
   */
  const catalogs =
    await Promise.all(
      languages.map(
        (language) =>
          loadReadingCatalog(
            language
          )
      )
    );


  const byLanguage =
    {};


  languages.forEach(
    (
      language,
      index
    ) => {
      byLanguage[
        language
      ] =
        catalogs[
          index
        ];
    }
  );


  return {
    mode:
      normalizedMode,

    languages,

    byLanguage,

    all:
      catalogs.flat()
  };
}


/* =========================================================
   CARGAR LECTURAS DE APOYO
   ========================================================= */

export async function loadSupportCatalog(
  language
) {
  validateLanguage(
    language
  );


  const catalogPath =
    CONFIG.supportCatalogs[
      language
    ];


  if (!catalogPath) {
    throw new Error(
      `No existe catálogo de apoyo para "${language}".`
    );
  }


  const readings =
    await fetchCatalog(
      catalogPath
    );


  return readings.filter(
    (reading) =>
      reading.active ===
        true &&
      reading.language ===
        language &&
      reading.group ===
        "support"
  );
}


/* =========================================================
   FETCH CON CACHE
   ========================================================= */

async function fetchCatalog(
  catalogPath
) {
  const catalogURL =
    resolveProjectURL(
      catalogPath
    );


  const cacheKey =
    catalogURL.href;


  /*
   * Si ya existe una solicitud o resultado,
   * reutilizamos la misma Promise.
   */
  if (
    catalogCache.has(
      cacheKey
    )
  ) {
    return catalogCache.get(
      cacheKey
    );
  }


  const request =
    fetchCatalogFromNetwork(
      catalogURL
    );


  catalogCache.set(
    cacheKey,
    request
  );


  try {
    return await request;

  } catch (error) {

    /*
     * Si falló, eliminamos el elemento de cache
     * para permitir un nuevo intento.
     */
    catalogCache.delete(
      cacheKey
    );


    throw error;
  }
}


/* =========================================================
   SOLICITUD REAL
   ========================================================= */

async function fetchCatalogFromNetwork(
  catalogURL
) {
  const response =
    await fetch(
      catalogURL
    );


  if (!response.ok) {
    throw new Error(
      `No se pudo cargar el catálogo (${response.status}): ${catalogURL}`
    );
  }


  const readings =
    await response.json();


  validateCatalog(
    readings,
    catalogURL.href
  );


  return readings;
}


/* =========================================================
   RESOLVER RUTA DESDE LA RAÍZ DE QUODAM
   ========================================================= */

function resolveProjectURL(
  path
) {
  /*
   * readingRepository.js vive en:
   *
   * /js/modules/readingRepository.js
   *
   * ../../ nos devuelve a la raíz de Quodam.
   *
   * Esto también funciona cuando lectura.html
   * se encuentra dentro de /pages/.
   */

  const projectRoot =
    new URL(
      "../../",
      import.meta.url
    );


  const normalizedPath =
    String(
      path
    ).replace(
      /^\.\//,
      ""
    );


  return new URL(
    normalizedPath,
    projectRoot
  );
}


/* =========================================================
   VALIDAR IDIOMA
   ========================================================= */

function validateLanguage(
  language
) {
  if (
    language !==
      "es" &&
    language !==
      "en"
  ) {
    throw new Error(
      `Idioma no soportado: "${language}".`
    );
  }
}


/* =========================================================
   VALIDAR CATÁLOGO
   ========================================================= */

function validateCatalog(
  readings,
  source
) {
  if (
    !Array.isArray(
      readings
    )
  ) {
    throw new Error(
      `${source} debe contener un arreglo de lecturas.`
    );
  }


  const ids =
    new Set();


  readings.forEach(
    (
      reading,
      index
    ) => {

      if (
        !reading ||
        typeof reading !==
          "object" ||
        Array.isArray(
          reading
        )
      ) {
        throw new Error(
          `${source}: lectura inválida en posición ${index}.`
        );
      }


      if (
        typeof reading.id !==
          "string" ||
        !reading.id.trim()
      ) {
        throw new Error(
          `${source}: existe una lectura sin ID válido.`
        );
      }


      if (
        ids.has(
          reading.id
        )
      ) {
        throw new Error(
          `${source}: ID duplicado "${reading.id}".`
        );
      }


      ids.add(
        reading.id
      );


      if (
        typeof reading.title !==
          "string" ||
        !reading.title.trim()
      ) {
        throw new Error(
          `${source}: "${reading.id}" no tiene título válido.`
        );
      }


      if (
        !Array.isArray(
          reading.lines
        ) ||
        reading.lines.length ===
          0
      ) {
        throw new Error(
          `${source}: "${reading.id}" no contiene líneas válidas.`
        );
      }


      if (
        reading.language !==
          "es" &&
        reading.language !==
          "en"
      ) {
        throw new Error(
          `${source}: "${reading.id}" tiene un idioma inválido.`
        );
      }
    }
  );
}


/* =========================================================
   LIMPIAR CACHE
   ========================================================= */

export function clearReadingRepositoryCache() {
  catalogCache.clear();
}