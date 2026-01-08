import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useListState } from '@mantine/hooks';
import { Profile } from 'types/profile';
import { Match } from 'types/match';
import { GameAction } from 'types/GameState';
import { APP_VERSION, DEFAULT_MATCH_SETTINGS } from '@utils/constants';
import { v4 as getUUID } from 'uuid';
import { notifications } from "@mantine/notifications";

export type UseMultiplayerLobbyProps = {
  isHost: boolean;
  broadcastAction: (action: GameAction) => void;
  broadcastSettings: (settings: Match) => void;
  lastReceivedAction: GameAction | null;
  lastReceivedSettings: Match | null;
};

export const useMultiplayerLobby = ({
  isHost,
  broadcastAction,
  broadcastSettings,
  lastReceivedAction,
  lastReceivedSettings,
}: UseMultiplayerLobbyProps) => {
  const [view, setView] = useState<"landing" | "host-lobby" | "guest-lobby">("landing");
  
  // Profile State
  const [selectedProfiles, selectedProfilesActions] = useListState<Profile>([]);
  const [guestMyProfile, setGuestMyProfile] = useState<Profile | null>(null);

  // Match Settings Form
  const matchSettings = useForm<Match>({
    initialValues: {
      appVersion: APP_VERSION,
      createdAt: Date.now(),
      initialScore: DEFAULT_MATCH_SETTINGS.SCORE,
      matchCheckout: DEFAULT_MATCH_SETTINGS.CHECKOUT,
      matchStatus: DEFAULT_MATCH_SETTINGS.STATUS,
      matchMode: "online",
      verificationMode: "social",
      uuid: getUUID(),
      players: [],
      updatedAt: Date.now(),
      legs: DEFAULT_MATCH_SETTINGS.LEGS,
      sets: DEFAULT_MATCH_SETTINGS.SETS,
    },
  });

  // --- Host Logic ---

  // Sync Settings changes to Guests (Host Side)
  useEffect(() => {
    if (isHost && view === "host-lobby") {
       // We include the players list in the settings broadcast. 
       // We must map Profile[] to Player[] to satisfy Match type.
       const payload: Match = { 
         ...matchSettings.values, 
         players: selectedProfiles.map(p => ({
           ...p,
           scoreLeft: -1,
           isWinner: false,
           rounds: [],
           legsWon: 0,
           setsWon: 0
         })) 
       }; 
       broadcastSettings(payload);
    }
  }, [JSON.stringify(matchSettings.values), selectedProfiles, isHost, view, broadcastSettings]);

  // Handle Guest Ready (Host Side)
  useEffect(() => {
    if (isHost && lastReceivedAction?.type === "PLAYER_READY") {
      const newProfile = lastReceivedAction.payload;
      // Avoid duplicates
      if (!selectedProfiles.some(p => p.uuid === newProfile.uuid)) {
         selectedProfilesActions.append(newProfile);
         notifications.show({ title: "Player Joined", message: `${newProfile.username} is ready!`, color: "blue" });
      }
    }
  }, [lastReceivedAction, isHost, selectedProfiles, selectedProfilesActions]);

  // --- Guest Logic ---

  // Sync Settings from Host (Guest Side)
  useEffect(() => {
    if (!isHost && lastReceivedSettings) {
      matchSettings.setValues(lastReceivedSettings);
      
      // Update players list if provided
      if (lastReceivedSettings.players) {
        const profiles = lastReceivedSettings.players as Profile[];
        selectedProfilesActions.setState(profiles);
      }
    }
  }, [lastReceivedSettings, isHost, selectedProfilesActions]);

  // Guest Helper
  const handleGuestReady = (profile: Profile) => {
    setGuestMyProfile(profile);
    broadcastAction({ type: "PLAYER_READY", payload: profile });
  };

  return {
    view,
    setView,
    selectedProfiles,
    selectedProfilesActions,
    guestMyProfile,
    setGuestMyProfile,
    matchSettings,
    handleGuestReady
  };
};
