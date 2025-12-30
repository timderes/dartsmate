import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
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
} from "@mantine/core";

import { useTranslation } from "next-i18next";

import OnlyControlsLayout from "@/components/layouts/OnlyControlsLayout";

import type {
  Checkout,
  DartThrow,
  Match,
  MatchRound,
  Player,
} from "types/match";
import { useEffect, useState } from "react";
import {
  useListState,
  useLocalStorage,
  useSessionStorage,
} from "@mantine/hooks";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import {
  DARTBOARD_ZONES,
  SCORE_BULLSEYE,
  SCORE_MISSED,
  SCORE_OUTER_BULL,
  THROWS_PER_ROUND,
} from "utils/constants";
import { IconCrown, IconEraser } from "@tabler/icons-react";
import {
  getScores,
  getTotalRoundScore,
} from "utils/match/stats/getTotalRoundScore";
import { applyScoreMultiplier } from "utils/match/helper/applyScoreMultiplier";
import isNonMultipleScore from "utils/match/helper/isNonMultipleScore";
import { getTotalMatchAvg } from "utils/match/stats/getTotalMatchAvg";
import getFormattedName from "utils/misc/getFormattedName";
import { useRouter } from "next/router";
import { useElapsedTime } from "use-elapsed-time";
import { modals } from "@mantine/modals";
import addMatchToDatabase from "@/lib/db/matches/addMatch";
import getFirstNineAverage from "@/lib/playing/stats/getFirstNineAverage";
import isBust from "@/lib/playing/stats/isBust";
import SharedConfirmModalProps from "utils/modals/sharedConfirmModalProps";
import updateProfileFromDatabase from "@/lib/db/profiles/updateProfile";
import log from "electron-log/renderer";
import getNumberOfRoundsAboveThreshold from "utils/match/stats/getScoresAbove";
import getMatchWinner from "@/lib/playing/getMatchWinner";

const PlayingPage: NextPage = () => {
  const theme = useMantineTheme();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const [matchSessionData, setMatchSessionData] = useSessionStorage<Match>({
    defaultValue: undefined,
    key: "currentMatch",
  });
  const [colorScheme] = useLocalStorage<MantineColorScheme>({
    key: "mantine-color-scheme-value",
  });
  const [players, playersActions] = useListState<Player>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState<{
    double: boolean;
    triple: boolean;
  }>({ double: false, triple: false });
  const [matchRound, setMatchRound] = useState<DartThrow[]>([]);
  const router = useRouter();
  const { elapsedTime, reset: resetTimer } = useElapsedTime({
    isPlaying: true,
    updateInterval: 1, // Interval in seconds
  });

  useEffect(() => {
    if (matchSessionData) {
      // Indicates the game hasn't started jet
      if (matchSessionData.players[0].scoreLeft === -1) {
        const updatedPlayers = matchSessionData.players.map((player) => ({
          ...player,
          scoreLeft: matchSessionData.initialScore,
        }));

        playersActions.setState(updatedPlayers);
      }
    }
  }, [matchSessionData]);

  const scores = getScores(matchRound);
  const totalRoundScore = getTotalRoundScore(scores);

  const handleUpdateCurrentPlayerIndex = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  if (!matchSessionData) {
    return <LoadingOverlay />;
  }

  const handleMultiplierToggle = (
    multiplierType: "double" | "triple",
  ): void => {
    // Toggle the selected multiplier and reset the other to false
    setScoreMultiplier((prevMultiplier) => ({
      ...prevMultiplier,
      [multiplierType]: !prevMultiplier[multiplierType],
      [multiplierType === "double" ? "triple" : "double"]: false,
    }));
  };

  const handleDartThrow = (score: number): void => {
    if (matchRound.length >= THROWS_PER_ROUND) return;

    const roundData: DartThrow = {
      dartboardZone: score,
      score: applyScoreMultiplier(
        scoreMultiplier.double,
        scoreMultiplier.triple,
        score,
      ),
      isBullseye: score === SCORE_BULLSEYE,
      isDouble: isNonMultipleScore(score) ? false : scoreMultiplier.double,
      isTriple: isNonMultipleScore(score) ? false : scoreMultiplier.triple,
      isMissed: score === SCORE_MISSED,
      isOuterBull: score === SCORE_OUTER_BULL,
    };

    setScoreMultiplier({
      double: false,
      triple: false,
    });
    setMatchRound((prevRounds) => [...prevRounds, roundData]);
  };

  const handleRemoveLastThrow = (): void => {
    if (matchRound.length === 0) return;

    const updatedRounds = matchRound.slice(0, -1);

    setMatchRound(updatedRounds);
  };

  const isLastThrowCheckout = (
    checkout: Checkout,
    scoreLeft: number,
    thrownScore: number,
  ): boolean => {
    if (matchRound.length === 0) {
      // Can't win without a throw
      return false;
    }

    if (scoreLeft - thrownScore !== 0) {
      // Remaining score was not 0!
      return false;
    }

    const lastThrow = matchRound[matchRound.length - 1];

    if (!lastThrow) {
      // Just an additional safeguard, should not occur due to previous checks
      return false;
    }

    if (checkout === "Single") {
      return !lastThrow.isDouble && !lastThrow.isTriple;
    }

    if (checkout === "Double") {
      return lastThrow.isDouble || lastThrow.isBullseye;
    }

    if (checkout === "Triple") {
      return lastThrow.isTriple;
    }

    // If checkout type is "Any" or not specified
    return true;
  };

  const handleRoundUpdate = (): void => {
    if (matchRound.length > THROWS_PER_ROUND) return;

    const { matchCheckout: checkout } = matchSessionData;

    const currentPlayer = players[currentPlayerIndex];

    const isWinner = isLastThrowCheckout(
      checkout,
      currentPlayer.scoreLeft,
      totalRoundScore,
    );

    const emptyRoundData: DartThrow = {
      dartboardZone: 0,
      isBullseye: false,
      isDouble: false,
      isMissed: true,
      isOuterBull: false,
      isTriple: false,
      score: 0,
    };

    const filledThrowDetails = [
      ...matchRound,
      ...Array.from(
        { length: THROWS_PER_ROUND - matchRound.length },
        () => emptyRoundData,
      ),
    ];

    const newScoreLeft = currentPlayer.scoreLeft - totalRoundScore;

    const updatedMatchRound: MatchRound = {
      elapsedTime: elapsedTime,
      isBust: isBust(checkout, newScoreLeft),
      roundAverage:
        matchRound.length > 0 ? totalRoundScore / matchRound.length : 0,
      roundTotal: totalRoundScore,

      throwDetails:
        isWinner && newScoreLeft === 0
          ? matchRound
          : filledThrowDetails.slice(0, THROWS_PER_ROUND),
    };
    const updatedCurrentPlayer: Player = {
      ...currentPlayer,
      rounds: [...currentPlayer.rounds, updatedMatchRound],
      isWinner: isWinner,

      scoreLeft:
        isWinner && newScoreLeft === 0
          ? 0
          : // Update score only if >0 and is not a bust!
            newScoreLeft > 0 && !isBust(checkout, newScoreLeft)
            ? newScoreLeft
            : currentPlayer.scoreLeft,
    };

    // Update the players array with the updated current player data
    const updatedPlayers = players.map((player, index) =>
      index === currentPlayerIndex ? updatedCurrentPlayer : player,
    );

    playersActions.setState(updatedPlayers);

    // Update the match session data with the updated players array
    setMatchSessionData({
      ...matchSessionData,
      matchStatus: isWinner ? "finished" : "started",
      players: updatedPlayers,
    });

    handleUpdateCurrentPlayerIndex();
    setMatchRound([]);
    resetTimer();
  };

  // Function to find the highest score across all rounds
  const getMatchHighestScore = (matchRounds: MatchRound[]): number => {
    let highestScore = 0;

    // Iterate through each MatchRound
    matchRounds.forEach((matchRound) => {
      // Iterate through each DartThrow in throwDetails of the current MatchRound

      if (matchRound.roundTotal > highestScore) {
        highestScore = matchRound.roundTotal;
      }
    });

    return highestScore;
  };

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
        void addMatchToDatabase({
          ...matchSessionData,
          matchStatus: "aborted",
        });

        players.forEach((player) => {
          handleUpdatePlayerStatistics(player);
        });

        void router.push(`/${locale}/match/view`);
      },
      ...SharedConfirmModalProps,
    });

  const handleAbortMatch = (): void => {
    openAbortModal();
  };

  const handleFinishedMatch = (): void => {
    void addMatchToDatabase({ ...matchSessionData, matchStatus: "finished" });

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
      <Grid gutter={0}>
        <Grid.Col span={{ md: 8, xl: 9 }}>
          <Grid gutter={0}>
            {players.map((player, _idx) => {
              const progressValue =
                (player.scoreLeft / matchSessionData.initialScore) * 100;
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
                    bg={getCardBackgroundColor(player.color, _idx)}
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
                              value={getTotalMatchAvg(players[_idx].rounds)}
                            />
                          </Text>
                        </Tooltip>
                      </Stack>
                      <Divider
                        label={t("routes.statistics")}
                        color={
                          _idx === currentPlayerIndex ? player.color : undefined
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
                            value={getFirstNineAverage(players[_idx].rounds)}
                          />
                        </span>
                        <span>
                          {t("stats.highestScore")}:{" "}
                          <NumberFormatter
                            defaultValue={0}
                            value={getMatchHighestScore(players[_idx].rounds)}
                          />
                        </span>
                        <span>
                          {t("stats.dartsThrown")}:{" "}
                          {/* TODO: Lazy way... Not handling 1 or 2 dart inputs */}
                          {players[_idx].rounds.length * THROWS_PER_ROUND}
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
            <SimpleGrid
              cols={{
                xs: 4,
                lg: 3,
              }}
            >
              {DARTBOARD_ZONES.map((zone) => (
                <Button
                  onClick={() => handleDartThrow(zone)}
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
              {Array.from({ length: THROWS_PER_ROUND }, (_, _idx) => (
                <Text fz="xl" key={_idx}>
                  {matchRound[_idx]?.isDouble
                    ? "D"
                    : matchRound[_idx]?.isTriple
                      ? "T"
                      : undefined}
                  {matchRound[_idx]?.dartboardZone ?? "-"}
                </Text>
              ))}
            </Group>
            <SimpleGrid cols={3}>
              <Button
                onClick={() => handleMultiplierToggle("double")}
                variant={scoreMultiplier.double ? undefined : "default"}
              >
                {t("match:multipliers.double")}
              </Button>
              <Button
                onClick={() => handleMultiplierToggle("triple")}
                variant={scoreMultiplier.triple ? undefined : "default"}
              >
                {t("match:multipliers.triple")}
              </Button>
              <Tooltip label={t("match:removeThrows")} withArrow>
                <Button
                  disabled={matchRound.length === 0}
                  onClick={() => handleRemoveLastThrow()}
                  variant="default"
                >
                  <IconEraser />
                </Button>
              </Tooltip>
            </SimpleGrid>
            <Button
              disabled={matchSessionData.matchStatus === "finished"}
              onClick={() => handleRoundUpdate()}
            >
              {t("match:nextPlayer")}
            </Button>
            <Divider />
            {getMatchWinner(matchSessionData) ? (
              <Button onClick={() => handleFinishedMatch()}>
                {t("match:closeFinishedMatch")}
              </Button>
            ) : (
              <Button onClick={() => handleAbortMatch()}>
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
