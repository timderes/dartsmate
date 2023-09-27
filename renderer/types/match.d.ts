import type { UUID } from "crypto";
import type { Profile } from "./profile";

declare type Checkout = "Any" | "Double" | "Single" | "Triple";

type MatchRound = Record<
  UUID,
  {
    elapsedThrowingTime: number;
    isBust: boolean;
    roundAvg: number;
    roundScore: number;
    throws: Throw[];
    scoreLeft: number;
  }[]
>;

declare type MatchStatus = "ABORTED" | "FINISHED" | "STARTED" | "UNFINISHED";

declare type MatchType = 901 | 701 | 501 | 301;

declare type Match = {
  appVersion: string;
  checkout: Checkout;
  createdAt: number;
  disabledStatistics: boolean;
  matchRounds: MatchRound[];
  matchStatus: MatchStatus;
  matchType: MatchType;
  matchUuid: UUID;
  profiles: Profile[];
  updatedAt: number;
  winner?: UUID;
};

type Throw = {
  isBullseye: boolean;
  isDouble: boolean;
  isMissed: boolean;
  isOuterBull: boolean;
  isTriple: boolean;
  score: number;
  zone: number;
};
