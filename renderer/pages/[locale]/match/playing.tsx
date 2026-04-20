import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import {
  Button,
  Grid,
  LoadingOverlay,
  type MantineColorScheme,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "next-i18next";
import { useLocalStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import { modals } from "@mantine/modals";
import log from "electron-log/renderer";

import type { Player } from "types/match";

import OnlyControlsLayout from "@components/layouts/OnlyControlsLayout";
import { useDartGame } from "@hooks/useDartGame";

import addMatchToDatabase from "@lib/db/matches/addMatch";
import updateProfileFromDatabase from "@lib/db/profiles/updateProfile";

import getMatchWinner from "@lib/playing/getMatchWinner";
import updatePlayerStatistics from "@/lib/playing/player/updatePlayerStatistics";

import getScores from "@/lib/playing/stats/getScores";
import getTotalRoundScore from "@/lib/playing/stats/getTotalRoundScore";
import SharedConfirmModalProps from "@utils/modals/sharedConfirmModalProps";

import { useProfile } from "@/contexts/ProfileContext";

import MatchPlayerCard from "@components/match/MatchPlayerCard";
import MatchControls from "@components/match/MatchControls";
import MatchRoundInfo from "@components/match/MatchRoundInfo";

const PlayingPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();
  const { refreshProfile, profile: defaultProfile } = useProfile();

  const { state, actions } = useDartGame();
  const {
    checkout,
    players,
    currentPlayerIndex,
    currentLegStartingPlayerIndex,
    matchRound,
    multiplier: scoreMultiplier,
    matchStatus,
    initialScore,
    isHydrated,
  } = state;

  const [colorScheme] = useLocalStorage<MantineColorScheme>({
    key: "mantine-color-scheme-value",
  });

  // Derived state for the UI
  const scores = getScores(matchRound);
  const totalRoundScore = getTotalRoundScore(scores);

  if (!isHydrated) {
    return <LoadingOverlay />;
  }

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
    const updatedStatistics: Player["statistics"] =
      updatePlayerStatistics(player);

    updateProfileFromDatabase(
      {
        statistics: {
          ...updatedStatistics,
        },
      },
      player.uuid,
    )
      .then(() => {
        if (player.uuid === defaultProfile?.uuid) {
          void refreshProfile();
        }
      })
      .catch((err) => {
        log.error("Failed to update player statistics. Error:", err);
      });
  };

  return (
    <OnlyControlsLayout>
      <Grid gutter={0}>
        <Grid.Col span={{ md: 8, xl: 9 }}>
          <Grid gutter={0}>
            {players.map((player, index) => (
              <Grid.Col
                span={{
                  md: 6,
                  xl: 4,
                }}
                key={player.uuid}
              >
                <MatchPlayerCard
                  player={player}
                  index={index}
                  currentPlayerIndex={currentPlayerIndex}
                  currentLegStartingPlayerIndex={currentLegStartingPlayerIndex}
                  initialScore={initialScore}
                  colorScheme={colorScheme ?? "dark"}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Grid.Col>
        <Grid.Col component="aside" span="auto" p="lg">
          <Stack gap="sm">
            <MatchControls
              actions={actions}
              multiplier={scoreMultiplier}
              matchStatus={matchStatus}
              matchRoundLength={matchRound.length}
            />
            <MatchRoundInfo
              totalRoundScore={totalRoundScore}
              scores={scores}
              matchRound={matchRound}
              checkout={checkout}
            />
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
