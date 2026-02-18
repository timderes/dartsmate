import { describe, it, expect } from "vitest";

import { DEFAULT_CHECKOUTS } from "@/utils/match/checkouts/default";
import { SCORE_BULLSEYE } from "@/utils/constants";

/**
 * Gets the score of a checkout dart (eg. "T20" -> 60, "D16" -> 32, "S5" -> 5, "BULL" -> 50).
 */
const getScoreOfThrow = (dart: string): number => {
  if (dart === "BULL") return SCORE_BULLSEYE;

  const m = /^(T|D|S)(\d+)$/.exec(dart);

  if (m) {
    const n = parseInt(m[2]);

    if (m[1] === "T") return 3 * n; // Is a triple dart
    if (m[1] === "D") return 2 * n; // Is a double dart
    return n; // Is a single dart
  }

  const num = parseInt(dart);

  if (!Number.isNaN(num)) return num;

  throw new Error(`Unknown checkout dart: ${dart}`);
};

/**
 * Test if the checkouts in the DEFAULT_CHECKOUTS table sum to their keys and end with a double or bullseye,
 * which is required to finish a leg in a double-out game.
 */
describe("match.checkouts.default", () => {
  for (const [scoreStr, tokens] of Object.entries(DEFAULT_CHECKOUTS)) {
    const score = Number(scoreStr);

    if (!tokens) {
      throw new Error(`Checkout for score ${score} is missing`);
    }

    it(`${score} -> [${tokens.join(",")}] should sum to ${score} and end with a double or bullseye`, () => {
      const sum = tokens.reduce((s, t) => s + getScoreOfThrow(t!), 0);

      expect(sum).toBe(score);

      const last = tokens[tokens.length - 1];

      // Last should be a double or bullseye, which is required
      // to finish a leg in a double-out game
      expect(last).toMatch(/^(D\d+|BULL)$/);
    });
  }
});
