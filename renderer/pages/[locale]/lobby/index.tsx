import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import OnlyControlsLayout from "@/components/layouts/OnlyControlsLayout";
import { Grid, ScrollArea, Title } from "@mantine/core";

import { useTranslation } from "next-i18next";

import getAllProfilesFromDatabase from "@/lib/db/profiles/getAllProfiles";
import { useCallback, useEffect } from "react";
import type { SelectableProfile } from "types/profile";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

import LobbySettings from "@/components/content/lobby/LobbySettings";
import { headerHeight } from "@/components/layouts/Default";

/**
 * The page where the user can create a new match.
 */
const NewGamePage: NextPage = () => {
  const { t } = useTranslation();

  const [profiles, profilesActions] = useListState<SelectableProfile>([]);

  const getAllProfiles = useCallback(() => {
    profilesActions.setState([]);
    getAllProfilesFromDatabase()
      .then((profiles) => {
        profiles.forEach((profile) => {
          profilesActions.append({ ...profile, selected: false });
        });
      })
      .catch((err) => {
        notifications.show({
          title: t("error"),
          message: t("lobby:errorFetchingProfiles", { error: err as string }),
        });
      });
  }, [profiles]);

  useEffect(() => {
    void getAllProfiles();
  }, []);

  return (
    <OnlyControlsLayout>
      <Grid type="container" gutter={0}>
        <Grid.Col span={9}>
          <ScrollArea h={`calc(100vh - ${headerHeight}px)`} type="never" p="md">
            <Title fz="h5" tt="uppercase">
              {t("lobby:title.players")}
            </Title>
          </ScrollArea>
        </Grid.Col>
        <Grid.Col span="auto">
          <LobbySettings />
        </Grid.Col>
      </Grid>
    </OnlyControlsLayout>
  );
};

export default NewGamePage;

export const getStaticProps = makeStaticProperties(["common", "lobby"]);

export { getStaticPaths };
