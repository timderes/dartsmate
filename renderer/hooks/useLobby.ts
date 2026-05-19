import type { Profile } from "@/types/profile";
import { useListState } from "@mantine/hooks";

const useLobby = () => {
  const [availableProfiles, availableProfilesActions] = useListState<Profile>(
    [],
  );
  const [selectedProfiles, selectedProfilesActions] = useListState<Profile>([]);

  const addPlayer = (profile: Profile) => {
    selectedProfilesActions.append(profile);
  };

  const removePlayer = (uuid: Profile["uuid"]) => {
    selectedProfilesActions.setState(
      selectedProfiles.filter((p) => p.uuid !== uuid),
    );
  };

  const resetPlayers = () => {
    selectedProfilesActions.setState([]);
    availableProfilesActions.setState([]);
  };

  const setAvailableProfiles = (profiles: Profile[]) => {
    availableProfilesActions.setState(profiles);
  };

  return {
    availableProfiles,
    selectedProfiles,
    addPlayer,
    removePlayer,
    resetPlayers,
    setAvailableProfiles,
  };
};

export default useLobby;
