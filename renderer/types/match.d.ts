import type { Profile } from "./profile";

type Player = Profile & {
  scoreLeft: number;
  isWinner: boolean;
  rounds: MatchRound[];
};

declare type Checkout = "Any" | "Double" | "Single" | "Triple";
declare type MatchStatus = "aborted" | "finished" | "started" | "undefined";

declare type Match = {
  appVersion: string; // Semantic versioning string (e.g., "1.0.0")
  createdAt: number; // Timestamp when the match was created (UNIX timestamp)
  initialScore: number;
  players: Player[];
  matchCheckout: Checkout;
  matchStatus: MatchStatus;
  uuid: string; // Unique identifier for the match (UUID format: eg. 1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed)
  updatedAt: number;
};

declare type MatchRound = {
  elapsedTime: number;
  isBust: boolean;
  roundAverage: number;
  roundTotal: number;
  throwDetails: DartThrow[];
};

declare type DartboardZone = "BULLSEYE" | "NUMBER" | "MISSED" | "OUTER_BULL";

declare type DartThrow = {
  isBullseye: boolean;
  isDouble: boolean;
  isMissed: boolean;
  isOuterBull: boolean;
  isTriple: boolean;
  score: number;
  dartboardZone: number; // The specific zone on the dartboard where the throw landed
};
