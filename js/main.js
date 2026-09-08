import {
  CONFIG
} from "./config.js";

import {
  loadReadingsForMode
} from "./modules/readingRepository.js";


import {
  saveReadingMode,
  getSavedReadingMode,
  normalizeReadingMode
} from "./modules/languageMode.js";


import {
  wait,
  showElement,
  hideElement
} from "./utils/helpers.js";


import {
   selectFinalReading,
  selectRandomReading,
  selectDifferentReading
} from "./modules/readingSelector.js";


import {
  renderReadingPage,
  renderBookSpread,
  clearBookPage
} from "./modules/readingRenderer.js";


import {
  openBook,
  turnPage,
  setBookSearching,
  setBookSelected,
  celebrateBookSelection
} from "./modules/bookAnimation.js";


/* =========================================================
   QUODAM — MAIN v3
   ========================================================= */

const state = {
  mode:
    null,

  readings:
    [],

  currentReading:
    null,

  selectedReading:
    null,

  previousReadingId:
    null,

  isSelecting:
    false,

  isLoadingMode:
    false,

  hasOpenedBook:
    false
};

/* =========================================================
   DOM
   ========================================================= */

const elements = {
   welcome:
    document.querySelector(
      "#welcome"
    ),

  discovery:
    document.querySelector(
      "#discovery"
    ),

  modeSelector:
    document.querySelector(
      "#mode-selector"
    ),

  modeButtons:
    document.querySelectorAll(
      "[data-reading-mode]"
    ),

  modeStatus:
    document.querySelector(
      "#mode-status"
    ),

  book:
    document.querySelector(
      "#book"
    ),


  ritual:
    document.querySelector(
      "#ritual"
    ),

  turningPage:
    document.querySelector(
      "#turning-page"
    ),

  turningFrontContent:
    document.querySelector(
      "#turning-front-content"
    ),

  turningBackContent:
    document.querySelector(
      "#turning-back-content"
    ),

  leftPageContent:
    document.querySelector(
      "#left-page-content"
    ),

  rightPageContent:
    document.querySelector(
      "#right-page-content"
    ),

  liveRegion:
    document.querySelector(
      "#live-region"
    )
};


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

async function initialize() {
  try {
    validateRequiredElements();


    registerEvents();


    const savedMode =
      getSavedReadingMode();


    if (savedMode) {
      state.mode =
        savedMode;
    }


    setModeStatus(
      ""
    );


    handleInitialNavigation();


    console.info(
      "Quodam v4 listo para seleccionar un modo."
    );

  } catch (error) {
    console.error(
      "Error al inicializar Quodam:",
      error
    );


    setModeStatus(
      "No pudimos preparar Quodam. Intenta recargar la página."
    );
  }
}


/* =========================================================
   VALIDACIÓN
   ========================================================= */

function validateRequiredElements() {
  const required = {
    welcome:
      elements.welcome,

    discovery:
      elements.discovery,

  modeSelector:
  elements.modeSelector,

modeStatus:
  elements.modeStatus,

    book:
      elements.book,

    ritual:
      elements.ritual,

    turningPage:
      elements.turningPage,

    turningFrontContent:
      elements.turningFrontContent,

    turningBackContent:
      elements.turningBackContent,

    leftPageContent:
      elements.leftPageContent,

    rightPageContent:
      elements.rightPageContent,

    liveRegion:
      elements.liveRegion
  };


  const missing =
    Object.entries(
      required
    )
      .filter(
        (
          [
            ,
            element
          ]
        ) =>
          !element
      )
      .map(
        (
          [
            name
          ]
        ) =>
          name
      );


  if (
    missing.length >
    0
  ) {
    throw new Error(
      `Faltan elementos HTML: ${missing.join(
        ", "
      )}`
    );
  }
}
if (
  elements.modeButtons.length ===
  0
) {
  throw new Error(
    "No existen botones de modo de lectura."
  );
}


/* =========================================================
   EVENTOS
   ========================================================= */

function registerEvents() {
  elements.modeButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const mode =
            button.dataset
              .readingMode;


          selectReadingMode(
            mode
          );
        }
      );

    }
  );
}

/* =========================================================
   SELECCIONAR MODO
   ========================================================= */

async function selectReadingMode(
  mode
) {
  if (
    state.isLoadingMode ||
    state.isSelecting
  ) {
    return;
  }


  const normalizedMode =
    normalizeReadingMode(
      mode
    );


  if (!normalizedMode) {
    setModeStatus(
      "Ese modo de lectura no está disponible."
    );

    return;
  }


  state.isLoadingMode =
    true;


  setModeButtonsDisabled(
    true
  );


  setModeStatus(
    normalizedMode ===
      "en"
      ? "Preparing your adventure..."
      : "Preparando tu aventura..."
  );


  try {

    /*
     * Aquí ocurre la nueva carga optimizada.
     */
    const catalog =
      await loadReadingsForMode(
        normalizedMode
      );


    state.mode =
      saveReadingMode(
        normalizedMode
      );


    state.readings =
      catalog.all;


    validateReadings(
      state.readings
    );


    console.info(
      "MODO QUODAM:",
      {
        mode:
          state.mode,

        languages:
          catalog.languages,

        readings:
          state.readings.length
      }
    );


    setModeStatus(
      ""
    );


    await startDiscovery();

  } catch (error) {
    console.error(
      "No se pudo preparar el modo de lectura:",
      error
    );


    setModeStatus(
      "No pudimos cargar las lecturas. Intenta otra vez."
    );

  } finally {
    state.isLoadingMode =
      false;


    setModeButtonsDisabled(
      false
    );
  }
}


/* =========================================================
   NAVEGACIÓN INICIAL
   ========================================================= */

function handleInitialNavigation() {
  const params =
    new URLSearchParams(
      window.location.search
    );


 if (
  !shouldDiscover ||
  !state.mode
) {
  return;
}


window.history.replaceState(
  {},
  "",
  window.location.pathname
);


selectReadingMode(
  state.mode
);


 if (!shouldDiscover) {
  return;
}
}


/* =========================================================
   DESCUBRIMIENTO
   ========================================================= */

async function startDiscovery() {
  if (
    state.isSelecting
  ) {
    return;
  }


  state.isSelecting =
    true;


  try {
    showDiscoveryScene();


    prepareDiscoveryInterface();


    announce(
      "Quodam está buscando una lectura para ti."
    );


    if (
      !state.hasOpenedBook
    ) {
      await runOpeningSequence();
    }


    await runSelectionAnimation();

  } catch (error) {
    console.error(
      "Error durante la selección:",
      error
    );


    setBookSearching(
      elements.book,
      false
    );


    announce(
      "Ocurrió un problema al buscar una lectura."
    );

  } finally {
    state.isSelecting =
      false;

  }
}


/* =========================================================
   ESCENA
   ========================================================= */

function showDiscoveryScene() {
  elements.welcome.classList.remove(
    "scene--active"
  );


  elements.discovery.classList.add(
    "scene--active"
  );
}


/* =========================================================
   PREPARACIÓN
   ========================================================= */

function prepareDiscoveryInterface() {
  removeOracle();


  removeFinalActions();


  state.currentReading =
    null;


  state.selectedReading =
    null;


  setBookSelected(
    elements.book,
    false
  );


  setBookSearching(
    elements.book,
    false
  );


  clearBookPage(
    elements.leftPageContent
  );


  clearBookPage(
    elements.rightPageContent
  );


  clearTurningPage();


  /*
   * Ocultamos restos del resultado antiguo
   * si todavía existen en el HTML.
   */
  document.querySelector(
    "#story-result"
  )?.setAttribute(
    "hidden",
    ""
  );


  document.querySelector(
    "#story-preview"
  )?.setAttribute(
    "hidden",
    ""
  );


  if (
    state.hasOpenedBook
  ) {
    hideElement(
      elements.ritual
    );
  }
}


/* =========================================================
   APERTURA
   ========================================================= */

async function runOpeningSequence() {
  showElement(
    elements.ritual
  );


  await openBook(
    elements.book
  );


  state.hasOpenedBook =
    true;


  await wait(
    CONFIG.ritualDuration
  );


  await turnPage({
    turningPage:
      elements.turningPage,

    duration:
      520
  });


  hideElement(
    elements.ritual
  );
}


/* =========================================================
   RULETA
   ========================================================= */

async function runSelectionAnimation() {
  setBookSearching(
    elements.book,
    true
  );


  /*
   * ÚNICA selección del ganador.
   */
  state.selectedReading =
    selectFinalReading(
      state.readings,
      state.previousReadingId
    );


  if (
    !state.selectedReading
  ) {
    throw new Error(
      "No se pudo seleccionar la lectura ganadora."
    );
  }


  console.log(
    "GANADOR:",
    {
      id:
        state.selectedReading.id,

      title:
        state.selectedReading.title,

      image:
        state.selectedReading.image
    }
  );


  const firstReading =
    selectIntermediateReading(
      null
    ) ??
    state.selectedReading;


  setCurrentReading(
    firstReading
  );


  const totalRounds =
    Math.max(
      5,
      Math.min(
        Number(
          CONFIG.selection.totalRounds
        ) ||
        8,
        9
      )
    );


  for (
    let round = 0;
    round <
    totalRounds;
    round++
  ) {
    const isFinalRound =
      round ===
      totalRounds -
        1;


    const nextReading =
      isFinalRound
        ? state.selectedReading
        : selectIntermediateReading(
            state.currentReading?.id
          );


    if (
      !nextReading
    ) {
      throw new Error(
        "No se pudo obtener la siguiente lectura."
      );
    }


    /*
     * 1. Frente = texto actual.
     */
    renderReadingPage(
      state.currentReading,
      elements.turningFrontContent,
      "text"
    );


    /*
     * 2. Reverso = imagen de LA MISMA lectura
     *    que ocupará el siguiente spread.
     */
    renderReadingPage(
      nextReading,
      elements.turningBackContent,
      "image"
    );


    const duration =
      calculateTurnDuration(
        round,
        totalRounds
      );


    await turnPage({
      turningPage:
        elements.turningPage,

      duration,

      onHalfTurn:
        () => {
          /*
           * Imagen y texto cambian JUNTOS.
           * Así nunca queda la página derecha
           * mostrando otra lectura.
           */
          setCurrentReading(
            nextReading
          );
        }
    });


    state.currentReading =
      nextReading;
  }


  await finalizeSelection();
}


/* =========================================================
   LECTURAS INTERMEDIAS
   ========================================================= */

function selectIntermediateReading(
  currentId
) {
  const candidates =
    state.readings.filter(
      (reading) =>
        reading.id !==
          currentId &&
        reading.id !==
          state.selectedReading?.id
    );


  if (
    candidates.length >
    0
  ) {
    return selectRandomReading(
      candidates,
      currentId
    );
  }


  return (
    selectDifferentReading(
      state.readings,
      currentId
    ) ??
    state.selectedReading
  );
}


/* =========================================================
   MOSTRAR UNA LECTURA EN EL LIBRO
   ========================================================= */

function setCurrentReading(
  reading
) {
  if (!reading) {
    return;
  }


  state.currentReading =
    reading;


  renderBookSpread({
    reading,

    leftContainer:
      elements.leftPageContent,

    rightContainer:
      elements.rightPageContent
  });
}


/* =========================================================
   DURACIÓN PROGRESIVA
   ========================================================= */

function calculateTurnDuration(
  round,
  totalRounds
) {
  const fastDuration =
    310;


  const slowDuration =
    560;


  const progress =
    totalRounds <=
      1
      ? 1
      : round /
        (
          totalRounds -
          1
        );


  /*
   * Empieza ágil y desacelera suavemente.
   */
  const eased =
    progress *
    progress;


  return Math.round(
    fastDuration +
    (
      slowDuration -
      fastDuration
    ) *
    eased
  );
}


/* =========================================================
   FINALIZAR
   ========================================================= */

async function finalizeSelection() {
  if (
    !state.selectedReading
  ) {
    throw new Error(
      "No existe una lectura seleccionada."
    );
  }


  /*
   * GARANTÍA FINAL:
   * volvemos a renderizar las DOS páginas
   * usando exactamente selectedReading.
   */
  state.currentReading =
    state.selectedReading;


  renderBookSpread({
    reading:
      state.selectedReading,

    leftContainer:
      elements.leftPageContent,

    rightContainer:
      elements.rightPageContent
  });


  /*
   * La hoja de giro ya terminó.
   * No puede quedarse tapando la página derecha.
   */
  clearTurningPage();


  state.previousReadingId =
    state.selectedReading.id;


  setBookSearching(
    elements.book,
    false
  );


  setBookSelected(
    elements.book,
    true
  );


  announce(
    `La lectura te ha escogido: ${state.selectedReading.title}`
  );


  await celebrateBookSelection(
    elements.book,
    500
  );


  /*
   * Ahora aparece la hoja parlanchina:
   * la propia hoja abre y cierra como una boca.
   */
  await showSelectionOracle(
    state.selectedReading
  );


  /*
   * Los botones aparecen al terminar el anuncio.
   */
  showFinalActions();


  console.log(
    "LECTURA FINAL SINCRONIZADA:",
    {
      selectedId:
        state.selectedReading.id,

      visibleId:
        state.currentReading?.id,

      leftDOM:
        elements.leftPageContent
          .querySelector(
            "[data-reading-id]"
          )
          ?.dataset
          .readingId,

      rightDOM:
        elements.rightPageContent
          .querySelector(
            "[data-reading-id]"
          )
          ?.dataset
          .readingId,

      title:
        state.selectedReading.title,

      image:
        state.selectedReading.image
    }
  );
}


/* =========================================================
   HOJA PARLANTE
   ========================================================= */

async function showSelectionOracle(
  reading
) {
  removeOracle();


  const oracle =
    document.createElement(
      "div"
    );


  oracle.className =
    "book-oracle";


  oracle.setAttribute(
    "role",
    "status"
  );


  oracle.setAttribute(
    "aria-live",
    "polite"
  );


  oracle.innerHTML = `
    <div
      class="book-oracle__veil"
      aria-hidden="true"
    ></div>


    <div
      class="book-oracle__sheet"
    >

      <!-- =================================
           MITAD SUPERIOR DE LA HOJA
      ================================== -->

      <div
        class="
          book-oracle__jaw
          book-oracle__jaw--top
        "
      >

        <div
          class="book-oracle__face"
          aria-hidden="true"
        >

          <span
            class="
              book-oracle__eye
              book-oracle__eye--left
            "
          ></span>


          <span
            class="
              book-oracle__eye
              book-oracle__eye--right
            "
          ></span>

        </div>

      </div>


      <!-- =================================
           INTERIOR DE LA BOCA
      ================================== -->

      <div
        class="book-oracle__mouth-space"
      >

        <div
          class="book-oracle__speech"
        >

          <p
            class="book-oracle__message"
          >
            La lectura te ha escogido
          </p>


          <strong
            class="book-oracle__title"
          >
            ${escapeHTML(
              reading?.title ??
              "Tu lectura"
            )}
          </strong>

        </div>

      </div>


      <!-- =================================
           MITAD INFERIOR DE LA HOJA
      ================================== -->

      <div
        class="
          book-oracle__jaw
          book-oracle__jaw--bottom
        "
      ></div>


      <!-- Sello mágico -->

      <span
        class="book-oracle__seal"
        aria-hidden="true"
      >
        ✦
      </span>

    </div>
  `;


  elements.book.append(
    oracle
  );


  /*
   * 1. Entra cerrada.
   */
  await nextFrame();


  oracle.classList.add(
    "is-visible"
  );


  await wait(
    500
  );


  /*
   * 2. HABLA.
   *
   * El CSS de .is-speaking hace que:
   * - mandíbula superior suba,
   * - mandíbula inferior baje,
   * - aparezca el interior oscuro,
   * - aparezca el mensaje,
   * - parpadeen los ojos.
   */
  oracle.classList.add(
    "is-speaking"
  );


  await wait(
    2850
  );


  /*
   * 3. Se cierra.
   */
  oracle.classList.remove(
    "is-speaking"
  );


  oracle.classList.add(
    "is-closing"
  );


  await wait(
    520
  );


  /*
   * 4. Desaparece.
   */
  oracle.classList.add(
    "is-leaving"
  );


  await wait(
    420
  );


  oracle.remove();
}


/* =========================================================
   ACCIONES FINALES
   ========================================================= */

function showFinalActions() {
  removeFinalActions();


  const textPage =
    elements.rightPageContent.querySelector(
      ".book-reading--text-page"
    );


  if (!textPage) {
    return;
  }


  const continueMessage =
    textPage.querySelector(
      ".book-reading__continue"
    );


  if (
    continueMessage
  ) {
    continueMessage.hidden =
      true;
  }


  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "book-reading__final-actions";


  actions.innerHTML = `
    <button
      class="button button--primary"
      type="button"
      data-quodam-action="read"
    >
      Leer cuento completo
    </button>


    <button
      class="button button--secondary"
      type="button"
      data-quodam-action="again"
    >
      Descubrir otra
    </button>
  `;


  const readButton =
    actions.querySelector(
      '[data-quodam-action="read"]'
    );


  const againButton =
    actions.querySelector(
      '[data-quodam-action="again"]'
    );


  readButton.addEventListener(
    "click",
    openSelectedReading
  );


  againButton.addEventListener(
    "click",
    startDiscovery
  );


  textPage.append(
    actions
  );


  requestAnimationFrame(
    () => {
      actions.classList.add(
        "is-visible"
      );
    }
  );
}


/* =========================================================
   ABRIR LECTURA COMPLETA
   ========================================================= */

function openSelectedReading() {
  if (
    state.isSelecting ||
    !state.selectedReading?.id
  ) {
    return;
  }


  const selectedId =
    normalizeReadingId(
      state.selectedReading.id
    );


  if (!selectedId) {
    return;
  }


  /*
   * Protección contra el bug original.
   */
  if (
    state.currentReading?.id !==
    selectedId
  ) {
    console.error(
      "Quodam bloqueó una navegación desincronizada.",
      {
        selected:
          selectedId,

        visible:
          state.currentReading?.id
      }
    );

    return;
  }


  window.location.assign(
    `./pages/lectura.html?id=${encodeURIComponent(
      selectedId
    )}`
  );
}


/* =========================================================
   LIMPIEZA DE ACCIONES
   ========================================================= */

function removeFinalActions() {
  elements.rightPageContent
    ?.querySelector(
      ".book-reading__final-actions"
    )
    ?.remove();
}


/* =========================================================
   LIMPIEZA DEL ORÁCULO
   ========================================================= */

function removeOracle() {
  elements.book
    ?.querySelector(
      ".book-oracle"
    )
    ?.remove();
}


/* =========================================================
   LIMPIAR HOJA DE GIRO
   ========================================================= */

function clearTurningPage() {
  if (
    !elements.turningPage
  ) {
    return;
  }


  elements.turningPage.classList.remove(
    "is-turning",
    "is-half-turn"
  );


  elements.turningPage.setAttribute(
    "aria-busy",
    "false"
  );


  clearBookPage(
    elements.turningFrontContent
  );


  clearBookPage(
    elements.turningBackContent
  );


  /*
   * IMPORTANTE:
   * cuando no gira, la hoja temporal desaparece.
   */
  elements.turningPage.hidden =
    true;
}


/* =========================================================
   VALIDAR DATOS
   ========================================================= */

function validateReadings(
  readings
) {
  if (
    !Array.isArray(
      readings
    ) ||
    readings.length ===
      0
  ) {
    throw new Error(
      "No hay lecturas válidas."
    );
  }


  const ids =
    new Set();


  for (
    const reading
    of readings
  ) {
    const id =
      normalizeReadingId(
        reading?.id
      );


    if (!id) {
      throw new Error(
        "Existe una lectura sin ID."
      );
    }


    if (
      ids.has(
        id
      )
    ) {
      throw new Error(
        `ID duplicado: "${id}".`
      );
    }


    reading.id =
      id;


    ids.add(
      id
    );


    /*
     * Imagen y texto deben venir del MISMO objeto.
     */
    if (
      typeof reading.image !==
        "string" ||
      !reading.image.trim()
    ) {
      console.warn(
        `La lectura "${id}" no tiene una imagen válida.`
      );
    }
  }
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


  return normalized ||
    null;
}


/* =========================================================
   UTILIDADES
   ========================================================= */

function nextFrame() {
  return new Promise(
    (resolve) =>
      requestAnimationFrame(
        resolve
      )
  );
}


function escapeHTML(
  value
) {
  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(
      value ??
      ""
    );


  return div.innerHTML;
}


/* =========================================================
   BOTÓN PRINCIPAL
   ========================================================= */




/* =========================================================
   ACCESIBILIDAD
   ========================================================= */

function announce(
  message
) {
  elements.liveRegion.textContent =
    String(
      message ??
      ""
    );
}
function setModeButtonsDisabled(
  disabled
) {
  elements.modeButtons.forEach(
    (button) => {
      button.disabled =
        disabled;
    }
  );
}


function setModeStatus(
  message
) {
  if (!elements.modeStatus) {
    return;
  }


  elements.modeStatus.textContent =
    message;
}


/* =========================================================
   INICIAR
   ========================================================= */

initialize();
