import { wait } from "../utils/helpers.js";


export async function openBook(bookElement) {
  bookElement.classList.remove(
    "book--closed"
  );

  bookElement.classList.add(
    "book--opening"
  );

  await wait(1100);

  bookElement.classList.remove(
    "book--opening"
  );

  bookElement.classList.add(
    "book--ready"
  );
}


export async function turnPage(pageTurnElement) {
  pageTurnElement.classList.remove(
    "book__page-turn--active"
  );

  void pageTurnElement.offsetWidth;

  pageTurnElement.classList.add(
    "book__page-turn--active"
  );

  await wait(700);

  pageTurnElement.classList.remove(
    "book__page-turn--active"
  );
}