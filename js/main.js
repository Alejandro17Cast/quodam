import {
  CONFIG
} from "./config.js";

import {
  wait,
  showElement,
  hideElement
} from "./utils/helpers.js";

import {
  loadStories,
  selectRandomStory
} from "./modules/storySelector.js";

import {
  renderPreview,
  renderResult
} from "./modules/storyRenderer.js";


const state = {
  stories: [],
  selectedStory: null,
  previousStoryId: null,
  isSelecting: false
};


const elements = {
  welcome:
    document.querySelector("#welcome"),

  discovery:
    document.querySelector("#discovery"),

  discoverButton:
    document.querySelector("#discover-button"),

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

  resultImage:
    document.querySelector("#result-image"),

  resultTitle:
    document.querySelector("#result-title"),

  resultDescription:
    document.querySelector(
      "#result-description"
    ),

  readButton:
    document.querySelector("#read-button"),

  againButton:
    document.querySelector("#again-button"),

  liveRegion:
    document.querySelector("#live-region")
};


async function initialize() {
  try {

    state.stories =
      await loadStories(
        CONFIG.storiesIndexPath
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
      openSelectedStory
    );

  } catch (error) {

    console.error(error);

    elements.discoverButton.disabled = true;

    elements.discoverButton.textContent =
      "No fue posible cargar las historias";

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
    "Quodam está buscando una historia para ti.";


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

    const previewStory =
      selectRandomStory(
        state.stories
      );


    renderPreview(
      previewStory,
      elements
    );


    await wait(delay);


    delay +=
      CONFIG.selection.delayIncrement;
  }


  const selected =
    selectRandomStory(
      state.stories,
      state.previousStoryId
    );


  state.selectedStory = selected;

  state.previousStoryId =
    selected.id;


  showSelectedStory();
}


function showSelectedStory() {

  hideElement(elements.preview);

  renderResult(
    state.selectedStory,
    elements
  );

  showElement(elements.result);


  elements.liveRegion.textContent =
    `Historia encontrada: ${state.selectedStory.title}`;
}


function openSelectedStory() {

  if (!state.selectedStory) {
    return;
  }


  window.location.href =
    `./pages/lectura.html?id=${encodeURIComponent(
      state.selectedStory.id
    )}`;
}


initialize();