import { randomItem } from "../utils/random.js";

export async function loadReadings(indexPath) {
  const indexResponse = await fetch(indexPath);

  if (!indexResponse.ok) {
    throw new Error("No se pudo cargar el índice de lecturas.");
  }

  const readingPaths = await indexResponse.json();

  const readings = await Promise.all(
    readingPaths.map(async (path) => {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`No se pudo cargar ${path}`);
      }

      return response.json();
    })
  );

  return readings.filter((reading) => reading.active);
}

export function selectRandomReading(
  readings,
  previousReadingId = null
) {
  if (!readings.length) {
    throw new Error("No existen lecturas disponibles.");
  }

  if (readings.length === 1) {
    return readings[0];
  }

  const candidates = previousReadingId
    ? readings.filter(
        (reading) => reading.id !== previousReadingId
      )
    : readings;

  return randomItem(candidates);
}