import type { Checkout } from "@/types/match";

/**
 * Checks if the current throw results in a bust situation based on the remaining score.
 * A bust occurs when a player attempts to throw a score that would exceed the remaining score or violates
 * specific throw rules (e.g., attempting a double with a score less than 2).
 *
 * @param {Checkout} checkout - The type of checkout being attempted. Can be "Any", "Single", "Double" or "Triple".
 * @param {number} remainingScore - The remaining score to be reduced. Should be a positive number.
 * @returns {boolean} - Returns `true` if it's a bust, `false` otherwise.
 *
 * @example
 * isBust("Double", 1); // returns true (because a Double requires at least 2 points)
 * isBust("Triple", 2); // returns true (because a Triple requires at least 3 points)
 * isBust("Double", 4); // returns false (valid Double checkout with remaining score of 4)
 */
const isBust = (checkout: Checkout, remainingScore: number): boolean => {
  if (remainingScore < 0) return true;

  if (checkout === "Double" && remainingScore < 2) return true;
  if (checkout === "Triple" && remainingScore < 3) return true;

  return false;
};

export default isBust;
