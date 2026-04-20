import { useReducer, useEffect } from "react";
import type { Match } from "types/match";
import { useSessionStorage } from "@mantine/hooks";
import { APP_VERSION } from "@utils/constants";
import { useElapsedTime } from "use-elapsed-time";
import { gameReducer } from "./useDartGame/reducer";

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
    currentLegIndex: 0,
    currentSetIndex: 0,
    currentLegStartingPlayerIndex: 0,
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
    legs: 3,
    sets: 1,
    checkout: undefined,
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
        legs: state.legs,
        sets: state.sets,
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
