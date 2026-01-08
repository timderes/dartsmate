import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import DefaultLayout from "@components/layouts/Default";
import {
  Button,
  Divider,
  Grid,
  Stack,
  Title,
} from "@mantine/core";
import type { Profile } from "types/profile";
import { useListState, useSessionStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import type { Match } from "types/match";
import {
  APP_VERSION,
  DEFAULT_MATCH_SETTINGS,
} from "@utils/constants";
import { v4 as getUUID } from "uuid";
import getAllProfilesFromDatabase from "@lib/db/profiles/getAllProfiles";
import { notifications } from "@mantine/notifications";

import { MatchSettingsForm } from "@components/lobby/MatchSettingsForm";
import { PlayerSelectionList } from "@components/lobby/PlayerSelectionList";

const NewGamePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const [selectedProfiles, selectedProfilesActions] = useListState<Profile>([]);
  const [availableProfiles, availableProfilesActions] = useListState<Profile>(
    [],
  );

  const getAllProfiles = () =>
    getAllProfilesFromDatabase()
      .then((profiles) => {
        availableProfilesActions.setState(profiles);
      })
      .catch((e) => {
        notifications.show({
          title: "Error!",
          message: String(e),
        });
      });

  const router = useRouter();

  const [, setMatchStorage] = useSessionStorage<Match>({
    key: "currentMatch",
    defaultValue: undefined,
  });

  useEffect(() => {
    selectedProfilesActions.setState([]);
    availableProfilesActions.setState([]);
    void getAllProfiles();
  }, []);

  const uuid = getUUID();

  const matchSettings = useForm<Match>({
    initialValues: {
      appVersion: APP_VERSION,
      createdAt: Date.now(),
      initialScore: DEFAULT_MATCH_SETTINGS.SCORE,
      matchCheckout: DEFAULT_MATCH_SETTINGS.CHECKOUT,
      matchStatus: DEFAULT_MATCH_SETTINGS.STATUS,
      matchMode: "local",
      verificationMode: "social",
      uuid: uuid,
      players: [],
      updatedAt: Date.now(),
      legs: DEFAULT_MATCH_SETTINGS.LEGS,
      sets: DEFAULT_MATCH_SETTINGS.SETS,
    },
  });

  const handleRemovePlayer = (uuid: Profile["uuid"]): void => {
    const updatedProfiles = selectedProfiles.filter(
      (profile) => profile.uuid !== uuid,
    );
    selectedProfilesActions.setState(updatedProfiles);

    matchSettings.setValues({
      players: updatedProfiles.map((profile) => ({
        ...profile,
        scoreLeft: -1,
        isWinner: false,
        rounds: [],
        legsWon: 0,
        setsWon: 0,
      })),
    });
  };

  const handleAddPlayer = (profile: Profile): void => {
    selectedProfilesActions.append(profile);
    const updatedProfiles = [...selectedProfiles, profile];

    matchSettings.setValues({
      players: updatedProfiles.map((profile) => ({
        ...profile,
        scoreLeft: -1,
        isWinner: false,
        rounds: [],
        legsWon: 0,
        setsWon: 0,
      })),
    });
  };

  const handleStartMatch = (): void => {
    if (!matchSettings.isValid()) return;

    setMatchStorage(matchSettings.values);
    void router.push(`/${locale}/match/playing`);
  };

  return (
    <DefaultLayout withNavbarOpen={false}>
      <Grid gutter={0}>
        <Grid.Col span="auto" px="xs">
          <PlayerSelectionList
            selectedProfiles={selectedProfiles}
            availableProfiles={availableProfiles}
            onAdd={handleAddPlayer}
            onRemove={handleRemovePlayer}
            onCreateGuest={() =>
              void router.push({
                pathname: `/${locale}/profile/create`,
                query: { isGuest: true },
              })
            }
          />
        </Grid.Col>
        <Grid.Col span={4} px="xs" h="100%">
          <Stack gap="xs">
            <Title>{t("lobby:title.matchSettings")}</Title>
            {/* The title is duplicated inside MatchSettingsForm if I'm not careful.
                Let's check MatchSettingsForm content. It has a Title.
                I should probably remove the Title here or there.
                In MatchSettingsForm.tsx: <Title>{t("lobby:title.matchSettings")}</Title>
                So I will remove it here.
            */}
             <MatchSettingsForm form={matchSettings} />
            
            <Divider />
            <Button
              disabled={selectedProfiles.length === 0}
              onClick={() => handleStartMatch()}
              mt="auto"
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
