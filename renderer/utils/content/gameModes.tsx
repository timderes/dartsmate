import type GameMode from "types/GameMode";

// TODO: Routes are currently here hardcoded. They should match with the navbar routes
// @see utils/content/navbarRoutes.tsx

/**
 * List of all available game modes
 *
 * Use translation strings for `text` and `title`!
 */
const MODES: GameMode[] = [
  {
    id: "MATCH_501",
    text: "gameModes:match.text",
    title: "gameModes:match.title",
    type: "MATCH",
    isActive: true,
    setupRoute: "/lobby",
  },
  {
    id: "AROUND_THE_CLOCK",
    text: "gameModes:aroundTheClock.text",
    title: "gameModes:aroundTheClock.title",
    type: "TRAINING",
    isActive: false,
    setupRoute: "/practice/aroundTheClock",
  },
  {
    id: "BOBS_27",
    text: "gameModes:bobs27.text",
    title: "gameModes:bobs27.title",
    type: "TRAINING",
    isActive: false,
    setupRoute: "/practice/bobs27",
  },
  {
    id: "DOUBLES_TRAINING",
    text: "gameModes:doublesTraining.text",
    title: "gameModes:doublesTraining.title",
    type: "TRAINING",
    isActive: false,
    setupRoute: "/practice/doublesTraining",
  },
  {
    id: "SINGLES_TRAINING",
    text: "gameModes:singlesTraining.text",
    title: "gameModes:singlesTraining.title",
    type: "TRAINING",
    isActive: false,
    setupRoute: "/practice/singlesTraining",
  },
  {
    id: "SCORE_TRAINING",
    text: "gameModes:scoreTraining.text",
    title: "gameModes:scoreTraining.title",
    type: "TRAINING",
    isActive: false,
    setupRoute: "/practice/scoreTraining",
  },
  {
    id: "SHANGHAI",
    text: "gameModes:shanghai.text",
    title: "gameModes:shanghai.title",
    type: "TRAINING",
    isActive: false,
    setupRoute: "/practice/shanghai",
  },
];

export const MATCH_MODES = MODES.filter((mode) => mode.type === "MATCH");
export const TRAINING_MODES = MODES.filter((mode) => mode.type === "TRAINING");

export default MODES;
