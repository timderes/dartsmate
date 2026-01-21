import { useTranslation } from "next-i18next";

import {
  ActionIcon,
  AppShell,
  Flex,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";

import { IconMenu2 } from "@tabler/icons-react";

import { useNavbar } from "@/contexts/NavbarContext";
import { APP_NAME, APP_SHELL } from "@/utils/constants";

import WindowControls from "./WindowControls";

const AppHeader = () => {
  const { t } = useTranslation();
  const { toggleNavbar } = useNavbar();

  return (
    <AppShell.Header className="draggable">
      <Flex
        align="center"
        justify="space-between"
        h={APP_SHELL.HEADER_HEIGHT}
        mah={APP_SHELL.HEADER_HEIGHT}
        px="sm"
        w="100%"
      >
        <Group gap="lg">
          <Tooltip label={t("toggleNavigation")} withArrow>
            <ActionIcon
              color="gray"
              size={APP_SHELL.ICON_SIZE}
              onClick={toggleNavbar}
              variant="transparent"
            >
              <IconMenu2 />
            </ActionIcon>
          </Tooltip>
          <Text fz="sm" ta="center" tt="uppercase">
            {APP_NAME}
          </Text>
        </Group>
        <WindowControls />
      </Flex>
    </AppShell.Header>
  );
};

export default AppHeader;
