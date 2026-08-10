import { wait } from "../utils/helpers.js";


export function resetReveal(elements) {
  const revealElements = [
    elements.resultStar,
  elements.resultEyebrow,
  elements.resultCoverWrapper,
  elements.resultTitle,
  elements.resultDescription,
  elements.resultActions
  ];

  revealElements.forEach((element) => {
    if (!element) {
      return;
    }

    element.classList.remove(
      "is-visible"
    );
  });
}


export async function revealReading(
  elements
) {
  await wait(150);

  elements.resultStar
    ?.classList.add(
      "is-visible"
    );

  await wait(300);

  elements.resultEyebrow
    ?.classList.add(
      "is-visible"
    );

  await wait(250);

  elements.resultCoverWrapper
    ?.classList.add(
      "is-visible"
    );

  await wait(400);

  elements.resultTitle
    ?.classList.add(
      "is-visible"
    );

  await wait(200);

  elements.resultDescription
    ?.classList.add(
      "is-visible"
    );

  await wait(220);

  elements.resultActions
    ?.classList.add(
      "is-visible"
    );
}