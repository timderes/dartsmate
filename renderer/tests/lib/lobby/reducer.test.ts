import { describe, expect, it } from "vitest";
import lobbyReducer from "@/lib/lobby/reducer";
import createInitialLobbyState from "@/lib/lobby/createInitialLobbyState";
import { createMockPlayer } from "@/tests/mocks/player.mock";

describe("lobby reducer", () => {
  it("should add a player to the lobby state", () => {
    const state = createInitialLobbyState();
    const player = createMockPlayer();

    const nextState = lobbyReducer(state, {
      type: "ADD_PLAYER",
      payload: {
        player,
      },
    });

    // There is a player
    expect(nextState.players).toHaveLength(1);

    // The player has the correct properties
    expect(nextState.players[0]).toMatchObject({
      uuid: player.uuid,
      username: player.username,
      name: player.name,
      scoreLeft: -1,
      isWinner: false,
      legsWon: 0,
      setsWon: 0,
      rounds: [],
    });

    expect(state.players).toHaveLength(0);
  });

  it("should remove a player from the lobby state", () => {
    const player = createMockPlayer();
    const state = {
      ...createInitialLobbyState(),
      players: [player],
    };

    const nextState = lobbyReducer(state, {
      type: "REMOVE_PLAYER",
      payload: {
        playerUUID: player.uuid,
      },
    });

    // The player has been removed
    expect(nextState.players).toHaveLength(0);

    expect(state.players).toHaveLength(1);
  });

  it("should update match settings in the lobby state", () => {
    const state = createInitialLobbyState();
    const nextState = lobbyReducer(state, {
      type: "UPDATE_MATCH_SETTINGS",
      payload: {
        initialScore: 701,
        legs: 9,
        sets: 7,
      },
    });

    // State is updated correctly
    expect(nextState.initialScore).toBe(701);
    expect(nextState.legs).toBe(9);
    expect(nextState.sets).toBe(7);

    expect(state.initialScore).not.toBe(701);
    expect(state.legs).not.toBe(9);
    expect(state.sets).not.toBe(7);
  });

  it("should return the current state for unknown action types", () => {
    const state = createInitialLobbyState();

    const nextState = lobbyReducer(state, {
      type: "UNKNOWN_ACTION",
    } as never);

    expect(nextState).toBe(state);
  });
});
