import type { Player, MatchRound } from "@/types/match";

/**
 * Helper function to create a mock player with custom statistics and rounds.
 * Used for testing player-related functionality.
 */
export const createMockPlayer = (
  statistics: Partial<Player["statistics"]> = {},
  rounds: MatchRound[] = [],
): Player => ({
  avatarImage: undefined,
  bio: "Test bio",
  color: "blue",
  country: undefined,
  createdAt: Date.now(),
  isGuestProfile: false,
  name: {
    firstName: "Test",
    lastName: "Player",
  },
  username: "testplayer",
  updatedAt: Date.now(),
  uuid: "test-uuid-123",
  statistics: {
    average: 0,
    playedMatches: 0,
    playedTrainings: 0,
    thrownDarts: 0,
    thrownOneHundredAndEighty: 0,
    ...statistics,
  },
  scoreLeft: 501,
  isWinner: false,
  rounds: rounds,
  legsWon: 0,
  setsWon: 0,
});
