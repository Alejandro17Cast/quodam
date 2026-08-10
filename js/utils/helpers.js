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


export function getReadingImagePath(reading) {
  if (!reading) {
    console.warn(
      "No se recibió una lectura para obtener su imagen."
    );

    return null;
  }

  if (!reading.image) {
    console.warn(
      `La lectura "${reading.title ?? reading.id ?? "sin identificar"}" no tiene una imagen asignada.`
    );

    return null;
  }

  return `./assets/images/readings/${reading.image}/illustration.png`;
}