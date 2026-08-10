import {
  loadReadings
} from "./readingSelector.js";


const elements = {
  container:
    document.querySelector("#reading-container"),

  error:
    document.querySelector("#reading-error")
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


    renderReading(reading);

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

  return params.get("id");
}


function renderReading(reading) {

  document.title =
    `${reading.title} — Quodam`;


  const linesHTML =
    reading.lines
      .map(
        (line) => `
          <p class="reading-text__line">
            ${escapeHTML(line)}
          </p>
        `
      )
      .join("");


  elements.container.innerHTML = `
    <article class="reading-text">

      <header class="reading-text__header">

        <p class="reading-text__category">
          ${escapeHTML(reading.category)}
        </p>

        <h1 class="reading-text__title">
          ${escapeHTML(reading.title)}
        </h1>

        <p class="reading-text__meta">
          Nivel ${reading.level}
          ·
          ${reading.estimatedReadingTime} min
        </p>

      </header>


      ${
        reading.illustration
          ? `
            <div class="reading-text__illustration">

              <img
                src=".${reading.illustration}"
                alt="Ilustración de ${escapeHTML(
                  reading.title
                )}"
              >

            </div>
          `
          : ""
      }


      <div class="reading-text__body">

        ${linesHTML}

      </div>


      <footer class="reading-text__footer">

        <p>
          Fin
        </p>

        <a
          href="../index.html"
          class="button button--primary"
        >
          Descubrir otra lectura
        </a>

      </footer>

    </article>
  `;
}


function showError() {

  elements.container.hidden = true;

  elements.error.hidden = false;
}


function escapeHTML(value) {

  const element =
    document.createElement("div");

  element.textContent =
    String(value);

  return element.innerHTML;
}


initializeReader();