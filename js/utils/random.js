export function randomIndex(length) {
  return Math.floor(
    Math.random() * length
  );
}


export function randomItem(items) {
  return items[randomIndex(items.length)];
}