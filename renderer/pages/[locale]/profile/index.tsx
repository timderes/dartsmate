import { useTranslation } from "next-i18next";
import type { NextPage } from "next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import DefaultLayout from "@/components/layouts/Default";
import {
  ActionIcon,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useRouter } from "next/router";
import Stat from "@/components/content/Stat";
import getFormattedName from "@utils/misc/getFormattedName";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import useDefaultProfile from "@/hooks/getDefaultProfile";

const ProfileIndexPage: NextPage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const router = useRouter();

  const defaultProfile = useDefaultProfile();

  if (!defaultProfile) {
    return <DefaultLayout withNavbarOpen>UNABLE TO LOAD PROFILE</DefaultLayout>;
  }

  const stats = defaultProfile.statistics;

  return (
    <DefaultLayout withNavbarOpen>
      <Paper component="header" radius={0} p="xl" m={0}>
        <Stack gap="lg">
          <Group align="start">
            <ProfileAvatar
              color={defaultProfile.color}
              profile={defaultProfile}
              size="xl"
              variant="filled"
            />
            <Stack gap={0}>
              <Title>{getFormattedName(defaultProfile.name)}</Title>
              <Text c="dimmed">{defaultProfile.username}</Text>
            </Stack>
            <Group ml="auto">
              <Tooltip label={t("profile:editProfile")} withArrow>
                <ActionIcon
                  onClick={() => void router.push(`/${locale}/profile/edit`)}
                  variant="filled"
                >
                  <IconEdit />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          <Paper>
            <Text
              fs={defaultProfile.bio ? "" : "italic"}
              c={defaultProfile.bio ? "" : "dimmed"}
            >
              {defaultProfile.bio ||
                t("profile:emptyBioPlaceholder", {
                  FIRST_NAME: defaultProfile.name.firstName,
                })}
            </Text>
          </Paper>
          <Divider />
          <Group gap="xl" ta="center" grow>
            <Stat text={t("stats.darts")} value={stats.thrownDarts} />
            <Stat
              text={t("stats.180s")}
              value={stats.thrownOneHundredAndEighty}
            />
            <Stat text={t("stats.matches")} value={stats.playedMatches} />
            <Stat text={t("stats.trainings")} value={stats.playedTrainings} />
            <Stat
              text={t("stats.avg")}
              value={stats.average}
              numberProps={{
                decimalScale: 2,
              }}
            />
          </Group>
          <Divider />
        </Stack>
      </Paper>
    </DefaultLayout>
  );
};

export default ProfileIndexPage;

export const getStaticProps = makeStaticProperties(["common", "profile"]);

export { getStaticPaths };
