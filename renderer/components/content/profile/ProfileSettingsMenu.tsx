import { useTranslation } from "next-i18next";

import { ActionIcon, Menu } from "@mantine/core";
import {
  IconChartBarOff,
  IconEdit,
  IconFileExport,
  IconUserEdit,
  IconUserStar,
  IconUserX,
} from "@tabler/icons-react";

const ProfileSettingsMenu = () => {
  const { t } = useTranslation(["profile"]);

  return (
    <Menu shadow="md" width={250} withArrow>
      <Menu.Target>
        <ActionIcon variant="filled" radius={0}>
          <IconEdit />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconUserEdit size={14} />}>
          {t("profile:editProfile")}
        </Menu.Item>
        <Menu.Item leftSection={<IconFileExport size={14} />}>
          {t("profile:exportProfile")}
        </Menu.Item>
        <Menu.Item leftSection={<IconChartBarOff size={14} />}>
          {t("profile:resetProfileStatistics")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          // disabled={!activeProfile.isGuestProfile}
          leftSection={<IconUserStar size={14} />}
        >
          {t("profile:setAsDefaultProfile")}
        </Menu.Item>
        <Menu.Item color="red" leftSection={<IconUserX size={14} />}>
          {t("profile:deleteProfile")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProfileSettingsMenu;
