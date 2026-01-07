import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import Peer, { MediaConnection, DataConnection } from "peerjs";
import { GameAction } from "types/GameState";

type MultiplayerContextType = {
  isHost: boolean;
  roomId: string | null;
  hostGame: () => Promise<string>;
  joinGame: (roomId: string) => Promise<void>;
  leaveGame: () => void;
  broadcastAction: (action: GameAction) => void;
  lastReceivedAction: GameAction | null;
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
  
  const [myStream, setMyStreamState] = useState<MediaStream | null>(null);
  const [peerStreams, setPeerStreams] = useState<Record<string, MediaStream>>(
    {},
  );

  const peerRef = useRef<Peer | null>(null);
  const peersRef = useRef<DataConnection[]>([]);

  // Keep refs synced for callbacks
  useEffect(() => {
    peersRef.current = peers;
  }, [peers]);

  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  // Host Logic: Broadcast Lobby Updates
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

  // Guest Logic: Mesh Networking (Connect to other guests)
  useEffect(() => {
    if (!isHost && peer && connectedGuestIds.length > 0) {
        connectedGuestIds.forEach(guestId => {
            // If it's not me, and I'm not already connected, connect!
            const isAlreadyConnected = peers.some(p => p.peer === guestId);
            if (guestId !== peer.id && !isAlreadyConnected) {
                connectToPeer(guestId);
            }
        });
    }
  }, [connectedGuestIds, isHost, peer, peers, connectToPeer]);


  const setMyStream = (stream: MediaStream) => {
    setMyStreamState(stream);
    
    // Initiate calls to all currently connected peers
    peers.forEach((conn) => {
      if (peer && conn.open) {
        const call = peer.call(conn.peer, stream);
        call.on('stream', (remoteStream) => {
           setPeerStreams((prev) => ({
             ...prev,
             [call.peer]: remoteStream
           }));
        });
      }
    });
  };

  const handleData = useCallback((data: unknown) => {
    const payload = data as DataPayload;
    if (payload?.type === "GAME_ACTION") {
      setLastReceivedAction(payload.payload as GameAction);
    }
    if (payload?.type === "LOBBY_UPDATE") {
      setConnectedGuestIds(payload.payload as string[]);
    }
  }, []);

  const handleIncomingCall = useCallback((call: MediaConnection) => {
     call.answer(myStream ?? undefined);
     call.on('stream', (remoteStream) => {
         setPeerStreams((prev) => ({
             ...prev,
             [call.peer]: remoteStream
         }));
     });
  }, [myStream]);

  const connectToPeer = useCallback((remotePeerId: string) => {
      if (!peerRef.current) return;
      
      const conn = peerRef.current.connect(remotePeerId);
      
      conn.on('open', () => {
          setPeers((prev) => [...prev, conn]);
          
          // If we have a stream, call them
          if (myStream) {
              const call = peerRef.current!.call(remotePeerId, myStream);
              call.on('stream', (remoteStream) => {
                setPeerStreams((prev) => ({
                    ...prev,
                    [call.peer]: remoteStream
                }));
              });
          }
      });

      conn.on('data', handleData);
      
      conn.on('close', () => {
          setPeers((prev) => prev.filter(p => p.peer !== remotePeerId));
          setPeerStreams((prev) => {
              const newState = { ...prev };
              delete newState[remotePeerId];
              return newState;
          });
      });
  }, [myStream, handleData]);

  // Global Peer Event Listeners (Host & Guest)
  useEffect(() => {
    if (!peer) return;

    const handleConnection = (conn: DataConnection) => {
        conn.on('open', () => {
            setPeers((prev) => [...prev, conn]);
            
            // If we have a stream, call the new peer immediately
             if (myStream) {
              const call = peer.call(conn.peer, myStream);
              call.on('stream', (remoteStream) => {
                setPeerStreams((prev) => ({
                    ...prev,
                    [call.peer]: remoteStream
                }));
              });
            }
        });

        conn.on('close', () => {
           setPeers((prev) => prev.filter((p) => p.peer !== conn.peer));
           setPeerStreams((prev) => {
               const newState = { ...prev };
               delete newState[conn.peer];
               return newState;
           });
        });

        conn.on('data', (data: unknown) => {
            handleData(data);
            
            // If I am Host, I might need to relay this to others (Star topology for game state)
            // But for Mesh Video, direct connections handle themselves.
            const payload = data as DataPayload;
            if (isHost && payload?.type === 'GAME_ACTION') {
                 // Optional: Re-broadcast to ensure consistency if we don't trust Mesh propagation
                 // For now, let's assume clients broadcast to everyone in their list
            }
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
  }, [peer, handleIncomingCall, handleData, myStream, isHost]);

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

  const joinGame = useCallback((hostId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          const newPeer = new Peer();
          
          newPeer.on("open", () => {
              setPeer(newPeer);
              setIsHost(false);
              setRoomId(hostId);
              
              // Initial connection to Host
              // The Global Listener will handle the 'open' event and state update
              const conn = newPeer.connect(hostId);
              conn.on('open', () => {
                  setPeers(prev => [...prev, conn]);
                  conn.on('data', handleData);
              });
              
              resolve();
          });

          newPeer.on("error", (err) => reject(err));
      });
  }, [handleData]);

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
    // Send to all connected peers
    peersRef.current.forEach(conn => {
        if (conn.open) {
            void conn.send({ type: "GAME_ACTION", payload: action });
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
        lastReceivedAction,
        peers,
        connectedGuestIds,
        myStream,
        peerStreams,
        setMyStream
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
