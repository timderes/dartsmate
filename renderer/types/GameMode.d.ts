declare type GameModeType = "MATCH" | "TRAINING";

declare type GameMode = {
  id: string;
  isActive?: boolean;
  setupRoute: string;
  text: string;
  title: string;
  type: GameModeType;
};

export default GameMode;
