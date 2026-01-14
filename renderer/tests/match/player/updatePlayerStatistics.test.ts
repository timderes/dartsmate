import { describe, expect, it } from "vitest";
import updatePlayerStatistics from "@/lib/playing/player/updatePlayerStatistics";
import { MatchRound } from "@/types/match";
import { MOCK_THROW_DETAIL } from "@/tests/mocks/throwDetail.mock";
import { createMockPlayer } from "@/tests/mocks/player.mock";

describe("player.updatePlayerStatistics", () => {
  describe("updatePlayedMatches", () => {
    it("increments playedMatches by 1", () => {
      const player = createMockPlayer({ playedMatches: 5 });
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.playedMatches).toBe(6);
    });

    it("increments playedMatches from 0 to 1 for first match", () => {
      const player = createMockPlayer({ playedMatches: 0 });
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.playedMatches).toBe(1);
    });
  });

  describe("updateThrownDarts", () => {
    it("counts darts from a single round", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 20,
          roundTotal: 60,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
          ],
        },
      ];

      const player = createMockPlayer({ thrownDarts: 0 }, rounds);
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownDarts).toBe(3);
    });

    it("counts darts from multiple rounds", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 20,
          roundTotal: 60,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
          ],
        },
        {
          elapsedTime: 1,
          roundAverage: 40,
          roundTotal: 80,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 40, isDouble: true },
          ],
        },
      ];

      const player = createMockPlayer({ thrownDarts: 10 }, rounds);
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownDarts).toBe(15); // 10 + 3 + 2
    });

    it("handles rounds with no throws", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 0,
          roundTotal: 0,
          isBust: false,
          throwDetails: [],
        },
      ];

      const player = createMockPlayer({ thrownDarts: 5 }, rounds);
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownDarts).toBe(5);
    });

    it("handles rounds with undefined throwDetails", () => {
      // Create a round without throwDetails to test edge case handling
      const roundWithoutThrows = {
        elapsedTime: 1,
        roundAverage: 0,
        roundTotal: 0,
        isBust: false,
      } as MatchRound;

      const rounds: MatchRound[] = [roundWithoutThrows];

      const player = createMockPlayer({ thrownDarts: 5 }, rounds);
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownDarts).toBe(5);
    });
  });

  describe("updateThrownOneHundredAndEighties", () => {
    it("counts a single 180 round", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 60,
          roundTotal: 180,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
          ],
        },
      ];

      const player = createMockPlayer(
        { thrownOneHundredAndEighty: 0 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownOneHundredAndEighty).toBe(1);
    });

    it("counts multiple 180 rounds", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 60,
          roundTotal: 180,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
          ],
        },
        {
          elapsedTime: 1,
          roundAverage: 60,
          roundTotal: 180,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
          ],
        },
      ];

      const player = createMockPlayer(
        { thrownOneHundredAndEighty: 3 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownOneHundredAndEighty).toBe(5); // 3 + 2
    });

    it("does not count rounds below 180", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 57,
          roundTotal: 171,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 57, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 57, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 57, isTriple: true },
          ],
        },
      ];

      const player = createMockPlayer(
        { thrownOneHundredAndEighty: 2 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownOneHundredAndEighty).toBe(2);
    });

    it("counts rounds with exactly 180", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 60,
          roundTotal: 180,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
          ],
        },
      ];

      const player = createMockPlayer(
        { thrownOneHundredAndEighty: 0 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.thrownOneHundredAndEighty).toBe(1);
    });
  });

  describe("updateAverage - weighted average calculation", () => {
    it("returns match average for first match (playedMatches = 0)", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 20,
          roundTotal: 60,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
          ],
        },
      ];

      const player = createMockPlayer(
        { average: 0, playedMatches: 0 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.average).toBe(60);
    });

    it("returns match average when previous average is 0", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 20,
          roundTotal: 80,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 40, isDouble: true },
            { ...MOCK_THROW_DETAIL, score: 20 },
          ],
        },
      ];

      const player = createMockPlayer(
        { average: 0, playedMatches: 5 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.average).toBe(80);
    });

    it("calculates weighted average for second match", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 30,
          roundTotal: 90,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 30 },
            { ...MOCK_THROW_DETAIL, score: 30 },
            { ...MOCK_THROW_DETAIL, score: 30 },
          ],
        },
      ];

      // First match had average of 60, now playing second match with average of 90
      const player = createMockPlayer(
        { average: 60, playedMatches: 1 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      // (60 * 1 + 90) / (1 + 1) = 150 / 2 = 75
      expect(updatedStats.average).toBe(75);
    });

    it("calculates weighted average for multiple previous matches", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 40,
          roundTotal: 120,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 40 },
            { ...MOCK_THROW_DETAIL, score: 40 },
            { ...MOCK_THROW_DETAIL, score: 40 },
          ],
        },
      ];

      // Previous 4 matches had average of 80, now playing 5th match with average of 120
      const player = createMockPlayer(
        { average: 80, playedMatches: 4 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      // (80 * 4 + 120) / (4 + 1) = 440 / 5 = 88
      expect(updatedStats.average).toBe(88);
    });

    it("calculates weighted average with multiple rounds in current match", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 20,
          roundTotal: 60,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
          ],
        },
        {
          elapsedTime: 1,
          roundAverage: 40,
          roundTotal: 120,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 40 },
            { ...MOCK_THROW_DETAIL, score: 40 },
            { ...MOCK_THROW_DETAIL, score: 40 },
          ],
        },
      ];

      // Previous 2 matches had average of 50, current match has average of (60 + 120) / 2 = 90
      const player = createMockPlayer(
        { average: 50, playedMatches: 2 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      // (50 * 2 + 90) / (2 + 1) = 190 / 3 = 63.333...
      expect(updatedStats.average).toBeCloseTo((50 * 2 + 90) / 3, 2);
    });

    it("handles low average increasing over time", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 30,
          roundTotal: 100,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 50, isBullseye: true },
            { ...MOCK_THROW_DETAIL, score: 25, isOuterBull: true },
            { ...MOCK_THROW_DETAIL, score: 25, isOuterBull: true },
          ],
        },
      ];

      const player = createMockPlayer({ average: 30, playedMatches: 1 }, rounds);
      const updatedStats = updatePlayerStatistics(player);

      // (30 * 1 + 100) / (1 + 1) = 130 / 2 = 65
      expect(updatedStats.average).toBe(65);
    });

    it("handles high average decreasing over time", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 10,
          roundTotal: 30,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 10 },
            { ...MOCK_THROW_DETAIL, score: 10 },
            { ...MOCK_THROW_DETAIL, score: 10 },
          ],
        },
      ];

      const player = createMockPlayer({ average: 80, playedMatches: 1 }, rounds);
      const updatedStats = updatePlayerStatistics(player);

      // (80 * 1 + 30) / (1 + 1) = 110 / 2 = 55
      expect(updatedStats.average).toBe(55);
    });
  });

  describe("complete statistics update", () => {
    it("updates all statistics correctly in a single call", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 60,
          roundTotal: 180,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
            { ...MOCK_THROW_DETAIL, score: 60, isTriple: true },
          ],
        },
        {
          elapsedTime: 1,
          roundAverage: 40,
          roundTotal: 120,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 40 },
            { ...MOCK_THROW_DETAIL, score: 40 },
            { ...MOCK_THROW_DETAIL, score: 40 },
          ],
        },
      ];

      const player = createMockPlayer(
        {
          average: 75,
          playedMatches: 3,
          thrownDarts: 50,
          thrownOneHundredAndEighty: 2,
          playedTrainings: 5,
        },
        rounds,
      );

      const updatedStats = updatePlayerStatistics(player);

      // Check all statistics are updated correctly
      expect(updatedStats.playedMatches).toBe(4); // 3 + 1
      expect(updatedStats.thrownDarts).toBe(56); // 50 + 6
      expect(updatedStats.thrownOneHundredAndEighty).toBe(3); // 2 + 1 (one 180 round)
      expect(updatedStats.average).toBeCloseTo((75 * 3 + 150) / 4, 2); // (75 * 3 + 150) / 4 = 93.75
      expect(updatedStats.playedTrainings).toBe(5); // unchanged
    });

    it("preserves playedTrainings count", () => {
      const rounds: MatchRound[] = [
        {
          elapsedTime: 1,
          roundAverage: 20,
          roundTotal: 60,
          isBust: false,
          throwDetails: [
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
            { ...MOCK_THROW_DETAIL, score: 20 },
          ],
        },
      ];

      const player = createMockPlayer(
        { playedTrainings: 10 },
        rounds,
      );
      const updatedStats = updatePlayerStatistics(player);

      expect(updatedStats.playedTrainings).toBe(10);
    });
  });
});
