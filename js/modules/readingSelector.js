import { randomItem } from "../utils/random.js";


export async function loadReadings(indexPath) {
  const indexResponse = await fetch(indexPath);

  if (!indexResponse.ok) {
    throw new Error(
      `No se pudo cargar el índice de lecturas: ${indexPath}`
    );
  }

  const readingPaths = await indexResponse.json();

  if (!Array.isArray(readingPaths)) {
    throw new Error(
      "El índice de lecturas debe ser un arreglo."
    );
  }


  const results = await Promise.allSettled(
    readingPaths.map((path) =>
      loadReading(path)
    )
  );


  const readings = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      readings.push(result.value);
      return;
    }

    console.warn(
      `Quodam ignoró una lectura que no pudo cargarse: ${readingPaths[index]}`,
      result.reason
    );
  });


  const activeReadings = readings.filter(
    (reading) => reading.active
  );


  if (!activeReadings.length) {
    throw new Error(
      "No existe ninguna lectura válida y activa."
    );
  }

  return activeReadings;
}


async function loadReading(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(
      `No se encontró el archivo (${response.status}).`
    );
  }


  const reading = await response.json();

  validateReading(reading, path);

  return reading;
}


function validateReading(reading, path) {
  if (!reading || typeof reading !== "object") {
    throw new Error(
      `${path} no contiene una lectura válida.`
    );
  }


  const requiredFields = [
    "id",
    "title",
    "lines"
  ];


  for (const field of requiredFields) {
    if (!reading[field]) {
      throw new Error(
        `${path} no contiene el campo obligatorio "${field}".`
      );
    }
  }


  if (!Array.isArray(reading.lines)) {
    throw new Error(
      `${path}: "lines" debe ser un arreglo.`
    );
  }


  if (!reading.lines.length) {
    throw new Error(
      `${path} no contiene líneas de lectura.`
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


  const candidates = previousReadingId
    ? readings.filter(
        (reading) =>
          reading.id !== previousReadingId
      )
    : readings;


  return randomItem(candidates);
}