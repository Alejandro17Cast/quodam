export function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}


export function showElement(element) {
  element.hidden = false;
}


export function hideElement(element) {
  element.hidden = true;
}