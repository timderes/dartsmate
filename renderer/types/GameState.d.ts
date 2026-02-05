import type { CheckoutRoute } from "./CheckoutTable";
import type { Match, DartThrow } from "./match";

export type GameState = {
  currentPlayerIndex: number;
  currentLegIndex: number;
  currentSetIndex: number;
  currentLegStartingPlayerIndex: number;
  matchRound: DartThrow[];
  multiplier: {
    double: boolean;
    triple: boolean;
  };
  isHydrated: boolean;
  checkout: CheckoutRoute;
} & Match;

export type GameAction =
  | { type: "INIT_GAME"; payload: Match }
  | { type: "THROW_DART"; payload: { zone: number } }
  | { type: "UNDO_THROW" }
  | { type: "TOGGLE_MULTIPLIER"; payload: "double" | "triple" }
  | { type: "NEXT_TURN"; payload: { elapsedTime: number } }
  | { type: "ABORT_MATCH" }
  | { type: "PLAYER_READY"; payload: import("./profile").Profile };
