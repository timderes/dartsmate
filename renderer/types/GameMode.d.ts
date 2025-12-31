export type GameModeType = "MATCH" | "TRAINING";

export type GameMode = {
  id: string;
  isActive?: boolean;
  setupRoute: string;
  text: string;
  title: string;
  type: GameModeType;
};
