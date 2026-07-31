import { APP_VERSION, DEFAULT_MATCH_SETTINGS } from "@/utils/constants";
import { v4 as getUUID } from "uuid";
import type { Match } from "@/types/match";

/**
 * Creates the initial state for the lobby.
 *
 * This state is used as the starting point when creating a new match.
 *
 * @see {@link Match} for the current structure of the lobby state.
 *
 * Currently, the lobby state reuses the {@link Match} type. In the future,
 * it might make sense to introduce a dedicated lobby state that contains
 * only the data required during match creation.
 *
 * This would allow us to support additional game modes or lobby-specific
 * settings without coupling them directly to the {@link Match} model.
 */
const createInitialLobbyState = (): Match => {
  return {
    appVersion: APP_VERSION,
    createdAt: Date.now(),
    initialScore: DEFAULT_MATCH_SETTINGS.SCORE,
    matchCheckout: DEFAULT_MATCH_SETTINGS.CHECKOUT,
    matchStatus: DEFAULT_MATCH_SETTINGS.STATUS,
    uuid: getUUID(),
    players: [],
    updatedAt: Date.now(),
    legs: DEFAULT_MATCH_SETTINGS.LEGS,
    sets: DEFAULT_MATCH_SETTINGS.SETS,
    startWithBullOff: DEFAULT_MATCH_SETTINGS.START_WITH_BULL_OFF,
  };
};

export default createInitialLobbyState;
