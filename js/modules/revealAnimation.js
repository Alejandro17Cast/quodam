import { wait } from "../utils/helpers.js";


export function resetReveal(elements) {
  const revealElements = [
    elements.resultEyebrow,
    elements.resultCoverWrapper,
    elements.resultTitle,
    elements.resultDescription,
    elements.resultActions
  ];


  revealElements.forEach((element) => {
    element.classList.remove(
      "is-visible"
    );
  });
}


export async function revealReading(
  elements
) {

  await wait(180);

  elements.resultEyebrow.classList.add(
    "is-visible"
  );


  await wait(260);

  elements.resultCoverWrapper.classList.add(
    "is-visible"
  );


  await wait(420);

  elements.resultTitle.classList.add(
    "is-visible"
  );


  await wait(220);

  elements.resultDescription.classList.add(
    "is-visible"
  );


  await wait(250);

  elements.resultActions.classList.add(
    "is-visible"
  );
}
