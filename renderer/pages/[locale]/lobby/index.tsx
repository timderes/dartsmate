import { useEffect, useReducer, type ReactNode } from "react";
import { useTranslation } from "next-i18next/pages";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import DefaultLayout from "@/components/layouts/Default";
import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Flex,
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
import type { Profile } from "@/types/profile";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import { useDisclosure, useListState } from "@mantine/hooks";
import {
  IconHelpCircleFilled,
  IconUserMinus,
  IconUserPlus,
  IconUserQuestion,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import type { Match } from "@/types/match";
import { LEGS, MATCH_SCORE, SETS } from "@/utils/constants";
import getFormattedName from "@/utils/misc/getFormattedName";
import EmptyState from "@/components/content/EmptyState";
import getAllProfilesFromDatabase from "@/lib/db/profiles/getAllProfiles";
import { notifications } from "@mantine/notifications";
import createInitialLobbyState from "@/lib/lobby/createInitialLobbyState";
import lobbyReducer from "@/lib/lobby/reducer";
import { useForm } from "@mantine/form";

const NewGamePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const [availableProfiles, availableProfilesActions] = useListState<Profile>(
    [],
  );

  const [lobbyState, dispatch] = useReducer(
    lobbyReducer,
    createInitialLobbyState(),
  );

  const matchSettings = useForm<Match>({
    initialValues: createInitialLobbyState(),

    onValuesChange: (values) => {
      dispatch({
        type: "UPDATE_MATCH_SETTINGS",
        payload: values,
      });
    },
  });

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
    // TODO: Add here : dispatch({ type: "RESET_PLAYERS" });
    availableProfilesActions.setState([]);

    void getAllProfiles();
  }, []);

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

  const handleStartMatch = (): void => {
    const startWithBullOff = lobbyState.startWithBullOff;

    if (startWithBullOff) {
      void router.push(`/${locale}/match/bullOff`);
      return;
    }

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
        {lobbyState.players.some((p) => p.uuid === profile.uuid) ? (
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
              if (lobbyState.players.some((p) => p.uuid === guestPlayer.uuid))
                return;

              return (
                <div key={guestPlayer.uuid}>{renderPlayer(guestPlayer)}</div>
              );
            })}
          </Stack>
        </ScrollArea>
      </Drawer>
      <Grid gap={0}>
        <Grid.Col span="auto" px="xs">
          <Stack gap="lg">
            <Group>
              <Title>{t("lobby:title.players")}</Title>
              <Button ml="auto" size="xs" onClick={open}>
                {t("lobby:addPlayer")}
              </Button>
            </Group>
            {lobbyState.players.map((player) => (
              <div key={player.uuid}>{renderPlayer(player)}</div>
            ))}
            {lobbyState.players.length === 0 ? (
              <EmptyState
                icon={<IconUserQuestion size={64} opacity={0.6} />}
                title={t("lobby:emptyLobbyState.title")}
                text={t("lobby:emptyLobbyState.text")}
              />
            ) : undefined}
          </Stack>
        </Grid.Col>
        <Grid.Col span={4} px="xs" h="100%">
          <Stack gap="md">
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
                label={
                  <Flex align="center" gap="xs">
                    <span>{t("set", { count: 2 })}</span>
                    <Tooltip label={t("lobby:setsHelpTooltip")} withArrow>
                      <IconHelpCircleFilled
                        size={20}
                        style={{
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Flex>
                }
                min={SETS.MIN}
                max={SETS.MAX}
                {...matchSettings.getInputProps("sets")}
              />
              <NumberInput
                label={
                  <Flex align="center" gap="xs">
                    <span>{t("leg", { count: 2 })}</span>
                    <Tooltip label={t("lobby:legsHelpTooltip")} withArrow>
                      <IconHelpCircleFilled
                        size={20}
                        style={{
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Flex>
                }
                min={LEGS.MIN}
                max={LEGS.MAX}
                {...matchSettings.getInputProps("legs")}
              />
            </Group>
            <Select
              label={t("lobby:checkout")}
              {...matchSettings.getInputProps("matchCheckout")}
              defaultValue={matchSettings.values.matchCheckout}
              data={[
                {
                  label: t("checkouts.any"),
                  value: "Any",
                },
                {
                  label: t("checkouts.single"),
                  value: "Single",
                },
                {
                  label: t("checkouts.double"),
                  value: "Double",
                },
                {
                  label: t("checkouts.triple"),
                  value: "Triple",
                },
              ]}
            />
            <Checkbox
              label={t("lobby:startWithBullOff")}
              {...matchSettings.getInputProps("startWithBullOff", {
                type: "checkbox",
              })}
            />
            <Divider />
            <Button
              disabled={lobbyState.players.length === 0}
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
