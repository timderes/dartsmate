import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import {
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import CenteredContent from "@/components/content/CenteredContent";

import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import type { Match } from "types/match";

/**
 * This page is rendered *after* the bull-off has been performed and the
 * starting player has been determined.
 *
 * The user can now use drag-and-drop to reorder the players according
 * to the bull-off results.
 */
const BullOffResultsPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();

  const [currentMatch, setCurrentMatch] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  if (!currentMatch) return <LoadingOverlay />;

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
};

export default BullOffResultsPage;

export const getStaticProps = makeStaticProperties(["lobby"]);

export { getStaticPaths };
