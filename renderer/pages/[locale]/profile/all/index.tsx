import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import useGetAllProfiles from "@/hooks/getAllProfiles";

import DefaultLayout, { headerHeight } from "@components/layouts/Default";
import {
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/profile";
import getFormattedName from "@/utils/misc/getFormattedName";
import Stat from "@/components/content/Stat";
import { APP_NAME, DATE_OPTIONS } from "@/utils/constants";
import ProfileSettingsMenu from "@/components/content/profile/ProfileSettingsMenu";

const ProfileAllPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const profiles = useGetAllProfiles();
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>(
    undefined,
  );

  useEffect(() => {
    setActiveProfile(profiles ? profiles[0] : undefined);
  }, [profiles]);

  return (
    <DefaultLayout withNavbarOpen>
      <Grid gutter={0}>
        <Grid.Col span={3}>
          <ScrollArea.Autosize
            mih={`calc(100dvh - ${headerHeight}px)`}
            mah={`calc(100dvh - ${headerHeight}px)`}
          >
            {profiles?.map((profile) => (
              <NavLink
                autoContrast
                active={activeProfile?.uuid === profile.uuid}
                key={profile.uuid}
                leftSection={<ProfileAvatar profile={profile} size="sm" />}
                label={profile.username}
                onClick={() => setActiveProfile(profile)}
                variant="filled"
              />
            ))}
          </ScrollArea.Autosize>
        </Grid.Col>
        <Grid.Col span={9}>
          <ScrollArea.Autosize mah={`calc(100dvh - ${headerHeight}px)`}>
            {profiles && activeProfile ? (
              <>
                <Flex align="start" justify="end">
                  <ProfileSettingsMenu profile={activeProfile} />
                </Flex>
                <Card component={Stack} radius={0}>
                  <Group>
                    <ProfileAvatar profile={activeProfile} size="xl" />
                    <div>
                      <Title>{getFormattedName(activeProfile.name)} </Title>
                      <Text opacity={0.7}>@{activeProfile.username}</Text>
                    </div>
                  </Group>
                  <Text>
                    {t("profile:playingWithAppSince", {
                      APP_NAME,
                      DATE: new Date(
                        activeProfile.createdAt,
                      ).toLocaleDateString(locale, DATE_OPTIONS),
                    })}
                  </Text>
                  <Divider />
                  <Group grow>
                    <Stat
                      text={t("stats.matches")}
                      value={activeProfile.statistics.playedMatches}
                      decimalScale={2}
                    />
                    <Stat
                      text={t("stats.avg")}
                      value={activeProfile.statistics.average}
                      decimalScale={2}
                    />
                    <Stat
                      text={t("stats.dartsThrown")}
                      value={activeProfile.statistics.thrownDarts}
                      decimalScale={2}
                    />
                    <Stat
                      text={t("stats.180s")}
                      value={activeProfile.statistics.thrownOneHundredAndEighty}
                      decimalScale={2}
                    />
                  </Group>
                </Card>
              </>
            ) : undefined}
          </ScrollArea.Autosize>
        </Grid.Col>
      </Grid>
    </DefaultLayout>
  );
};

export default ProfileAllPage;

export const getStaticProps = makeStaticProperties(["common", "profile"]);

export { getStaticPaths };
