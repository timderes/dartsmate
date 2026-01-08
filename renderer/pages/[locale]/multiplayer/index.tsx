import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import {
  Button,
  Card,
  Center,
  Container,
  CopyButton,
  Divider,
  Grid,
  Group,
  Loader,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Badge,
} from "@mantine/core";
import { useListState, useSessionStorage } from "@mantine/hooks";
import { IconCheck, IconCopy, IconDeviceGamepad2, IconUsers } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";

import { useMultiplayer } from "../../../context/MultiplayerContext";
import { useMultiplayerLobby } from "@hooks/useMultiplayerLobby";
import { MatchSettingsForm } from "@components/lobby/MatchSettingsForm";
import { PlayerSelectionList } from "@components/lobby/PlayerSelectionList";
import ProfileAvatar from "@components/content/ProfileAvatar";

import getAllProfilesFromDatabase from "@lib/db/profiles/getAllProfiles";
import { Match } from "types/match";
import { Profile } from "types/profile";

const MultiplayerPage = () => {
  const { t, i18n: { language: locale } } = useTranslation();
  const router = useRouter();
  
  // 1. Context
  const {
    hostGame,
    joinGame,
    roomId,
    broadcastAction,
    broadcastSettings,
    lastReceivedAction,
    lastReceivedSettings,
    isHost,
  } = useMultiplayer();

  // 2. Logic Hook
  const {
    view,
    setView,
    selectedProfiles,
    selectedProfilesActions,
    guestMyProfile,
    setGuestMyProfile,
    matchSettings,
    handleGuestReady
  } = useMultiplayerLobby({
      isHost,
      broadcastAction,
      broadcastSettings,
      lastReceivedAction,
      lastReceivedSettings
  });

  // 3. UI Local State
  const [joinRoomIdInput, setJoinRoomIdInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableProfiles, availableProfilesActions] = useListState<Profile>([]);

  const [, setMatchStorage] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  // --- Data Fetching ---
  useEffect(() => {
    void getAllProfilesFromDatabase().then((profiles) => {
      availableProfilesActions.setState(profiles);
    });
  }, []);

  // --- Actions ---

  const handleHostGame = async () => {
    setIsConnecting(true);
    try {
      await hostGame();
      setView("host-lobby");
      notifications.show({ title: t("lobby:online.notifications.createdTitle"), message: t("lobby:online.notifications.createdMessage"), color: "green" });
    } catch (e) {
      notifications.show({ title: t("lobby:online.notifications.errorTitle"), message: String(e), color: "red" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinRoomIdInput) return;
    setIsConnecting(true);
    try {
      await joinGame(joinRoomIdInput);
      setView("guest-lobby");
      notifications.show({ title: t("lobby:online.notifications.connectedTitle"), message: t("lobby:online.notifications.connectedMessage"), color: "green" });
    } catch (e) {
      notifications.show({ title: t("lobby:online.notifications.errorTitle"), message: String(e), color: "red" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartMatch = () => {
    if (selectedProfiles.length < 1) return; 

    const finalMatchData: Match = {
      ...matchSettings.values,
      players: selectedProfiles.map(p => ({
        ...p,
        scoreLeft: -1, 
        isWinner: false,
        rounds: [],
        legsWon: 0,
        setsWon: 0,
      })),
      matchMode: "online",
    };

    broadcastAction({ type: "INIT_GAME", payload: finalMatchData });
    setMatchStorage(finalMatchData);
    void router.push(`/${locale}/match/playing`);
  };

  // Listen for Game Start (Guest Side)
  useEffect(() => {
    if (!isHost && lastReceivedAction?.type === "INIT_GAME") {
       const matchData = lastReceivedAction.payload;
       setMatchStorage(matchData);
       void router.push(`/${locale}/match/playing`);
    }
  }, [lastReceivedAction, isHost, locale, router, setMatchStorage]);


  // --- Render Views ---

  const renderLanding = () => (
    <Container size="sm" mt={100}>
       <Title ta="center" mb="xl">{t("lobby:modes.online")}</Title>
       <SimpleGrid cols={2} spacing="xl">
          <Card padding="xl" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={() => void handleHostGame()}>
             <Stack align="center" gap="md">
                <IconDeviceGamepad2 size={50} color="var(--mantine-color-blue-6)" />
                <Title order={3}>{t("lobby:online.hostNew")}</Title>
                <Text c="dimmed" ta="center" size="sm">Create a new room and invite your friends to play.</Text>
                {isConnecting && <Loader size="sm" />}
             </Stack>
          </Card>
          <Card padding="xl" radius="md" withBorder>
             <Stack align="center" gap="md">
                <IconUsers size={50} color="var(--mantine-color-green-6)" />
                <Title order={3}>{t("lobby:online.join")}</Title>
                 <Group w="100%">
                    <TextInput 
                      placeholder="Room ID" 
                      value={joinRoomIdInput} 
                      onChange={(e) => setJoinRoomIdInput(e.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <Button onClick={() => void handleJoinGame()} loading={isConnecting}>GO</Button>
                 </Group>
                 <Text c="dimmed" ta="center" size="sm">Enter the code from your friend to join.</Text>
             </Stack>
          </Card>
       </SimpleGrid>
       <Center mt="xl">
          <Button variant="subtle" onClick={() => void router.push(`/${locale}/lobby`)}>
            Back to Local Game
          </Button>
       </Center>
    </Container>
  );

  const renderHostLobby = () => (
    <Grid gutter="lg">
      <Grid.Col span={8}>
        <Stack>
            <Card withBorder radius="md" p="md">
               <Group justify="space-between">
                  <Stack gap={0}>
                     <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Room ID</Text>
                     <Title order={2} style={{ fontFamily: 'monospace' }}>{roomId}</Title>
                  </Stack>
                  <CopyButton value={roomId ?? ""}>
                    {({ copied, copy }) => (
                      <Button color={copied ? 'teal' : 'blue'} onClick={copy} leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}>
                        {copied ? "Copied" : "Copy Code"}
                      </Button>
                    )}
                  </CopyButton>
               </Group>
            </Card>

            <PlayerSelectionList 
               selectedProfiles={selectedProfiles}
               availableProfiles={availableProfiles}
               onAdd={(p) => {
                 selectedProfilesActions.append(p);
               }}
               onRemove={(uuid) => {
                 selectedProfilesActions.setState(prev => prev.filter(p => p.uuid !== uuid));
               }}
               onCreateGuest={() => {
                  void router.push(`/${locale}/profile/create`);
               }}
            />
        </Stack>
      </Grid.Col>
      <Grid.Col span={4}>
         <Stack>
            <Card withBorder radius="md" p="md">
               <MatchSettingsForm form={matchSettings} />
               <Divider my="md" />
               <Button size="xl" onClick={handleStartMatch} disabled={selectedProfiles.length === 0}>
                  START MATCH
               </Button>
            </Card>
         </Stack>
      </Grid.Col>
    </Grid>
  );

  const renderGuestLobby = () => (
    <Container size="md">
       <Stack gap="xl">
          <Title ta="center">Connected to Lobby</Title>
          
          <Card withBorder radius="md" p="xl">
             <Title order={3} mb="md">1. Select Your Profile</Title>
             {!guestMyProfile ? (
                 <ScrollArea h={200}>
                    <Stack>
                       {availableProfiles.map(p => (
                          <Group key={p.uuid} justify="space-between" style={{ cursor: 'pointer' }} onClick={() => handleGuestReady(p)}>
                              <Group>
                                 <ProfileAvatar profile={p} size="md" />
                                 <Text>{p.username}</Text>
                              </Group>
                              <Button variant="light" size="xs">Select</Button>
                          </Group>
                       ))}
                    </Stack>
                 </ScrollArea>
             ) : (
                <Group>
                    <ProfileAvatar profile={guestMyProfile} size="lg" />
                    <Stack gap={0}>
                       <Text fw={700}>{guestMyProfile.username}</Text>
                       <Text size="sm" c="green">Ready & Waiting for Host...</Text>
                    </Stack>
                    <Button variant="subtle" color="gray" ml="auto" onClick={() => setGuestMyProfile(null)}>Change</Button>
                </Group>
             )}
          </Card>

          <Card withBorder radius="md" p="xl" style={{ opacity: 0.8 }}>
             <Title order={3} mb="md">Match Settings (Host Controlled)</Title>
             <MatchSettingsForm form={matchSettings} readOnly />
             <Divider my="sm" />
             <Title order={4} mt="md">Players ({selectedProfiles.length})</Title>
             <Group mt="xs">
                {selectedProfiles.map(p => (
                   <Badge key={p.uuid} size="lg" variant="dot">{p.username}</Badge>
                ))}
             </Group>
          </Card>
       </Stack>
    </Container>
  );

  return (
    <DefaultLayout withNavbarOpen={true}>
       {view === "landing" && renderLanding()}
       {view === "host-lobby" && renderHostLobby()}
       {view === "guest-lobby" && renderGuestLobby()}
    </DefaultLayout>
  );
};

export default MultiplayerPage;

export const getStaticProps = makeStaticProperties(["common", "lobby", "match"]);
export { getStaticPaths };