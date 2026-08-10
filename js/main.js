console.log("main.js cargado correctamente");


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
  renderResult
} from "./modules/readingRenderer.js";

import {
  openBook,
  turnPage
} from "./modules/bookAnimation.js";

import {
  resetReveal,
  revealReading
} from "./modules/revealAnimation.js";


const state = {
  readings: [],
  selectedReading: null,
  previousReadingId: null,
  previewReadingId: null,
  isSelecting: false,
  hasOpenedBook: false
};


const elements = {
  welcome:
    document.querySelector("#welcome"),

  discovery:
    document.querySelector("#discovery"),

  discoverButton:
    document.querySelector("#discover-button"),

  book:
    document.querySelector("#book"),

  pageTurn:
    document.querySelector("#page-turn"),

  ritual:
    document.querySelector("#ritual"),

  preview:
    document.querySelector("#story-preview"),

  previewImage:
    document.querySelector("#preview-image"),

  previewTitle:
    document.querySelector("#preview-title"),

  result:
    document.querySelector("#story-result"),

  resultEyebrow:
    document.querySelector("#result-eyebrow"),

  resultCoverWrapper:
    document.querySelector("#result-cover-wrapper"),

  resultImage:
    document.querySelector("#result-image"),

  resultTitle:
    document.querySelector("#result-title"),

  resultDescription:
    document.querySelector("#result-description"),

  resultActions:
    document.querySelector("#result-actions"),

  readButton:
    document.querySelector("#read-button"),

  againButton:
    document.querySelector("#again-button"),

  liveRegion:
    document.querySelector("#live-region")
};


function validateRequiredElements() {
  const requiredElements = {
    welcome: elements.welcome,
    discovery: elements.discovery,
    discoverButton: elements.discoverButton,
    book: elements.book,
    pageTurn: elements.pageTurn,
    ritual: elements.ritual,
    preview: elements.preview,
    previewImage: elements.previewImage,
    previewTitle: elements.previewTitle,
    result: elements.result,
    resultEyebrow: elements.resultEyebrow,
    resultCoverWrapper:
      elements.resultCoverWrapper,
    resultImage: elements.resultImage,
    resultTitle: elements.resultTitle,
    resultDescription:
      elements.resultDescription,
    resultActions: elements.resultActions,
    readButton: elements.readButton,
    againButton: elements.againButton,
    liveRegion: elements.liveRegion
  };


  for (
    const [name, element]
    of Object.entries(requiredElements)
  ) {
    if (!element) {
      throw new Error(
        `No se encontró el elemento requerido: ${name}`
      );
    }
  }
}


async function initialize() {
  console.log("initialize ejecutado");

  try {
    validateRequiredElements();


    state.readings =
      await loadReadings(
        CONFIG.readingsIndexPath
      );

      await preloadReadingImages(
  state.readings
);

elements.discoverButton.disabled =
  false;

elements.discoverButton.textContent =
  "Descubrir una lectura";
  
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


    console.info(
      `Quodam iniciado con ${state.readings.length} lecturas.`
    );

  } catch (error) {
    console.error(
      "Error al inicializar Quodam:",
      error
    );


    if (elements.discoverButton) {
      elements.discoverButton.disabled = true;

      elements.discoverButton.textContent =
        "No fue posible iniciar Quodam";
    }
  }
}


async function startDiscovery() {
  if (state.isSelecting) {
    return;
  }


  state.isSelecting = true;


  try {
    elements.welcome.classList.remove(
      "scene--active"
    );


    elements.discovery.classList.add(
      "scene--active"
    );


    hideElement(
      elements.preview
    );


    hideElement(
      elements.result
    );


    resetReveal(
      elements
    );


    elements.liveRegion.textContent =
      "Quodam está buscando una lectura para ti.";


    /*
     * La primera vez abrimos el libro.
     */
    if (!state.hasOpenedBook) {
      showElement(
        elements.ritual
      );


      await openBook(
        elements.book
      );


      state.hasOpenedBook = true;


      await wait(
        CONFIG.ritualDuration
      );


      await turnPage(
        elements.pageTurn
      );


      hideElement(
        elements.ritual
      );

    } else {
      /*
       * Si el libro ya está abierto,
       * solamente pasamos una página.
       */
      await turnPage(
        elements.pageTurn
      );
    }


    showElement(
      elements.preview
    );


    await runSelectionAnimation();

  } catch (error) {
    console.error(
      "Error durante el descubrimiento:",
      error
    );


    elements.liveRegion.textContent =
      "Ocurrió un problema al buscar una lectura.";

  } finally {
    state.isSelecting = false;
  }
}


async function runSelectionAnimation() {
  let currentReadingId =
    state.previewReadingId;


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
        "No se pudo obtener una lectura para la vista previa."
      );
    }


    currentReadingId =
      previewReading.id;


    state.previewReadingId =
      previewReading.id;


    renderPreview(
      previewReading,
      elements
    );


    const delay =
      calculateSelectionDelay(
        round
      );


    await wait(delay);
  }


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
   * Mostramos la lectura definitiva
   * brevemente antes de revelar
   * el resultado.
   */
  renderPreview(
    selectedReading,
    elements
  );


  await wait(600);


  await turnPage(
    elements.pageTurn
  );


  await showSelectedReading();
}


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


  elements.liveRegion.textContent =
    `Lectura encontrada: ${state.selectedReading.title}`;


  await revealReading(
    elements
  );
}


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


function calculateSelectionDelay(round) {
  const {
    initialDelay,
    maximumDelay,
    slowdownStart,
    totalRounds
  } = CONFIG.selection;


  if (round < slowdownStart) {
    return initialDelay;
  }


  const remainingRounds =
    totalRounds -
    slowdownStart -
    1;


  /*
   * Evitamos división entre cero
   * si la configuración cambia.
   */
  if (remainingRounds <= 0) {
    return maximumDelay;
  }


  const progress =
    (
      round -
      slowdownStart
    ) /
    remainingRounds;


  /*
   * Curva cuadrática:
   * mantiene la búsqueda rápida
   * al principio y frena más
   * claramente al final.
   */
  const easedProgress =
    progress * progress;


  return Math.round(
    initialDelay +
    (
      maximumDelay -
      initialDelay
    ) *
    easedProgress
  );
}


initialize();
