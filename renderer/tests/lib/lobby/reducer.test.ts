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

  it("should set a custom player order by UUID", () => {
    const playerOne = {
      ...createMockPlayer(),
      uuid: "player-one",
      username: "player-one",
      name: { firstName: "Player", lastName: "One" },
    };
    const playerTwo = {
      ...createMockPlayer(),
      uuid: "player-two",
      username: "player-two",
      name: { firstName: "Player", lastName: "Two" },
    };
    const playerThree = {
      ...createMockPlayer(),
      uuid: "player-three",
      username: "player-three",
      name: { firstName: "Player", lastName: "Three" },
    };

    const state = {
      ...createInitialLobbyState(),
      players: [playerOne, playerTwo, playerThree],
    };

    const nextState = lobbyReducer(state, {
      type: "SET_PLAYER_ORDER",
      payload: {
        playerUUIDs: [playerThree.uuid, playerOne.uuid, playerTwo.uuid],
      },
    });

    expect(nextState.players.map((player) => player.uuid)).toEqual([
      "player-three",
      "player-one",
      "player-two",
    ]);
    expect(state.players.map((player) => player.uuid)).toEqual([
      "player-one",
      "player-two",
      "player-three",
    ]);
  });

  it("should ignore unknown UUIDs while setting player order", () => {
    const playerOne = {
      ...createMockPlayer(),
      uuid: "player-one",
      username: "player-one",
      name: { firstName: "Player", lastName: "One" },
    };
    const playerTwo = {
      ...createMockPlayer(),
      uuid: "player-two",
      username: "player-two",
      name: { firstName: "Player", lastName: "Two" },
    };

    const state = {
      ...createInitialLobbyState(),
      players: [playerOne, playerTwo],
    };

    const nextState = lobbyReducer(state, {
      type: "SET_PLAYER_ORDER",
      payload: {
        playerUUIDs: [playerTwo.uuid, "unknown-player", playerOne.uuid],
      },
    });

    expect(nextState.players.map((player) => player.uuid)).toEqual([
      "player-two",
      "player-one",
    ]);
  });

  it("should return the current state for unknown action types", () => {
    const state = createInitialLobbyState();

    const nextState = lobbyReducer(state, {
      type: "UNKNOWN_ACTION",
    } as never);

    expect(nextState).toBe(state);
  });
});
