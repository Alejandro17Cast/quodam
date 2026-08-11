import {
  getReadingImagePath
} from "../utils/helpers.js";


export function renderPreview(
  reading,
  elements
) {
  if (
    !reading ||
    !elements?.preview ||
    !elements?.previewImage ||
    !elements?.previewTitle
  ) {
    console.warn(
      "No se pudo renderizar la vista previa:",
      { reading, elements }
    );

    return;
  }


  elements.preview.classList.remove(
    "story-preview--changing"
  );


  /*
   * Fuerza al navegador a reiniciar
   * la animación CSS.
   */
  void elements.preview.offsetWidth;


  prepareImage(
    elements.previewImage,
    getReadingImagePath(reading),
    `Ilustración de ${reading.title ?? "la lectura"}`
  );


  elements.previewTitle.textContent =
    reading.title ?? "Lectura sin título";


  elements.preview.classList.add(
    "story-preview--changing"
  );
}


export function renderResult(
  reading,
  elements
) {
  if (
    !reading ||
    !elements?.resultImage ||
    !elements?.resultTitle ||
    !elements?.resultDescription
  ) {
    console.warn(
      "No se pudo renderizar el resultado:",
      { reading, elements }
    );

    return;
  }


  prepareImage(
    elements.resultImage,
    getReadingImagePath(reading),
    `Ilustración de ${reading.title ?? "la lectura"}`
  );


  elements.resultTitle.textContent =
    reading.title ?? "Lectura sin título";


  const category =
    reading.category ?? "Lectura";

  const level =
    reading.level ?? 1;

  const readingTime =
    reading.estimatedReadingTime ?? 1;


  elements.resultDescription.textContent =
    `${category} · Nivel ${level} · ${readingTime} min`;
}


function prepareImage(
  imageElement,
  source,
  alternativeText
) {
  if (!imageElement) {
    console.warn(
      "No se encontró el elemento de imagen."
    );

    return;
  }


  /*
   * Limpiamos handlers anteriores por si
   * el mismo <img> se reutiliza muchas veces.
   */
  imageElement.onload = null;
  imageElement.onerror = null;


  imageElement.alt =
    alternativeText;


  /*
   * Si no existe una ruta, simplemente
   * dejamos la imagen vacía.
   */
  if (!source) {
    imageElement.removeAttribute(
      "src"
    );

    imageElement.alt =
      "Ilustración no disponible";

    return;
  }


  imageElement.onload = () => {
    imageElement.classList.add(
      "is-loaded"
    );
  };


  imageElement.onerror = () => {
    console.warn(
      `No se pudo cargar la imagen: ${source}`
    );


    imageElement.classList.remove(
      "is-loaded"
    );


    /*
     * Quitamos onerror antes de eliminar
     * src para evitar posibles bucles.
     */
    imageElement.onerror = null;


    imageElement.removeAttribute(
      "src"
    );


    imageElement.alt =
      "Ilustración no disponible";
  };


  imageElement.classList.remove(
    "is-loaded"
  );


  imageElement.src =
    source;
}

export function renderReadingPage(
  reading,
  container
) {
  if (
    !reading ||
    !container
  ) {
    return;
  }


  const imagePath =
    getReadingImagePath(
      reading
    );


  const firstLines =
    reading.lines
      ?.slice(0, 2)
      .map(
        (line) =>
          `<p>${escapeHTML(line)}</p>`
      )
      .join("") ?? "";


  container.innerHTML = `
    <div class="book-reading">

      ${
        imagePath
          ? `
            <img
              class="book-reading__image"
              src="${imagePath}"
              alt=""
            >
          `
          : ""
      }

      <h3
        class="book-reading__title"
      >
        ${escapeHTML(
          reading.title
        )}
      </h3>

      <div
        class="book-reading__excerpt"
      >
        ${firstLines}
      </div>

    </div>
  `;
}


function escapeHTML(value) {
  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    String(
      value ?? ""
    );

  return element.innerHTML;
}