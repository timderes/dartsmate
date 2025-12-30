import { describe, expect, it } from "vitest";
import { gameReducer } from "@/hooks/useDartGame";
import type { Player } from "types/match";

const createMockPlayer = (id: string, name: string): Player => ({
  uuid: id,
  username: name,
  name: { firstName: name, lastName: "Doe" },
  scoreLeft: 501,
  rounds: [],
  isWinner: false,
  color: "red",
  statistics: {
    average: 0,
    playedMatches: 0,
    playedTrainings: 0,
    thrownDarts: 0,
    thrownOneHundredAndEighty: 0,
  },
  isGuestProfile: false,
  bio: "",
  createdAt: 0,
  updatedAt: 0,
});

describe("useDartGame Reducer", () => {
  const initialState = {
    players: [createMockPlayer("1", "Alice"), createMockPlayer("2", "Bob")],
    currentPlayerIndex: 0,
    matchRound: [],
    multiplier: { double: false, triple: false },
    matchStatus: "started" as const,
    initialScore: 501,
    matchCheckout: "Double" as const,
    uuid: "match-1",
    appVersion: "0.3.0",
    createdAt: 123456789,
  };

  it("should handle THROW_DART correctly (Single 20)", () => {
    const newState = gameReducer(initialState, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });

    expect(newState.matchRound).toHaveLength(1);
    expect(newState.matchRound[0].score).toBe(20);
    expect(newState.matchRound[0].isDouble).toBe(false);
  });

  it("should handle THROW_DART with Triple Multiplier", () => {
    // 1. Set Multiplier
    const multiplierState = gameReducer(initialState, {
      type: "TOGGLE_MULTIPLIER",
      payload: "triple",
    });

    expect(multiplierState.multiplier.triple).toBe(true);

    // 2. Throw Dart
    const finalState = gameReducer(multiplierState, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });

    expect(finalState.matchRound[0].score).toBe(60); // 20 * 3
    expect(finalState.matchRound[0].isTriple).toBe(true);
    expect(finalState.multiplier.triple).toBe(false); // Should reset
  });

  it("should switch turns on NEXT_TURN", () => {
    // Simulate Alice throwing 3 darts
    let state = gameReducer(initialState, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });

    // End Turn
    const nextTurnState = gameReducer(state, {
      type: "NEXT_TURN",
      payload: { elapsedTime: 10 },
    });

    expect(nextTurnState.currentPlayerIndex).toBe(1); // Bob's turn
    expect(nextTurnState.matchRound).toHaveLength(0); // Reset round
    expect(nextTurnState.players[0].scoreLeft).toBe(441); // 501 - 60
  });

  it("should detect a WIN (Checkout)", () => {
    // Setup a state where Alice has 40 left
    const closeToWinState = {
      ...initialState,
      players: [
        { ...initialState.players[0], scoreLeft: 40 },
        initialState.players[1],
      ],
    };

    // 1. Set Double
    let state = gameReducer(closeToWinState, {
      type: "TOGGLE_MULTIPLIER",
      payload: "double",
    });

    // 2. Throw 20 (Double 20 = 40)
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });

    // 3. Next Turn
    const winState = gameReducer(state, {
      type: "NEXT_TURN",
      payload: { elapsedTime: 10 },
    });

    expect(winState.matchStatus).toBe("finished");
    expect(winState.players[0].isWinner).toBe(true);
    expect(winState.players[0].scoreLeft).toBe(0);
  });
});
