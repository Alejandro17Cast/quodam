import {
  getReadingImagePath
} from "../utils/helpers.js";


/* =========================================================
   PREVIEW ANTIGUO
   ========================================================= */

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
      "No se pudo renderizar la vista previa.",
      {
        reading,
        elements
      }
    );

    return;
  }


  elements.preview.classList.remove(
    "story-preview--changing"
  );


  /*
   * Fuerza al navegador a recalcular
   * el elemento para reiniciar
   * correctamente la animación CSS.
   */
  void elements.preview.offsetWidth;


  prepareImage(
    elements.previewImage,
    getReadingImagePath(reading),
    `Ilustración de ${getSafeTitle(reading)}`
  );


  elements.previewTitle.textContent =
    getSafeTitle(reading);


  elements.preview.classList.add(
    "story-preview--changing"
  );
}


/* =========================================================
   RESULTADO FINAL
   ========================================================= */

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
      "No se pudo renderizar el resultado.",
      {
        reading,
        elements
      }
    );

    return;
  }


  prepareImage(
    elements.resultImage,
    getReadingImagePath(reading),
    `Ilustración de ${getSafeTitle(reading)}`
  );


  elements.resultTitle.textContent =
    getSafeTitle(reading);


  elements.resultDescription.textContent =
    createReadingMetadata(
      reading
    );
}


/* =========================================================
   LECTURA DENTRO DE UNA PÁGINA DEL LIBRO
   ========================================================= */

export function renderReadingPage(
  reading,
  container
) {
  if (
    !reading ||
    !container
  ) {
    console.warn(
      "No se pudo renderizar la lectura dentro del libro.",
      {
        reading,
        container
      }
    );

    return;
  }


  const title =
    getSafeTitle(
      reading
    );


  const imagePath =
    getReadingImagePath(
      reading
    );


  const excerpt =
    getReadingExcerpt(
      reading,
      2
    );


  container.innerHTML = `
    <article class="book-reading">

      ${
        imagePath
          ? `
            <div
              class="book-reading__image-wrapper"
            >

              <img
                class="book-reading__image"
                src="${escapeHTML(imagePath)}"
                alt="Ilustración de ${escapeHTML(title)}"
              >

            </div>
          `
          : `
            <div
              class="book-reading__image-placeholder"
              aria-hidden="true"
            >
              ✦
            </div>
          `
      }


      <p
        class="book-reading__category"
      >
        ${escapeHTML(
          reading.category ?? "Lectura"
        )}
      </p>


      <h3
        class="book-reading__title"
      >
        ${escapeHTML(title)}
      </h3>


      ${
        excerpt.length
          ? `
            <div
              class="book-reading__excerpt"
            >

              ${excerpt
                .map(
                  (line) => `
                    <p>
                      ${escapeHTML(line)}
                    </p>
                  `
                )
                .join("")}

            </div>
          `
          : ""
      }

    </article>
  `;


  const imageElement =
    container.querySelector(
      ".book-reading__image"
    );


  if (imageElement) {
    prepareExistingPageImage(
      imageElement,
      imagePath,
      title
    );
  }
}


/* =========================================================
   IMÁGENES
   ========================================================= */

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


  resetImageState(
    imageElement
  );


  imageElement.alt =
    alternativeText;


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
    handleImageError(
      imageElement,
      source
    );
  };


  imageElement.src =
    source;
}


/* =========================================================
   IMÁGENES GENERADAS DENTRO DE innerHTML
   ========================================================= */

function prepareExistingPageImage(
  imageElement,
  source,
  title
) {
  if (
    !imageElement ||
    !source
  ) {
    return;
  }


  resetImageState(
    imageElement
  );


  imageElement.alt =
    `Ilustración de ${title}`;


  imageElement.onload = () => {
    imageElement.classList.add(
      "is-loaded"
    );
  };


  imageElement.onerror = () => {
    handleImageError(
      imageElement,
      source
    );
  };


  /*
   * Si la imagen ya estaba en caché,
   * onload puede haber ocurrido antes
   * de asignar el handler.
   */
  if (
    imageElement.complete &&
    imageElement.naturalWidth > 0
  ) {
    imageElement.classList.add(
      "is-loaded"
    );
  }
}


/* =========================================================
   ERROR DE IMAGEN
   ========================================================= */

function handleImageError(
  imageElement,
  source
) {
  console.warn(
    `No se pudo cargar la imagen: ${source}`
  );


  imageElement.classList.remove(
    "is-loaded"
  );


  /*
   * Evita ciclos de error.
   */
  imageElement.onerror =
    null;


  imageElement.removeAttribute(
    "src"
  );


  imageElement.alt =
    "Ilustración no disponible";
}


/* =========================================================
   LIMPIAR ESTADO DE IMAGEN
   ========================================================= */

function resetImageState(
  imageElement
) {
  imageElement.onload =
    null;

  imageElement.onerror =
    null;


  imageElement.classList.remove(
    "is-loaded"
  );
}


/* =========================================================
   METADATOS
   ========================================================= */

function createReadingMetadata(
  reading
) {
  const category =
    reading.category ??
    "Lectura";


  const level =
    reading.level ??
    1;


  const readingTime =
    reading.estimatedReadingTime ??
    1;


  return `${category} · Nivel ${level} · ${readingTime} min`;
}


/* =========================================================
   EXTRACTO
   ========================================================= */

function getReadingExcerpt(
  reading,
  maximumLines = 2
) {
  if (
    !Array.isArray(
      reading?.lines
    )
  ) {
    return [];
  }


  return reading.lines
    .filter(
      (line) =>
        typeof line === "string" &&
        line.trim().length > 0
    )
    .slice(
      0,
      maximumLines
    );
}


/* =========================================================
   TÍTULO SEGURO
   ========================================================= */

function getSafeTitle(
  reading
) {
  return (
    reading?.title?.trim() ||
    "Lectura sin título"
  );
}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escapeHTML(
  value
) {
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