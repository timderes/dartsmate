import { describe, expect, it } from "vitest";
import getScores from "@/lib/playing/stats/getScores";
import { MOCK_THROW_DETAIL } from "@/tests/mocks/throwDetail.mock";

describe("match.stats.getScores", () => {
  it("returns an empty array when there are no throws in a rounds", () => {
    const scores = getScores([]);

    expect(scores).toEqual([]);
  });

  it("returns the scores for each throw in the rounds", () => {
    const thrownDarts = [
      { ...MOCK_THROW_DETAIL, score: 20 },
      { ...MOCK_THROW_DETAIL, score: 5 },
      { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
    ];

    const scores = getScores(thrownDarts);
    expect(scores).toEqual([20, 5, 60]);
  });

  it("returns zero scores for missed throws", () => {
    const thrownDarts = [
      { ...MOCK_THROW_DETAIL, score: 0, isMissed: true },
      { ...MOCK_THROW_DETAIL, score: 15 },
      { ...MOCK_THROW_DETAIL, score: 0, isMissed: true },
    ];

    const scores = getScores(thrownDarts);
    expect(scores).toEqual([0, 15, 0]);
  });

  it("handles bullseye and outer bull", () => {
    const thrownDarts = [
      { ...MOCK_THROW_DETAIL, score: 50, isBullseye: true },
      { ...MOCK_THROW_DETAIL, score: 25, isOuterBull: true },
      { ...MOCK_THROW_DETAIL, score: 10 },
    ];

    const scores = getScores(thrownDarts);
    expect(scores).toEqual([50, 25, 10]);
  });

  it("handles triples and doubles", () => {
    const thrownDarts = [
      { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
      { ...MOCK_THROW_DETAIL, score: 40, isDouble: true },
      { ...MOCK_THROW_DETAIL, score: 18 },
    ];

    const scores = getScores(thrownDarts);
    expect(scores).toEqual([60, 40, 18]);
  });
});
