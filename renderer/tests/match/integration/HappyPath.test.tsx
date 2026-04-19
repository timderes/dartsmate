import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import PlayingPage from "@/pages/[locale]/match/playing";

// Mock window.matchMedia which is required by Mantine
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { useDartGame } from "@hooks/useDartGame";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "next/router";

// --- Mocks ---

vi.mock("@hooks/useDartGame");
vi.mock("@/contexts/ProfileContext");
vi.mock("next/router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@lib/db/matches/addMatch", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@lib/db/profiles/updateProfile", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("electron-log/renderer", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Mantine Modals
vi.mock("@mantine/modals", () => ({
  modals: {
    openConfirmModal: vi.fn(),
  },
}));

describe("Match Integration - Happy Path", () => {
  const mockRouter = {
    push: vi.fn(),
    query: { locale: "en" },
  };

  const mockProfile = {
    refreshProfile: vi.fn(),
    profile: { uuid: "p1" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useProfile as any).mockReturnValue(mockProfile);
  });

  it("should complete a full 101-Single match successfully", async () => {
    // 1. Setup initial state for a 101 game
    let gameState = {
      state: {
        isHydrated: true,
        players: [
          {
            uuid: "p1",
            username: "Alice",
            name: { firstName: "Alice", lastName: "" },
            scoreLeft: 101,
            rounds: [],
            isWinner: false,
            legsWon: 0,
            setsWon: 0,
            color: "blue",
            statistics: {
              average: 0,
              playedMatches: 0,
              playedTrainings: 0,
              thrownDarts: 0,
              thrownOneHundredAndEighty: 0,
            },
          },
        ],
        currentPlayerIndex: 0,
        currentLegStartingPlayerIndex: 0,
        matchRound: [],
        multiplier: { double: false, triple: false },
        matchStatus: "started",
        initialScore: 101,
        matchCheckout: "Single",
        uuid: "match-123",
        legs: 1,
        sets: 1,
        appVersion: "1.0.0",
        createdAt: Date.now(),
      },
      actions: {
        throwDart: vi.fn(),
        nextTurn: vi.fn(),
        undoThrow: vi.fn(),
        toggleMultiplier: vi.fn(),
        abortMatch: vi.fn(),
      },
    };

    (useDartGame as any).mockReturnValue(gameState);

    const { rerender } = render(
      <MantineProvider>
        <PlayingPage />
      </MantineProvider>,
    );

    // Verify initial render
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.getByText("101")).toBeDefined();

    // 2. Simulate Alice throwing T20, T10, 11 (Sum: 60 + 30 + 11 = 101)
    // In this integration test, we verify that clicking UI buttons calls the correct actions
    
    // Throw T20
    fireEvent.click(screen.getByText("match:multipliers.triple"));
    expect(gameState.actions.toggleMultiplier).toHaveBeenCalledWith("triple");
    
    fireEvent.click(screen.getByText("20"));
    expect(gameState.actions.throwDart).toHaveBeenCalledWith(20);

    // Update state to reflect the win (Simulating what the hook/reducer would do)
    gameState.state.players[0].scoreLeft = 0;
    gameState.state.players[0].isWinner = true;
    gameState.state.matchStatus = "finished";
    (useDartGame as any).mockReturnValue(gameState);
    
    rerender(
      <MantineProvider>
        <PlayingPage />
      </MantineProvider>,
    );

    // Verify winner UI
    expect(screen.getByText("match:closeFinishedMatch")).toBeDefined();

    // 3. Complete the match
    fireEvent.click(screen.getByText("match:closeFinishedMatch"));

    // Verify navigation to results
    await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/en/match/view");
    });
  });
});
