import DefaultLayout from "@/components/layouts/Default";
import useLobby from "@/hooks/useLobby";
import { makeStaticProperties } from "@/lib/getStatic";
import { APP_SHELL } from "@/utils/constants";
import { Button, Center, Stack, Text, Title } from "@mantine/core";

import type { NextPage } from "next";
import { useTranslation } from "next-i18next/pages";
import { useState } from "react";

const BullOffContent = () => {
  const { state } = useLobby();
  const { t } = useTranslation();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const handleNextPlayer = () => () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % state.players.length);
  };

  return (
    <Center
      component={Stack}
      ta="center"
      mih={`calc(100dvh - ${APP_SHELL.HEADER_HEIGHT}px)`}
      justify="center"
      align="center"
    >
      <Text fz="md" tt="uppercase" opacity={0.7} style={{ letterSpacing: 4 }}>
        {t("match:bullOff")}
      </Text>
      <Title maw={600}>
        {t("match:bullOffActiveNextPlayer.title", {
          FIRST_NAME: state.players[currentPlayerIndex]?.name.firstName,
        })}
      </Title>
      <Text maw={600}>{t("match:bullOffActiveNextPlayer.helpText")}</Text>
      <Button mt="lg" onClick={handleNextPlayer()}>
        {t("next")}
      </Button>
    </Center>
  );
};

const BullOffPage: NextPage = () => {
  return (
    <DefaultLayout withNavbarOpen={false}>
      <BullOffContent />
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
