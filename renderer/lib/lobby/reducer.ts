import type { Match, Player } from "@/types/match";
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
      return {
        ...state,
        players: state.players.filter(
          (p) => p.uuid !== action.payload.playerUUID,
        ),
      };

    case "RESET_PLAYERS":
      return {
        ...state,
        players: [],
      };

    case "SET_PLAYER_ORDER": {
      const players = action.payload.playerUUIDs
        .map((uuid) => state.players.find((player) => player.uuid === uuid))
        .filter((player): player is Player => player !== undefined);

      return {
        ...state,
        players,
      };
    }

    //
    // Match Settings
    //
    case "UPDATE_MATCH_SETTINGS":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default lobbyReducer;
