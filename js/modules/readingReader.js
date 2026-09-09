import {
  loadReadings
} from "./readingSelector.js";


import {
  findReadingById
} from "./readingRepository.js";


import {
  getReadingSession,
  getSessionReadingById,
  setSessionCurrentReadingById,
  getNextSessionReading,
  advanceReadingSession
} from "./readingSession.js";


/* =========================================================
   QUODAM — READING READER KIDS v4
   ---------------------------------------------------------
   Responsable de:
   - Abrir EXACTAMENTE la lectura recibida por URL.
   - Renderizar la lectura completa.
   - Preparar la ilustración.
   - Crear progreso visual de lectura.
   - Animar suavemente las líneas al entrar en pantalla.

   No selecciona lecturas nuevas.
   No cambia el cuento recibido por URL.
   ========================================================= */


/* =========================================================
   REFERENCIAS DEL DOM
   ========================================================= */

const elements = {
  container:
    document.querySelector(
      "#reading-container"
    ),

  error:
    document.querySelector(
      "#reading-error"
    ),

  loading:
    document.querySelector(
      "#reading-loading"
    )
};


/* =========================================================
   ESTADO LOCAL DEL READER
   ========================================================= */

const readerState = {
  progressCleanup:
    null,

  lineObserver:
    null
};


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

async function initializeReader() {
  try {
    validateRequiredElements();


    setLoadingState(
      true
    );


    const readingId =
      getReadingIdFromURL();


    if (!readingId) {
      throw new Error(
        "No se recibió un identificador de lectura."
      );
    }


    /*
 * ===============================================
 * 1. SESIÓN
 * ===============================================
 *
 * Es la ruta MÁS RÁPIDA.
 *
 * No requiere ningún fetch.
 */
let reading =
  getSessionReadingById(
    readingId
  );


if (reading) {
  setSessionCurrentReadingById(
    readingId
  );
}


/*
 * ===============================================
 * 2. CATÁLOGO v4
 * ===============================================
 *
 * Solo ocurre si:
 * - recargaron directamente la URL,
 * - abrieron un enlace en otra pestaña,
 * - sessionStorage no estaba disponible.
 */
if (!reading) {
  reading =
    await findReadingById(
      readingId
    );
}


/*
 * ===============================================
 * 3. LEGACY
 * ===============================================
 *
 * Compatibilidad temporal con URLs de Quodam v3.
 */
if (!reading) {
  const legacyReadings =
    await loadReadings(
      "../data/readings-index.json"
    );


  const legacyIndex =
    buildReadingIndex(
      legacyReadings
    );


  reading =
    legacyIndex.get(
      readingId
    );
}

    console.log(
      "READER:",
      {
        urlId:
          readingId,

        foundId:
          reading?.id,

        title:
          reading?.title,

        matches:
          normalizeReadingId(
            reading?.id
          ) ===
          readingId
      }
    );


    if (!reading) {
      throw new Error(
        `No existe la lectura "${readingId}".`
      );
    }


    renderReading(
      reading
    );

  } catch (error) {
    console.error(
      "Error al abrir la lectura:",
      error
    );


    showError(
      error
    );

  } finally {
    setLoadingState(
      false
    );
  }
}


/* =========================================================
   VALIDAR INTERFAZ
   ========================================================= */

function validateRequiredElements() {
  if (!elements.container) {
    throw new Error(
      "No se encontró el elemento #reading-container."
    );
  }


  if (!elements.error) {
    console.warn(
      "No se encontró #reading-error. Los errores solo aparecerán en consola."
    );
  }
}


/* =========================================================
   OBTENER ID DE URL
   ========================================================= */

function getReadingIdFromURL() {
  const params =
    new URLSearchParams(
      window.location.search
    );


  return normalizeReadingId(
    params.get(
      "id"
    )
  );
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


/* =========================================================
   CONSTRUIR ÍNDICE
   ========================================================= */

function buildReadingIndex(
  readings
) {
  if (
    !Array.isArray(
      readings
    )
  ) {
    throw new Error(
      "El índice de lecturas no tiene un formato válido."
    );
  }


  if (
    readings.length ===
    0
  ) {
    throw new Error(
      "No hay lecturas disponibles."
    );
  }


  const readingsById =
    new Map();


  for (
    const reading
    of readings
  ) {
    const id =
      normalizeReadingId(
        reading?.id
      );


    if (!id) {
      console.warn(
        "LECTURA IGNORADA: no tiene un ID válido.",
        reading
      );

      continue;
    }


    if (
      readingsById.has(
        id
      )
    ) {
      console.error(
        "ID DUPLICADO:",
        {
          id,

          first:
            readingsById.get(
              id
            ),

          duplicate:
            reading
        }
      );


      throw new Error(
        `El ID "${id}" está duplicado en readings-index.json.`
      );
    }


    readingsById.set(
      id,
      reading
    );


    validateReadingData(
      reading,
      id
    );
  }


  if (
    readingsById.size ===
    0
  ) {
    throw new Error(
      "No se encontró ninguna lectura válida."
    );
  }


  return readingsById;
}


/* =========================================================
   VALIDACIÓN NO BLOQUEANTE
   ========================================================= */

function validateReadingData(
  reading,
  id
) {
  if (
    typeof reading?.title !==
      "string" ||
    !reading.title.trim()
  ) {
    console.warn(
      `La lectura "${id}" no tiene un título válido.`
    );
  }


  if (
    !Array.isArray(
      reading?.lines
    )
  ) {
    console.warn(
      `La lectura "${id}" no tiene un arreglo "lines" válido.`
    );
  }


  if (
    reading?.image !== undefined &&
    typeof reading.image !==
      "string"
  ) {
    console.warn(
      `La lectura "${id}" tiene un valor "image" no válido.`
    );
  }
}


/* =========================================================
   RUTA DE ILUSTRACIÓN
   ========================================================= */

function getIllustrationPath(
  reading
) {
  if (
    typeof reading?.image !==
      "string"
  ) {
    return null;
  }


  const image =
    reading.image.trim();


  if (!image) {
    return null;
  }


  /*
   * QUODAM v4
   */
  if (
    reading.language ===
      "es" ||
    reading.language ===
      "en"
  ) {
    return (
      "../assets/images/readings/" +
      reading.language +
      "/" +
      encodeURIComponent(
        image
      )
    );
  }


  /*
   * QUODAM v3
   */
  return (
    "../assets/images/readings/" +
    encodeURIComponent(
      image
    ) +
    "/illustration.png"
  );
}

/* =========================================================
   TEXTOS DE INTERFAZ SEGÚN IDIOMA
   ========================================================= */

function getReaderUI({
  language,
  currentStep,
  totalSteps,
  isMixedSession,
  nextReading
}) {
  const isEnglish =
    language ===
    "en";


  const stepLabel =
    totalSteps >
      1
      ? (
          isEnglish
            ? `Reading ${currentStep} of ${totalSteps}`
            : `Lectura ${currentStep} de ${totalSteps}`
        )
      : (
          isEnglish
            ? "Your reading"
            : "Tu lectura"
        );


  const nextLanguage =
    nextReading?.language;


  return {
    adventureLabel:
      isEnglish
        ? "Your adventure"
        : "Tu aventura",

    starting:
      isEnglish
        ? "Starting"
        : "Empezando",

    languageLabel:
      isEnglish
        ? "English"
        : "Español",

    gradeLabel:
      isEnglish
        ? "First grade"
        : "Primer grado",

    stepLabel,

    finished:
      isMixedSession &&
      nextReading
        ? (
            isEnglish
              ? "Great job! First part complete."
              : "¡Muy bien! Primera parte completada."
          )
        : (
            isEnglish
              ? "You did it!"
              : "¡Lo lograste!"
          ),

    home:
      isEnglish
        ? "Back to home"
        : "Volver al inicio",

    rediscover:
      isEnglish
        ? "Discover another reading"
        : "Descubrir otra lectura",

    next:
      nextLanguage ===
        "en"
        ? "Continue in English"
        : "Continuar en Español"
  };
}
/* =========================================================
   RENDERIZAR LECTURA
   ========================================================= */

function renderReading(
  reading
) {
  cleanupReaderExperience();


  const readingId =
    normalizeReadingId(
      reading?.id
    );


  if (!readingId) {
    throw new Error(
      "La lectura encontrada no posee un ID válido."
    );
  }


  const title =
    getSafeTitle(
      reading
    );


  const illustrationPath =
    getIllustrationPath(
      reading
    );


  const validLines =
    getValidLines(
      reading
    );

    const session =
  getReadingSession();


const nextReading =
  getNextSessionReading();


const isMixedSession =
  session?.mode ===
    "mixed";


const language =
  reading?.language ===
    "en"
    ? "en"
    : "es";

    const currentStep =
  (
    Number.isInteger(
      session?.currentIndex
    )
      ? session.currentIndex
      : 0
  ) + 1;


const totalSteps =
  Array.isArray(
    session?.readings
  )
    ? session.readings.length
    : 1;


const ui =
  getReaderUI({
    language,
    currentStep,
    totalSteps,
    isMixedSession,
    nextReading
  });


document.documentElement.lang =
  language;


const readerShell =
  document.querySelector(
    ".reader"
  );


if (readerShell) {
  readerShell.dataset.language =
    language;

  readerShell.dataset.mode =
    session?.mode ??
    language;
}

  document.title =
    `${title} — Quodam`;


  const linesHTML =
    validLines
      .map(
        (
          line,
          index
        ) => {
          const isQuestion =
            /[¿?]/.test(
              line
            );


          const lineClass =
            isQuestion
              ? "reading-text__line reading-text__line--question"
              : "reading-text__line";


          return `
            <p
              class="${lineClass}"
              data-line="${index + 1}"
            >
              ${escapeHTML(
                line
              )}
            </p>
          `;
        }
      )
      .join("");


  const rediscoverURL =
    `../index.html?discover=true&previous=${encodeURIComponent(
      readingId
    )}`;
let primaryActionHTML;


if (
  isMixedSession &&
  nextReading
) {
  const nextLabel =
    nextReading.language ===
      "en"
      ? "Continue in English →"
      : "Continuar en Español →";


 primaryActionHTML = `
  <button
    type="button"
    class="button button--primary"
    data-reader-action="next"
  >
    ${escapeHTML(
      ui.next
    )}
    <span
      aria-hidden="true"
    >
      →
    </span>
  </button>
`;

primaryActionHTML = `
  <a
    href="${escapeHTML(
      rediscoverURL
    )}"
    class="button button--primary"
  >
    ${escapeHTML(
      ui.rediscover
    )}
  </a>
`;

} else {

  const rediscoverLabel =
    language ===
      "en"
      ? "Discover another reading"
      : "Descubrir otra lectura";


  primaryActionHTML = `
    <a
      href="${escapeHTML(
        rediscoverURL
      )}"
      class="button button--primary"
    >
      ${escapeHTML(
        rediscoverLabel
      )}
    </a>
  `;
}

  elements.container.innerHTML = `

    <!-- =====================================
         PROGRESO DE LA AVENTURA
    ====================================== -->

    <div
      class="reading-progress"
      role="group"
      aria-label="Progreso de lectura"
    >

     <div
  class="reading-progress__label"
>
  <span>
    ${escapeHTML(
      ui.adventureLabel
    )}
  </span>

  <span
    data-reading-progress-label
    aria-live="polite"
  >
    ${escapeHTML(
      ui.starting
    )}
  </span>
</div>

      <div
        class="reading-progress__track"
        aria-hidden="true"
      >

        <div
          class="reading-progress__fill"
          data-reading-progress-fill
        ></div>


        <span
          class="reading-progress__star"
          data-reading-progress-star
        >
          ★
        </span>

      </div>

    </div>


    <!-- =====================================
         LECTURA
    ====================================== -->

    <article
      class="reading-text"
      data-reading-id="${escapeHTML(
        readingId
      )}"
      data-language="${escapeHTML(
  language
)}"
    >

      <!-- =====================================
           ENCABEZADO
      ====================================== -->

      <header
        class="reading-text__header"
      >

     <p
  class="reading-text__category"
>
  ${escapeHTML(
    ui.languageLabel
  )}
</p>


        <h1
          class="reading-text__title"
        >
          ${escapeHTML(
            title
          )}
        </h1>


    <p
  class="reading-text__meta"
>

  <span>
    ${escapeHTML(
      ui.gradeLabel
    )}
  </span>


  <span
    aria-hidden="true"
  >
    ·
  </span>


  <span>
    ${escapeHTML(
      ui.stepLabel
    )}
  </span>

</p>

      </header>


      <!-- =====================================
           ILUSTRACIÓN
      ====================================== -->

      ${
        illustrationPath
          ? `
            <figure
              class="reading-text__illustration"
            >

              <img
                class="reading-text__image"
                src="${escapeHTML(
                  illustrationPath
                )}"
                alt="Ilustración de ${escapeHTML(
                  title
                )}"
                loading="eager"
                decoding="async"
              >

            </figure>
          `
          : ""
      }


      <!-- =====================================
           TEXTO
      ====================================== -->

      <div
        class="reading-text__body"
      >

        ${
          linesHTML ||
          `
            <p
              class="reading-text__line is-visible"
            >
              Esta lectura todavía no tiene contenido disponible.
            </p>
          `
        }

      </div>


      <!-- =====================================
           FINAL
      ====================================== -->

      <footer
        class="reading-text__footer"
      >

        <div
          class="reading-text__ending"
        >

          <span
            aria-hidden="true"
          >
            ★
          </span>


         <p>
  ${escapeHTML(
    ui.finished
  )}
</p>

        </div>


        <div
          class="reading-text__actions"
        >

         ${primaryActionHTML}


         <a
  href="../index.html"
  class="button button--reader-secondary"
>
  ${escapeHTML(
    ui.home
  )}
</a>

        </div>

      </footer>

    </article>
  `;


  elements.container.hidden =
    false;

    const nextButton =
  elements.container.querySelector(
    '[data-reader-action="next"]'
  );


if (
  nextButton
) {
  nextButton.addEventListener(
    "click",
    () => {

      const next =
        advanceReadingSession();


      if (!next) {
        console.warn(
          "No existe otra lectura en la sesión."
        );

        return;
      }


      window.location.assign(
        `./lectura.html?id=${encodeURIComponent(
          next.id
        )}&mode=mixed`
      );
    }
  );
}


  if (
    elements.error
  ) {
    elements.error.hidden =
      true;
  }


  prepareIllustration(
    illustrationPath,
    title
  );


  initializeReaderExperience();


  console.log(
    "LECTURA RENDERIZADA:",
    {
      id:
        readingId,

      title,

      lines:
        validLines.length,

      illustration:
        illustrationPath
    }
  );
}


/* =========================================================
   EXPERIENCIA INFANTIL
   ========================================================= */

function initializeReaderExperience() {
  const readingElement =
    elements.container.querySelector(
      ".reading-text"
    );


  if (!readingElement) {
    return;
  }


  initializeReadingProgress(
    readingElement
  );


  initializeLineReveal(
    readingElement
  );
}


/* =========================================================
   PROGRESO DE LECTURA
   ========================================================= */

function initializeReadingProgress(
  readingElement
) {
  const language =
  readingElement.dataset
    .language ===
      "en"
      ? "en"
      : "es";
  const fill =
    elements.container.querySelector(
      "[data-reading-progress-fill]"
    );


  const star =
    elements.container.querySelector(
      "[data-reading-progress-star]"
    );


  const label =
    elements.container.querySelector(
      "[data-reading-progress-label]"
    );


  if (
    !fill ||
    !star ||
    !label
  ) {
    return;
  }


  let ticking =
    false;


  const updateProgress =
    () => {
      ticking =
        false;


      const rect =
        readingElement.getBoundingClientRect();


      const viewportHeight =
        window.innerHeight;


      const readableDistance =
        Math.max(
          1,
          readingElement.offsetHeight -
            viewportHeight *
            0.55
        );


      const traveled =
        Math.max(
          0,
          -rect.top +
            viewportHeight *
            0.18
        );


      const progress =
        clamp(
          traveled /
            readableDistance *
            100,
          0,
          100
        );


      const isMobile =
        window.matchMedia(
          "(max-width: 600px)"
        ).matches;


      /*
       * Escritorio/tablet:
       * progreso vertical.
       *
       * Móvil:
       * progreso horizontal.
       */
      if (isMobile) {
        fill.style.width =
          `${progress}%`;


        fill.style.height =
          "100%";


        star.style.left =
          `${progress}%`;


        star.style.top =
          "50%";

      } else {
        fill.style.width =
          "100%";


        fill.style.height =
          `${progress}%`;


        star.style.left =
          "50%";


        star.style.top =
          `${progress}%`;
      }


      llabel.textContent =
  getProgressMessage(
    progress,
    language
  );


      /*
       * Al llegar al final añadimos una clase
       * que activa una pequeña celebración.
       */
      star.classList.toggle(
        "is-complete",
        progress >=
          96
      );
    };


  const requestProgressUpdate =
    () => {
      if (ticking) {
        return;
      }


      ticking =
        true;


      requestAnimationFrame(
        updateProgress
      );
    };


  window.addEventListener(
    "scroll",
    requestProgressUpdate,
    {
      passive:
        true
    }
  );


  window.addEventListener(
    "resize",
    requestProgressUpdate
  );


  readerState.progressCleanup =
    () => {
      window.removeEventListener(
        "scroll",
        requestProgressUpdate
      );


      window.removeEventListener(
        "resize",
        requestProgressUpdate
      );
    };


  updateProgress();
}


/* =========================================================
   MENSAJES DEL PROGRESO
   ========================================================= */

function getProgressMessage(
  progress,
  language = "es"
) {
  const english =
    language ===
    "en";


  if (
    progress <
    12
  ) {
    return english
      ? "Starting"
      : "Empezando";
  }


  if (
    progress <
    38
  ) {
    return english
      ? "Great job!"
      : "¡Muy bien!";
  }


  if (
    progress <
    68
  ) {
    return english
      ? "Keep going!"
      : "¡Sigue así!";
  }


  if (
    progress <
    92
  ) {
    return english
      ? "Almost there!"
      : "¡Ya casi!";
  }


  return english
    ? "You did it!"
    : "¡Lo lograste!";
}


/* =========================================================
   APARICIÓN DE LÍNEAS
   ========================================================= */

function initializeLineReveal(
  readingElement
) {
  const lines =
    [
      ...readingElement.querySelectorAll(
        ".reading-text__line"
      )
    ];


  if (
    lines.length ===
    0
  ) {
    return;
  }


  const reducedMotion =
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (
    reducedMotion ||
    !(
      "IntersectionObserver"
      in window
    )
  ) {
    revealAllLines(
      lines
    );

    return;
  }


  readerState.lineObserver =
    new IntersectionObserver(
      (
        entries,
        observer
      ) => {
        for (
          const entry
          of entries
        ) {
          if (
            !entry.isIntersecting
          ) {
            continue;
          }


          entry.target.classList.add(
            "is-visible"
          );


          observer.unobserve(
            entry.target
          );
        }
      },
      {
        threshold:
          0.16,

        rootMargin:
          "0px 0px -5% 0px"
      }
    );


  /*
   * Las primeras líneas se muestran inmediatamente.
   * Así nunca aparece una página de lectura vacía
   * esperando al IntersectionObserver.
   */
  lines.forEach(
    (
      line,
      index
    ) => {
      if (
        index <
        2
      ) {
        line.classList.add(
          "is-visible"
        );

        return;
      }


      readerState.lineObserver.observe(
        line
      );
    }
  );
}


/* =========================================================
   MOSTRAR TODAS LAS LÍNEAS
   ========================================================= */

function revealAllLines(
  lines
) {
  for (
    const line
    of lines
  ) {
    line.classList.add(
      "is-visible"
    );
  }
}


/* =========================================================
   LIMPIAR EXPERIENCIA PREVIA
   ========================================================= */

function cleanupReaderExperience() {
  if (
    typeof readerState.progressCleanup ===
      "function"
  ) {
    readerState.progressCleanup();
  }


  readerState.progressCleanup =
    null;


  if (
    readerState.lineObserver
  ) {
    readerState.lineObserver.disconnect();
  }


  readerState.lineObserver =
    null;
}


/* =========================================================
   LÍNEAS VÁLIDAS
   ========================================================= */

function getValidLines(
  reading
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
        typeof line ===
          "string" &&
        line.trim().length >
          0
    )
    .map(
      (line) =>
        line.trim()
    );
}


/* =========================================================
   VALORES SEGUROS
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


  return "Lectura";
}


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


function getSafeLevel(
  reading
) {
  const level =
    Number(
      reading?.grade ??
      reading?.level
    );


  if (
    Number.isFinite(
      level
    ) &&
    level >
      0
  ) {
    return Math.round(
      level
    );
  }


  return 1;
}

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
    readingTime >
      0
  ) {
    return Math.round(
      readingTime
    );
  }


  return 1;
}


/* =========================================================
   ILUSTRACIÓN
   ========================================================= */

function prepareIllustration(
  illustrationPath,
  title
) {
  if (!illustrationPath) {
    return;
  }


  const imageElement =
    elements.container.querySelector(
      ".reading-text__image"
    );


  if (!imageElement) {
    return;
  }


  const markAsLoaded =
    () => {
      imageElement.classList.add(
        "is-loaded"
      );
    };


  imageElement.addEventListener(
    "load",
    markAsLoaded,
    {
      once:
        true
    }
  );


  imageElement.addEventListener(
    "error",
    () => {
      console.warn(
        `No se pudo cargar la ilustración de "${title}": ${illustrationPath}`
      );


      const figure =
        imageElement.closest(
          ".reading-text__illustration"
        );


      if (figure) {
        figure.hidden =
          true;
      }
    },
    {
      once:
        true
    }
  );


  if (
    imageElement.complete &&
    imageElement.naturalWidth >
      0
  ) {
    markAsLoaded();
  }
}


/* =========================================================
   ESTADO DE CARGA
   ========================================================= */

function setLoadingState(
  loading
) {
  const isLoading =
    Boolean(
      loading
    );


  if (
    elements.loading
  ) {
    elements.loading.hidden =
      !isLoading;
  }


  if (
    elements.container
  ) {
    elements.container.setAttribute(
      "aria-busy",
      String(
        isLoading
      )
    );
  }
}


/* =========================================================
   ERROR
   ========================================================= */

function showError(
  error
) {
  cleanupReaderExperience();


  if (
    elements.container
  ) {
    elements.container.hidden =
      true;


    elements.container.setAttribute(
      "aria-busy",
      "false"
    );
  }


  if (!elements.error) {
    return;
  }


  elements.error.hidden =
    false;


  const messageElement =
    elements.error.querySelector(
      "[data-reading-error-message]"
    );


  if (
    messageElement
  ) {
    messageElement.textContent =
      error?.message ??
      "No fue posible abrir esta lectura.";
  }
}


/* =========================================================
   CLAMP
   ========================================================= */

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value
    )
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
      value ??
      ""
    );


  return element.innerHTML;
}


/* =========================================================
   INICIAR
   ========================================================= */

function startReader() {
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeReader,
      {
        once:
          true
      }
    );


    return;
  }


  initializeReader();
}


startReader();
