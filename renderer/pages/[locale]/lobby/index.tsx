import { useEffect, type ReactNode } from "react";
import { useTranslation } from "next-i18next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import {
  ActionIcon,
  Button,
  Divider,
  Drawer,
  Grid,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
  rem,
} from "@mantine/core";
import type { Profile } from "types/profile";
import ProfileAvatar from "@components/content/ProfileAvatar";
import { useDisclosure, useListState, useSessionStorage } from "@mantine/hooks";
import {
  IconUserMinus,
  IconUserPlus,
  IconUserQuestion,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import type { Match } from "types/match";
import {
  APP_VERSION,
  DEFAULT_MATCH_SETTINGS,
  MATCH_SCORE,
} from "@utils/constants";
import { v4 as getUUID } from "uuid";
import getFormattedName from "@utils/misc/getFormattedName";
import EmptyState from "@components/content/EmptyState";
import getAllProfilesFromDatabase from "@lib/db/profiles/getAllProfiles";
import { notifications } from "@mantine/notifications";

const NewGamePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const [selectedProfiles, selectedProfilesActions] = useListState<Profile>([]);
  const [availableProfiles, availableProfilesActions] = useListState<Profile>(
    [],
  );

  const getAllProfiles = () =>
    getAllProfilesFromDatabase()
      .then((profiles) => {
        profiles.forEach((profile) => {
          availableProfilesActions.append(profile);
        });
      })
      .catch((e) => {
        notifications.show({
          title: "Error!",
          message: e as string,
        });
      });

  const [opened, { open, close }] = useDisclosure(false);

  const router = useRouter();

  useEffect(() => {
    // Reset profiles since they will refetch each render
    selectedProfilesActions.setState([]);
    availableProfilesActions.setState([]);

    void getAllProfiles();
  }, []);

  const uuid = getUUID();

  const [, setMatchStorage] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  const matchSettings = useForm<Match>({
    initialValues: {
      appVersion: APP_VERSION,
      createdAt: Date.now(),
      initialScore: DEFAULT_MATCH_SETTINGS.SCORE,
      matchCheckout: DEFAULT_MATCH_SETTINGS.CHECKOUT,
      matchStatus: DEFAULT_MATCH_SETTINGS.STATUS,
      uuid: uuid,
      players: [],
      updatedAt: Date.now(),
      legs: 3,
      sets: 1,
    },
  });

  const handleRemovePlayer = (uuid: Profile["uuid"]): void => {
    const updatedProfiles = selectedProfiles.filter(
      (profile) => profile.uuid !== uuid,
    );
    selectedProfilesActions.setState(updatedProfiles);

    matchSettings.setValues({
      players: updatedProfiles.map((profile) => ({
        ...profile,
        scoreLeft: -1,
        isWinner: false,
        rounds: [],
        legsWon: 0,
        setsWon: 0,
      })),
    });
  };

  const handleAddPlayer = (profile: Profile): void => {
    selectedProfilesActions.append(profile);
    const updatedProfiles = [...selectedProfiles, profile];

    matchSettings.setValues({
      players: updatedProfiles.map((profile) => ({
        ...profile,
        scoreLeft: -1,
        isWinner: false,
        rounds: [],
        legsWon: 0,
        setsWon: 0,
      })),
    });
  };

  const handleStartMatch = (): void => {
    if (!matchSettings.isValid()) return;

    setMatchStorage(matchSettings.values);
    void router.push(`/${locale}/match/playing`);
  };

  const renderPlayer = (profile: Profile): ReactNode => {
    return (
      <Group justify="space-between">
        <Group>
          <ProfileAvatar
            profile={profile}
            src={profile.avatarImage}
            size="lg"
          />
          <Text>
            {getFormattedName(profile.name)}{" "}
            <Text component="span" c="dimmed" display="block" size="xs">
              {profile.username}
            </Text>
          </Text>
        </Group>
        {selectedProfiles.includes(profile) ? (
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

  return (
    <DefaultLayout withNavbarOpen={false}>
      <Drawer opened={opened} onClose={close} title={t("lobby:addPlayer")}>
        <ScrollArea pr="xl" h="auto">
          <Stack>
            <Button
              onClick={() =>
                void router.push({
                  pathname: `/${locale}/profile/create`,
                  query: { isGuest: true },
                })
              }
            >
              {t("lobby:createGuestPlayer")}
            </Button>
            {availableProfiles.map((guestPlayer) => {
              if (selectedProfiles.includes(guestPlayer)) return;

              return (
                <div key={guestPlayer.uuid}>{renderPlayer(guestPlayer)}</div>
              );
            })}
          </Stack>
        </ScrollArea>
      </Drawer>
      <Grid gutter={0}>
        <Grid.Col span="auto" px="xs">
          <Stack gap="lg">
            <Group>
              <Title>{t("lobby:title.players")}</Title>
              <Button ml="auto" size="xs" onClick={open}>
                {t("lobby:addPlayer")}
              </Button>
            </Group>
            {selectedProfiles.map((player) => (
              <div key={player.uuid}>{renderPlayer(player)}</div>
            ))}
            {selectedProfiles.length === 0 ? (
              <EmptyState
                icon={<IconUserQuestion size={64} opacity={0.6} />}
                title={t("lobby:emptyLobbyState.title")}
                text={t("lobby:emptyLobbyState.text")}
              />
            ) : undefined}
          </Stack>
        </Grid.Col>
        <Grid.Col span={4} px="xs" h="100%">
          <Stack gap="xs">
            <Title>{t("lobby:title.matchSettings")}</Title>
            <NumberInput
              label={t("lobby:score")}
              min={MATCH_SCORE.MIN}
              max={MATCH_SCORE.MAX}
              {...matchSettings.getInputProps("initialScore")}
            />
            <Group grow>
              <NumberInput
                // `count = 2` to force pluralization
                label={t("set", { count: 2 })}
                min={1}
                {...matchSettings.getInputProps("sets")}
              />
              <NumberInput
                label={t("leg", { count: 2 })}
                min={1}
                {...matchSettings.getInputProps("legs")}
              />
            </Group>
            <Select
              label={t("lobby:checkout")}
              {...matchSettings.getInputProps("matchCheckout")}
              defaultValue={matchSettings.values.matchCheckout}
              data={["Any", "Single", "Double", "Triple"]}
            />
            <Divider />
            <Button
              disabled={selectedProfiles.length === 0}
              onClick={() => handleStartMatch()}
              mt="auto"
            >
              {t("lobby:startMatch")}
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    </DefaultLayout>
  );
};

export default NewGamePage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
