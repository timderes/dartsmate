import SettingsLayout from "@/components/layouts/SettingsLayout";
import {
  Button,
  Paper,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";

import { getStaticPaths, makeStaticProperties } from "@/lib/getStatic";
import { useTranslation } from "next-i18next";
import { modals } from "@mantine/modals";
import deleteAllMatchesFromDatabase from "@/lib/db/matches/deleteAllMatches";
import { notifications } from "@mantine/notifications";
import deleteAllProfilesFromDatabase from "@/lib/db/profiles/deleteAllProfiles";
import { useRouter } from "next/router";
import formatLocalizedRoute from "utils/navigation/formatLocalizedRoute";
import { useLocalStorage, useSessionStorage } from "@mantine/hooks";
import SharedConfirmModalProps from "utils/modals/sharedConfirmModalProps";

// TODO: Lazy code here. Refactor later
const storagePage = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const theme = useMantineTheme();
  const router = useRouter();

  const [, , removeColorScheme] = useLocalStorage({
    key: "mantine-color-scheme-value",
  });

  const [, , removeCurrentMatch] = useSessionStorage({
    key: "currentMatch",
  });

  const handleDeleteAllProfiles = () => {
    modals.openConfirmModal({
      title: t("settings:storage.modals.confirmDeleteAllProfilesTitle"),
      children: (
        <Text size="sm">
          {t("settings:storage.modals.confirmDeleteAllProfilesText")}
        </Text>
      ),

      labels: { confirm: t("confirm"), cancel: t("cancel") },
      onConfirm: () =>
        void deleteAllProfilesFromDatabase().then(
          () =>
            notifications.show({
              title: t(
                "settings:storage.notifications.successDeleteAllProfilesTitle"
              ),
              message: t(
                "settings:storage.notifications.successDeleteAllProfilesText"
              ),
            }),

          void router
            .push(
              formatLocalizedRoute({
                locale,
                route: "/profileSetupIntro",
              })
            )
            .then(() => {
              window.ipc.removeDefaultProfileUUID();
            })
        ),
      ...SharedConfirmModalProps,
    });
  };

  const handleDeleteAllMatches = () =>
    modals.openConfirmModal({
      title: t("settings:storage.modals.confirmDeleteAllMatchesTitle"),
      children: (
        <Text size="sm">
          {t("settings:storage.modals.confirmDeleteAllMatchesText")}
        </Text>
      ),

      labels: { confirm: t("confirm"), cancel: t("cancel") },
      onConfirm: () =>
        void deleteAllMatchesFromDatabase().then(() =>
          notifications.show({
            title: t(
              "settings:storage.notifications.successDeleteAllMatchesTitle"
            ),
            message: t(
              "settings:storage.notifications.successDeleteAllMatchesText"
            ),
          })
        ),
      ...SharedConfirmModalProps,
    });

  const handleResetApp = () => {
    modals.openConfirmModal({
      title: t("settings:storage.modals.confirmResetAppTitle"),
      children: (
        <Text size="sm">
          {t("settings:storage.modals.confirmResetAppText")}
        </Text>
      ),

      labels: { confirm: t("confirm"), cancel: t("cancel") },
      onConfirm: () => {
        window.ipc.removeAppSettings();
        removeColorScheme();
        removeCurrentMatch();
        void deleteAllMatchesFromDatabase();
        void deleteAllProfilesFromDatabase();

        notifications.show({
          title: t("settings:storage.notifications.successResetAppTitle"),
          message: t("settings:storage.notifications.successResetAppText"),
        });

        void router.push(
          formatLocalizedRoute({
            locale,
            route: "/profileSetupIntro",
          })
        );
      },
      ...SharedConfirmModalProps,
    });
  };

  return (
    <SettingsLayout route="storage">
      <Stack>
        <Title>{t("settings:storage.title")}</Title>
        <Text>{t("settings:storage.text")}</Text>
        <Paper
          p="lg"
          withBorder
          style={{
            borderColor: theme.colors.red[7],
          }}
        >
          <Stack>
            <Title fz="h3">{t("settings:storage.dangerZoneTitle")}</Title>
            <Text mb="lg">{t("settings:storage.dangerZoneText")}</Text>
            <Button variant="filled" onClick={() => handleDeleteAllProfiles()}>
              {t("settings:storage.dangerZone.btn.label.deleteAllProfiles")}
            </Button>
            <Button variant="filled" onClick={() => handleDeleteAllMatches()}>
              {t("settings:storage.dangerZone.btn.label.deleteAllMatches")}
            </Button>
            <Button variant="filled" onClick={() => handleResetApp()}>
              {t("settings:storage.dangerZone.btn.label.resetApp")}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </SettingsLayout>
  );
};

export default storagePage;

export const getStaticProps = makeStaticProperties(["common", "settings"]);

export { getStaticPaths };
