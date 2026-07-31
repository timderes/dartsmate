import { createContext } from "react";
import type { Dispatch } from "react";
import type { LobbyAction } from "@/lib/lobby/actions";
import type { LobbyState } from "@/lib/lobby/reducer";

export type LobbyContextValue = {
  state: LobbyState;
  dispatch: Dispatch<LobbyAction>;
};

const LobbyContext = createContext<LobbyContextValue | null>(null);

export default LobbyContext;
