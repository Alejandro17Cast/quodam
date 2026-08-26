import { CONFIG } from "./config.js";

import {
  preloadReadingImages
} from "./modules/imagePreloader.js";

import {
  wait,
  showElement,
  hideElement
} from "./utils/helpers.js";

import {
  loadReadings,
  selectRandomReading,
  selectDifferentReading
} from "./modules/readingSelector.js";

import {
  renderPreview,
  renderResult,
  renderReadingPage
} from "./modules/readingRenderer.js";

import {
  openBook,
  turnPage
} from "./modules/bookAnimation.js";

import {
  resetReveal,
  revealReading
} from "./modules/revealAnimation.js";


/* =========================================================
   ESTADO GLOBAL DE LA EXPERIENCIA
   ========================================================= */

const state = {
  readings: [],

  selectedReading: null,

  previousReadingId: null,

  previewReadingId: null,

  isSelecting: false,

  hasOpenedBook: false
};


/* =========================================================
   REFERENCIAS DEL DOM
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

  discoverButton:
    document.querySelector(
      "#discover-button"
    ),


  /* Libro */

  book:
    document.querySelector(
      "#book"
    ),

  ritual:
    document.querySelector(
      "#ritual"
    ),


  /* Página real animada */

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


  /* Páginas fijas */

  leftPageContent:
    document.querySelector(
      "#left-page-content"
    ),

  rightPageContent:
    document.querySelector(
      "#right-page-content"
    ),


  /*
   * Preview anterior.
   *
   * Todavía lo mantenemos porque forma
   * parte del HTML actual, pero poco a poco
   * dejará de ser protagonista.
   */

  preview:
    document.querySelector(
      "#story-preview"
    ),

  previewImage:
    document.querySelector(
      "#preview-image"
    ),

  previewTitle:
    document.querySelector(
      "#preview-title"
    ),


  /* Resultado */

  result:
    document.querySelector(
      "#story-result"
    ),

  resultStar:
    document.querySelector(
      "#result-star"
    ),

  resultEyebrow:
    document.querySelector(
      "#result-eyebrow"
    ),

  resultCoverWrapper:
    document.querySelector(
      "#result-cover-wrapper"
    ),

  resultImage:
    document.querySelector(
      "#result-image"
    ),

  resultTitle:
    document.querySelector(
      "#result-title"
    ),

  resultDescription:
    document.querySelector(
      "#result-description"
    ),

  resultActions:
    document.querySelector(
      "#result-actions"
    ),


  /* Acciones */

  readButton:
    document.querySelector(
      "#read-button"
    ),

  againButton:
    document.querySelector(
      "#again-button"
    ),


  /* Accesibilidad */

  liveRegion:
    document.querySelector(
      "#live-region"
    )
};


/* =========================================================
   VALIDACIÓN DE INTERFAZ
   ========================================================= */

function validateRequiredElements() {
  const requiredElements = {
    welcome:
      elements.welcome,

    discovery:
      elements.discovery,

    discoverButton:
      elements.discoverButton,

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

    preview:
      elements.preview,

    previewImage:
      elements.previewImage,

    previewTitle:
      elements.previewTitle,

    result:
      elements.result,

    resultStar:
      elements.resultStar,

    resultEyebrow:
      elements.resultEyebrow,

    resultCoverWrapper:
      elements.resultCoverWrapper,

    resultImage:
      elements.resultImage,

    resultTitle:
      elements.resultTitle,

    resultDescription:
      elements.resultDescription,

    resultActions:
      elements.resultActions,

    readButton:
      elements.readButton,

    againButton:
      elements.againButton,

    liveRegion:
      elements.liveRegion
  };


  for (
    const [name, element]
    of Object.entries(
      requiredElements
    )
  ) {
    if (!element) {
      throw new Error(
        `No se encontró el elemento requerido: ${name}`
      );
    }
  }
}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

async function initialize() {
  try {
    validateRequiredElements();


    /*
     * El botón empieza deshabilitado
     * mientras Quodam carga.
     */
    setDiscoveryButtonLoading();


    state.readings =
      await loadReadings(
        CONFIG.readingsIndexPath
      );


    if (!state.readings.length) {
      throw new Error(
        "Quodam no tiene lecturas disponibles."
      );
    }


    /*
     * Precargamos las imágenes para
     * reducir parpadeos.
     */
    await preloadReadingImages(
      state.readings
    );


    registerEvents();


    setDiscoveryButtonReady();


    console.info(
      `Quodam iniciado con ${state.readings.length} lecturas.`
    );


    handleInitialNavigation();

  } catch (error) {
    console.error(
      "Error al inicializar Quodam:",
      error
    );


    setDiscoveryButtonError();
  }
}


/* =========================================================
   EVENTOS
   ========================================================= */

function registerEvents() {
  elements.discoverButton.addEventListener(
    "click",
    startDiscovery
  );


  elements.againButton.addEventListener(
    "click",
    startDiscovery
  );


  elements.readButton.addEventListener(
    "click",
    openSelectedReading
  );
}


/* =========================================================
   NAVEGACIÓN INICIAL
   ========================================================= */

function handleInitialNavigation() {
  const params =
    new URLSearchParams(
      window.location.search
    );


  const shouldDiscover =
    params.get(
      "discover"
    ) === "true";


  const previousReadingId =
    params.get(
      "previous"
    );


  if (previousReadingId) {
    state.previousReadingId =
      previousReadingId;
  }


  if (!shouldDiscover) {
    return;
  }


  /*
   * Limpiamos la URL para que
   * actualizar la página no vuelva
   * a iniciar automáticamente.
   */
  window.history.replaceState(
    {},
    "",
    window.location.pathname
  );


  startDiscovery();
}


/* =========================================================
   DESCUBRIMIENTO
   ========================================================= */

async function startDiscovery() {
  if (state.isSelecting) {
    return;
  }


  state.isSelecting =
    true;


  lockDiscoveryActions();


  try {
    showDiscoveryScene();


    prepareDiscoveryInterface();


    announce(
      "Quodam está buscando una lectura para ti."
    );


    /*
     * Primera entrada:
     * mostramos ritual y abrimos libro.
     */
    if (!state.hasOpenedBook) {
      await runOpeningSequence();
    }


    /*
     * En búsquedas posteriores no
     * volvemos a abrir el libro.
     */

    elements.book.classList.add(
  "book--searching"
);
    await runSelectionAnimation();

  } catch (error) {
    console.error(
      "Error durante el descubrimiento:",
      error
    );


    announce(
      "Ocurrió un problema al buscar una lectura."
    );

  } finally {
    state.isSelecting =
      false;


    unlockDiscoveryActions();
  }
}


/* =========================================================
   CAMBIO DE ESCENA
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
   PREPARACIÓN DE INTERFAZ
   ========================================================= */

function prepareDiscoveryInterface() {
  hideElement(
    elements.preview
  );


  hideElement(
    elements.result
  );


  resetReveal(
    elements
  );


  clearTurningPage();


  /*
   * La página dinámica derecha queda
   * preparada para recibir contenido.
   */
  elements.rightPageContent.innerHTML =
    "";


  elements.leftPageContent.innerHTML =
    "";
}


/* =========================================================
   SECUENCIA DE APERTURA
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


  /*
   * Una hoja pasa para dar inicio
   * al descubrimiento.
   */
  await turnPage(
    elements.turningPage,
    650
  );


  hideElement(
    elements.ritual
  );
}


/* =========================================================
   ANIMACIÓN DE SELECCIÓN
   ========================================================= */

async function runSelectionAnimation() {
  let currentReadingId =
    state.previewReadingId;


  /*
   * Durante la ruleta no necesitamos
   * mostrar el preview antiguo.
   */
  hideElement(
    elements.preview
  );


  for (
    let round = 0;
    round < CONFIG.selection.totalRounds;
    round++
  ) {
    const previewReading =
      selectDifferentReading(
        state.readings,
        currentReadingId
      );


    if (!previewReading) {
      throw new Error(
        "No se pudo obtener una lectura para la página."
      );
    }


    currentReadingId =
      previewReading.id;


    state.previewReadingId =
      previewReading.id;


    /*
     * La lectura actual aparece
     * físicamente en la hoja.
     */
    renderReadingPage(
      previewReading,
      elements.turningFrontContent
    );


    /*
     * También preparamos la cara posterior
     * para que no se vea completamente vacía
     * durante el giro.
     */
    renderReadingPage(
      previewReading,
      elements.turningBackContent
    );


    const delay =
      calculateSelectionDelay(
        round
      );


    const pageDuration =
      calculatePageDuration(
        delay
      );


    await turnPage(
      elements.turningPage,
      pageDuration
    );
  }


  await selectFinalReading();
}


/* =========================================================
   LECTURA FINAL
   ========================================================= */

async function selectFinalReading() {
  const selectedReading =
    selectRandomReading(
      state.readings,
      state.previousReadingId
    );


  if (!selectedReading) {
    throw new Error(
      "No se pudo seleccionar una lectura."
    );
  }


  state.selectedReading =
    selectedReading;


  state.previousReadingId =
    selectedReading.id;


  /*
   * Antes de revelar el resultado,
   * mostramos la lectura final
   * en una última página.
   */
  renderReadingPage(
    selectedReading,
    elements.turningFrontContent
  );


  renderReadingPage(
    selectedReading,
    elements.turningBackContent
  );


  await turnPage(
    elements.turningPage,
    700
  );


  await wait(180);

elements.book.classList.remove(
  "book--searching"
);

elements.book.classList.add(
  "book--selected"
); 
  await showSelectedReading();
}


/* =========================================================
   REVELACIÓN
   ========================================================= */

async function showSelectedReading() {
  if (!state.selectedReading) {
    throw new Error(
      "No existe una lectura seleccionada."
    );
  }


  hideElement(
    elements.preview
  );


  resetReveal(
    elements
  );


  renderResult(
    state.selectedReading,
    elements
  );


  showElement(
    elements.result
  );


  announce(
    `Lectura encontrada: ${state.selectedReading.title}`
  );


  await revealReading(
    elements
  );
}


/* =========================================================
   ABRIR LECTURA
   ========================================================= */

function openSelectedReading() {
  if (!state.selectedReading) {
    console.warn(
      "No existe una lectura seleccionada para abrir."
    );

    return;
  }


  const readingId =
    encodeURIComponent(
      state.selectedReading.id
    );


  window.location.href =
    `./pages/lectura.html?id=${readingId}`;
}


/* =========================================================
   VELOCIDAD DE LA RULETA
   ========================================================= */

function calculateSelectionDelay(
  round
) {
  const {
    initialDelay,
    maximumDelay,
    slowdownStart,
    totalRounds
  } =
    CONFIG.selection;


  if (
    round <
    slowdownStart
  ) {
    return initialDelay;
  }


  const remainingRounds =
    totalRounds -
    slowdownStart -
    1;


  if (
    remainingRounds <= 0
  ) {
    return maximumDelay;
  }


  const progress =
    (
      round -
      slowdownStart
    ) /
    remainingRounds;


  /*
   * Curva cuadrática.
   *
   * La desaceleración apenas se percibe
   * al inicio y aumenta al final.
   */
  const easedProgress =
    progress *
    progress;


  return Math.round(
    initialDelay +
    (
      maximumDelay -
      initialDelay
    ) *
    easedProgress
  );
}


/* =========================================================
   VELOCIDAD DE LAS PÁGINAS
   ========================================================= */

function calculatePageDuration(
  delay
) {
  /*
   * Evitamos páginas tan rápidas
   * que sean prácticamente invisibles.
   */
  const minimumDuration =
    170;


  const maximumDuration =
    650;


  return Math.max(
    minimumDuration,
    Math.min(
      delay,
      maximumDuration
    )
  );
}


/* =========================================================
   LIMPIEZA DE LA HOJA
   ========================================================= */

function clearTurningPage() {
  elements.turningPage.classList.remove(
    "is-turning"
  );


  elements.turningPage.style.animationDuration =
    "";


  elements.turningFrontContent.innerHTML =
    "";


  elements.turningBackContent.innerHTML =
    "";
}


/* =========================================================
   BOTONES
   ========================================================= */

function lockDiscoveryActions() {
  elements.discoverButton.disabled =
    true;


  elements.againButton.disabled =
    true;
}


function unlockDiscoveryActions() {
  elements.discoverButton.disabled =
    false;


  elements.againButton.disabled =
    false;
}


function setDiscoveryButtonLoading() {
  elements.discoverButton.disabled =
    true;


  elements.discoverButton.textContent =
    "Preparando Quodam...";
}


function setDiscoveryButtonReady() {
  elements.discoverButton.disabled =
    false;


  elements.discoverButton.textContent =
    "Descubrir una lectura";
}


function setDiscoveryButtonError() {
  if (
    !elements.discoverButton
  ) {
    return;
  }


  elements.discoverButton.disabled =
    true;


  elements.discoverButton.textContent =
    "No fue posible iniciar Quodam";
}


/* =========================================================
   ACCESIBILIDAD
   ========================================================= */

function announce(message) {
  if (
    !elements.liveRegion
  ) {
    return;
  }


  elements.liveRegion.textContent =
    message;
}


/* =========================================================
   INICIAR QUODAM
   ========================================================= */

initialize();