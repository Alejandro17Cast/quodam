export function renderPreview(
  story,
  elements
) {

  elements.previewImage.src =
    story.thumbnail;

  elements.previewImage.alt =
    `Ilustración de ${story.title}`;

  elements.previewTitle.textContent =
    story.title;
}


export function renderResult(
  story,
  elements
) {

  elements.resultImage.src =
    story.cover;

  elements.resultImage.alt =
    `Portada de ${story.title}`;

  elements.resultTitle.textContent =
    story.title;

  elements.resultDescription.textContent =
    story.description;
}