import type { NextPage } from "next";
import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { useSessionStorage } from "@mantine/hooks";
import type { Match } from "types/match";
import { useState } from "react";
import { Button, Group, Progress, Stack, Text, Title } from "@mantine/core";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useRouter } from "next/router";
import CenteredContent from "@/components/content/CenteredContent";

/**
 * This page allows players to perform a bull-off to determine the starting player.
 */
const BullOffPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentMatch] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });
  const router = useRouter();

  if (!currentMatch) return <LoadingOverlay />;

  const handleNextPlayer = () => {
    const numberOfPlayers = currentMatch.players.length;

    if (currentPlayer === numberOfPlayers - 1) {
      // If the last player has thrown the bull-off, the match can start
      // and the player with the highest score will start the match
      handleGoToBullOffResults();
      return;
    }

    setCurrentPlayer(currentPlayer + 1);
  };

  const handleGoToBullOffResults = () => {
    void router.push(`/${locale}/match/preMatch/bullOff/results/`);
  };

  return (
    <CenteredContent>
      <Stack>
        <Title fz="h2" c="dimmed" tt="uppercase">
          {t("lobby:bullOff")}
          &nbsp;&ndash;&nbsp;
          {currentPlayer + 1}/{currentMatch.players.length}
        </Title>
        <Progress
          radius="xs"
          value={((currentPlayer + 1) / currentMatch.players.length) * 100}
        />
        <Text fz="h1">
          {t("lobby:playerCanBullOff", {
            FIRST_NAME: currentMatch.players[currentPlayer].name.firstName,
          })}
        </Text>
        <Group>
          <Button w="fit-content" onClick={() => handleNextPlayer()}>
            {t("next")}
          </Button>
          <Button
            ml="auto"
            c="dimmed"
            onClick={() => handleGoToBullOffResults()}
            variant="transparent"
          >
            {t("skip")}
          </Button>
        </Group>
      </Stack>
    </CenteredContent>
  );
};

export default BullOffPage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
