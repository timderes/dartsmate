import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import { Accordion, Container, SimpleGrid, Stack, Text } from "@mantine/core";
import HeaderGreeting from "@components/HeaderGreeting";
import useDefaultProfile from "@hooks/getDefaultProfile";
import { useTranslation } from "next-i18next";
import GameModeCard from "@components/content/GameModeCard";
import { IconBarbell, IconTarget } from "@tabler/icons-react";
import { MATCH_MODES, TRAINING_MODES } from "@utils/content/gameModes";

const IndexPage = () => {
  const defaultProfile = useDefaultProfile();
  const { t } = useTranslation();

  return (
    <DefaultLayout withNavbarOpen>
      <Container fluid>
        <Stack my="lg">
          <HeaderGreeting firstName={defaultProfile?.name.firstName || ""} />
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
