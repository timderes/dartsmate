import type { NextPage } from "next";
import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { useSessionStorage } from "@mantine/hooks";
import type { Match } from "types/match";
import { useState } from "react";
import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import LoadingOverlay from "@/components/LoadingOverlay";

/**
 * This page allows players to perform a bull-off to determine the starting player.
 */
const BullOffPage: NextPage = () => {
  const { t } = useTranslation();
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isBullOffFinished, setIsBullOffFinished] = useState(false);
  const [currentMatch] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  if (!currentMatch) return <LoadingOverlay />;

  const handleNextPlayer = () => {
    const numberOfPlayers = currentMatch.players.length;

    if (currentPlayer === numberOfPlayers - 1) {
      // If the last player has thrown the bull-off, the match can start
      // and the player with the highest score will start the match
      setIsBullOffFinished(true);
      return;
    }

    setCurrentPlayer(currentPlayer + 1);
  };

  if (isBullOffFinished) {
    return (
      <Container h="100dvh">
        <Title>{t("lobby:bullOff")}</Title>
        <Text fw="bold">{t("lobby:bullOffFinished")}</Text>
        <Button>{t("lobby:startMatch")}</Button>
      </Container>
    );
  }

  return (
    <Container h="100dvh">
      <Center ta="center" component={Stack} w={600} mx="auto">
        <Title>{t("lobby:bullOff")}</Title>
        <Text>
          {t("lobby:playerCanBullOff", {
            FIRST_NAME: currentMatch.players[currentPlayer].name.firstName,
          })}
        </Text>
        <Button w="fit-content" mx="auto" onClick={() => handleNextPlayer()}>
          {t("next")}
        </Button>
      </Center>
    </Container>
  );
};

export default BullOffPage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
