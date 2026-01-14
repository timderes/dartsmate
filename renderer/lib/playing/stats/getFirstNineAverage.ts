import type { MatchRound } from "types/match";
import { THROWS_PER_ROUND } from "utils/constants";

/**
 * Calculates the average score of the first nine throws based on the player's rounds.
 *
 * @param {MatchRound[]} playerRounds - An array of match rounds containing round data.
 * @returns {number} The average score of the first nine throws, or 0 if no rounds are available.
 *
 */
const getFirstNineAverage = (playerRounds: MatchRound[]): number => {
  if (playerRounds.length === 0) return 0;

  const MaxRounds = Math.floor(9 / THROWS_PER_ROUND);

  // Take the rounds needed for nine darts and calculate the average of the scores
  const firstThreeRounds = playerRounds.slice(0, MaxRounds);

  const totalScore = firstThreeRounds.reduce(
    (sum, round) => sum + round.roundTotal,
    0,
  );

  return totalScore / firstThreeRounds.length;
};

export default getFirstNineAverage;
