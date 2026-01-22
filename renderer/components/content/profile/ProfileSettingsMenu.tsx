import { useTranslation } from "next-i18next";

import { ActionIcon, Menu, type MenuProps, Text } from "@mantine/core";
import {
  IconChartBarOff,
  IconEdit,
  IconFileExport,
  IconUserEdit,
  IconUserStar,
  IconUserX,
} from "@tabler/icons-react";
import type { Profile } from "@/types/profile";
import { useRouter } from "next/router";
import { modals } from "@mantine/modals";
import SharedConfirmModalProps from "@/utils/modals/sharedConfirmModalProps";
import updateProfileFromDatabase from "@/lib/db/profiles/updateProfile";
import deleteProfileFromDatabase from "@/lib/db/profiles/deleteProfile";
import Logger from "electron-log";
import useDefaultProfile from "@/hooks/getDefaultProfile";

type ProfileSettingsMenuProps = {
  profile: Profile;
} & MenuProps;

const ProfileSettingsMenu = ({
  profile,
  ...props
}: ProfileSettingsMenuProps) => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation(["common", "profile"]);
  const router = useRouter();
  const defaultProfile = useDefaultProfile();

  const handleEditProfile = (uuid: Profile["uuid"]) => {
    void router.push(`/${locale}/profile/edit?uuid=${uuid}`);
  };

  const handleResetProfileStatistics = (profile: Profile) => {
    modals.openConfirmModal({
      ...SharedConfirmModalProps,
      title: t("profile:resetProfileStatisticsConfirmModal.title", {
        FIRST_NAME: profile.name.firstName,
      }),
      children: (
        <Text>
          {t("profile:resetProfileStatisticsConfirmModal.text", {
            NUMBER_OF_MATCHES: profile.statistics.playedMatches,
            count: profile.statistics.playedMatches,
          })}
        </Text>
      ),
      labels: {
        confirm: t("yes"),
        cancel: t("cancel"),
      },
      onConfirm: () => {
        updateProfileFromDatabase(
          {
            ...profile,
            statistics: {
              playedMatches: 0,
              playedTrainings: 0,
              thrownDarts: 0,
              thrownOneHundredAndEighty: 0,
              average: 0,
            },
            updatedAt: Date.now(),
          },
          profile.uuid,
        )
          .then(() => {
            Logger.info(
              "Statistics for profile with UUID `",
              profile.uuid,
              "` have been reset successfully.",
            );
            void router.reload();
          })
          .catch((err) => {
            Logger.error("Failed to reset profile statistics. Error:", err);
          });
      },
    });
  };

  const handleDeleteProfile = (profile: Profile) => {
    modals.openConfirmModal({
      ...SharedConfirmModalProps,
      title: t("profile:deleteProfileConfirmModal.title", {
        FIRST_NAME: profile.name.firstName,
      }),
      children: <Text>{t("profile:deleteProfileConfirmModal.text")}</Text>,
      labels: {
        confirm: t("yes"),
        cancel: t("cancel"),
      },
      onConfirm: () => {
        deleteProfileFromDatabase(profile.uuid)
          .then(() => {
            Logger.info(
              "Profile with UUID `",
              profile.uuid,
              "` deleted successfully.",
            );
            void router.reload();
          })
          .catch((err) => {
            Logger.error("Failed to delete profile. Error:", err);
          });
      },
    });
  };

  const handleSetProfileAsDefault = (profile: Profile) => {
    try {
      window.ipc.setDefaultProfileUUID(profile.uuid);

      Logger.info(
        "Profile with UUID `",
        profile.uuid,
        "` set as default profile.",
      );
    } catch (error) {
      Logger.error("Failed to set a new default profile. Error:", error);
    } finally {
      void router.reload();
    }
  };

  return (
    <Menu shadow="md" width={250} withArrow {...props}>
      <Menu.Target>
        <ActionIcon variant="filled" radius={0}>
          <IconEdit />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUserEdit size={14} />}
          onClick={() => handleEditProfile(profile.uuid)}
        >
          {t("profile:editProfile")}
        </Menu.Item>
        {/* TODO: Add exporting profiles with a future update */}
        <Menu.Item leftSection={<IconFileExport size={14} />} disabled>
          {t("profile:exportProfile")}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconChartBarOff size={14} />}
          onClick={() => handleResetProfileStatistics(profile)}
        >
          {t("profile:resetProfileStatistics")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          disabled={profile.uuid === defaultProfile?.uuid}
          leftSection={<IconUserStar size={14} />}
          onClick={() => handleSetProfileAsDefault(profile)}
        >
          {t("profile:setAsDefaultProfile")}
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconUserX size={14} />}
          onClick={() => handleDeleteProfile(profile)}
        >
          {t("profile:deleteProfile")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProfileSettingsMenu;
