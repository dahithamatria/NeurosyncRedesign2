// Fisher-Yates shuffle - returns a new shuffled array, does not mutate the original.
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Pick `count` random unique items from an array.
export function pickRandom(array, count) {
  return shuffleArray(array).slice(0, count);
}

// Shuffle an array of option strings and return the new array plus the new index of a target value.
export function shuffleOptions(options, correctValue) {
  const shuffled = shuffleArray(options);
  return { options: shuffled, correctIndex: shuffled.indexOf(correctValue) };
}
