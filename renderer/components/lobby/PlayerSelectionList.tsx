import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUserMinus,
  IconUserPlus,
  IconUserQuestion,
} from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { Profile } from "types/profile";
import ProfileAvatar from "@components/content/ProfileAvatar";
import getFormattedName from "@utils/misc/getFormattedName";
import EmptyState from "@components/content/EmptyState";

type PlayerSelectionListProps = {
  selectedProfiles: Profile[];
  availableProfiles: Profile[];
  onAdd: (profile: Profile) => void;
  onRemove: (uuid: string) => void;
  onCreateGuest: () => void;
};

export const PlayerSelectionList = ({
  selectedProfiles,
  availableProfiles,
  onAdd,
  onRemove,
  onCreateGuest,
}: PlayerSelectionListProps) => {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);

  const renderPlayer = (profile: Profile, isSelected: boolean) => (
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
      {isSelected ? (
        <Tooltip
          label={t("lobby:removePlayerFromLobby", {
            PLAYER_NAME: profile.username,
          })}
          withArrow
        >
          <ActionIcon onClick={() => onRemove(profile.uuid)} variant="default">
            <IconUserMinus style={{ height: rem(18), width: rem(18) }} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Tooltip
          label={t("lobby:addPlayerToLobby", {
            PLAYER_NAME: profile.username,
          })}
          withArrow
        >
          <ActionIcon onClick={() => onAdd(profile)} variant="default">
            <IconUserPlus style={{ height: rem(18), width: rem(18) }} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );

  return (
    <>
      <Drawer opened={opened} onClose={close} title={t("lobby:addPlayer")}>
        <ScrollArea pr="xl" h="auto">
          <Stack>
            <Button onClick={onCreateGuest}>
              {t("lobby:createGuestPlayer")}
            </Button>
            {availableProfiles.map((guestPlayer) => {
              if (selectedProfiles.some((p) => p.uuid === guestPlayer.uuid))
                return null;
              return (
                <div key={guestPlayer.uuid}>
                  {renderPlayer(guestPlayer, false)}
                </div>
              );
            })}
          </Stack>
        </ScrollArea>
      </Drawer>

      <Stack gap="lg">
        <Group>
          <Title order={3}>{t("lobby:title.players")}</Title>
          <Button ml="auto" size="xs" onClick={open}>
            {t("lobby:addPlayer")}
          </Button>
        </Group>

        {selectedProfiles.map((player) => (
          <div key={player.uuid}>{renderPlayer(player, true)}</div>
        ))}

        {selectedProfiles.length === 0 && (
          <EmptyState
            icon={<IconUserQuestion size={64} opacity={0.6} />}
            title={t("lobby:emptyLobbyState.title")}
            text={t("lobby:emptyLobbyState.text")}
          />
        )}
      </Stack>
    </>
  );
};
