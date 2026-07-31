import { useContext } from "react";
import LobbyContext from "@/contexts/LobbyContext";

const useLobby = () => {
  const context = useContext(LobbyContext);

  if (!context) {
    throw new Error("useLobby must be used within a LobbyProvider.");
  }

  return context;
};

export default useLobby;
