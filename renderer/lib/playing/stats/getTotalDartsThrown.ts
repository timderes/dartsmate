import type { MatchRound } from "types/match";

/**
 * Calculates the total number of darts thrown across all rounds.
 * This accounts for rounds that may have fewer than 3 darts (e.g. winning checkout or bust).
 *
 * @param rounds - The array of match rounds
 * @returns Total count of darts thrown
 */
const getTotalDartsThrown = (rounds: MatchRound[]): number => {
  return rounds.reduce((total, round) => {
    // throwDetails contains the actual darts thrown in that round
    return total + (round.throwDetails?.length ?? 0);
  }, 0);
};

export default getTotalDartsThrown;
