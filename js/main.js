import { CONFIG } from "./config.js";

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


const state = {
  readings: [],
  selectedReading: null,
  previousReadingId: null,
  previewReadingId: null,
  isSelecting: false,
  hasOpenedBook: false
};


const elements = {
  welcome: document.querySelector("#welcome"),
  discovery: document.querySelector("#discovery"),

  discoverButton: document.querySelector("#discover-button"),

  book: document.querySelector("#book"),
  pageTurn: document.querySelector("#page-turn"),

  ritual: document.querySelector("#ritual"),

  preview: document.querySelector("#story-preview"),
  previewImage: document.querySelector("#preview-image"),
  previewTitle: document.querySelector("#preview-title"),

  result: document.querySelector("#story-result"),
  resultImage: document.querySelector("#result-image"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),

  readButton: document.querySelector("#read-button"),
  againButton: document.querySelector("#again-button"),

  liveRegion: document.querySelector("#live-region")
};


async function initialize() {
  try {
    state.readings = await loadReadings(
      CONFIG.readingsIndexPath
    );

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

  } catch (error) {
    console.error(
      "Error al inicializar Quodam:",
      error
    );

    elements.discoverButton.disabled = true;

    elements.discoverButton.textContent =
      "No fue posible cargar las lecturas";
  }
}


async function startDiscovery() {
  if (state.isSelecting) {
    return;
  }

  state.isSelecting = true;

  elements.welcome.classList.remove(
    "scene--active"
  );

  elements.discovery.classList.add(
    "scene--active"
  );

  hideElement(elements.preview);
  hideElement(elements.result);

  elements.liveRegion.textContent =
    "Quodam está buscando una lectura para ti.";


  /*
   * Solo abrimos el libro la primera vez.
   */
  if (!state.hasOpenedBook) {
    showElement(elements.ritual);

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

    hideElement(elements.ritual);
  } else {
    /*
     * Si el libro ya estaba abierto,
     * simplemente pasamos una página.
     */
    await turnPage(
      elements.pageTurn
    );
  }


  showElement(elements.preview);

  await runSelectionAnimation();

  state.isSelecting = false;
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


  state.selectedReading =
    selectedReading;

  state.previousReadingId =
    selectedReading.id;


  /*
   * Mostramos brevemente la lectura
   * definitiva antes de revelar
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


  showSelectedReading();
}


function showSelectedReading() {
  hideElement(elements.preview);


  renderResult(
    state.selectedReading,
    elements
  );


  showElement(elements.result);


  elements.liveRegion.textContent =
    `Lectura encontrada: ${state.selectedReading.title}`;
}


function openSelectedReading() {
  if (!state.selectedReading) {
    return;
  }


  window.location.href =
    `./pages/lectura.html?id=${encodeURIComponent(
      state.selectedReading.id
    )}`;
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


  const progress =
    (
      round - slowdownStart
    ) /
    (
      totalRounds -
      slowdownStart -
      1
    );


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