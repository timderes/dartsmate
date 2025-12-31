import { useReducer, useEffect } from "react";
import type {
  Match,
  Player,
  DartThrow,
  MatchRound,
  Checkout,
} from "types/match";
import { useSessionStorage } from "@mantine/hooks";
import {
  SCORE_BULLSEYE,
  SCORE_MISSED,
  SCORE_OUTER_BULL,
  THROWS_PER_ROUND,
  APP_VERSION,
} from "@utils/constants";
import { applyScoreMultiplier } from "@utils/match/helper/applyScoreMultiplier";
import isNonMultipleScore from "@utils/match/helper/isNonMultipleScore";
import isBust from "@lib/playing/stats/isBust";
import {
  getScores,
  getTotalRoundScore,
} from "@utils/match/stats/getTotalRoundScore";
import { useElapsedTime } from "use-elapsed-time";

// --- Types ---

type GameState = {
  currentPlayerIndex: number;
  matchRound: DartThrow[]; // Current throws in this turn (0-3)
  multiplier: {
    double: boolean;
    triple: boolean;
  };
  isHydrated: boolean;
} & Match;

type GameAction =
  | { type: "INIT_GAME"; payload: Match }
  | { type: "THROW_DART"; payload: { zone: number } }
  | { type: "UNDO_THROW" }
  | { type: "TOGGLE_MULTIPLIER"; payload: "double" | "triple" }
  | { type: "NEXT_TURN"; payload: { elapsedTime: number } }
  | { type: "ABORT_MATCH" };

// --- Helpers ---

const isWinningThrow = (
  checkoutType: Checkout,
  scoreLeft: number,
  roundTotal: number,
  lastThrow: DartThrow,
): boolean => {
  if (scoreLeft - roundTotal !== 0) return false;

  if (checkoutType === "Single")
    return !lastThrow.isDouble && !lastThrow.isTriple;
  if (checkoutType === "Double")
    return lastThrow.isDouble || lastThrow.isBullseye;
  if (checkoutType === "Triple") return lastThrow.isTriple;

  return true; // "Any" checkout
};

// --- Reducer ---

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "INIT_GAME": {
      const matchData = action.payload;
      // If game hasn't started (scoreLeft is -1), initialize scores
      const initializedPlayers = matchData.players.map((player) => ({
        ...player,
        scoreLeft:
          player.scoreLeft === -1 ? matchData.initialScore : player.scoreLeft,
      }));

      return {
        ...state,
        players: initializedPlayers,
        matchStatus: matchData.matchStatus,
        initialScore: matchData.initialScore,
        matchCheckout: matchData.matchCheckout,
        uuid: matchData.uuid,
        appVersion: matchData.appVersion || APP_VERSION,
        createdAt: matchData.createdAt,
        updatedAt: matchData.updatedAt,
        currentPlayerIndex: 0,
        isHydrated: true,
      };
    }

    case "TOGGLE_MULTIPLIER": {
      const type = action.payload;
      return {
        ...state,
        multiplier: {
          double: type === "double" ? !state.multiplier.double : false,
          triple: type === "triple" ? !state.multiplier.triple : false,
        },
      };
    }

    case "THROW_DART": {
      if (state.matchRound.length >= THROWS_PER_ROUND) return state;

      const { zone } = action.payload;
      const { double, triple } = state.multiplier;

      const score = applyScoreMultiplier(double, triple, zone);

      const newThrow: DartThrow = {
        dartboardZone: zone,
        score,
        isBullseye: zone === SCORE_BULLSEYE,
        isOuterBull: zone === SCORE_OUTER_BULL,
        isMissed: zone === SCORE_MISSED,
        isDouble: isNonMultipleScore(zone) ? false : double,
        isTriple: isNonMultipleScore(zone) ? false : triple,
      };

      return {
        ...state,
        matchRound: [...state.matchRound, newThrow],
        multiplier: { double: false, triple: false }, // Reset multipliers after throw
      };
    }

    case "UNDO_THROW": {
      if (state.matchRound.length === 0) return state;
      return {
        ...state,
        matchRound: state.matchRound.slice(0, -1),
      };
    }

    case "NEXT_TURN": {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const scores = getScores(state.matchRound);
      const totalRoundScore = getTotalRoundScore(scores);

      // 1. Check Win Condition
      const lastThrow = state.matchRound[state.matchRound.length - 1];
      const isWinner =
        lastThrow &&
        isWinningThrow(
          state.matchCheckout,
          currentPlayer.scoreLeft,
          totalRoundScore,
          lastThrow,
        );

      // 2. Check Bust
      const newScoreLeft = currentPlayer.scoreLeft - totalRoundScore;
      const bust = isBust(state.matchCheckout, newScoreLeft);

      // 3. Prepare Round Data
      // Fill empty slots if less than 3 throws (unless won)
      const emptyThrow: DartThrow = {
        dartboardZone: 0,
        isBullseye: false,
        isDouble: false,
        isMissed: true,
        isOuterBull: false,
        isTriple: false,
        score: 0,
      };

      const finalRoundDetails = isWinner
        ? state.matchRound
        : [
            ...state.matchRound,
            ...Array.from(
              { length: THROWS_PER_ROUND - state.matchRound.length },
              () => emptyThrow,
            ),
          ];

      const matchRoundData: MatchRound = {
        elapsedTime: action.payload.elapsedTime,
        isBust: bust,
        roundAverage:
          state.matchRound.length > 0
            ? totalRoundScore / state.matchRound.length
            : 0,
        roundTotal: totalRoundScore,
        throwDetails: finalRoundDetails,
      };

      // 4. Update Player
      const updatedPlayer: Player = {
        ...currentPlayer,
        rounds: [...currentPlayer.rounds, matchRoundData],
        isWinner: isWinner,
        scoreLeft: isWinner ? 0 : bust ? currentPlayer.scoreLeft : newScoreLeft,
      };

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updatedPlayer : p,
      );

      return {
        ...state,
        players: updatedPlayers,
        matchStatus: isWinner ? "finished" : "started",
        currentPlayerIndex:
          (state.currentPlayerIndex + 1) % state.players.length,
        matchRound: [],
        multiplier: { double: false, triple: false },
      };
    }

    case "ABORT_MATCH":
      return { ...state, matchStatus: "aborted" };

    default:
      return state;
  }
};

// --- Hook ---

export const useDartGame = () => {
  const [persistedMatchData, setPersistedMatchData] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  // Timer is managed here to be passed to actions
  const { elapsedTime, reset: resetTimer } = useElapsedTime({
    isPlaying: true,
    updateInterval: 1,
  });

  const [state, dispatch] = useReducer(gameReducer, {
    players: [],
    currentPlayerIndex: 0,
    matchRound: [],
    multiplier: { double: false, triple: false },
    matchStatus: "undefined",
    initialScore: 501,
    matchCheckout: "Double",
    uuid: "",
    appVersion: APP_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isHydrated: false,
  });

  // 1. Hydrate state on load
  useEffect(() => {
    if (persistedMatchData && !state.isHydrated) {
      dispatch({ type: "INIT_GAME", payload: persistedMatchData });
    }
  }, [persistedMatchData, state.isHydrated]);

  // 2. Persist state to session storage on every change
  useEffect(() => {
    if (
      state.isHydrated &&
      state.matchStatus !== "undefined" &&
      state.players.length > 0
    ) {
      const currentMatchData: Match = {
        appVersion: state.appVersion,
        createdAt: state.createdAt,
        initialScore: state.initialScore,
        matchCheckout: state.matchCheckout,
        matchStatus: state.matchStatus,
        players: state.players,
        updatedAt: Date.now(),
        uuid: state.uuid,
      };
      setPersistedMatchData(currentMatchData);
    }
  }, [
    state.players,
    state.matchStatus,
    state.currentPlayerIndex,
    state.isHydrated,
  ]);

  // Exposed Actions
  const actions = {
    throwDart: (zone: number) =>
      dispatch({ type: "THROW_DART", payload: { zone } }),
    undoThrow: () => dispatch({ type: "UNDO_THROW" }),
    toggleMultiplier: (type: "double" | "triple") =>
      dispatch({ type: "TOGGLE_MULTIPLIER", payload: type }),
    nextTurn: () => {
      dispatch({ type: "NEXT_TURN", payload: { elapsedTime } });
      resetTimer();
    },
    abortMatch: () => dispatch({ type: "ABORT_MATCH" }),
  };

  return { state, actions };
};
