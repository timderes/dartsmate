import type { MatchRound } from "types/match";

// Find the highest score across all rounds
const getHighestScore = (matchRounds: MatchRound[]): number => {
  let highestScore = 0;

  matchRounds.forEach((matchRound) => {
    if (matchRound.roundTotal > highestScore) {
      highestScore = matchRound.roundTotal;
    }
  });

  return highestScore;
};

export default getHighestScore;
