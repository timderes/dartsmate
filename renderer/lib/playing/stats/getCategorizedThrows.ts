import type { MatchRound } from "types/match";

const getCategorizedThrows = (
  rounds: MatchRound[],
): {
  triples: number;
  doubles: number;
  normals: number;
  missed: number;
} => {
  let triples = 0;
  let doubles = 0;
  let normals = 0;
  let missed = 0;

  rounds.forEach((round) => {
    round.throwDetails.forEach((details) => {
      if (details.isTriple) {
        triples++;
      } else if (details.isDouble) {
        doubles++;
      } else if (details.score > 0) {
        normals++;
      } else if (details.isMissed) {
        missed++;
      }
    });
  });

  return { triples, doubles, normals, missed };
};

export default getCategorizedThrows;
