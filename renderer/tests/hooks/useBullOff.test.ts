import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCallback, useContext, useState } from "react";
import { useRouter } from "next/router";
import { useSessionStorage } from "@mantine/hooks";
import { useTranslation } from "next-i18next/pages";

import useLobby from "@/hooks/useLobby";
import useBullOff from "@/hooks/useBullOff";
import createInitialLobbyState from "@/lib/lobby/createInitialLobbyState";
import { createMockPlayer } from "@/tests/mocks/player.mock";

const { logErrorMock } = vi.hoisted(() => ({
  logErrorMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useContext: vi.fn(),
    useState: vi.fn(),
    useCallback: vi.fn(),
  };
});

vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@mantine/hooks", () => ({
  useSessionStorage: vi.fn(),
}));

vi.mock("next-i18next/pages", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("electron-log/renderer", () => ({
  default: {
    error: logErrorMock,
  },
}));

vi.mock("@/hooks/useLobby", () => ({
  default: vi.fn(),
}));

type Player = ReturnType<typeof createMockPlayer>;

type SetupOptions = {
  currentPlayerIndex?: number;
  showBullOffTable?: boolean;
  players?: Player[];
  locale?: string;
  pushResult?: Promise<void>;
};

const setup = ({
  currentPlayerIndex = 0,
  showBullOffTable = false,
  players = [],
  locale = "en",
  pushResult = Promise.resolve(),
}: SetupOptions = {}) => {
  const setCurrentPlayerIndex = vi.fn();
  const setShowBullOffTable = vi.fn();
  const setCurrentMatch = vi.fn();
  const removeCurrentMatch = vi.fn();
  const dispatch = vi.fn();
  const push = vi.fn(() => pushResult);

  const state = {
    ...createInitialLobbyState(),
    players,
  };

  vi.mocked(useContext).mockReturnValue(null);

  vi.mocked(useState)
    .mockImplementationOnce(() => [currentPlayerIndex, setCurrentPlayerIndex])
    .mockImplementationOnce(() => [showBullOffTable, setShowBullOffTable]);

  vi.mocked(useCallback).mockImplementation(
    ((callback) => callback) satisfies typeof useCallback,
  );

  vi.mocked(useLobby).mockReturnValue({
    state,
    dispatch,
  });

  vi.mocked(useSessionStorage).mockReturnValue([
    undefined,
    setCurrentMatch,
    removeCurrentMatch,
  ]);

  vi.mocked(useTranslation).mockReturnValue({
    i18n: {
      language: locale,
    },
  } as never);

  vi.mocked(useRouter).mockReturnValue({
    locale,
    push,
  } as never);

  const hook = useBullOff();

  return {
    hook,
    dispatch,
    setCurrentMatch,
    setCurrentPlayerIndex,
    setShowBullOffTable,
    push,
    state,
  };
};

describe("useBullOff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return provider context when available", () => {
    const contextState = {
      currentPlayerIndex: 1,
      showBullOffTable: true,
      isLastPlayer: true,
      handleNextTurn: vi.fn(),
      movePlayerInTable: vi.fn(),
      handleSkipToTable: vi.fn(),
      startMatch: vi.fn(),
    };

    vi.mocked(useContext).mockReturnValue(contextState);

    const result = useBullOff();

    expect(result).toBe(contextState);
    expect(useLobby).not.toHaveBeenCalled();
    expect(useTranslation).not.toHaveBeenCalled();
  });

  it("should move to next player when current player is not the last", () => {
    const players = [
      { ...createMockPlayer(), uuid: "player-1" },
      { ...createMockPlayer(), uuid: "player-2" },
    ];

    const { hook, setCurrentPlayerIndex, setShowBullOffTable } = setup({
      players,
      currentPlayerIndex: 0,
    });

    hook.handleNextTurn();

    expect(setCurrentPlayerIndex).toHaveBeenCalledTimes(1);

    const updateCurrentPlayerIndex = vi.mocked(setCurrentPlayerIndex).mock
      .calls[0][0] as (previousIndex: number) => number;

    expect(updateCurrentPlayerIndex(0)).toBe(1);
    expect(setShowBullOffTable).not.toHaveBeenCalled();
  });

  it("should show sorting table when current player is the last", () => {
    const players = [
      { ...createMockPlayer(), uuid: "player-1" },
      { ...createMockPlayer(), uuid: "player-2" },
    ];

    const { hook, setCurrentPlayerIndex, setShowBullOffTable } = setup({
      players,
      currentPlayerIndex: 1,
    });

    hook.handleNextTurn();

    expect(setShowBullOffTable).toHaveBeenCalledWith(true);
    expect(setCurrentPlayerIndex).not.toHaveBeenCalled();
  });

  it("should skip directly to sorting table", () => {
    const { hook, setShowBullOffTable } = setup();

    hook.handleSkipToTable();

    expect(setShowBullOffTable).toHaveBeenCalledWith(true);
  });

  it("should reorder players in lobby state when moving in table", () => {
    const players = [
      { ...createMockPlayer(), uuid: "player-1" },
      { ...createMockPlayer(), uuid: "player-2" },
      { ...createMockPlayer(), uuid: "player-3" },
    ];

    const { hook, dispatch } = setup({ players });

    hook.movePlayerInTable(1, 1);

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_PLAYER_ORDER",
      payload: {
        playerUUIDs: ["player-1", "player-3", "player-2"],
      },
    });
  });

  it("should not reorder players when target index is out of bounds", () => {
    const players = [
      { ...createMockPlayer(), uuid: "player-1" },
      { ...createMockPlayer(), uuid: "player-2" },
    ];

    const { hook, dispatch } = setup({ players });

    hook.movePlayerInTable(0, -1);
    hook.movePlayerInTable(1, 1);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("should persist match and navigate using the selected language when starting", () => {
    const players = [{ ...createMockPlayer(), uuid: "player-1" }];

    const { hook, setCurrentMatch, push, state } = setup({
      players,
      locale: "de",
    });

    hook.startMatch();

    expect(setCurrentMatch).toHaveBeenCalledWith(state);
    expect(push).toHaveBeenCalledWith("/de/match/playing");
  });

  it("should use the translation language instead of the router locale when starting", () => {
    const players = [{ ...createMockPlayer(), uuid: "player-1" }];

    const { hook, push } = setup({
      players,
      locale: "de",
    });

    vi.mocked(useRouter).mockReturnValue({
      locale: "en",
      push,
    } as never);

    hook.startMatch();

    expect(push).toHaveBeenCalledWith("/de/match/playing");
  });

  it("should log navigation errors while starting match", async () => {
    const navigationError = new Error("Navigation failed");

    const { hook } = setup({
      pushResult: Promise.reject(navigationError),
    });

    hook.startMatch();

    await Promise.resolve();
    await Promise.resolve();

    expect(logErrorMock).toHaveBeenCalledWith(
      "Navigation error:",
      navigationError,
    );
  });
});
