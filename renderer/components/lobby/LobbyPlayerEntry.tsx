import { ActionIcon, Group, rem, Text, Tooltip } from "@mantine/core";
import { IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import type { Profile } from "@/types/profile";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import getFormattedName from "@/utils/misc/getFormattedName";
import useLobby from "@/hooks/useLobby";
import { useTranslation } from "next-i18next/pages";

const LobbyPlayerEntry = ({
  profile,
}: {
  profile: Profile;
}): React.JSX.Element => {
  const { t } = useTranslation(["common"]);
  const { state, dispatch } = useLobby();

  const handleRemovePlayer = (uuid: Profile["uuid"]): void => {
    dispatch({ type: "REMOVE_PLAYER", payload: { playerUUID: uuid } });
  };

  const handleAddPlayer = (profile: Profile): void => {
    dispatch({
      type: "ADD_PLAYER",
      payload: {
        player: profile,
      },
    });
  };

  return (
    <Group justify="space-between">
      <Group>
        <ProfileAvatar profile={profile} src={profile.avatarImage} size="lg" />
        <Text>
          {getFormattedName(profile.name)}{" "}
          <Text component="span" c="dimmed" display="block" size="xs">
            {profile.username}
          </Text>
        </Text>
      </Group>
      {state.players.some((p) => p.uuid === profile.uuid) ? (
        <Tooltip
          label={t("lobby:removePlayerFromLobby", {
            PLAYER_NAME: profile.username,
          })}
          withArrow
        >
          <ActionIcon
            onClick={() => handleRemovePlayer(profile.uuid)}
            disabled={false}
            variant="default"
          >
            <IconUserMinus
              style={{
                height: rem(18),
                width: rem(18),
              }}
            />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Tooltip
          label={t("lobby:addPlayerToLobby", {
            PLAYER_NAME: profile.username,
          })}
          withArrow
        >
          <ActionIcon
            onClick={() => handleAddPlayer(profile)}
            disabled={false}
            variant="default"
          >
            <IconUserPlus
              style={{
                height: rem(18),
                width: rem(18),
              }}
            />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
};

export default LobbyPlayerEntry;
