import DefaultLayout from "@/components/layouts/Default";
import { Center, Stack } from "@mantine/core";
import type { NextPage } from "next";
import BullOffActiveStep from "@/components/bull-off/BullOffActiveStep";
import { BullOffFinalTable } from "@/components/bull-off/BullOffFinalTable";
import useBullOff from "@/hooks/useBullOff";
import useLobby from "@/hooks/useLobby";
import BullOffProvider from "@/providers/BullOffProvider";
import log from "electron-log/renderer";
import { APP_SHELL } from "@/utils/constants";
import { makeStaticProperties } from "@/lib/getStatic";

const BullOffPage: NextPage = () => {
  return (
    <DefaultLayout withNavbarOpen={false}>
      <BullOffProvider>
        <Center
          component={Stack}
          ta="center"
          mih={`calc(100dvh - ${APP_SHELL.HEADER_HEIGHT}px)`}
          justify="center"
          align="center"
        >
          <BullOffContent />
        </Center>
      </BullOffProvider>
    </DefaultLayout>
  );
};

const BullOffContent = () => {
  const { showBullOffTable, movePlayerInTable, startMatch } = useBullOff();
  const { state: gameState } = useLobby();
  const players = gameState.players ?? [];

  // Currently not a robust solution, but it should be enough for now.
  // If the players array is empty, we log an error to help with debugging.
  //
  // It's pretty much a edge case, but it can happen if the game state is not
  // properly initialized or if there's a bug in the lobby logic.
  if (!players || players.length === 0) {
    log.error("No players found in game state while bull-off.");
  }

  return showBullOffTable ? (
    <BullOffFinalTable
      players={players}
      onMovePlayer={movePlayerInTable}
      onStart={startMatch}
    />
  ) : (
    <BullOffActiveStep />
  );
};

export default BullOffPage;

export const getStaticProps = makeStaticProperties([
  "common",
  "lobby",
  "match",
]);

export { getStaticPaths } from "@/lib/getStatic";
