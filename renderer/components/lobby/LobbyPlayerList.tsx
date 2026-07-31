import useLobby from "@/hooks/useLobby";
import {
  Button,
  Drawer,
  EmptyState,
  Group,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import LobbyPlayerEntry from "./LobbyPlayerEntry";
import { IconUserQuestion } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import useGetAllProfiles from "@/hooks/getAllProfiles";

const LobbyPlayerList = (): React.JSX.Element => {
  const { t } = useTranslation(["common"]);
  const { state: lobbyState } = useLobby();
  const [opened, { open, close }] = useDisclosure(false);

  const profiles = useGetAllProfiles();

  const availableProfiles =
    profiles?.filter(
      (profile) =>
        !lobbyState.players.some((player) => player.uuid === profile.uuid),
    ) ?? [];

  return (
    <>
      <Drawer opened={opened} onClose={close} title={t("lobby:addPlayer")}>
        <ScrollArea pr="xl" h="auto">
          <Stack>
            <Button
              onClick={() => console.info("Create guest player button clicked")}
            >
              {t("lobby:createGuestPlayer")}
            </Button>
            {availableProfiles?.map((guestPlayer) => {
              if (lobbyState.players.some((p) => p.uuid === guestPlayer.uuid))
                return;

              return (
                <div key={guestPlayer.uuid}>
                  <LobbyPlayerEntry profile={guestPlayer} />
                </div>
              );
            })}
          </Stack>
        </ScrollArea>
      </Drawer>

      <Stack gap="lg">
        <Group>
          <Title>{t("lobby:title.players")}</Title>
          <Button ml="auto" size="xs" onClick={open}>
            {t("lobby:addPlayer")}
          </Button>
        </Group>
        {lobbyState.players.map((player) => (
          <div key={player.uuid}>
            <LobbyPlayerEntry profile={player} />
          </div>
        ))}
        {lobbyState.players.length === 0 ? (
          <EmptyState
            icon={<IconUserQuestion size={64} opacity={0.6} />}
            title={t("lobby:emptyLobbyState.title")}
            description={t("lobby:emptyLobbyState.text")}
          />
        ) : undefined}
      </Stack>
    </>
  );
};

export default LobbyPlayerList;
