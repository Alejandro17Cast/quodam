import {
  loadReadings
} from "./readingSelector.js";


const elements = {
  container:
    document.querySelector(
      "#reading-container"
    ),

  error:
    document.querySelector(
      "#reading-error"
    )
};


async function initializeReader() {
  try {
    const readingId =
      getReadingIdFromURL();


    if (!readingId) {
      throw new Error(
        "No se recibió un identificador de lectura."
      );
    }


    const readings =
      await loadReadings(
        "../data/readings-index.json"
      );


    const reading =
      readings.find(
        (item) =>
          item.id === readingId
      );


    if (!reading) {
      throw new Error(
        `No existe la lectura "${readingId}".`
      );
    }


    renderReading(
      reading
    );

  } catch (error) {
    console.error(
      "Error al abrir la lectura:",
      error
    );

    showError();
  }
}


function getReadingIdFromURL() {
  const params =
    new URLSearchParams(
      window.location.search
    );


  return params.get(
    "id"
  );
}


function getIllustrationPath(reading) {
  if (!reading?.image) {
    return null;
  }


  return `../assets/images/readings/${reading.image}/illustration.png`;
}


function renderReading(reading) {
  if (!elements.container) {
    console.error(
      "No se encontró el contenedor de lectura."
    );

    return;
  }


  document.title =
    `${reading.title} — Quodam`;


  const illustrationPath =
    getIllustrationPath(
      reading
    );


  const linesHTML =
    reading.lines
      .map(
        (line, index) => `
          <p
            class="reading-text__line"
            data-line="${index + 1}"
          >
            ${escapeHTML(line)}
          </p>
        `
      )
      .join("");


  elements.container.innerHTML = `
    <article class="reading-text">

      <!-- =========================
           ENCABEZADO
      ========================== -->

      <header
        class="reading-text__header"
      >

        <p
          class="reading-text__category"
        >
          ${escapeHTML(
            reading.category ?? "Lectura"
          )}
        </p>


        <h1
          class="reading-text__title"
        >
          ${escapeHTML(
            reading.title ?? "Lectura"
          )}
        </h1>


        <p
          class="reading-text__meta"
        >
          Nivel ${
            reading.level ?? 1
          }

          <span aria-hidden="true">
            ·
          </span>

          ${
            reading.estimatedReadingTime ?? 1
          } min
        </p>

      </header>


      <!-- =========================
           ILUSTRACIÓN
      ========================== -->

      ${
        illustrationPath
          ? `
            <figure
              class="reading-text__illustration"
            >

              <img
                src="${illustrationPath}"
                alt="Ilustración de ${escapeHTML(
                  reading.title
                )}"
              >

            </figure>
          `
          : ""
      }


      <!-- =========================
           TEXTO
      ========================== -->

      <div
        class="reading-text__body"
      >
        ${linesHTML}
      </div>


      <!-- =========================
           FINAL
      ========================== -->

      <footer
        class="reading-text__footer"
      >

        <div
          class="reading-text__ending"
        >

          <span
            aria-hidden="true"
          >
            ✦
          </span>

          <p>
            Fin
          </p>

        </div>


        <div
          class="reading-text__actions"
        >

          <a
            href="../index.html"
            class="button button--primary"
          >
            Descubrir otra lectura
          </a>


          <a
            href="../index.html"
            class="button button--reader-secondary"
          >
            Volver al inicio
          </a>

        </div>

      </footer>

    </article>
  `;
}


function showError() {
  if (elements.container) {
    elements.container.hidden =
      true;
  }


  if (elements.error) {
    elements.error.hidden =
      false;
  }
}


function escapeHTML(value) {
  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value ?? ""
    );


  return element.innerHTML;
}


initializeReader();