import { randomItem } from "../utils/random.js";


export async function loadReadings(indexPath) {
  /*
   * Convertimos la ruta recibida en una URL absoluta.
   *
   * Ejemplo desde index.html:
   * ./data/readings-index.json
   *
   * se convierte en:
   * http://localhost:5500/data/readings-index.json
   *
   * Desde lectura.html:
   * ../data/readings-index.json
   *
   * termina apuntando exactamente al mismo archivo.
   */
  const indexURL = new URL(
    indexPath,
    window.location.href
  );


  const indexResponse = await fetch(indexURL);

  if (!indexResponse.ok) {
    throw new Error(
      `No se pudo cargar el índice de lecturas: ${indexURL}`
    );
  }


  const readingPaths =
    await indexResponse.json();


  if (!Array.isArray(readingPaths)) {
    throw new Error(
      "El índice de lecturas debe ser un arreglo."
    );
  }


  /*
   * Cada ruta del JSON se resuelve tomando como
   * referencia readings-index.json.
   *
   * Así no importa si estamos en:
   *
   * /index.html
   *
   * o
   *
   * /pages/lectura.html
   */
  const readingURLs =
    readingPaths.map(
      (path) =>
        new URL(path, indexURL)
    );


  const results =
    await Promise.allSettled(
      readingURLs.map(
        (url) => loadReading(url)
      )
    );


  const readings = [];


  results.forEach(
    (result, index) => {

      if (
        result.status === "fulfilled"
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
        reading.active
    );


  if (!activeReadings.length) {
    throw new Error(
      "No existe ninguna lectura válida y activa."
    );
  }


  return activeReadings;
}


async function loadReading(url) {
  const response =
    await fetch(url);


  if (!response.ok) {
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


  return reading;
}


function validateReading(
  reading,
  source
) {

  if (
    !reading ||
    typeof reading !== "object"
  ) {
    throw new Error(
      `${source} no contiene una lectura válida.`
    );
  }


  const requiredFields = [
    "id",
    "title",
    "lines"
  ];


  for (
    const field of requiredFields
  ) {

    if (!reading[field]) {
      throw new Error(
        `${source} no contiene el campo obligatorio "${field}".`
      );
    }
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


  if (
    reading.lines.length === 0
  ) {
    throw new Error(
      `${source} no contiene líneas de lectura.`
    );
  }
}


export function selectRandomReading(
  readings,
  previousReadingId = null
) {

  if (!readings.length) {
    throw new Error(
      "No existen lecturas disponibles."
    );
  }


  if (readings.length === 1) {
    return readings[0];
  }


  const candidates =
    previousReadingId
      ? readings.filter(
          (reading) =>
            reading.id !==
            previousReadingId
        )
      : readings;


  return randomItem(candidates);
}
export function selectDifferentReading(
  readings,
  currentReadingId = null
) {
  if (readings.length <= 1) {
    return readings[0];
  }

  const candidates = currentReadingId
    ? readings.filter(
        (reading) =>
          reading.id !== currentReadingId
      )
    : readings;

  return randomItem(candidates);
}