import { describe, expect, it } from "vitest";
import getHighestScore from "@/lib/playing/stats/getHighestScore";

describe("match.stats.getHighestScore", () => {
  it("returns 0 when there are no match rounds", () => {
    const highestScore = getHighestScore([]);

    expect(highestScore).toBe(0);
  });
});
