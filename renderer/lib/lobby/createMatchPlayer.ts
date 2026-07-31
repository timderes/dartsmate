import type { Player } from "@/types/match";
import type { Profile } from "@/types/profile";

/**
 * Takes a profile and adds the necessary properties to create a
 * Player object for a match.
 */
const createMatchPlayer = (player: Profile): Player => {
  return {
    ...player,
    scoreLeft: -1,
    isWinner: false,
    rounds: [],
    legsWon: 0,
    setsWon: 0,
  };
};

export default createMatchPlayer;
