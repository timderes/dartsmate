import { useReducer } from "react";
import LobbyContext from "@/contexts/LobbyContext";
import lobbyReducer from "@/lib/lobby/reducer";
import createInitialLobbyState from "@/lib/lobby/createInitialLobbyState";

type LobbyProviderProps = React.PropsWithChildren;

const LobbyProvider = ({ children }: LobbyProviderProps) => {
  const [state, dispatch] = useReducer(
    lobbyReducer,
    undefined,
    createInitialLobbyState,
  );

  return (
    <LobbyContext.Provider value={{ state, dispatch }}>
      {children}
    </LobbyContext.Provider>
  );
};

export default LobbyProvider;
