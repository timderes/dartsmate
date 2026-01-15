import { useTranslation } from "next-i18next";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import useGetAllProfiles from "@/hooks/getAllProfiles";

import DefaultLayout, { headerHeight } from "@components/layouts/Default";
import { Grid, NavLink, ScrollArea } from "@mantine/core";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import { useEffect, useState } from "react";
import type { Profile } from "@/types/profile";

const ProfileAllPage = () => {
  const { t } = useTranslation();
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
            bg="dark.8"
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
              />
            ))}
          </ScrollArea.Autosize>
        </Grid.Col>
        <Grid.Col span={9}>
          <ScrollArea.Autosize mah={`calc(100dvh - ${headerHeight}px)`}>
            {profiles && activeProfile ? (
              <div>
                <h2>{activeProfile.username}</h2>
              </div>
            ) : undefined}
          </ScrollArea.Autosize>
        </Grid.Col>
      </Grid>
    </DefaultLayout>
  );
};

export default ProfileAllPage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
