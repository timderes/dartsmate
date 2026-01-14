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

  it("returns correct average for multiple rounds", () => {
    const roundData: MatchRound[] = [
      {
        elapsedTime: 1,
        roundAverage: (20 + 10 + 5) / 3,
        roundTotal: 35,
        isBust: false,
        throwDetails: [
          {
            ...MOCK_THROW_DETAIL,
            score: 20,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 10,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 5,
          },
        ],
      },
      {
        elapsedTime: 1,
        roundAverage: (1 + 32 + 40) / 3,
        roundTotal: 73,
        isBust: false,
        throwDetails: [
          {
            ...MOCK_THROW_DETAIL,
            score: 1,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 32,
            isDouble: true,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 40,
            isDouble: true,
          },
        ],
      },
      {
        elapsedTime: 1,
        roundAverage: (0 + 50 + 25) / 3,
        roundTotal: 75,
        isBust: false,
        throwDetails: [
          {
            ...MOCK_THROW_DETAIL,
            score: 0,
            isMissed: true,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 50,
            isBullseye: true,
          },
          {
            ...MOCK_THROW_DETAIL,
            score: 25,
            isOuterBull: true,
          },
        ],
      },
    ];

    const matchAverage = getMatchAverage(roundData);
    expect(matchAverage).toBeCloseTo(20.3333, 4);
  });
});
