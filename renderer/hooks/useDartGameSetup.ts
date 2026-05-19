import { useEffect, useMemo } from "react";
import { useForm } from "@mantine/form";
import { useListState, useSessionStorage } from "@mantine/hooks";
import { v4 as uuidv4 } from "uuid";

import type { Profile } from "@/types/profile";
import type { Match, Player } from "@/types/match";

import { APP_VERSION, DEFAULT_MATCH_SETTINGS } from "@/utils/constants";

/**
 * Converts a profile into a match player.
 */
const toMatchPlayer = (profile: Profile): Player => ({
  ...profile,
  scoreLeft: -1, // `-1` indicates that the player hasn't started scoring yet
  isWinner: false,
  rounds: [],
  legsWon: 0,
  setsWon: 0,
});

const useDartGameSetup = () => {
  //
  // Lobby state and actions (Player selection)
  //

  const [availableProfiles, availableActions] = useListState<Profile>([]);
  const [selectedProfiles, selectedActions] = useListState<Profile>([]);

  // Fast lookup for selected players
  const selectedIds = useMemo(
    () => new Set(selectedProfiles.map((p) => p.uuid)),
    [selectedProfiles],
  );

  const isSelected = (uuid: string) => selectedIds.has(uuid);

  const availableToSelect = useMemo(() => {
    return availableProfiles.filter((p) => !selectedIds.has(p.uuid));
  }, [availableProfiles, selectedIds]);

  /**
   * Adds a player to the selected list if they are not already selected.
   * Identifies players by their UUID.
   */
  const addPlayer = (profile: Profile) => {
    if (selectedIds.has(profile.uuid)) return;

    selectedActions.append(profile);
  };

  /**
   * Remove a player from the selected list by their UUID
   */
  const removePlayer = (uuid: string) => {
    selectedActions.setState(selectedProfiles.filter((p) => p.uuid !== uuid));
  };

  /**
   * Sets the list of available profiles and clears any selected profiles.
   */
  const initializeProfiles = (profiles: Profile[]) => {
    availableActions.setState(profiles);
    selectedActions.setState([]);
  };

  //
  // Match state and settings
  //

  const [, setMatchStorage] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  const matchForm = useForm<Match>({
    initialValues: {
      appVersion: APP_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      uuid: uuidv4(),
      players: [],
      initialScore: DEFAULT_MATCH_SETTINGS.SCORE,
      matchCheckout: DEFAULT_MATCH_SETTINGS.CHECKOUT,
      matchStatus: DEFAULT_MATCH_SETTINGS.STATUS,
      legs: DEFAULT_MATCH_SETTINGS.LEGS,
      sets: DEFAULT_MATCH_SETTINGS.SETS,
    },
  });

  /**
   * Automatically keep match players in sync
   */
  useEffect(() => {
    matchForm.setFieldValue("players", selectedProfiles.map(toMatchPlayer));
  }, [selectedProfiles]);

  /**
   * Save current match setup to session storage
   */
  const saveMatchToSessionStorage = () => {
    setMatchStorage(matchForm.values);
  };

  /**
   * Reset the entire game setup, including selected players and match settings,
   * to their initial states.
   */
  const reset = () => {
    availableActions.setState([]);
    selectedActions.setState([]);
    matchForm.reset();
  };

  return {
    //
    // Lobby
    //
    availableProfiles,
    availableToSelect,
    selectedProfiles,
    addPlayer,
    removePlayer,
    initializeProfiles,
    isSelected,
    //
    // Match
    //
    match: matchForm.values,
    matchForm,
    isMatchValid: matchForm.isValid(),
    saveMatchToSessionStorage,
    reset,
  };
};

export default useDartGameSetup;
