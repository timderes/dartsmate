import { describe, expect, it } from "vitest";
import getMatchAverage from "@/lib/playing/stats/getMatchAverage";
import { MatchRound } from "@/types/match";
import { MOCK_THROW_DETAIL } from "@/tests/mocks/throwDetail.mock";
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
            ...MOCK_THROW_DETAIL,
            score: 20,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 20,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 20,
          },
        ],
      },
    ];

    const matchAverage = getMatchAverage(roundData);

    expect(matchAverage).toBe(20);
  });
});
