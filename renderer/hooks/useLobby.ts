import type { Profile } from "@/types/profile";
import { useListState } from "@mantine/hooks";

const useLobby = () => {
  const [available, availableActions] = useListState<Profile>([]);
  const [selected, selectedActions] = useListState<Profile>([]);

  const addPlayer = (p: Profile) => {
    if (selected.some((x) => x.uuid === p.uuid)) return;
    selectedActions.append(p);
  };

  const removePlayer = (uuid: Profile["uuid"]) => {
    selectedActions.setState(selected.filter((p) => p.uuid !== uuid));
  };

  const isSelected = (uuid: Profile["uuid"]) => {
    return selected.some((p) => p.uuid === uuid);
  };

  const initialize = (profiles: Profile[]) => {
    availableActions.setState(profiles);
    selectedActions.setState([]);
  };

  const isLobbyEmpty = selected.length === 0;

  return {
    availableProfiles: available,
    selectedProfiles: selected,
    isLobbyEmpty,

    addPlayer,
    removePlayer,
    isSelected,
    initialize,
  };
};

export default useLobby;
