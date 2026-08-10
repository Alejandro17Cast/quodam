export function renderPreview(
  reading,
  elements
) {
  elements.preview.classList.remove(
    "story-preview--changing"
  );

  void elements.preview.offsetWidth;

  elements.previewImage.src =
    reading.thumbnail;

  elements.previewImage.alt =
    `Ilustración de ${reading.title}`;

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
  elements.resultImage.src =
    reading.illustration;

  elements.resultImage.alt =
    `Ilustración de ${reading.title}`;


  elements.resultTitle.textContent =
    reading.title;


  elements.resultDescription.textContent =
    `${reading.category} · Nivel ${reading.level} · ${reading.estimatedReadingTime} min`;
}