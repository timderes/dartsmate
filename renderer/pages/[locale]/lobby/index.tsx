import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "next-i18next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import {
  ActionIcon,
  Button,
  Checkbox,
  CopyButton,
  Divider,
  Drawer,
  Flex,
  Grid,
  Group,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  rem,
  Badge,
} from "@mantine/core";
import type { Profile } from "types/profile";
import ProfileAvatar from "@components/content/ProfileAvatar";
import { useDisclosure, useListState, useSessionStorage } from "@mantine/hooks";
import {
  IconCheck,
  IconCopy,
  IconHelpCircleFilled,
  IconUserMinus,
  IconUserPlus,
  IconUserQuestion,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import type { Match, MatchMode } from "types/match";
import {
  APP_VERSION,
  DEFAULT_MATCH_SETTINGS,
  LEGS,
  MATCH_SCORE,
  SETS,
} from "@utils/constants";
import { v4 as getUUID } from "uuid";
import getFormattedName from "@utils/misc/getFormattedName";
import EmptyState from "@components/content/EmptyState";
import getAllProfilesFromDatabase from "@lib/db/profiles/getAllProfiles";
import { notifications } from "@mantine/notifications";
import { useMultiplayer } from "../../../context/MultiplayerContext";

const NewGamePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const { hostGame, joinGame, roomId, broadcastAction, lastReceivedAction, connectedGuestIds } = useMultiplayer();

  const [matchMode, setMatchMode] = useState<MatchMode>("local");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

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
          message: String(e),
        });
      });

  const [opened, { open, close }] = useDisclosure(false);

  const router = useRouter();

  const [, setMatchStorage] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });
  
  // Listen for Game Start (Guest Side)
  useEffect(() => {
    if (lastReceivedAction?.type === "INIT_GAME") {
       const matchData = lastReceivedAction.payload;
       setMatchStorage(matchData);
       void router.push(`/${locale}/match/playing`);
    }
  }, [lastReceivedAction, locale, router, setMatchStorage]);

  useEffect(() => {
    // Reset profiles since they will refetch each render
    selectedProfilesActions.setState([]);
    availableProfilesActions.setState([]);

    void getAllProfiles();
  }, []);

  const uuid = getUUID();

  const matchSettings = useForm<Match>({
    initialValues: {
      appVersion: APP_VERSION,
      createdAt: Date.now(),
      initialScore: DEFAULT_MATCH_SETTINGS.SCORE,
      matchCheckout: DEFAULT_MATCH_SETTINGS.CHECKOUT,
      matchStatus: DEFAULT_MATCH_SETTINGS.STATUS,
      matchMode: DEFAULT_MATCH_SETTINGS.MATCH_MODE,
      verificationMode: DEFAULT_MATCH_SETTINGS.VERIFICATION_MODE,
      uuid: uuid,
      players: [],
      updatedAt: Date.now(),
      legs: DEFAULT_MATCH_SETTINGS.LEGS,
      sets: DEFAULT_MATCH_SETTINGS.SETS,
    },
  });

  // Update form when mode changes
  useEffect(() => {
    matchSettings.setFieldValue("matchMode", matchMode);
  }, [matchMode]);

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

    // If online, tell everyone to start
    if (matchMode === 'online') {
        broadcastAction({ type: "INIT_GAME", payload: matchSettings.values });
    }

    setMatchStorage(matchSettings.values);
    void router.push(`/${locale}/match/playing`);
  };

  const handleHostOnline = async () => {
    setIsConnecting(true);
    try {
      await hostGame();
      notifications.show({
        title: t("lobby:online.notifications.createdTitle"),
        message: t("lobby:online.notifications.createdMessage"),
        color: "green",
      });
    } catch {
      notifications.show({
        title: t("lobby:online.notifications.errorTitle"),
        message: t("lobby:online.notifications.createError"),
        color: "red",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinOnline = async () => {
    if (!joinRoomId) return;
    setIsConnecting(true);
    try {
      await joinGame(joinRoomId);
      notifications.show({
        title: t("lobby:online.notifications.connectedTitle"),
        message: t("lobby:online.notifications.connectedMessage"),
        color: "green",
      });
    } catch {
      notifications.show({
        title: t("lobby:online.notifications.errorTitle"),
        message: t("lobby:online.notifications.joinError"),
        color: "red",
      });
    } finally {
      setIsConnecting(false);
    }
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
             <Group justify="space-between">
              <Title>{t("lobby:title.players")}</Title>
              <SegmentedControl
                value={matchMode}
                onChange={(value) => setMatchMode(value as MatchMode)}
                data={[
                  { label: t("lobby:modes.local"), value: "local" },
                  { label: t("lobby:modes.online"), value: "online" },
                ]}
              />
            </Group>

            {matchMode === "online" && (
              <Stack gap="md" p="md" bg="var(--mantine-color-body)" style={{border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)'}}>
                {!roomId ? (
                  <Group align="end">
                     <TextInput 
                        label={t("lobby:online.joinExisting")} 
                        placeholder={t("lobby:online.enterRoomId")} 
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.currentTarget.value)}
                        style={{ flex: 1 }}
                     />
                     <Button onClick={() => void handleJoinOnline()} loading={isConnecting}>{t("lobby:online.join")}</Button>
                     <Divider orientation="vertical" />
                     <Button variant="light" onClick={() => void handleHostOnline()} loading={isConnecting}>{t("lobby:online.hostNew")}</Button>
                  </Group>
                ) : (
                   <Stack>
                      <Text fw={700}>{t("lobby:online.lobbyCreated")}</Text>
                      <Group>
                        <TextInput 
                          readOnly 
                          label={t("lobby:online.shareId")} 
                          value={roomId} 
                          style={{ flex: 1 }}
                        />
                         <CopyButton value={roomId}>
                          {({ copied, copy }) => (
                            <Button color={copied ? 'teal' : 'blue'} onClick={copy} mt={25}>
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </Button>
                          )}
                        </CopyButton>
                      </Group>
                      
                      <Divider label={t("lobby:online.connectedGuests")} labelPosition="center" />
                      {connectedGuestIds.length === 0 ? (
                        <Text c="dimmed" size="sm" ta="center">{t("lobby:online.waitingForGuests")}</Text>
                      ) : (
                        <Group>
                            {connectedGuestIds.map(guestId => (
                                <Badge key={guestId} variant="dot" color="green" size="lg">
                                    {t("lobby:online.guestBadge")} ({guestId.substring(0, 4)}...)
                                </Badge>
                            ))}
                        </Group>
                      )}
                   </Stack>
                )}
              </Stack>
            )}

            <Group>
               <Text fw="bold" size="lg">{t("lobby:title.players")}</Text>
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
              data={["Any", "Single", "Double", "Triple"]}
            />
             
             {matchMode === "online" && (
                 <>
                    <Divider label={t("lobby:online.settings")} labelPosition="center" />
                    <Checkbox
                        label={t("lobby:online.enforceVerification")}
                        checked={matchSettings.values.verificationMode === 'enforced'}
                        onChange={(event) => matchSettings.setFieldValue('verificationMode', event.currentTarget.checked ? 'enforced' : 'social')}
                        wrapperProps={{
                            title: t("lobby:online.enforceVerificationTooltip")
                        }}
                    />
                 </>
             )}

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