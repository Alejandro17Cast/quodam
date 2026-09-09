import {
  getReadingImagePath
} from "../utils/helpers.js";

const IMAGE_TIMEOUT =
  3500;
/* =========================================================
   QUODAM v4 — IMAGE LOADER
   ---------------------------------------------------------
   Precarga únicamente las imágenes que realmente
   necesitamos.

   Nunca bloquea Quodam si una imagen falla.
   ========================================================= */


const imageCache =
  new Map();


export function preloadImage(
  source
) {
  if (!source) {
    return Promise.resolve(
      false
    );
  }


  if (
    imageCache.has(
      source
    )
  ) {
    return imageCache.get(
      source
    );
  }


  const request =
    new Promise(
      (resolve) => {

        const image =
          new Image();


        let finished =
          false;


        const finish =
          (loaded) => {

            if (finished) {
              return;
            }


            finished =
              true;


            clearTimeout(
              timeoutId
            );


            image.onload =
              null;


            image.onerror =
              null;


            resolve(
              loaded
            );
          };


        const timeoutId =
          window.setTimeout(
            () => {
              console.warn(
                `La imagen tardó demasiado: ${source}`
              );


              finish(
                false
              );
            },
            IMAGE_TIMEOUT
          );


        image.decoding =
          "async";


        image.onload =
          () => {
            finish(
              true
            );
          };


        image.onerror =
          () => {
            console.warn(
              `No se pudo precargar: ${source}`
            );


            finish(
              false
            );
          };


        image.src =
          source;
      }
    );


  imageCache.set(
    source,
    request
  );


  return request;
}


/* =========================================================
   PRECARGAR UNA LECTURA
   ========================================================= */

export function preloadReadingImage(
  reading
) {
  if (!reading) {
    return Promise.resolve(
      false
    );
  }


  const source =
    getReadingImagePath(
      reading
    );


  return preloadImage(
    source
  );
}


/* =========================================================
   PRECARGAR UNA SESIÓN
   ========================================================= */

export function preloadSessionImages(
  readings
) {
  if (
    !Array.isArray(
      readings
    )
  ) {
    return Promise.resolve(
      []
    );
  }


  return Promise.all(
    readings.map(
      preloadReadingImage
    )
  );
}


/* =========================================================
   LIMPIAR CACHE
   ========================================================= */

export function clearImageLoaderCache() {
  imageCache.clear();
}