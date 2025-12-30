import {
  SCORE_BULLSEYE,
  SCORE_MISSED,
  SCORE_OUTER_BULL,
} from "@utils/constants";

export const NON_MULTIPLE_SCORE_ZONES = new Set([
  SCORE_BULLSEYE,
  SCORE_OUTER_BULL,
  SCORE_MISSED,
]);

/*
 * Returns `true` if the player hits the bullseye, outer bull,
 * or missed the board. Used to disable score multiplier.
 */
export const isNonMultipleScore = (score: number): boolean => {
  return NON_MULTIPLE_SCORE_ZONES.has(score);
};

export default isNonMultipleScore;
