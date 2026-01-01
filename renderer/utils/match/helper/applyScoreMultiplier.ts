import isNonMultipleScore from "./isNonMultipleScore";

/**
 * Applies a score multiplier based on whether the score is a double or triple.
 * Certain scores (bullseye, outer bull, missed) are not affected by multipliers.
 *
 * @param {boolean} isDouble - Indicates if the score should be doubled.
 * @param {boolean} isTriple - Indicates if the score should be tripled.
 * @param {number} score - The original score.
 * @returns {number} The adjusted score after applying the multiplier.
 * @throws {Error} If both isDouble and isTriple are true.
 */
export const applyScoreMultiplier = (
  isDouble: boolean,
  isTriple: boolean,
  score: number,
): number => {
  if (isDouble && isTriple) {
    throw new Error("A score cannot be both double and triple!");
  }

  /*
   * Check if the player hit bullseye, outer bull or missed
   * These fields wont provide a multiplier, even if the player
   * selected one.
   */
  if (isNonMultipleScore(score)) return score;

  if (isDouble) return score * 2;
  if (isTriple) return score * 3;

  return score;
};
