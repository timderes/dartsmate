import DefaultLayout from "@/components/layouts/Default";
import useLobby from "@/hooks/useLobby";
import { makeStaticProperties } from "@/lib/getStatic";
import { APP_SHELL } from "@/utils/constants";
import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";

import type { NextPage } from "next";
import { useTranslation } from "next-i18next/pages";
import { useRouter } from "next/router";
import { useState } from "react";

const BullOffContent = () => {
  const router = useRouter();
  const { dispatch, state } = useLobby();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const isLastPlayer = currentPlayerIndex === state.players.length - 1;
  const [showBullOffTable, setShowBullOffTable] = useState(false);

  const handleNextPlayer = () => {
    if (isLastPlayer) {
      setShowBullOffTable(true);
      return;
    }

    setCurrentPlayerIndex((index) => index + 1);
  };

  const handleMovePlayerUp = (index: number) => {
    if (index === 0) {
      return;
    }

    const playerUUIDs = state.players.map((player) => player.uuid);

    [playerUUIDs[index - 1], playerUUIDs[index]] = [
      playerUUIDs[index],
      playerUUIDs[index - 1],
    ];

    dispatch({
      type: "SET_PLAYER_ORDER",
      payload: { playerUUIDs },
    });
  };

  const handleMovePlayerDown = (index: number) => {
    if (index === state.players.length - 1) {
      return;
    }

    const playerUUIDs = state.players.map((player) => player.uuid);

    [playerUUIDs[index], playerUUIDs[index + 1]] = [
      playerUUIDs[index + 1],
      playerUUIDs[index],
    ];

    dispatch({
      type: "SET_PLAYER_ORDER",
      payload: { playerUUIDs },
    });
  };

  if (showBullOffTable) {
    return (
      <>
        <Text fz="md" tt="uppercase" opacity={0.7} style={{ letterSpacing: 4 }}>
          {t("match:bullOff")}
        </Text>

        <Title maw={600}>{t("match:bullOffFinished.title")}</Title>

        <Text maw={600}>{t("match:bullOffFinished.helpText")}</Text>

        <Stack mt="xl" w="100%" maw={500}>
          {state.players.map((player, index) => (
            <Group key={player.uuid} justify="space-between" p="md">
              <Text fw={500}>
                {index + 1}. {player.name.firstName}
              </Text>

              <Group gap="xs">
                <Button
                  variant="default"
                  size="xs"
                  disabled={index === 0}
                  onClick={() => {
                    handleMovePlayerUp(index);
                  }}
                >
                  ↑
                </Button>

                <Button
                  variant="default"
                  size="xs"
                  disabled={index === state.players.length - 1}
                  onClick={() => {
                    handleMovePlayerDown(index);
                  }}
                >
                  ↓
                </Button>
              </Group>
            </Group>
          ))}
        </Stack>

        <Button
          mt="xl"
          onClick={() => void router.push(`/${locale}/match/playing`)}
        >
          {t("lobby:startMatch")}
        </Button>
      </>
    );
  }

  return (
    <>
      <Text fz="md" tt="uppercase" opacity={0.7} style={{ letterSpacing: 4 }}>
        {t("match:bullOff")} ({currentPlayerIndex + 1}/{state.players.length})
      </Text>
      <Title maw={600}>
        {t("match:bullOffActiveNextPlayer.title", {
          FIRST_NAME: state.players[currentPlayerIndex]?.name.firstName,
        })}
      </Title>
      <Text maw={600}>{t("match:bullOffActiveNextPlayer.helpText")}</Text>

      <Group mt="lg">
        <Button onClick={handleNextPlayer}>{t("next")}</Button>
        <Button variant="transparent" onClick={() => setShowBullOffTable(true)}>
          {t("skip")}
        </Button>
      </Group>
    </>
  );
};

const BullOffPage: NextPage = () => {
  return (
    <DefaultLayout withNavbarOpen={false}>
      <Center
        component={Stack}
        ta="center"
        mih={`calc(100dvh - ${APP_SHELL.HEADER_HEIGHT}px)`}
        justify="center"
        align="center"
      >
        <BullOffContent />
      </Center>
    </DefaultLayout>
  );
};

export default BullOffPage;

export const getStaticProps = makeStaticProperties([
  "common",
  "lobby",
  "match",
]);

export { getStaticPaths } from "@/lib/getStatic";
