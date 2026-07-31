import type { Match } from "@/types/match";
import type { LobbyAction } from "@/lib/lobby/actions";
import createMatchPlayer from "./createMatchPlayer";

// This will be expanded in the future to include more properties
// related to the lobby state, such as player information, game
// settings, etc.
export type LobbyState = Match;

const lobbyReducer = (state: LobbyState, action: LobbyAction): LobbyState => {
  switch (action.type) {
    //
    // Players
    //
    case "ADD_PLAYER":
      console.info("Adding player to lobby:", action.payload.player);
      return {
        ...state,
        players: [
          ...state.players,
          {
            ...createMatchPlayer(action.payload.player),
          },
        ],
      };

    case "REMOVE_PLAYER":
      console.info("Removing player from lobby:", action.payload.playerUUID);
      return {
        ...state,
        players: state.players.filter(
          (p) => p.uuid !== action.payload.playerUUID,
        ),
      };

    case "RESET_PLAYERS":
      console.info("Resetting players in lobby");
      return {
        ...state,
        players: [],
      };

    //
    // Match Settings
    //
    case "UPDATE_MATCH_SETTINGS":
      console.info("Updating match settings:", action.payload);
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default lobbyReducer;
