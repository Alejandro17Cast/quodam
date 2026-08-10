export function preloadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        source,
        loaded: true
      });
    };

    image.onerror = () => {
      console.warn(
        `No se pudo precargar la imagen: ${source}`
      );

      resolve({
        source,
        loaded: false
      });
    };

    image.src = source;
  });
}


export async function preloadReadingImages(
  readings
) {
  if (!Array.isArray(readings)) {
    return [];
  }

  const sources = readings
    .filter(
      (reading) =>
        reading?.image
    )
    .map(
      (reading) =>
        `./assets/images/readings/${reading.image}/illustration.png`
    );

  return Promise.all(
    sources.map(
      (source) =>
        preloadImage(source)
    )
  );
}