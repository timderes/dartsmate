import type { NextPage } from "next";
import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { useSessionStorage } from "@mantine/hooks";
import type { Match } from "types/match";
import { useState } from "react";
import {
  Button,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import LoadingOverlay from "@/components/LoadingOverlay";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
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
  const [isBullOffFinished, setIsBullOffFinished] = useState(false);
  const [currentMatch, setCurrentMatch] = useSessionStorage<Match>({
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
      setIsBullOffFinished(true);
      return;
    }

    setCurrentPlayer(currentPlayer + 1);
  };

  const players = currentMatch.players.map((player, index) => (
    <Draggable key={player.uuid} index={index} draggableId={player.uuid}>
      {(provided) => (
        <Group
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Text fz="h1" fw="bold" c="dimmed" size="sm">
            {index + 1}
          </Text>
          <Text>{player.username}</Text>
        </Group>
      )}
    </Draggable>
  ));

  const handleStartMatch = () => {
    void router.push(`/${locale}/match/playing`);
  };

  if (isBullOffFinished) {
    return (
      <CenteredContent w={1000}>
        <Stack>
          <Title fz="h2" c="dimmed" tt="uppercase">
            {t("lobby:bullOff")}
          </Title>
          <Text fz="h2" fw="bold">
            {t("lobby:bullOffFinished")}
          </Text>
          <DragDropContext
            onDragEnd={({ destination, source }) =>
              setCurrentMatch((prev) => {
                if (!destination) return prev;

                const players = [...prev.players];
                const [removed] = players.splice(source.index, 1);
                players.splice(destination.index, 0, removed);

                return { ...prev, players, updatedAt: Date.now() };
              })
            }
          >
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {players}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Divider />
          <Button w="fit-content" onClick={() => handleStartMatch()}>
            {t("lobby:startMatch")}
          </Button>
        </Stack>
      </CenteredContent>
    );
  }

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
        <Button w="fit-content" onClick={() => handleNextPlayer()}>
          {t("next")}
        </Button>
      </Stack>
    </CenteredContent>
  );
};

export default BullOffPage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
