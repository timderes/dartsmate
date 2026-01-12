import { describe, expect, it } from "vitest";
import isCheckoutPossible from "@/lib/playing/isCheckoutPossible";
import { GameState } from "@/types/GameState";
import { THROWS_PER_ROUND } from "@/utils/constants";

describe("match.playing.isCheckoutPossible", () => {
  const mockState = {
    currentPlayerIndex: 0,
  };

  it("returns the correct checkout route when possible", () => {
    const updatedState = {
      ...mockState,
      matchRound: [
        { score: 60, isDouble: false },
        { score: 0, isDouble: false },
      ],
      players: [{ scoreLeft: 80 }],
      // Omit other properties with the as GameState type assertion
    } as GameState;

    const result = isCheckoutPossible(updatedState);

    expect(result).toEqual(["D10"]); // Example checkout for 20 remaining
  });
  it("returns undefined when the player has used all throws", () => {
    const updatedState = {
      ...mockState,
      matchRound: Array.from({ length: THROWS_PER_ROUND }, () => ({
        score: 20,
        isDouble: false,
      })),

      players: [{ scoreLeft: 141 }],
      // Omit other properties with the as GameState type assertion
    } as GameState;

    const result = isCheckoutPossible(updatedState);

    expect(result).toBeUndefined();
  });

  it("returns undefined when no checkout is possible (bogey number 179)", () => {
    const updatedState = {
      ...mockState,
      matchRound: [
        {
          score: 0,
          isDouble: false,
          isTriple: false,
          isBullseye: false,
          isMissed: true,
          dartboardZone: 0,
        },
      ],
      players: [{ scoreLeft: 179 }], // No checkout for 179 in default table
      // Omit other properties with the as GameState type assertion
    } as GameState;

    const result = isCheckoutPossible(updatedState);

    expect(result).toBeUndefined();
  });
});
