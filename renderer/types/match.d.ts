import type { Profile } from "./profile";

export type Player = Profile & {
  scoreLeft: number;
  isWinner: boolean;
  rounds: MatchRound[];
  legsWon: number;
  setsWon: number;
};

export type Checkout = "Any" | "Double" | "Single" | "Triple";
export type MatchStatus = "aborted" | "finished" | "started" | "undefined";

export type Match = {
  appVersion: string; // Semantic versioning string (e.g., "1.0.0")
  createdAt: number; // Timestamp when the match was created (UNIX timestamp)
  initialScore: number;
  players: Player[];
  matchCheckout: Checkout;
  matchStatus: MatchStatus;
  uuid: string; // Unique identifier for the match (UUID format: eg. 1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed)
  updatedAt: number;
  legs: number;
  sets: number;
};

export type MatchRound = {
  elapsedTime: number;
  isBust: boolean;
  roundAverage: number;
  roundTotal: number;
  throwDetails: DartThrow[];
};

export type DartboardZone = "BULLSEYE" | "NUMBER" | "MISSED" | "OUTER_BULL";

export type DartThrow = {
  isBullseye: boolean;
  isDouble: boolean;
  isMissed: boolean;
  isOuterBull: boolean;
  isTriple: boolean;
  score: number;
  dartboardZone: number; // The specific zone on the dartboard where the throw landed
};
