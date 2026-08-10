import { CONFIG } from "./config.js";

import {
  wait,
  showElement,
  hideElement
} from "./utils/helpers.js";

import {
  loadReadings,
  selectRandomReading
} from "./modules/readingSelector.js";

import {
  renderPreview,
  renderResult
} from "./modules/readingRenderer.js";


const state = {
  readings: [],
  selectedReading: null,
  previousReadingId: null,
  isSelecting: false
};


const elements = {
  welcome: document.querySelector("#welcome"),
  discovery: document.querySelector("#discovery"),

  discoverButton: document.querySelector("#discover-button"),

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
    console.error(error);

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

  showElement(elements.ritual);

  elements.liveRegion.textContent =
    "Quodam está buscando una lectura para ti.";

  await wait(
    CONFIG.ritualDuration
  );

  hideElement(elements.ritual);
  showElement(elements.preview);

  await runSelectionAnimation();

  state.isSelecting = false;
}


async function runSelectionAnimation() {
  let delay =
    CONFIG.selection.initialDelay;

  for (
    let round = 0;
    round < CONFIG.selection.totalRounds;
    round++
  ) {
    const previewReading =
      selectRandomReading(
        state.readings
      );

    renderPreview(
      previewReading,
      elements
    );

    await wait(delay);

    delay +=
      CONFIG.selection.delayIncrement;
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


initialize();