import type { Player } from "@/types/match";
import getNumberOfRoundsAboveThreshold from "../stats/getScoresAbove";
import getMatchAverage from "../stats/getMatchAverage";

/**
 * Called after a match or training is completed to update the player's statistics.
 *
 * @param player - The player whose statistics need to be updated
 * @returns The updated player statistics
 */
const updatePlayerStatistics = (player: Player): Player["statistics"] => {
  const currentStatistics = player.statistics;

  // Update statistics with new calculations
  // TODO: Implement trainings statistics update here, when trainings are supported
  const updatedStatistics: Player["statistics"] = {
    ...currentStatistics,
    average: updateAverage(player),
    thrownOneHundredAndEighty: updateThrownOneHundredAndEighties(player),
    thrownDarts: updateThrownDarts(player),
    playedMatches: updatePlayedMatches(currentStatistics),
  };

  return updatedStatistics;
};

export default updatePlayerStatistics;

const updatePlayedMatches = (statistics: Player["statistics"]) => {
  // TODO: Check if the match was a training. In this case, playedMatches should not be incremented.
  return statistics.playedMatches + 1;
};

const updateThrownOneHundredAndEighties = (player: Player) => {
  const newOneHundredAndEighties = getNumberOfRoundsAboveThreshold(
    player.rounds,
    180,
  );

  return player.statistics.thrownOneHundredAndEighty + newOneHundredAndEighties;
};

const updateThrownDarts = (player: Player) => {
  const previousThrownDarts = player.statistics.thrownDarts ?? 0;

  const thrownDartsInMatch = player.rounds.reduce(
    (sum, round) => sum + (round.throwDetails?.length ?? 0),
    0,
  );
  return previousThrownDarts + thrownDartsInMatch;
};

const updateAverage = (player: Player) => {
  const previousAverage = player.statistics.average ?? 0;

  // If there was no previous average or played matches, return the current match average
  if (previousAverage === 0 || player.statistics.playedMatches === 0) {
    return getMatchAverage(player.rounds);
  }

  const currentMatchAverage = getMatchAverage(player.rounds);
  const playedMatches = player.statistics.playedMatches;

  // Weighted average across matches
  return (
    (previousAverage * playedMatches + currentMatchAverage) /
    (playedMatches + 1)
  );
};
