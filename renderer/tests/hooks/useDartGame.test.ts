import { describe, expect, it } from "vitest";
import { gameReducer } from "@hooks/useDartGame";
import type { Player } from "types/match";

const createMockPlayer = (id: string, name: string): Player => ({
  uuid: id,
  username: name,
  name: { firstName: name, lastName: "Doe" },
  scoreLeft: 501,
  rounds: [],
  isWinner: false,
  legsWon: 0,
  setsWon: 0,
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
    currentLegIndex: 0,
    currentSetIndex: 0,
    matchRound: [],
    multiplier: { double: false, triple: false },
    matchStatus: "started" as const,
    initialScore: 501,
    matchCheckout: "Double" as const,
    uuid: "match-1",
    appVersion: "0.5.0",
    createdAt: 123456789,
    updatedAt: 123456789,
    isHydrated: true,
    legs: 1,
    sets: 1,
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
    expect(winState.players[0].legsWon).toBe(1);
    expect(winState.players[0].setsWon).toBe(1);
  });

  it("should track legs won in a 3 legs match", () => {
    // Setup a 3 legs, 1 set match
    const multiLegState = {
      ...initialState,
      legs: 3,
      sets: 1,
      players: [
        { ...initialState.players[0], scoreLeft: 40 },
        initialState.players[1],
      ],
    };

    // Alice wins first leg
    let state = gameReducer(multiLegState, {
      type: "TOGGLE_MULTIPLIER",
      payload: "double",
    });
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });
    state = gameReducer(state, {
      type: "NEXT_TURN",
      payload: { elapsedTime: 10 },
    });

    // After first leg win
    expect(state.players[0].legsWon).toBe(1);
    expect(state.players[0].setsWon).toBe(0); // Haven't won set yet
    expect(state.matchStatus).toBe("started"); // Match continues
    expect(state.currentLegIndex).toBe(1); // Moved to next leg
    expect(state.players[0].scoreLeft).toBe(501); // Score reset for new leg
    expect(state.players[1].scoreLeft).toBe(501);
  });

  it("should win match after winning enough legs in a set", () => {
    // Setup where Alice has already won 2 legs (needs 3 total to win set)
    const closeToSetWinState = {
      ...initialState,
      legs: 3,
      sets: 1,
      currentLegIndex: 2,
      players: [
        { ...initialState.players[0], scoreLeft: 40, legsWon: 2 },
        initialState.players[1],
      ],
    };

    // Alice wins third leg (3 out of 3 = set win)
    let state = gameReducer(closeToSetWinState, {
      type: "TOGGLE_MULTIPLIER",
      payload: "double",
    });
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });
    state = gameReducer(state, {
      type: "NEXT_TURN",
      payload: { elapsedTime: 10 },
    });

    // Should win the match (1 set, 3 legs required)
    expect(state.players[0].legsWon).toBe(3);
    expect(state.players[0].setsWon).toBe(1);
    expect(state.players[0].isWinner).toBe(true);
    expect(state.matchStatus).toBe("finished");
  });

  it("should handle multi-set matches correctly", () => {
    // Setup: 3 legs per set, 3 sets total. Alice has won 2 legs already
    const multiSetState = {
      ...initialState,
      legs: 3,
      sets: 3,
      currentLegIndex: 2,
      players: [
        { ...initialState.players[0], scoreLeft: 40, legsWon: 2, setsWon: 0 },
        initialState.players[1],
      ],
    };

    // Alice wins third leg to win first set
    let state = gameReducer(multiSetState, {
      type: "TOGGLE_MULTIPLIER",
      payload: "double",
    });
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });
    state = gameReducer(state, {
      type: "NEXT_TURN",
      payload: { elapsedTime: 10 },
    });

    // Should win the first set but not the match
    expect(state.players[0].legsWon).toBe(0); // Reset for new set
    expect(state.players[0].setsWon).toBe(1);
    expect(state.players[0].isWinner).toBe(false);
    expect(state.matchStatus).toBe("started");
    expect(state.currentSetIndex).toBe(1); // Moved to next set
    expect(state.currentLegIndex).toBe(0); // Reset to first leg of new set
    expect(state.players[0].scoreLeft).toBe(501); // Score reset
  });

  it("should win match after winning enough sets", () => {
    // Setup where Alice has already won 2 sets and has 2 legs in the third set
    const closeToMatchWinState = {
      ...initialState,
      legs: 3,
      sets: 3,
      currentSetIndex: 2,
      currentLegIndex: 2,
      players: [
        { ...initialState.players[0], scoreLeft: 40, legsWon: 2, setsWon: 2 },
        initialState.players[1],
      ],
    };

    // Alice wins third leg to win third set (3 sets total = match win)
    let state = gameReducer(closeToMatchWinState, {
      type: "TOGGLE_MULTIPLIER",
      payload: "double",
    });
    state = gameReducer(state, {
      type: "THROW_DART",
      payload: { zone: 20 },
    });
    state = gameReducer(state, {
      type: "NEXT_TURN",
      payload: { elapsedTime: 10 },
    });

    // Should win the match
    expect(state.players[0].legsWon).toBe(3);
    expect(state.players[0].setsWon).toBe(3);
    expect(state.players[0].isWinner).toBe(true);
    expect(state.matchStatus).toBe("finished");
  });
});
