export function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}


export function showElement(element) {
  if (!element) {
    console.warn(
      "showElement recibió un elemento inexistente."
    );

    return;
  }

  element.hidden = false;
}


export function hideElement(element) {
  if (!element) {
    console.warn(
      "hideElement recibió un elemento inexistente."
    );

    return;
  }

  element.hidden = true;
}


export function getReadingImagePath(
  reading
) {
  if (!reading) {
    console.warn(
      "No se recibió una lectura para obtener su imagen."
    );

    return null;
  }


  if (!reading.image) {
    return null;
  }


  /*
   * QUODAM v4
   *
   * Las nuevas lecturas contienen language
   * y utilizan archivos WebP directos.
   */
  if (
    reading.language ===
      "es" ||
    reading.language ===
      "en"
  ) {
    return `./assets/images/readings/${reading.language}/${reading.image}`;
  }


  /*
   * QUODAM v3
   *
   * Compatibilidad temporal con las imágenes
   * antiguas.
   */
  return `./assets/images/readings/${reading.image}/illustration.png`;
}