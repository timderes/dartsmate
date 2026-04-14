import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import {
  Accordion,
  Button,
  Container,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
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
import type { UpdateInfo } from "electron-updater";

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
          window.ipc
            .getUpdateInfo()
            .then((updateInfo: UpdateInfo) => {
              modals.open({
                modalId: "changelog-modal",
                fullScreen: true,
                withCloseButton: false, // Only close with next button
                title: t("changelogTitle", {
                  VERSION: latestSeenVersion ?? APP_VERSION,
                }),

                children: (
                  <>
                    {updateInfo?.releaseNotes &&
                    Array.isArray(updateInfo.releaseNotes) &&
                    updateInfo.releaseNotes.length > 0 ? (
                      updateInfo.releaseNotes.map((noteObj, index) => (
                        <div key={index} style={{ marginBottom: 24 }}>
                          <Text fw={700} mb={4}>
                            {noteObj.version && (
                              <>
                                {t("versionLabel", {
                                  VERSION: noteObj.version,
                                })}
                              </>
                            )}
                          </Text>
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                typeof noteObj.note === "string"
                                  ? noteObj.note
                                  : String(noteObj.note),
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <Text fs="italic">{t("changelogNoInfo")}</Text>
                    )}
                    <Button onClick={() => modals.close("changelog-modal")}>
                      {t("next")}
                    </Button>
                  </>
                ),
                onClose: () => {
                  window.ipc.setLatestSeenChangeLogVersion(APP_VERSION);
                },
              });
            })
            .catch((error) => {
              console.error("Error fetching update info:", error);
              Logger.error("Error fetching update info:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching latest seen changelog version:", error);
        Logger.error("Error fetching latest seen changelog version:", error);
      });
  }, [t]);

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
