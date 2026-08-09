import {
  randomItem
} from "../utils/random.js";


export async function loadStories(indexPath) {
  const indexResponse =
    await fetch(indexPath);

  if (!indexResponse.ok) {
    throw new Error(
      "No se pudo cargar el índice de cuentos."
    );
  }

  const storyPaths =
    await indexResponse.json();


  const stories =
    await Promise.all(
      storyPaths.map(async (path) => {

        const response =
          await fetch(path);

        if (!response.ok) {
          throw new Error(
            `No se pudo cargar ${path}`
          );
        }

        return response.json();
      })
    );


  return stories.filter(
    (story) => story.active
  );
}


export function selectRandomStory(
  stories,
  previousStoryId = null
) {

  if (!stories.length) {
    throw new Error(
      "No existen cuentos disponibles."
    );
  }


  if (stories.length === 1) {
    return stories[0];
  }


  const candidates =
    previousStoryId
      ? stories.filter(
          (story) =>
            story.id !== previousStoryId
        )
      : stories;


  return randomItem(candidates);
}