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
  TextInput,
  Title,
} from "@mantine/core";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/profile";
import getFormattedName from "@/utils/misc/getFormattedName";
import Stat from "@/components/content/Stat";
import { APP_NAME, DATE_OPTIONS } from "@/utils/constants";
import ProfileSettingsMenu from "@/components/content/profile/ProfileSettingsMenu";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDebouncedCallback } from "@mantine/hooks";
import useDefaultProfile from "@/hooks/getDefaultProfile";
import { useField } from "@mantine/form";

const ProfileAllPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const allProfiles = useGetAllProfiles();
  const [filteredProfiles, setFilteredProfiles] = useState<
    Profile[] | undefined
  >(undefined);
  const defaultProfile = useDefaultProfile();
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>(
    undefined,
  );

  const search = useField({
    initialValue: "",
    onValueChange: (value) => handleSearch(value),
  });
  useEffect(() => {
    setFilteredProfiles(allProfiles);
    setActiveProfile(defaultProfile ?? undefined);
  }, [allProfiles, defaultProfile]);

  const handleSearch = useDebouncedCallback((query: string) => {
    if (!query.trim()) {
      setFilteredProfiles(allProfiles);
      return;
    }
    const filtered = allProfiles?.filter((profile) =>
      profile.username.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredProfiles(filtered);
  }, 500);

  const handleSetActiveProfile = (profile: Profile) => {
    setActiveProfile(profile);

    setFilteredProfiles(allProfiles);
    search.setValue("");
  };
  return (
    <DefaultLayout withNavbarOpen>
      <Grid gutter={0}>
        <Grid.Col span={3}>
          <ScrollArea.Autosize
            mih={`calc(100dvh - ${headerHeight}px)`}
            mah={`calc(100dvh - ${headerHeight}px)`}
          >
            <NavLink
              autoContrast
              leftSection={<IconSearch />}
              rightSection={
                search.getValue() ? (
                  <IconX onClick={() => search.setValue("")} />
                ) : undefined
              }
              label={
                <TextInput
                  placeholder={t("searchInputPlaceholder")}
                  variant="unstyled"
                  {...search.getInputProps()}
                />
              }
            />
            {filteredProfiles?.map((profile) => (
              <NavLink
                autoContrast
                active={activeProfile?.uuid === profile.uuid}
                key={profile.uuid}
                leftSection={<ProfileAvatar profile={profile} size="sm" />}
                label={profile.username}
                onClick={() => handleSetActiveProfile(profile)}
                variant="filled"
              />
            ))}
          </ScrollArea.Autosize>
        </Grid.Col>
        <Grid.Col span={9}>
          <ScrollArea.Autosize mah={`calc(100dvh - ${headerHeight}px)`}>
            {filteredProfiles && activeProfile ? (
              <>
                <Card component={Stack} radius={0}>
                  <Flex justify="space-between">
                    <Group>
                      <ProfileAvatar profile={activeProfile} size="xl" />
                      <Stack gap={0}>
                        <Title>{getFormattedName(activeProfile.name)} </Title>
                        <Text opacity={0.7}>@{activeProfile.username}</Text>
                      </Stack>
                    </Group>
                    <ProfileSettingsMenu profile={activeProfile} />
                  </Flex>
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
