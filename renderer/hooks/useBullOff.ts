import useLobby from "@/hooks/useLobby";
import type { Match } from "@/types/match";
import { useSessionStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useState, useCallback, useContext } from "react";
import log from "electron-log/renderer";
import BullOffContext from "@/contexts/BullOffContext";

export type BullOffState = {
  currentPlayerIndex: number;
  showBullOffTable: boolean;
  isLastPlayer: boolean;
  handleNextTurn: () => void;
  movePlayerInTable: (index: number, direction: -1 | 1) => void;
  handleSkipToTable: () => void;
  startMatch: () => void;
};

const useBullOff = (): BullOffState => {
  const contextState = useContext(BullOffContext);

  if (contextState !== null) {
    return contextState;
  }

  const router = useRouter();
  const { dispatch, state } = useLobby();
  const [, setCurrentMatch] = useSessionStorage<Match>({ key: "currentMatch" });

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showBullOffTable, setShowBullOffTable] = useState(false);

  const isLastPlayer = currentPlayerIndex === state.players?.length - 1;

  const handleNextTurn = useCallback(() => {
    if (isLastPlayer) {
      setShowBullOffTable(true);
    } else {
      setCurrentPlayerIndex((prev) => prev + 1);
    }
  }, [isLastPlayer]);

  const handleSkipToTable = useCallback(() => {
    setShowBullOffTable(true);
  }, []);

  const reorderByUUIDs = useCallback(
    (newOrderUUIDs: string[]) => {
      dispatch({
        type: "SET_PLAYER_ORDER",
        payload: { playerUUIDs: newOrderUUIDs },
      });
    },
    [dispatch],
  );

  const movePlayerInTable = useCallback(
    (index: number, direction: -1 | 1) => {
      if (!state.players?.length) return;

      if (index + direction < 0 || index + direction >= state.players.length)
        return;

      const currentUUIDs = state.players.map((p) => p.uuid);

      [currentUUIDs[index], currentUUIDs[index + direction]] = [
        currentUUIDs[index + direction],
        currentUUIDs[index],
      ];

      reorderByUUIDs(currentUUIDs);
    },
    [state.players, reorderByUUIDs],
  );

  const startMatch = useCallback(() => {
    setCurrentMatch(state);
    router.push(`/${router.locale ?? "en"}/match/playing`).catch((err) => {
      log.error("Navigation error:", err);
    });
  }, [router, state, setCurrentMatch]);

  return {
    currentPlayerIndex,
    showBullOffTable,
    isLastPlayer,
    handleNextTurn,
    movePlayerInTable,
    handleSkipToTable,
    startMatch,
  };
};

export default useBullOff;
