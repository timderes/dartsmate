import { useTranslation } from "next-i18next";
import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import SettingsLayout from "@/components/layouts/SettingsLayout";
import ProfileAvatar from "@/components/content/ProfileAvatar";
import getFormattedName from "@/utils/misc/getFormattedName";
import { IconUserDown, IconUserEdit, IconUserMinus } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useRouter } from "next/router";
import getDefaultIconSize from "@/utils/misc/getDefaultIconSize";
import log from "electron-log/renderer";
import useDefaultProfile from "@/hooks/getDefaultProfile";
import deleteProfileFromDatabase from "@/lib/db/profiles/deleteProfile";
import SharedConfirmModalProps from "@/utils/modals/sharedConfirmModalProps";
import { useProfile } from "@/contexts/ProfileContext";

const SettingsPage = () => {
  const defaultProfile = useDefaultProfile();
  const { refreshProfile } = useProfile();

  const router = useRouter();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();

  const handleDeleteProfile = () => {
    modals.openConfirmModal({
      title: t("settings:deleteProfile.title"),
      children: <Text>{t("settings:deleteProfile.confirmText")}</Text>,
      labels: {
        confirm: t("settings:deleteProfile.title"),
        cancel: t("cancel"),
      },
      onConfirm: () => {
        if (!defaultProfile) throw new Error("Unable to delete the profile!");

        deleteProfileFromDatabase(defaultProfile.uuid)
          .then(async () => {
            window.ipc.removeDefaultProfileUUID();
            await refreshProfile();
            void router.push(`/${locale}/profileSetupIntro`);
          })
          .catch((e) => {
            log.error("Failed to delete profile. Error:", e);
          });
      },
      ...SharedConfirmModalProps,
    });
  };

  return (
    <SettingsLayout route="/">
      <Stack>
        <Title>{t("profile:step.label.profile")}</Title>
        <Text>{t("settings:profile.text")}</Text>
        {defaultProfile ? (
          <>
            <Group>
              <ProfileAvatar size="lg" profile={defaultProfile} />
              <Stack gap={0}>
                <Text>{getFormattedName(defaultProfile.name)}</Text>
                <Text fz="xs" c="dimmed">
                  {defaultProfile.username}{" "}
                </Text>
              </Stack>
            </Group>
            <Button.Group mt="lg">
              <Button
                onClick={() =>
                  void router.push(
                    `/${locale}/profile/edit?uuid=${defaultProfile.uuid}`,
                  )
                }
                variant="default"
                leftSection={<IconUserEdit style={getDefaultIconSize()} />}
              >
                {t("profile:editProfile")}
              </Button>
              <Button
                disabled
                leftSection={<IconUserDown style={getDefaultIconSize()} />}
                variant="default"
              >
                {t("profile:exportProfile")}
              </Button>
              <Button
                leftSection={<IconUserMinus style={getDefaultIconSize()} />}
                onClick={() => handleDeleteProfile()}
              >
                {t("settings:deleteProfile.title")}
              </Button>
            </Button.Group>
          </>
        ) : (
          <>
            <Group>
              <Skeleton height={64} circle />
              <Text>{t("settings:defaultProfile.notFound")}</Text>
            </Group>
            <Button
              onClick={() => void router.push(`/${locale}/profile/create`)}
            >
              {t("settings:defaultProfile.createButton")}
            </Button>
          </>
        )}
      </Stack>
    </SettingsLayout>
  );
};

export default SettingsPage;

export const getStaticProps = makeStaticProperties([
  "common",
  "profile",
  "settings",
]);

export { getStaticPaths };
