import { Group, Text, Button, Stack, ActionIcon } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import type { Player } from "@/types/match";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import getFormattedName from "@/utils/misc/getFormattedName";
import BullOffHeader from "./BullOfHeader";

type BullOffSortingProps = {
  players: Player[];
  onMovePlayer: (index: number, direction: -1 | 1) => void;
  onStart: () => void;
};

const BullOffSorting = ({
  players,
  onMovePlayer,
  onStart,
}: BullOffSortingProps) => {
  const { t } = useTranslation(["match", "lobby"]);

  return (
    <Stack align="center" gap="xl">
      <BullOffHeader
        upperCasedTitle={t("match:bullOff")}
        title={t("match:bullOffFinished.title")}
        helpText={t("match:bullOffFinished.helpText")}
      />
      <Stack w={{ sm: "90%", md: 500 }}>
        {players.map((player, index) => (
          <Group
            key={player?.uuid ?? `temp-${index}`}
            justify="space-between"
            py="xs"
          >
            <Text fw={500}>
              <Text span>{index + 1}.</Text> {getFormattedName(player.name)}
            </Text>

            <Group gap="xs">
              <ActionIcon
                variant="filled"
                aria-label="Settings"
                disabled={index === 0}
                onClick={() => onMovePlayer(index, -1)}
              >
                <IconArrowUp style={{ width: "70%", height: "70%" }} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                aria-label="Settings"
                disabled={index === players.length - 1}
                onClick={() => onMovePlayer(index, 1)}
              >
                <IconArrowDown style={{ width: "70%", height: "70%" }} />
              </ActionIcon>
            </Group>
          </Group>
        ))}
      </Stack>
      <Button onClick={onStart}>{t("lobby:startMatch")}</Button>
    </Stack>
  );
};

export default BullOffSorting;
