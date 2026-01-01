import type { MatchRound } from "types/match";

const getNumberOfRoundsAboveThreshold = (
  rounds: MatchRound[],
  n: number,
): number => {
  return rounds.filter((round) => round.roundTotal >= n).length;
};

export default getNumberOfRoundsAboveThreshold;
