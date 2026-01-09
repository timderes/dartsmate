import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import Peer, { MediaConnection, DataConnection } from "peerjs";
import { GameAction } from "types/GameState";
import { Match } from "types/match";

type MultiplayerContextType = {
  isHost: boolean;
  roomId: string | null;
  hostGame: () => Promise<string>;
  joinGame: (roomId: string) => Promise<void>;
  leaveGame: () => void;
  broadcastAction: (action: GameAction) => void;
  broadcastSettings: (settings: Match) => void;
  lastReceivedAction: GameAction | null;
  lastReceivedSettings: Match | null;
  peers: DataConnection[];
  connectedGuestIds: string[];
  myStream: MediaStream | null;
  peerStreams: Record<string, MediaStream>; // Keyed by Peer ID (which we'll need to map to Player UUID later)
  setMyStream: (stream: MediaStream) => void;
};

type DataPayload = {
  type: string;
  payload?: unknown;
};

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(
  undefined,
);

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peers, setPeers] = useState<DataConnection[]>([]);
  const [connectedGuestIds, setConnectedGuestIds] = useState<string[]>([]);
  const [lastReceivedAction, setLastReceivedAction] =
    useState<GameAction | null>(null);
  const [lastReceivedSettings, setLastReceivedSettings] =
    useState<Match | null>(null);

  const [myStream, setMyStreamState] = useState<MediaStream | null>(null);
  const [peerStreams, setPeerStreams] = useState<Record<string, MediaStream>>(
    {},
  );

  const peerRef = useRef<Peer | null>(null);
  const peersRef = useRef<DataConnection[]>([]);

  // 1. Core Helpers (Defined first to avoid hoisting issues)
  const handleData = useCallback((data: unknown) => {
    const payload = data as DataPayload;
    if (payload?.type === "GAME_ACTION") {
      setLastReceivedAction(payload.payload as GameAction);
    }
    if (payload?.type === "LOBBY_UPDATE") {
      setConnectedGuestIds(payload.payload as string[]);
    }
    if (payload?.type === "SETTINGS_UPDATE") {
      setLastReceivedSettings(payload.payload as Match);
    }
  }, []);

  const handleIncomingCall = useCallback(
    (call: MediaConnection) => {
      call.answer(myStream ?? undefined);
      call.on("stream", (remoteStream) => {
        setPeerStreams((prev) => ({
          ...prev,
          [call.peer]: remoteStream,
        }));
      });
    },
    [myStream],
  );

  const connectToPeer = useCallback(
    (remotePeerId: string) => {
      if (!peerRef.current) return;

      const conn = peerRef.current.connect(remotePeerId);

      conn.on("open", () => {
        setPeers((prev) => [...prev, conn]);

        // If we have a stream, call them
        if (myStream) {
          const call = peerRef.current!.call(remotePeerId, myStream);
          call.on("stream", (remoteStream) => {
            setPeerStreams((prev) => ({
              ...prev,
              [call.peer]: remoteStream,
            }));
          });
        }
      });

      conn.on("data", handleData);

      conn.on("close", () => {
        setPeers((prev) => prev.filter((p) => p.peer !== remotePeerId));
        setPeerStreams((prev) => {
          const newState = { ...prev };
          delete newState[remotePeerId];
          return newState;
        });
      });
    },
    [myStream, handleData],
  );

  // 2. Lifecycle Syncs
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  // 3. Host Logic: Broadcast Lobby Updates
  useEffect(() => {
    if (isHost) {
      const activePeers = peers.filter((p) => p.open);
      const guestIds = activePeers.map((p) => p.peer);

      setConnectedGuestIds(guestIds);

      activePeers.forEach((conn) => {
        void conn.send({ type: "LOBBY_UPDATE", payload: guestIds });
      });
    }
  }, [peers, isHost]);

  // 4. Guest Logic: Mesh Networking (Connect to other guests)
  useEffect(() => {
    if (!isHost && peer && connectedGuestIds.length > 0) {
      connectedGuestIds.forEach((guestId) => {
        const isAlreadyConnected = peers.some((p) => p.peer === guestId);
        if (guestId !== peer.id && !isAlreadyConnected) {
          connectToPeer(guestId);
        }
      });
    }
  }, [connectedGuestIds, isHost, peer, peers, connectToPeer]);

  // 5. Global Peer Event Listeners (Host & Guest)
  useEffect(() => {
    if (!peer) return;

    const handleConnection = (conn: DataConnection) => {
      conn.on("open", () => {
        setPeers((prev) => [...prev, conn]);

        if (myStream) {
          const call = peer.call(conn.peer, myStream);
          call.on("stream", (remoteStream) => {
            setPeerStreams((prev) => ({
              ...prev,
              [call.peer]: remoteStream,
            }));
          });
        }
      });

      conn.on("close", () => {
        setPeers((prev) => prev.filter((p) => p.peer !== conn.peer));
        setPeerStreams((prev) => {
          const newState = { ...prev };
          delete newState[conn.peer];
          return newState;
        });
      });

      conn.on("data", (data: unknown) => {
        handleData(data);
      });
    };

    peer.on("connection", handleConnection);
    peer.on("call", handleIncomingCall);
    peer.on("error", (err) => console.error("Peer error:", err));

    return () => {
      peer.off("connection", handleConnection);
      peer.off("call", handleIncomingCall);
      peer.off("error");
    };
  }, [peer, handleIncomingCall, handleData, myStream]);

  // 6. Action Methods
  const setMyStream = (stream: MediaStream) => {
    setMyStreamState(stream);
    peers.forEach((conn) => {
      if (peer && conn.open) {
        const call = peer.call(conn.peer, stream);
        call.on("stream", (remoteStream) => {
          setPeerStreams((prev) => ({
            ...prev,
            [call.peer]: remoteStream,
          }));
        });
      }
    });
  };

  const hostGame = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const newPeer = new Peer();
      newPeer.on("open", (id) => {
        setPeer(newPeer);
        setIsHost(true);
        setRoomId(id);
        resolve(id);
      });
      newPeer.on("error", (err) => reject(err));
    });
  }, []);

  const joinGame = useCallback(
    (hostId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const newPeer = new Peer();

        const timeout = setTimeout(() => {
          newPeer.destroy();
          reject(new Error("Connection timed out. Lobby not found or host is offline."));
        }, 5000);

        newPeer.on("open", () => {
          const conn = newPeer.connect(hostId);

          conn.on("open", () => {
            clearTimeout(timeout);
            setPeer(newPeer);
            setIsHost(false);
            setRoomId(hostId);

            setPeers((prev) => [...prev, conn]);
            conn.on("data", handleData);
            resolve();
          });

          conn.on("error", (err) => {
            clearTimeout(timeout);
            newPeer.destroy();
            reject(err);
          });
        });

        newPeer.on("error", (err) => {
          clearTimeout(timeout);
          newPeer.destroy();
          // PeerJS specific error for missing peer
          if (err.type === "peer-unavailable") {
            reject(new Error("Lobby not found. Please check the Room ID."));
          } else {
            reject(err);
          }
        });
      });
    },
    [handleData],
  );

  const leaveGame = useCallback(() => {
    peerRef.current?.destroy();
    setPeer(null);
    setIsHost(false);
    setRoomId(null);
    setPeers([]);
    setConnectedGuestIds([]);
    setPeerStreams({});
  }, []);

  const broadcastAction = useCallback((action: GameAction) => {
    peersRef.current.forEach((conn) => {
      if (conn.open) {
        void conn.send({ type: "GAME_ACTION", payload: action });
      }
    });
  }, []);

  const broadcastSettings = useCallback((settings: Match) => {
    peersRef.current.forEach((conn) => {
      if (conn.open) {
        void conn.send({ type: "SETTINGS_UPDATE", payload: settings });
      }
    });
  }, []);

  return (
    <MultiplayerContext.Provider
      value={{
        isHost,
        roomId,
        hostGame,
        joinGame,
        leaveGame,
        broadcastAction,
        broadcastSettings,
        lastReceivedAction,
        lastReceivedSettings,
        peers,
        connectedGuestIds,
        myStream,
        peerStreams,
        setMyStream,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  }
  return context;
};
