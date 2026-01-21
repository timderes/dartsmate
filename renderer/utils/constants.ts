import pkg from "../../package.json";
import { Checkout, MatchStatus } from "types/match";

export const APP_NAME = pkg.productName;
export const APP_VERSION = pkg.version;

// Date options used on all pages and components
export const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

// The maximum number of throws allowed per round in the game.
export const THROWS_PER_ROUND = 3;

// An array containing the possible scoring zones on a dartboard.
export const DARTBOARD_ZONES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 50,
];

// Values to identify the "special" dartboard zones
export const SCORE_BULLSEYE = 50;
export const SCORE_OUTER_BULL = 25;
export const SCORE_MISSED = 0;

// Define default values for match setup
export const DEFAULT_MATCH_SETTINGS: {
  CHECKOUT: Checkout;
  SCORE: number;
  STATUS: MatchStatus;
  LEGS: number;
  SETS: number;
} = {
  CHECKOUT: "Double",
  SCORE: 501,
  STATUS: "started",
  LEGS: 3,
  SETS: 1,
};

// Define the range of valid scores for a match
export const MATCH_SCORE = {
  MIN: 3,
  MAX: 901,
};

// The maximum limits for legs and sets in a match
export const LEGS = {
  MIN: 1,
  MAX: 99,
};
export const SETS = {
  MIN: 1,
  MAX: 49,
};

/**
 * Maximum number of notifications displayed at a time, other new notifications
 * will be added to queue.
 */
export const NOTIFICATION_LIMIT = 3;

/**
 * Constants related to the AppShell layout components.
 */
export const APP_SHELL = {
  ICON_SIZE: 24, // px
  HEADER_HEIGHT: 32, // px
  NAVBAR_WIDTH: 200, // px
};
