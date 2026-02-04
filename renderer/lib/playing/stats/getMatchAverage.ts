import type { MatchRound } from "@/types/match";

const getMatchAverage = (playerRounds: MatchRound[]): number => {
  if (playerRounds.length === 0) return 0;

  // Calculate the sum of all round averages
  const sumAverage = playerRounds.reduce(
    (sum, round) => sum + round.roundTotal,
    0,
  );

  // Return the overall average for the match
  return sumAverage / playerRounds.length;
};

export default getMatchAverage;
