import type { Match, Player } from "@/types/match";

export type LobbyAction =
  | { type: "ADD_PLAYER"; payload: { player: Player } }
  | { type: "REMOVE_PLAYER"; payload: { playerUUID: Player["uuid"] } }
  | {
      type: "UPDATE_MATCH_SETTINGS";
      payload: Partial<
        Omit<Match, "players" | "uuid" | "createdAt" | "updatedAt">
      >;
    };
