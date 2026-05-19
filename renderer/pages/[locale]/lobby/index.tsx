import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import {
  ActionIcon,
  Button,
  Divider,
  Drawer,
  Flex,
  Grid,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHelpCircleFilled,
  IconUserMinus,
  IconUserPlus,
  IconUserQuestion,
} from "@tabler/icons-react";
import DefaultLayout from "@components/layouts/Default";
import EmptyState from "@components/content/EmptyState";
import ProfileAvatar from "@components/content/ProfileAvatar";
import getAllProfilesFromDatabase from "@lib/db/profiles/getAllProfiles";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import getFormattedName from "@utils/misc/getFormattedName";
import { LEGS, MATCH_SCORE, SETS } from "@utils/constants";
import type { Profile } from "@/types/profile";
import { notifications } from "@mantine/notifications";
import Logger from "electron-log/renderer";
import useDartGameSetup from "@/hooks/useDartGameSetup";

const NewGamePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const game = useDartGameSetup();

  useEffect(() => {
    getAllProfilesFromDatabase()
      .then((profiles) => {
        game.initializeProfiles(profiles);
      })
      .catch((e) => {
        console.error("Error fetching profiles:", e);

        Logger.error("Error fetching profiles:", e);

        notifications.show({
          title: t("lobby:fetchProfilesErrorNotification.title"),
          message: t("lobby:fetchProfilesErrorNotification.message"),
        });
      });

    return () => {
      game.reset();
    };
  }, []);

  const handleStartMatch = () => {
    if (!game.isMatchValid) return;

    game.saveMatchToSession();
    void router.push(`/${locale}/match/playing`);
  };

  const renderPlayer = (profile: Profile) => {
    const isSelected = game.isSelected(profile.uuid);

    return (
      <Group justify="space-between">
        <Group>
          <ProfileAvatar profile={profile} size="lg" />
          <Text>
            {getFormattedName(profile.name)}
            <Text component="span" c="dimmed" display="block" size="xs">
              {profile.username}
            </Text>
          </Text>
        </Group>

        {isSelected ? (
          <Tooltip
            label={t("lobby:removePlayerFromLobby", {
              PLAYER_NAME: profile.username,
            })}
            withArrow
          >
            <ActionIcon
              variant="default"
              onClick={() => game.removePlayer(profile.uuid)}
            >
              <IconUserMinus
                style={{
                  height: rem(18),
                  width: rem(18),
                }}
              />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip
            label={t("lobby:addPlayerToLobby", {
              PLAYER_NAME: profile.username,
            })}
            withArrow
          >
            <ActionIcon
              variant="default"
              onClick={() => game.addPlayer(profile)}
            >
              <IconUserPlus
                style={{
                  height: rem(18),
                  width: rem(18),
                }}
              />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    );
  };

  return (
    <DefaultLayout withNavbarOpen={false}>
      <Drawer opened={opened} onClose={close} title={t("lobby:addPlayer")}>
        <ScrollArea pr="xl">
          <Stack>
            <Button
              onClick={() =>
                void router.push({
                  pathname: `/${locale}/profile/create`,
                  query: { isGuest: true },
                })
              }
            >
              {t("lobby:createGuestPlayer")}
            </Button>
            {game.availableToSelect.map((profile) => (
              <div key={profile.uuid}>{renderPlayer(profile)}</div>
            ))}
          </Stack>
        </ScrollArea>
      </Drawer>
      <Grid gap={0}>
        <Grid.Col span="auto" px="xs">
          <Stack gap="lg">
            <Group>
              <Title>{t("lobby:title.players")}</Title>

              <Button ml="auto" size="xs" onClick={open}>
                {t("lobby:addPlayer")}
              </Button>
            </Group>
            {game.selectedProfiles.map((player) => (
              <div key={player.uuid}>{renderPlayer(player)}</div>
            ))}
            {game.selectedProfiles.length === 0 && (
              <EmptyState
                icon={<IconUserQuestion size={64} opacity={0.6} />}
                title={t("lobby:emptyLobbyState.title")}
                text={t("lobby:emptyLobbyState.text")}
              />
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={4} px="xs">
          <Stack gap="xs">
            <Title>{t("lobby:title.matchSettings")}</Title>
            <NumberInput
              label={t("lobby:score")}
              min={MATCH_SCORE.MIN}
              max={MATCH_SCORE.MAX}
              {...game.matchForm.getInputProps("initialScore")}
            />
            <Group grow>
              <NumberInput
                // `count = 2` to force pluralization
                label={
                  <Flex align="center" gap="xs">
                    <span>{t("set", { count: 2 })}</span>
                    <Tooltip label={t("lobby:setsHelpTooltip")} withArrow>
                      <IconHelpCircleFilled
                        size={20}
                        style={{
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Flex>
                }
                min={SETS.MIN}
                max={SETS.MAX}
                {...game.matchForm.getInputProps("sets")}
              />
              <NumberInput
                label={
                  <Flex align="center" gap="xs">
                    <span>{t("leg", { count: 2 })}</span>
                    <Tooltip label={t("lobby:legsHelpTooltip")} withArrow>
                      <IconHelpCircleFilled
                        size={20}
                        style={{
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Flex>
                }
                min={LEGS.MIN}
                max={LEGS.MAX}
                {...game.matchForm.getInputProps("legs")}
              />
            </Group>
            <Select
              label={t("lobby:checkout")}
              data={[
                {
                  label: t("checkouts.any"),
                  value: "Any",
                },
                {
                  label: t("checkouts.single"),
                  value: "Single",
                },
                {
                  label: t("checkouts.double"),
                  value: "Double",
                },
                {
                  label: t("checkouts.triple"),
                  value: "Triple",
                },
              ]}
              {...game.matchForm.getInputProps("matchCheckout")}
            />
            <Divider />
            <Button
              mt="auto"
              disabled={game.selectedProfiles.length === 0}
              onClick={handleStartMatch}
            >
              {t("lobby:startMatch")}
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    </DefaultLayout>
  );
};

export default NewGamePage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
