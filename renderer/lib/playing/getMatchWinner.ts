import type { Player } from "types/match";

/**
 * Returns the player who won the match. Otherwise, returns undefined.
 */
const getMatchWinner = (players: Player[]): Player | undefined => {
  if (!players || players.length === 0) return undefined;

  return players.find((player) => player.isWinner);
};

export default getMatchWinner;
