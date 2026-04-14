import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import { Accordion, Container, SimpleGrid, Stack, Text } from "@mantine/core";
import HeaderGreeting from "@components/HeaderGreeting";
import useDefaultProfile from "@hooks/getDefaultProfile";
import { useTranslation } from "next-i18next";
import GameModeCard from "@components/content/GameModeCard";
import { IconBarbell, IconTarget } from "@tabler/icons-react";
import { MATCH_MODES, TRAINING_MODES } from "@utils/content/gameModes";
import { useEffect } from "react";
import { APP_VERSION } from "@/utils/constants";
import { modals } from "@mantine/modals";
import Logger from "electron-log/renderer";

const IndexPage = () => {
  const defaultProfile = useDefaultProfile();
  const { t } = useTranslation();

  // On a first load, check if the app has been updated
  useEffect(() => {
    // Check for latest seen changelog version in the electron store
    // and compare it with the current app version
    window.ipc
      .getLatestSeenChangelogVersion()
      .then((latestSeenVersion) => {
        if (latestSeenVersion !== APP_VERSION) {
          // If the versions are different, it means the user hasn't seen the
          // changelog for the current version
          modals.open({
            modalId: "changelog-modal",
            fullScreen: true,
            title: t("changelogTitle", { VERSION: APP_VERSION }),
            // TODO: Replace with actual changelog content
            children: <Text>UPDATE_CHANGELOG_MESSAGE</Text>,
            onClose: () => {
              window.ipc.setLatestSeenChangeLogVersion(APP_VERSION);
            },
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching latest seen changelog version:", error);
        Logger.error("Error fetching latest seen changelog version:", error);
      });
  }, []);

  return (
    <DefaultLayout withNavbarOpen>
      <Container fluid>
        <Stack my="lg">
          <HeaderGreeting firstName={defaultProfile?.name.firstName ?? ""} />
          <Accordion defaultValue="newMatch" variant="separated">
            <Accordion.Item value="newMatch">
              <Accordion.Control icon={<IconTarget size={20} />}>
                <Text tt="uppercase" fw="bold">
                  {t("routes.newMatch")}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={2}>
                  {MATCH_MODES.map((mode) => (
                    <GameModeCard key={mode.id} gameMode={mode} />
                  ))}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="practice">
              <Accordion.Control icon={<IconBarbell size={20} />}>
                <Text tt="uppercase" fw="bold">
                  {t("routes.practice")}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <SimpleGrid cols={2}>
                  {TRAINING_MODES.map((mode) => (
                    <GameModeCard key={mode.id} gameMode={mode} />
                  ))}
                </SimpleGrid>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Container>
    </DefaultLayout>
  );
};

export default IndexPage;

export const getStaticProps = makeStaticProperties(["common", "gameModes"]);

export { getStaticPaths };
