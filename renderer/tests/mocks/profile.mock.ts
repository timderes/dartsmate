import type { Profile } from "@/types/profile";
import { v4 as getUUID } from "uuid";

/**
 * Helper function to create a mock profile.
 *
 * A profile doesn't include match-specific properties
 * like scoreLeft, isWinner, rounds, legsWon, or setsWon.
 */
export const createMockProfile = (): Profile => ({
  avatarImage: undefined,
  bio: "Cowboy from the West",
  color: "red",
  country: "us",
  createdAt: Date.now(),
  isGuestProfile: false,
  name: {
    firstName: "John",
    lastName: "Marston",
  },
  username: "mrMilton",
  updatedAt: Date.now(),
  uuid: getUUID(),
  statistics: {
    average: 0,
    playedMatches: 0,
    playedTrainings: 0,
    thrownDarts: 0,
    thrownOneHundredAndEighty: 0,
  },
});
