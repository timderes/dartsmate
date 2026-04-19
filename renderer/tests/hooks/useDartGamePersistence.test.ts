import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDartGame } from "@hooks/useDartGame";
import type { Match } from "types/match";
import * as mantineHooks from "@mantine/hooks";

// Mock Mantine's useSessionStorage
const mockSetSessionStorage = vi.fn();
const mockUseSessionStorage = vi.fn();

vi.mock("@mantine/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof mantineHooks>();
  return {
    ...actual,
    useSessionStorage: (args: any) => mockUseSessionStorage(args),
  };
});

// Mock use-elapsed-time
vi.mock("use-elapsed-time", () => ({
  useElapsedTime: vi.fn(() => ({
    elapsedTime: 10,
    reset: vi.fn(),
  })),
}));

describe("useDartGame Persistence and Hydration", () => {
  it("should initialize with default state when no persisted data exists", () => {
    mockUseSessionStorage.mockReturnValue([undefined, mockSetSessionStorage]);
    const { result } = renderHook(() => useDartGame());
    
    expect(result.current.state.isHydrated).toBe(false);
    expect(result.current.state.matchStatus).toBe("undefined");
  });

  it("should hydrate state when persisted data is available", () => {
    const mockMatch: Match = {
      uuid: "persisted-uuid",
      appVersion: "1.0.0",
      createdAt: 1000,
      updatedAt: 1000,
      initialScore: 301,
      matchCheckout: "Single",
      matchStatus: "started",
      legs: 1,
      sets: 1,
      players: [
        {
          uuid: "p1",
          username: "Alice",
          name: { firstName: "Alice", lastName: "" },
          scoreLeft: 150,
          rounds: [],
          isWinner: false,
          legsWon: 0,
          setsWon: 0,
          color: "blue",
          statistics: { average: 0, playedMatches: 0, playedTrainings: 0, thrownDarts: 0, thrownOneHundredAndEighty: 0 },
          bio: "",
          createdAt: 0,
          updatedAt: 0,
          isGuestProfile: false
        }
      ],
    };

    mockUseSessionStorage.mockReturnValue([mockMatch, mockSetSessionStorage]);

    const { result } = renderHook(() => useDartGame());

    // Should hydrate based on mockMatch
    expect(result.current.state.isHydrated).toBe(true);
    expect(result.current.state.uuid).toBe("persisted-uuid");
    expect(result.current.state.initialScore).toBe(301);
    expect(result.current.state.players[0].scoreLeft).toBe(150);
  });

  it("should call setPersistedMatchData when state changes", () => {
    const mockMatch: Match = {
        uuid: "active-uuid",
        appVersion: "1.0.0",
        createdAt: 1000,
        updatedAt: 1000,
        initialScore: 501,
        matchCheckout: "Double",
        matchStatus: "started",
        legs: 1,
        sets: 1,
        players: [{ 
            uuid: "p1", 
            username: "Alice", 
            scoreLeft: 501, 
            rounds: [], 
            legsWon: 0, 
            setsWon: 0, 
            isWinner: false, 
            color: "red",
            name: { firstName: "A", lastName: "B" },
            statistics: { average: 0, playedMatches: 0, playedTrainings: 0, thrownDarts: 0, thrownOneHundredAndEighty: 0 },
            bio: "",
            createdAt: 0,
            updatedAt: 0,
            isGuestProfile: false
        }],
    };

    mockUseSessionStorage.mockReturnValue([mockMatch, mockSetSessionStorage]);

    const { result } = renderHook(() => useDartGame());

    // 2. Perform an action that changes state
    act(() => {
        result.current.actions.throwDart(20);
    });

    // 3. Check if persistence setter was called
    // Persistence might be called on first render too, so we check the latest call
    expect(mockSetSessionStorage).toHaveBeenCalled();
    
    act(() => {
        result.current.actions.nextTurn();
    });
    
    const lastCall = mockSetSessionStorage.mock.calls[mockSetSessionStorage.mock.calls.length - 1][0];
    expect(lastCall.players[0].scoreLeft).toBe(481); // 501 - 20
  });
});
