import type { Player, DartThrow, MatchRound } from "types/match";
import type { GameAction, GameState } from "types/GameState";
import {
  SCORE_BULLSEYE,
  SCORE_MISSED,
  SCORE_OUTER_BULL,
  THROWS_PER_ROUND,
} from "@utils/constants";
import { applyScoreMultiplier } from "@utils/match/helper/applyScoreMultiplier";
import isNonMultipleScore from "@utils/match/helper/isNonMultipleScore";
import isBust from "@lib/playing/stats/isBust";
import getScores from "@/lib/playing/stats/getScores";
import getTotalRoundScore from "@/lib/playing/stats/getTotalRoundScore";
import isCheckoutPossible from "@/lib/playing/isCheckoutPossible";
import { isWinningThrow } from "./utils";

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
        legsWon: player.legsWon ?? 0,
        setsWon: player.setsWon ?? 0,
      }));

      const newState = {
        ...state,
        players: initializedPlayers,
        matchStatus: matchData.matchStatus,
        initialScore: matchData.initialScore,
        matchCheckout: matchData.matchCheckout,
        uuid: matchData.uuid,
        appVersion: matchData.appVersion,
        createdAt: matchData.createdAt,
        updatedAt: matchData.updatedAt,
        legs: matchData.legs,
        sets: matchData.sets,
        currentPlayerIndex: 0,
        currentLegIndex: 0,
        currentSetIndex: 0,
        currentLegStartingPlayerIndex: 0,
        isHydrated: true,
        matchRound: [],
        multiplier: { double: false, triple: false },
        checkout: undefined,
      };

      return { ...newState, checkout: isCheckoutPossible(newState) };
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

      const newMatchRound = [...state.matchRound, newThrow];

      const newState: GameState = {
        ...state,
        matchRound: newMatchRound,
        multiplier: { double: false, triple: false },
      } as GameState;

      return { ...newState, checkout: isCheckoutPossible(newState) };
    }

    case "UNDO_THROW": {
      if (state.matchRound.length === 0) return state;

      const newMatchRound = state.matchRound.slice(0, -1);

      const newState: GameState = {
        ...state,
        matchRound: newMatchRound,
      } as GameState;

      return { ...newState, checkout: isCheckoutPossible(newState) };
    }

    case "NEXT_TURN": {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const scores = getScores(state.matchRound);
      const totalRoundScore = getTotalRoundScore(scores);

      // 1. Check Win Condition for current leg
      const lastThrow = state.matchRound[state.matchRound.length - 1];

      const isLegWinner =
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

      const finalRoundDetails = isLegWinner
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

      // 4. Update Player with round data
      const updatedPlayer: Player = {
        ...currentPlayer,
        rounds: [...currentPlayer.rounds, matchRoundData],
        scoreLeft: isLegWinner
          ? 0
          : bust
            ? currentPlayer.scoreLeft
            : newScoreLeft,
        legsWon: currentPlayer.legsWon,
        setsWon: currentPlayer.setsWon,
        isWinner: false, // Will be set below if match is won
      };

      let updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updatedPlayer : p,
      );

      // 5. Handle leg win and determine if set/match is won
      let newCurrentLegIndex = state.currentLegIndex;
      let newCurrentSetIndex = state.currentSetIndex;
      let newMatchStatus = state.matchStatus;
      let shouldResetScores = false;

      if (isLegWinner) {
        // Increment legs won for the current player
        updatedPlayers = updatedPlayers.map((p, i) =>
          i === state.currentPlayerIndex ? { ...p, legsWon: p.legsWon + 1 } : p,
        );

        const currentPlayerUpdated = updatedPlayers[state.currentPlayerIndex];

        // Check if player won the set
        if (currentPlayerUpdated.legsWon >= state.legs) {
          // Player won the set
          updatedPlayers = updatedPlayers.map((p, i) =>
            i === state.currentPlayerIndex
              ? { ...p, setsWon: p.setsWon + 1 }
              : p,
          );

          // Check if player won the match
          if (updatedPlayers[state.currentPlayerIndex].setsWon >= state.sets) {
            // Player won the match
            updatedPlayers = updatedPlayers.map((p, i) =>
              i === state.currentPlayerIndex ? { ...p, isWinner: true } : p,
            );
            newMatchStatus = "finished";
          } else {
            // Start new set - reset legs won and increment set index
            updatedPlayers = updatedPlayers.map((p) => ({
              ...p,
              legsWon: 0,
            }));
            newCurrentSetIndex += 1;
            newCurrentLegIndex = 0;
            shouldResetScores = true;
          }
        } else {
          // Start new leg - increment leg index
          newCurrentLegIndex += 1;
          shouldResetScores = true;
        }
      }

      // 6. Reset scores if starting a new leg
      if (shouldResetScores) {
        updatedPlayers = updatedPlayers.map((p) => ({
          ...p,
          scoreLeft: state.initialScore,
        }));
      }

      const nextPlayerIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
      const nextLegStarterIndex = shouldResetScores
        ? nextPlayerIndex
        : state.currentLegStartingPlayerIndex;

      const newState: GameState = {
        ...state,
        players: updatedPlayers,
        matchStatus: newMatchStatus,
        currentLegIndex: newCurrentLegIndex,
        currentSetIndex: newCurrentSetIndex,
        currentPlayerIndex: nextPlayerIndex,
        currentLegStartingPlayerIndex: nextLegStarterIndex,
        matchRound: [],
        multiplier: { double: false, triple: false },
      } as GameState;

      return { ...newState, checkout: isCheckoutPossible(newState) };
    }

    case "ABORT_MATCH":
      return { ...state, matchStatus: "aborted" };

    default:
      return state;
  }
};
