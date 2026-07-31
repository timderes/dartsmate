import { describe, expect, it } from "vitest";
import { createMockProfile } from "@/tests/mocks/profile.mock";
import createMatchPlayer from "@/lib/lobby/createMatchPlayer";

describe("createMatchPlayer", () => {
  it("should add the necessary properties to a profile to create a Player object", () => {
    const profile = createMockProfile();
    const player = createMatchPlayer(profile);

    // Check that the player object has the correct properties
    expect(player).toHaveProperty("scoreLeft", -1); // -1 indicates that the player has not yet started scoring
    expect(player).toHaveProperty("isWinner", false);
    expect(player).toHaveProperty("rounds");
    expect(player.rounds).toEqual([]);
    expect(player).toHaveProperty("legsWon", 0);
    expect(player).toHaveProperty("setsWon", 0);
  });
});
