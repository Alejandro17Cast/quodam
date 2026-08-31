import {
  getReadingImagePath
} from "../utils/helpers.js";


/* =========================================================
   QUODAM — READING RENDERER
   ---------------------------------------------------------
   Responsabilidad:
   - Dibujar lecturas.
   - NO seleccionar lecturas.
   - NO cambiar estado global.
   - NO navegar.
   - NO decidir cuál lectura ganó.

   Regla del libro:
   - Página izquierda = ilustración.
   - Página derecha   = texto.
   - Ambas páginas deben representar la misma lectura.
   ========================================================= */


/* =========================================================
   VARIANTES DISPONIBLES
   ========================================================= */

const PAGE_VARIANTS =
  new Set([
    "image",
    "text",
    "full"
  ]);


/* =========================================================
   PREVIEW LEGACY
   ---------------------------------------------------------
   Se mantiene únicamente mientras main.js todavía
   dependa de #story-preview.
   ========================================================= */

export function renderPreview(
  reading,
  elements
) {
  if (
    !isValidReading(
      reading
    ) ||
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
   * Reflow intencional:
   * reinicia correctamente la animación CSS.
   */
  void elements.preview.offsetWidth;


  prepareImage(
    elements.previewImage,
    getReadingImagePath(
      reading
    ),
    `Ilustración de ${getSafeTitle(
      reading
    )}`
  );


  elements.previewTitle.textContent =
    getSafeTitle(
      reading
    );


  elements.preview.classList.add(
    "story-preview--changing"
  );
}


/* =========================================================
   RESULTADO FINAL
   ---------------------------------------------------------
   Se mantiene por compatibilidad con revealAnimation.js
   y el HTML actual.
   ========================================================= */

export function renderResult(
  reading,
  elements
) {
  if (
    !isValidReading(
      reading
    ) ||
    !elements?.resultTitle ||
    !elements?.resultDescription
  ) {
    console.warn(
      "No se pudo renderizar el resultado final.",
      {
        reading,
        elements
      }
    );

    return;
  }


  const title =
    getSafeTitle(
      reading
    );


  /*
   * resultImage es opcional.
   *
   * Esto permite que en una futura limpieza
   * eliminemos la portada duplicada del resultado
   * sin romper el renderer.
   */
  if (
    elements.resultImage
  ) {
    prepareImage(
      elements.resultImage,
      getReadingImagePath(
        reading
      ),
      `Ilustración de ${title}`
    );
  }


  elements.resultTitle.textContent =
    title;


  elements.resultDescription.textContent =
    createReadingMetadata(
      reading
    );


  /*
   * Guardamos el ID también en el resultado.
   * Es útil para depuración y pruebas.
   */
  elements.result?.setAttribute(
    "data-reading-id",
    getSafeReadingId(
      reading
    )
  );
}


/* =========================================================
   RENDERIZAR UNA PÁGINA
   ========================================================= */

export function renderReadingPage(
  reading,
  container,
  variant = "full"
) {
  if (
    !isValidReading(
      reading
    ) ||
    !container
  ) {
    console.warn(
      "No se pudo renderizar la lectura dentro del libro.",
      {
        reading,
        container,
        variant
      }
    );

    clearBookPage(
      container
    );

    return;
  }


  const safeVariant =
    PAGE_VARIANTS.has(
      variant
    )
      ? variant
      : "full";


  if (
    safeVariant !==
    variant
  ) {
    console.warn(
      `Variante de página desconocida "${variant}". Se utilizará "full".`
    );
  }


  switch (
    safeVariant
  ) {
    case "image":
      renderReadingImagePage(
        reading,
        container
      );

      break;


    case "text":
      renderReadingTextPage(
        reading,
        container
      );

      break;


    default:
      renderReadingFullPage(
        reading,
        container
      );
  }
}


/* =========================================================
   PÁGINA IZQUIERDA
   ILUSTRACIÓN
   ========================================================= */

function renderReadingImagePage(
  reading,
  container
) {
  const id =
    getSafeReadingId(
      reading
    );


  const title =
    getSafeTitle(
      reading
    );


  const imagePath =
    getReadingImagePath(
      reading
    );


  /*
   * Importante:
   * NO colocamos src directamente.
   *
   * Primero insertamos el elemento y después
   * prepareImage() registra onload/onerror.
   *
   * Así evitamos perder eventos si la imagen
   * está en caché o falla muy rápido.
   */
  container.innerHTML = `
    <article
      class="book-reading book-reading--image-page"
      data-reading-id="${escapeHTML(
        id
      )}"
      aria-label="Ilustración de ${escapeHTML(
        title
      )}"
    >

      <div
        class="book-reading__image-stage"
      >

        <span
          class="book-reading__sparkle book-reading__sparkle--one"
          aria-hidden="true"
        >
          ✦
        </span>


        <span
          class="book-reading__sparkle book-reading__sparkle--two"
          aria-hidden="true"
        >
          ✧
        </span>


        ${
          imagePath
            ? `
              <img
                class="book-reading__image book-reading__image--large"
                alt=""
                decoding="async"
              >
            `
            : `
              <div
                class="book-reading__image-placeholder"
                role="img"
                aria-label="Ilustración no disponible"
              >
                <span
                  aria-hidden="true"
                >
                  ✦
                </span>
              </div>
            `
        }

      </div>

    </article>
  `;


  const imageElement =
    container.querySelector(
      ".book-reading__image"
    );


  if (
    imageElement &&
    imagePath
  ) {
    prepareImage(
      imageElement,
      imagePath,
      `Ilustración de ${title}`
    );
  }
}


/* =========================================================
   PÁGINA DERECHA
   TEXTO
   ========================================================= */

function renderReadingTextPage(
  reading,
  container
) {
  const id =
    getSafeReadingId(
      reading
    );


  const title =
    getSafeTitle(
      reading
    );


  const category =
    getSafeCategory(
      reading
    );


  const level =
    getSafeLevel(
      reading
    );


  const readingTime =
    getSafeReadingTime(
      reading
    );


  const excerpt =
    getReadingExcerpt(
      reading,
      3
    );


  container.innerHTML = `
    <article
      class="book-reading book-reading--text-page"
      data-reading-id="${escapeHTML(
        id
      )}"
    >

      <p
        class="book-reading__category"
      >
        ${escapeHTML(
          category
        )}
      </p>


      <h3
        class="book-reading__title"
      >
        ${escapeHTML(
          title
        )}
      </h3>


      <p
        class="book-reading__meta"
      >
        Nivel ${escapeHTML(
          level
        )}

        <span
          aria-hidden="true"
        >
          ·
        </span>

        ${escapeHTML(
          readingTime
        )} min
      </p>


      ${
        excerpt.length > 0
          ? `
            <div
              class="book-reading__excerpt"
            >

              ${excerpt
                .map(
                  (
                    line,
                    index
                  ) => {
                    const isQuestion =
                      isQuestionLine(
                        line
                      );


                    const className =
                      isQuestion
                        ? "book-reading__excerpt-line book-reading__excerpt-line--question"
                        : "book-reading__excerpt-line";


                    return `
                      <p
                        class="${className}"
                        data-excerpt-line="${index + 1}"
                      >
                        ${escapeHTML(
                          line
                        )}
                      </p>
                    `;
                  }
                )
                .join("")}

            </div>
          `
          : `
            <p
              class="book-reading__excerpt-empty"
            >
              Una lectura está esperando ser descubierta.
            </p>
          `
      }


      <div
        class="book-reading__continue"
        aria-hidden="true"
      >
        <span>
          ✦
        </span>

        <span>
          Sigue la aventura
        </span>
      </div>

    </article>
  `;
}


/* =========================================================
   VERSIÓN COMPLETA
   ---------------------------------------------------------
   Solo para compatibilidad.
   No debería ser la principal en el libro actual.
   ========================================================= */

function renderReadingFullPage(
  reading,
  container
) {
  const id =
    getSafeReadingId(
      reading
    );


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
    <article
      class="book-reading book-reading--full-page"
      data-reading-id="${escapeHTML(
        id
      )}"
    >

      ${
        imagePath
          ? `
            <div
              class="book-reading__image-wrapper"
            >

              <img
                class="book-reading__image"
                alt=""
                decoding="async"
              >

            </div>
          `
          : `
            <div
              class="book-reading__image-placeholder"
              role="img"
              aria-label="Ilustración no disponible"
            >
              <span
                aria-hidden="true"
              >
                ✦
              </span>
            </div>
          `
      }


      <p
        class="book-reading__category"
      >
        ${escapeHTML(
          getSafeCategory(
            reading
          )
        )}
      </p>


      <h3
        class="book-reading__title"
      >
        ${escapeHTML(
          title
        )}
      </h3>


      ${
        excerpt.length > 0
          ? `
            <div
              class="book-reading__excerpt"
            >

              ${excerpt
                .map(
                  (
                    line,
                    index
                  ) => `
                    <p
                      class="book-reading__excerpt-line"
                      data-excerpt-line="${index + 1}"
                    >
                      ${escapeHTML(
                        line
                      )}
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


  if (
    imageElement &&
    imagePath
  ) {
    prepareImage(
      imageElement,
      imagePath,
      `Ilustración de ${title}`
    );
  }
}


/* =========================================================
   APERTURA COMPLETA DEL LIBRO
   ---------------------------------------------------------
   REGLA IDEAL:
   reading = misma lectura para ambos lados.

   También acepta leftReading/rightReading para mantener
   compatibilidad con main.js durante la migración.
   ========================================================= */

export function renderBookSpread({
  reading = null,

  leftReading = null,

  rightReading = null,

  leftContainer,

  rightContainer
}) {
  /*
   * Si se proporciona "reading",
   * esa lectura manda sobre ambas páginas.
   */
  const resolvedLeftReading =
    reading ??
    leftReading;


  const resolvedRightReading =
    reading ??
    rightReading;


  /*
   * Esta advertencia es extremadamente útil:
   * detecta inmediatamente si el main vuelve
   * a desincronizar ambos lados.
   */
  const leftId =
    getSafeReadingId(
      resolvedLeftReading
    );


  const rightId =
    getSafeReadingId(
      resolvedRightReading
    );


  if (
    resolvedLeftReading &&
    resolvedRightReading &&
    leftId !== rightId
  ) {
    console.warn(
      "BOOK SPREAD DESINCRONIZADO:",
      {
        leftId,
        leftTitle:
          getSafeTitle(
            resolvedLeftReading
          ),

        rightId,
        rightTitle:
          getSafeTitle(
            resolvedRightReading
          )
      }
    );
  }


  if (
    leftContainer
  ) {
    if (
      resolvedLeftReading
    ) {
      renderReadingPage(
        resolvedLeftReading,
        leftContainer,
        "image"
      );

    } else {
      clearBookPage(
        leftContainer
      );
    }
  }


  if (
    rightContainer
  ) {
    if (
      resolvedRightReading
    ) {
      renderReadingPage(
        resolvedRightReading,
        rightContainer,
        "text"
      );

    } else {
      clearBookPage(
        rightContainer
      );
    }
  }
}


/* =========================================================
   LIMPIAR PÁGINA
   ========================================================= */

export function clearBookPage(
  container
) {
  if (!container) {
    return;
  }


  /*
   * Limpiamos handlers de imágenes existentes
   * antes de eliminar el contenido.
   */
  const images =
    container.querySelectorAll(
      "img"
    );


  for (
    const image
    of images
  ) {
    resetImageState(
      image
    );
  }


  container.replaceChildren();
}


/* =========================================================
   PREPARAR IMAGEN
   ========================================================= */

function prepareImage(
  imageElement,
  source,
  alternativeText
) {
  if (
    !imageElement
  ) {
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


  const markAsLoaded =
    () => {
      imageElement.classList.add(
        "is-loaded"
      );
    };


  imageElement.onload =
    markAsLoaded;


  imageElement.onerror =
    () => {
      handleImageError(
        imageElement,
        source
      );
    };


  /*
   * Asignamos src DESPUÉS de registrar
   * los handlers.
   */
  imageElement.src =
    source;


  /*
   * Caché del navegador.
   */
  if (
    imageElement.complete &&
    imageElement.naturalWidth >
      0
  ) {
    markAsLoaded();
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
   * Evitamos ciclos de error.
   */
  imageElement.onload =
    null;


  imageElement.onerror =
    null;


  imageElement.removeAttribute(
    "src"
  );


  imageElement.alt =
    "Ilustración no disponible";


  /*
   * Si la imagen pertenece a una página
   * ilustrada del libro, mostramos un fallback.
   */
  const stage =
    imageElement.closest(
      ".book-reading__image-stage"
    );


  if (
    stage &&
    !stage.querySelector(
      ".book-reading__image-placeholder"
    )
  ) {
    const placeholder =
      document.createElement(
        "div"
      );


    placeholder.className =
      "book-reading__image-placeholder";


    placeholder.setAttribute(
      "role",
      "img"
    );


    placeholder.setAttribute(
      "aria-label",
      "Ilustración no disponible"
    );


    placeholder.innerHTML =
      '<span aria-hidden="true">✦</span>';


    imageElement.replaceWith(
      placeholder
    );
  }
}


/* =========================================================
   REINICIAR ESTADO DE IMAGEN
   ========================================================= */

function resetImageState(
  imageElement
) {
  if (!imageElement) {
    return;
  }


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
  return [
    getSafeCategory(
      reading
    ),

    `Nivel ${getSafeLevel(
      reading
    )}`,

    `${getSafeReadingTime(
      reading
    )} min`
  ].join(
    " · "
  );
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


  const safeMaximum =
    Math.max(
      0,
      Math.floor(
        Number(
          maximumLines
        ) || 0
      )
    );


  return reading.lines
    .filter(
      (line) =>
        typeof line ===
          "string" &&
        line.trim().length >
          0
    )
    .map(
      (line) =>
        line.trim()
    )
    .slice(
      0,
      safeMaximum
    );
}


/* =========================================================
   DETECTAR PREGUNTA
   ========================================================= */

function isQuestionLine(
  line
) {
  if (
    typeof line !==
    "string"
  ) {
    return false;
  }


  return /[¿?]/.test(
    line
  );
}


/* =========================================================
   VALIDAR LECTURA
   ========================================================= */

function isValidReading(
  reading
) {
  return Boolean(
    reading &&
    typeof reading ===
      "object" &&
    !Array.isArray(
      reading
    )
  );
}


/* =========================================================
   ID SEGURO
   ========================================================= */

function getSafeReadingId(
  reading
) {
  if (
    typeof reading?.id ===
      "string"
  ) {
    return reading.id.trim();
  }


  return "";
}


/* =========================================================
   TÍTULO SEGURO
   ========================================================= */

function getSafeTitle(
  reading
) {
  if (
    typeof reading?.title ===
      "string" &&
    reading.title.trim()
  ) {
    return reading.title.trim();
  }


  return "Lectura sin título";
}


/* =========================================================
   CATEGORÍA SEGURA
   ========================================================= */

function getSafeCategory(
  reading
) {
  if (
    typeof reading?.category ===
      "string" &&
    reading.category.trim()
  ) {
    return reading.category.trim();
  }


  return "Lectura";
}


/* =========================================================
   NIVEL SEGURO
   ========================================================= */

function getSafeLevel(
  reading
) {
  const level =
    Number(
      reading?.level
    );


  if (
    Number.isFinite(
      level
    ) &&
    level > 0
  ) {
    return Math.round(
      level
    );
  }


  return 1;
}


/* =========================================================
   TIEMPO DE LECTURA SEGURO
   ========================================================= */

function getSafeReadingTime(
  reading
) {
  const readingTime =
    Number(
      reading?.estimatedReadingTime
    );


  if (
    Number.isFinite(
      readingTime
    ) &&
    readingTime > 0
  ) {
    return Math.round(
      readingTime
    );
  }


  return 1;
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
      value ??
      ""
    );


  return element.innerHTML;
}
