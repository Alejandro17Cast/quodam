import {
  wait
} from "../utils/helpers.js";


/* =========================================================
   QUODAM — BOOK ANIMATION v3.1
   Corrige la hoja fantasma que podía quedar encima
   de la página derecha después de cada giro.
   ========================================================= */

const activeTurns =
  new WeakSet();


function prefersReducedMotion() {
  return Boolean(
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
  );
}


function clampDuration(
  value,
  fallback = 460
) {
  const duration =
    Number(
      value
    );


  if (
    !Number.isFinite(
      duration
    )
  ) {
    return fallback;
  }


  return Math.max(
    220,
    Math.min(
      Math.round(
        duration
      ),
      700
    )
  );
}


/* =========================================================
   ABRIR LIBRO
   ========================================================= */

export async function openBook(
  bookElement
) {
  if (!bookElement) {
    return;
  }


  if (
    bookElement.classList.contains(
      "book--ready"
    )
  ) {
    return;
  }


  const duration =
    prefersReducedMotion()
      ? 1
      : 720;


  bookElement.classList.remove(
    "book--closed",
    "book--selected",
    "book--celebrating"
  );


  bookElement.classList.add(
    "book--opening"
  );


  bookElement.setAttribute(
    "aria-busy",
    "true"
  );


  await wait(
    duration
  );


  bookElement.classList.remove(
    "book--opening"
  );


  bookElement.classList.add(
    "book--ready"
  );


  bookElement.setAttribute(
    "aria-busy",
    "false"
  );
}


/* =========================================================
   GIRAR PÁGINA
   ========================================================= */

export async function turnPage({
  turningPage,
  duration = 460,
  onHalfTurn = null,
  onStart = null,
  onComplete = null
}) {
  if (
    !turningPage ||
    activeTurns.has(
      turningPage
    )
  ) {
    return;
  }


  const safeDuration =
    prefersReducedMotion()
      ? 1
      : clampDuration(
          duration
        );


  activeTurns.add(
    turningPage
  );


  /*
   * IMPORTANTE:
   * La hoja animada permanece oculta cuando está inactiva.
   * Solo la mostramos mientras realmente está girando.
   *
   * Esto evita que su cara frontal quede encima de la
   * página derecha después de animation.cancel().
   */
  turningPage.hidden =
    false;


  turningPage.classList.add(
    "is-turning"
  );


  turningPage.setAttribute(
    "aria-busy",
    "true"
  );


  try {
    if (
      typeof onStart ===
      "function"
    ) {
      await onStart();
    }


    const animation =
      turningPage.animate(
        [
          {
            transform:
              "rotateY(0deg)"
          },

          {
            offset:
              0.46,

            transform:
              "rotateY(-82deg)"
          },

          {
            offset:
              0.54,

            transform:
              "rotateY(-98deg)"
          },

          {
            transform:
              "rotateY(-180deg)"
          }
        ],
        {
          duration:
            safeDuration,

          easing:
            "cubic-bezier(0.42, 0, 0.18, 1)",

          fill:
            "forwards"
        }
      );


    const halfTurnTask =
      (async () => {
        await wait(
          Math.max(
            1,
            Math.round(
              safeDuration *
              0.5
            )
          )
        );


        turningPage.classList.add(
          "is-half-turn"
        );


        if (
          typeof onHalfTurn ===
          "function"
        ) {
          await onHalfTurn();
        }
      })();


    await Promise.all([
      animation.finished.catch(
        () => {}
      ),
      halfTurnTask
    ]);


    if (
      typeof onComplete ===
      "function"
    ) {
      await onComplete();
    }


    /*
     * Cancelamos la animación para limpiar
     * el transform inline generado por WAAPI.
     */
    animation.cancel();

  } finally {
    turningPage.classList.remove(
      "is-turning",
      "is-half-turn"
    );


    turningPage.setAttribute(
      "aria-busy",
      "false"
    );


    /*
     * CORRECCIÓN PRINCIPAL:
     * ocultamos la hoja animada al terminar.
     *
     * De esta forma las únicas páginas visibles
     * son left-page-content y right-page-content.
     */
    turningPage.hidden =
      true;


    activeTurns.delete(
      turningPage
    );
  }
}


/* =========================================================
   ESTADO DE BÚSQUEDA
   ========================================================= */

export function setBookSearching(
  bookElement,
  searching
) {
  if (!bookElement) {
    return;
  }


  const active =
    Boolean(
      searching
    );


  bookElement.classList.toggle(
    "book--searching",
    active
  );


  if (active) {
    bookElement.classList.remove(
      "book--selected",
      "book--celebrating"
    );
  }
}


/* =========================================================
   ESTADO SELECCIONADO
   ========================================================= */

export function setBookSelected(
  bookElement,
  selected
) {
  if (!bookElement) {
    return;
  }


  const active =
    Boolean(
      selected
    );


  bookElement.classList.toggle(
    "book--selected",
    active
  );


  if (active) {
    bookElement.classList.remove(
      "book--searching"
    );
  }
}


/* =========================================================
   CELEBRACIÓN FINAL
   ========================================================= */

export async function celebrateBookSelection(
  bookElement,
  duration = 520
) {
  if (
    !bookElement ||
    prefersReducedMotion()
  ) {
    return;
  }


  const safeDuration =
    clampDuration(
      duration,
      520
    );


  bookElement.classList.remove(
    "book--celebrating"
  );


  await new Promise(
    (resolve) =>
      requestAnimationFrame(
        resolve
      )
  );


  bookElement.style.setProperty(
    "--book-celebration-duration",
    `${safeDuration}ms`
  );


  bookElement.classList.add(
    "book--celebrating"
  );


  await wait(
    safeDuration
  );


  bookElement.classList.remove(
    "book--celebrating"
  );


  bookElement.style.removeProperty(
    "--book-celebration-duration"
  );
}

