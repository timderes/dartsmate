import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import {
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  type MantineColorScheme,
  NumberFormatter,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  darken,
  getThemeColor,
  lighten,
  rem,
  useMantineTheme,
  Drawer,
} from "@mantine/core";
import { useTranslation } from "next-i18next";
import { useLocalStorage, useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { modals } from "@mantine/modals";
import { IconCrown, IconEraser, IconVideo } from "@tabler/icons-react";
import log from "electron-log/renderer";
import { useEffect } from "react";

import type { Player } from "types/match";

import OnlyControlsLayout from "@components/layouts/OnlyControlsLayout";
import ProfileAvatar from "@components/content/ProfileAvatar";
import { useDartGame } from "@hooks/useDartGame";
import { useMultiplayer } from "../../../context/MultiplayerContext";

import VideoStream from "@components/media/VideoStream";

import addMatchToDatabase from "@lib/db/matches/addMatch";
import updateProfileFromDatabase from "@lib/db/profiles/updateProfile";
import getFirstNineAverage from "@lib/playing/stats/getFirstNineAverage";
import getMatchWinner from "@lib/playing/getMatchWinner";

import { DARTBOARD_ZONES, THROWS_PER_ROUND } from "@utils/constants";
import {
  getScores,
  getTotalRoundScore,
} from "@utils/match/stats/getTotalRoundScore";
import { getTotalMatchAvg } from "@utils/match/stats/getTotalMatchAvg";
import getFormattedName from "@utils/misc/getFormattedName";
import SharedConfirmModalProps from "@utils/modals/sharedConfirmModalProps";
import getNumberOfRoundsAboveThreshold from "@utils/match/stats/getScoresAbove";
import getTotalDartsThrown from "@utils/match/stats/getTotalDartsThrown";
import getHighestScore from "@utils/match/stats/getHighestScore";

const PlayingPage: NextPage = () => {
  const theme = useMantineTheme();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();

  const { state, actions, dispatch } = useDartGame();
  const { broadcastAction, lastReceivedAction, myStream, peerStreams, setMyStream } = useMultiplayer();
  const [cameraDrawerOpened, { toggle: toggleCameraDrawer }] = useDisclosure(false);

  const {
    players,
    currentPlayerIndex,
    matchRound,
    multiplier: scoreMultiplier,
    matchStatus,
    initialScore,
    isHydrated,
  } = state;

  // Automatic redirect if match is aborted remotely
  useEffect(() => {
    if (state.matchStatus === "aborted" && state.matchMode === "online") {
        void router.push(`/${locale}/match/view`);
    }
  }, [state.matchStatus, state.matchMode, locale, router]);

  const [colorScheme] = useLocalStorage<MantineColorScheme>({
    key: "mantine-color-scheme-value",
  });

  // --- Multiplayer Logic ---

  // 1. Initialize Camera if Online
  useEffect(() => {
    if (state.matchMode === 'online' && !myStream) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMyStream(stream);
          if (!cameraDrawerOpened) toggleCameraDrawer(); // Auto open camera view
        })
        .catch(err => console.error("Failed to get camera:", err));
    }
  }, [state.matchMode, myStream]);

  // 2. Sync Incoming Actions
  useEffect(() => {
    if (lastReceivedAction) {
      // If we are in 'enforced' mode, we might want to pause here for verification
      // For now, let's just apply the action to keep state in sync
      dispatch(lastReceivedAction);
    }
  }, [lastReceivedAction, dispatch]);

  // 3. Wrapper for Outgoing Actions
  const handleThrowDart = (zone: number) => {
    actions.throwDart(zone);
    if (state.matchMode === 'online') {
       broadcastAction({ type: "THROW_DART", payload: { zone } });
    }
  };

  const handleUndoThrow = () => {
    actions.undoThrow();
    if (state.matchMode === 'online') {
       broadcastAction({ type: "UNDO_THROW" });
    }
  };

  const handleNextTurn = () => {
    // If enforced verification is on, check logic here
    actions.nextTurn();
    if (state.matchMode === 'online') {
      // Payload needs elapsedTime, which is handled inside useDartGame's action wrapper usually
      // But we need to construct the raw action. 
      // Current useDartGame `nextTurn` dispatch includes `elapsedTime`.
      // We need to mirror that. The `actions.nextTurn` handles dispatch locally.
      // We can assume the local reducer is deterministic or we should broadcast the *result*.
      // For simplicity, we just trigger the same action type.
      // Note: `elapsedTime` might desync slightly, but it's acceptable for now.
       broadcastAction({ type: "NEXT_TURN", payload: { elapsedTime: 0 } }); 
    }
  };
  
  const handleToggleMultiplier = (type: "double" | "triple") => {
      actions.toggleMultiplier(type);
      if (state.matchMode === 'online') {
          broadcastAction({ type: "TOGGLE_MULTIPLIER", payload: type });
      }
  }


  // --- End Multiplayer Logic ---

  // Derived state for the UI
  const scores = getScores(matchRound);
  const totalRoundScore = getTotalRoundScore(scores);

  if (!isHydrated) {
    return <LoadingOverlay />;
  }

  const getCardBackgroundColor = (
    color: string,
    index: number,
  ): string | undefined => {
    if (index === currentPlayerIndex) {
      if (colorScheme === "dark") {
        return darken(getThemeColor(color, theme), 0.7);
      }

      if (colorScheme === "light") {
        return lighten(getThemeColor(color, theme), 0.7);
      }
    }

    return undefined;
  };

  const openAbortModal = () =>
    modals.openConfirmModal({
      title: t("match:modalAbortMatch:title"),
      children: <Text size="sm">{t("match:modalAbortMatch:text")}</Text>,
      labels: {
        confirm: t("match:abortMatch"),
        cancel: t("match:modalAbortMatch:cancelButton"),
      },
      onConfirm: () => {
        actions.abortMatch();
        if (state.matchMode === 'online') broadcastAction({ type: "ABORT_MATCH" });

        // Persist the aborted state
        void addMatchToDatabase({
          appVersion: state.appVersion,
          createdAt: state.createdAt,
          initialScore: state.initialScore,
          matchCheckout: state.matchCheckout,
          matchStatus: "aborted",
          players: state.players,
          updatedAt: Date.now(),
          uuid: state.uuid,
          legs: state.legs,
          sets: state.sets,
        });

        players.forEach((player) => {
          handleUpdatePlayerStatistics(player);
        });

        void router.push(`/${locale}/match/view`);
      },
      ...SharedConfirmModalProps,
    });

  const handleFinishedMatch = (): void => {
    void addMatchToDatabase({
      appVersion: state.appVersion,
      createdAt: state.createdAt,
      initialScore: state.initialScore,
      matchCheckout: state.matchCheckout,
      matchStatus: "finished",
      players: state.players,
      updatedAt: Date.now(),
      uuid: state.uuid,
      legs: state.legs,
      sets: state.sets,
    });

    players.forEach((player) => {
      handleUpdatePlayerStatistics(player);
    });

    void router.push(`/${locale}/match/view`);
  };

  const handleUpdatePlayerStatistics = (player: Player): void => {
    const oldStatistics = player.statistics;

    const newStatistics: Player["statistics"] = {
      // TODO: Calculate the average needs more statistics. Add the these later
      average: 0,
      // Played trainings is not updated here, only matches
      playedMatches: oldStatistics.playedMatches + 1,
      playedTrainings: oldStatistics.playedTrainings,
      thrownDarts:
        oldStatistics.thrownDarts + player.rounds.length * THROWS_PER_ROUND,
      thrownOneHundredAndEighty:
        oldStatistics.thrownOneHundredAndEighty +
        getNumberOfRoundsAboveThreshold(player.rounds, 180),
    };

    updateProfileFromDatabase(
      {
        statistics: {
          ...newStatistics,
        },
      },
      player.uuid,
    ).catch((err) => {
      log.error("Failed to update player statistics. Error:", err);
    });
  };

  return (
    <OnlyControlsLayout>
      <Drawer
        opened={cameraDrawerOpened}
        onClose={toggleCameraDrawer}
        position="right"
        title={t("match:camera.liveFeeds")}
        overlayProps={{ opacity: 0 }}
        withOverlay={false}
        styles={{
             content: { marginTop: '60px', height: 'calc(100% - 60px)' }
        }}
      >
        <Stack>
            {myStream && (
                <Card padding={0} radius="md" withBorder>
                   <VideoStream stream={myStream} muted label={t("match:camera.me")} />
                </Card>
            )}
            {Object.entries(peerStreams).map(([peerId, stream]) => (
                 <Card key={peerId} padding={0} radius="md" withBorder>
                    <VideoStream stream={stream} label={`${t("match:camera.peer")} ${peerId.substring(0,4)}`} />
                 </Card>
            ))}
            {Object.keys(peerStreams).length === 0 && !myStream && (
                <Text c="dimmed" ta="center">{t("match:camera.noFeeds")}</Text>
            )}
        </Stack>
      </Drawer>

      <Grid gutter={0}>
        <Grid.Col span={{ md: 8, xl: 9 }}>
          <Grid gutter={0}>
            {players.map((player, index) => {
              const progressValue = (player.scoreLeft / initialScore) * 100;
              return (
                <Grid.Col
                  span={{
                    md: 6,
                    xl: 4,
                  }}
                  key={player.uuid}
                >
                  <Card
                    radius={0}
                    px={0}
                    pb={0}
                    m="lg"
                    bg={getCardBackgroundColor(player.color, index)}
                  >
                    {player.isWinner ? (
                      <Tooltip
                        label={t("match:playerWon", {
                          PLAYER_NAME: player.username,
                        })}
                        withArrow
                      >
                        <IconCrown
                          style={{
                            position: "absolute",
                            right: 16,
                            top: 16,
                          }}
                          color="gold"
                          size={32}
                        />
                      </Tooltip>
                    ) : undefined}

                    <Stack>
                      <Group px="lg">
                        <ProfileAvatar size="lg" profile={player} />
                        <Stack align="start" gap={0}>
                          <Text opacity={0.6} fz="xs">
                            {getFormattedName(player.name)}
                          </Text>
                          <Text fz="h2" fw="bold">
                            {player.username}
                          </Text>
                        </Stack>
                      </Group>

                      <Stack gap={0} ta="center">
                        <Text
                          c={player.color}
                          fw="bold"
                          px="lg"
                          fz={{ md: rem(40), lg: rem(60), xl: rem(100) }}
                        >
                          <NumberFormatter value={player.scoreLeft} />
                        </Text>
                        <Tooltip label={t("stats.avg")} withArrow>
                          <Text
                            fz="lg"
                            style={{
                              cursor: "help",
                            }}
                          >
                            <NumberFormatter
                              decimalScale={2}
                              value={getTotalMatchAvg(players[index].rounds)}
                            />
                          </Text>
                        </Tooltip>
                      </Stack>
                      <Divider
                        label={t("routes.statistics")}
                        color={
                          index === currentPlayerIndex
                            ? player.color
                            : undefined
                        }
                      />
                      <Flex
                        direction={{
                          xs: "column",
                          xl: "row",
                        }}
                        tt="uppercase"
                        fz="xs"
                        px="lg"
                        opacity={0.7}
                        justify="space-between"
                      >
                        <span>
                          {t("stats.firstNineAvg")}:{" "}
                          <NumberFormatter
                            decimalScale={2}
                            defaultValue={0}
                            value={getFirstNineAverage(players[index].rounds)}
                          />
                        </span>
                        <span>
                          {t("stats.highestScore")}:{" "}
                          <NumberFormatter
                            defaultValue={0}
                            value={getHighestScore(players[index].rounds)}
                          />
                        </span>
                        <span>
                          {t("stats.dartsThrown")}:{" "}
                          {/* Fixed lazy calculation with proper utility */}
                          {getTotalDartsThrown(players[index].rounds)}
                        </span>
                      </Flex>
                      <Progress
                        color={player.color}
                        radius={0}
                        value={progressValue}
                      />
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </Grid.Col>
        <Grid.Col component="aside" span="auto" p="lg">
          <Stack gap="sm">
            {state.matchMode === 'online' && (
                 <Button variant="outline" leftSection={<IconVideo size={16} />} onClick={toggleCameraDrawer}>
                    {cameraDrawerOpened ? t("match:camera.hideCameras") : t("match:camera.showCameras")}
                 </Button>
            )}

            <SimpleGrid
              cols={{
                xs: 4,
                lg: 3,
              }}
            >
              {DARTBOARD_ZONES.map((zone) => (
                <Button
                  onClick={() => handleThrowDart(zone)}
                  variant="default"
                  key={zone}
                >
                  {zone}
                </Button>
              ))}
            </SimpleGrid>
            <Text
              fz={{ md: rem(40), lg: rem(40), xl: rem(80) }}
              ta="center"
              fw="bold"
            >
              <NumberFormatter value={totalRoundScore} />
            </Text>
            <Group justify="center" fz="h3" opacity={0.5}>
              {Array.from({ length: THROWS_PER_ROUND }, (_, index) => (
                <Text fz="xl" key={index}>
                  {matchRound[index]?.isDouble
                    ? "D"
                    : matchRound[index]?.isTriple
                      ? "T"
                      : undefined}
                  {matchRound[index]?.dartboardZone ?? "-"}
                </Text>
              ))}
            </Group>
            <SimpleGrid cols={3}>
              <Button
                onClick={() => handleToggleMultiplier("double")}
                variant={scoreMultiplier.double ? undefined : "default"}
              >
                {t("match:multipliers.double")}
              </Button>
              <Button
                onClick={() => handleToggleMultiplier("triple")}
                variant={scoreMultiplier.triple ? undefined : "default"}
              >
                {t("match:multipliers.triple")}
              </Button>
              <Tooltip label={t("match:removeThrows")} withArrow>
                <Button
                  disabled={matchRound.length === 0}
                  onClick={() => handleUndoThrow()}
                  variant="default"
                >
                  <IconEraser />
                </Button>
              </Tooltip>
            </SimpleGrid>
            <Button
              disabled={matchStatus === "finished"}
              onClick={() => handleNextTurn()}
            >
              {t("match:nextPlayer")}
            </Button>
            <Divider />
            {getMatchWinner(state) ? (
              <Button onClick={() => handleFinishedMatch()}>
                {t("match:closeFinishedMatch")}
              </Button>
            ) : (
              <Button onClick={() => openAbortModal()}>
                {t("match:abortMatch")}
              </Button>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </OnlyControlsLayout>
  );
};

export default PlayingPage;

export const getStaticProps = makeStaticProperties(["common", "match"]);

export { getStaticPaths };
