import { describe, expect, it } from "vitest";
import getMatchAverage from "@/lib/playing/stats/getMatchAverage";
import { MatchRound } from "@/types/match";

const DUMMY_THROW_DETAILS = {
  score: 0,
  isBullseye: false,
  isDouble: false,
  isTriple: false,
  isMissed: false,
  isOuterBull: false,
  dartboardZone: 0,
};

describe("match.stats.getMatchAverage", () => {
  it("returns 0 when there are no match rounds", () => {
    const matchAverage = getMatchAverage([]);

    expect(matchAverage).toBe(0);
  });

  it("returns 20 for 3x S20", () => {
    const roundData: MatchRound[] = [
      {
        elapsedTime: 1,
        roundAverage: 20,
        roundTotal: 60,
        isBust: false,
        throwDetails: [
          {
            ...DUMMY_THROW_DETAILS,
            score: 20,
          },
          {
            ...DUMMY_THROW_DETAILS,
            score: 20,
          },
          {
            ...DUMMY_THROW_DETAILS,
            score: 20,
          },
        ],
      },
    ];

    const matchAverage = getMatchAverage(roundData);

    expect(matchAverage).toBe(20);
  });
});
