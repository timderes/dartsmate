import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import DefaultLayout from "@/components/layouts/Default";
import {
  Accordion,
  Container,
  Divider,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import HeaderGreeting from "@/components/HeaderGreeting";
import useDefaultProfile from "hooks/getDefaultProfile";
import { useTranslation } from "next-i18next";
import GameModeCard from "@/components/content/GameModeCard";
import { IconBarbell, IconTarget } from "@tabler/icons-react";

const IndexPage = () => {
  const defaultProfile = useDefaultProfile();
  const { t } = useTranslation();

  const GAME_MODES = [
    {
      id: "MATCH_501",
      text: t("gameModes:match.text"),
      title: t("gameModes:match.title"),
      type: "MATCH",
    },
    {
      id: "AROUND_THE_CLOCK",
      text: t("gameModes:aroundTheClock.text"),
      title: t("gameModes:aroundTheClock.title"),
      type: "TRAINING",
    },
    {
      id: "BOBS_27",
      text: t("gameModes:bobs27.text"),
      title: t("gameModes:bobs27.title"),
      type: "TRAINING",
    },
    {
      id: "DOUBLES_TRAINING",
      text: t("gameModes:doublesTraining.text"),
      title: t("gameModes:doublesTraining.title"),
      type: "TRAINING",
    },
    {
      id: "SINGLES_TRAINING",
      text: t("gameModes:singlesTraining.text"),
      title: t("gameModes:singlesTraining.title"),
      type: "TRAINING",
    },
    {
      id: "SCORE_TRAINING",
      text: t("gameModes:scoreTraining.text"),
      title: t("gameModes:scoreTraining.title"),
      type: "TRAINING",
    },
    {
      id: "SHANGHAI",
      text: t("gameModes:shanghai.text"),
      title: t("gameModes:shanghai.title"),
      type: "TRAINING",
    },
  ];

  const MATCH_MODES = GAME_MODES.filter((game) => game.type === "MATCH");
  const TRAINING_MODES = GAME_MODES.filter((game) => game.type === "TRAINING");

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
                    <GameModeCard
                      key={mode.id}
                      text={mode.text}
                      title={mode.title}
                    />
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
                    <GameModeCard
                      key={mode.id}
                      text={mode.text}
                      title={mode.title}
                    />
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
