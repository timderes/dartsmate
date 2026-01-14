import type { DartThrow } from "@/types/match";

const getScores = (rounds: DartThrow[]): number[] => {
  if (rounds.length === 0) return [];

  return rounds.map((round) => {
    return round.score;
  });
};

export default getScores;
