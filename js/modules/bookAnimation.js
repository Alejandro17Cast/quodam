import {
  wait
} from "../utils/helpers.js";


export async function openBook(
  bookElement
) {
  if (!bookElement) {
    console.warn(
      "No se encontró el libro para abrirlo."
    );

    return;
  }


  bookElement.classList.remove(
    "book--closed"
  );

  bookElement.classList.add(
    "book--opening"
  );


  await wait(900);


  bookElement.classList.remove(
    "book--opening"
  );

  bookElement.classList.add(
    "book--ready"
  );
}


export async function turnRealPage(
  turningPageElement,
  duration = 850
) {
  if (!turningPageElement) {
    console.warn(
      "No se encontró la página que debe girar."
    );

    return;
  }


  turningPageElement.classList.remove(
    "is-turning"
  );


  /*
   * Reinicia la animación CSS.
   */
  void turningPageElement.offsetWidth;


  turningPageElement.style.animationDuration =
    `${duration}ms`;


  turningPageElement.classList.add(
    "is-turning"
  );


  await wait(duration);


  turningPageElement.classList.remove(
    "is-turning"
  );


  turningPageElement.style.animationDuration =
    "";
}


/*
 * Compatibilidad temporal.
 *
 * main.js todavía puede llamar turnPage().
 * Ahora internamente utilizaremos la página real.
 */
export async function turnPage(
  pageElement,
  duration = 850
) {
  await turnRealPage(
    pageElement,
    duration
  );
}