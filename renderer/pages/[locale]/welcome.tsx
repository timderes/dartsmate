import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "lib/get-static";
import {
  BackgroundImage,
  Button,
  Center,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import sendIPC from "utils/ipc/send";
import { useRouter } from "next/router";
import OnlyControlsLayout, {
  headerHeightOnlyControls,
} from "@/components/layouts/OnlyControlsLayout";

const WelcomePage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();
  const pageHeight = `calc(100vh - ${headerHeightOnlyControls}px)`;

  const renderLeftCol = () => {
    return <BackgroundImage src="/images/dartboard.jpg" h="100%" />;
  };

  const renderRightCol = () => {
    return (
      <Center h={pageHeight} p="xl" maw={800}>
        <Stack gap="xl">
          <Title fw="bold">{t("title", { ns: "welcome" })}</Title>
          <Text c="dimmed" fz="xl">
            {t("description", { ns: "welcome" })}
          </Text>
          <Group>
            <Button
              leftSection={<IconUserPlus />}
              onClick={() => void router.push(`/${locale}/profile/create`)}
            >
              {t("buttons.createProfile", { ns: "profile" })}
            </Button>
            <Button variant="default" onClick={() => sendIPC("close-app")}>
              {t("closeApp")}
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  };

  return (
    <OnlyControlsLayout>
      <Grid gutter={0}>
        <Grid.Col span={6}>{renderLeftCol()}</Grid.Col>
        <Grid.Col span="auto">{renderRightCol()}</Grid.Col>
      </Grid>
    </OnlyControlsLayout>
  );
};

export default WelcomePage;

export const getStaticProps = makeStaticProperties([
  "common",
  "profile",
  "welcome",
]);

export { getStaticPaths };
