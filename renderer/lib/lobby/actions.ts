import type { Match, Player } from "@/types/match";
import { Profile } from "@/types/profile";

export type LobbyAction =
  | { type: "ADD_PLAYER"; payload: { player: Profile } }
  | { type: "REMOVE_PLAYER"; payload: { playerUUID: Player["uuid"] } }
  | {
      type: "UPDATE_MATCH_SETTINGS";
      payload: Partial<Match>;
    };
