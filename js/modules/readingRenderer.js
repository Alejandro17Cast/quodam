
import {
  getReadingImagePath
} from "../utils/helpers.js";

export function renderPreview(
  reading,
  elements
) {
  elements.preview.classList.remove(
    "story-preview--changing"
  );

  void elements.preview.offsetWidth;

  prepareImage(
    elements.previewImage,
    getReadingImagePath(reading),
    `Ilustración de ${reading.title}`
  );

  elements.previewTitle.textContent =
    reading.title;

  elements.preview.classList.add(
    "story-preview--changing"
  );
}

export function renderResult(
  reading,
  elements
) {
  prepareImage(
    elements.resultImage,
    getReadingImagePath(reading),
    `Ilustración de ${reading.title}`
  );

  elements.resultTitle.textContent =
    reading.title;

  elements.resultDescription.textContent =
    `${reading.category} · Nivel ${reading.level} · ${reading.estimatedReadingTime} min`;
}

function prepareImage(
  imageElement,
  source,
  alternativeText
) {
  imageElement.alt =
    alternativeText;


  imageElement.onerror = () => {
    imageElement.removeAttribute(
      "src"
    );

    imageElement.alt =
      "Ilustración pendiente";
  };


  if (!source) {
    imageElement.removeAttribute(
      "src"
    );

    return;
  }


  imageElement.src =
    source;
}