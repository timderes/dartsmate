import { Button, Center, Group, Stack } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import useBullOff from "@/hooks/useBullOff";
import useLobby from "@/hooks/useLobby";
import BullOffHeader from "./BullOfHeader";

const BullOffActiveStep = () => {
  const { t } = useTranslation(["match", "common"]);
  const { currentPlayerIndex, handleNextTurn, handleSkipToTable } =
    useBullOff();
  const { state } = useLobby();

  const players = state.players ?? [];
  const totalPlayers = players.length;
  const playerName = players[currentPlayerIndex]?.name.firstName;

  return (
    <Center component={Stack} gap="xl">
      <BullOffHeader
        helpText={t("match:bullOffActiveNextPlayer.helpText")}
        title={t("match:bullOffActiveNextPlayer.title", {
          FIRST_NAME: playerName,
        })}
        upperCasedTitle={`${t("match:bullOff")} (${currentPlayerIndex + 1}/${totalPlayers})`}
      />
      <Group justify="center">
        <Button
          disabled={currentPlayerIndex === totalPlayers}
          onClick={handleNextTurn}
        >
          {t("common:next")}
        </Button>
        <Button variant="default" onClick={handleSkipToTable}>
          {t("match:skipBullOff")}
        </Button>
      </Group>
    </Center>
  );
};

export default BullOffActiveStep;
