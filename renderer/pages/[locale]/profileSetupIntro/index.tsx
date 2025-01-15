import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
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
import { useTranslation } from "next-i18next";
import sendIPC from "utils/ipc/send";
import { useRouter } from "next/router";
import OnlyControlsLayout, {
  headerHeightOnlyControls,
} from "@/components/layouts/OnlyControlsLayout";
import { APP_NAME } from "utils/constants";

/**
 * Renders the `ProfileSetupIntroPage`, displayed when no default profile exists.
 * This component provides a welcome message to the user and directs them to the
 * profile creation route to create a default profile.
 */
const ProfileSetupIntroPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const router = useRouter();
  const pageHeight = `calc(100vh - ${headerHeightOnlyControls}px)`;

  const renderLeftColumn = () => {
    return <BackgroundImage src="/images/dartboard.jpg" h="100%" />;
  };

  const renderRightColumn = () => {
    return (
      <Center h={pageHeight} p="xl" maw={800}>
        <Stack gap="xl">
          <Title fw="bold">{t("appIntro:welcomeTitle", { APP_NAME })}</Title>
          <Text>{t("appIntro:welcomeText", { APP_NAME })}</Text>
          <Group>
            <Button
              onClick={() => void router.push(`/${locale}/profile/create`)}
            >
              {t("appIntro:startIntro")}
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
        <Grid.Col
          span={{
            xs: 6,
            xl: 7,
          }}
        >
          {renderLeftColumn()}
        </Grid.Col>
        <Grid.Col span="auto">{renderRightColumn()}</Grid.Col>
      </Grid>
    </OnlyControlsLayout>
  );
};

export default ProfileSetupIntroPage;

export const getStaticProps = makeStaticProperties(["common", "appIntro"]);

export { getStaticPaths };
