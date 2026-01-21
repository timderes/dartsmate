import { useTranslation } from "next-i18next";

import {
  ActionIcon,
  AppShell,
  Flex,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useFullscreen } from "@mantine/hooks";

import {
  IconMenu2,
  IconMinus,
  IconSquare,
  IconSquaresDiagonal,
  IconSquareX,
} from "@tabler/icons-react";

import { useNavbar } from "@/contexts/NavbarContext";

import SharedConfirmModalProps from "@/utils/modals/sharedConfirmModalProps";
import { APP_NAME } from "@/utils/constants";
import sendIPC from "@/utils/ipc/send";

import { headerHeight, navbarIconSize } from "../Default";

const AppHeader = () => {
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { t } = useTranslation();
  const { toggleNavbar } = useNavbar();

  const handleCloseApp = () =>
    modals.openConfirmModal({
      title: t("confirmCloseAppTitle", { APP_NAME }),
      children: <Text>{t("confirmCloseAppText")}</Text>,
      labels: { confirm: t("yes"), cancel: t("cancel") },
      onConfirm: () => sendIPC("close-app"),
      ...SharedConfirmModalProps,
    });

  return (
    <AppShell.Header className="draggable">
      <Flex
        align="center"
        justify="space-between"
        h={headerHeight}
        mah={headerHeight}
        px="sm"
        w="100%"
      >
        <Group gap="lg">
          <Tooltip label={t("toggleNavigation")} withArrow>
            <ActionIcon
              color="gray"
              size={navbarIconSize}
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
        <Group gap="lg">
          {!fullscreen ? (
            <Tooltip label={t("minimizeApp")} withArrow>
              <ActionIcon
                c="dimmed"
                size={navbarIconSize}
                onClick={() => sendIPC("minimize-app-window")}
                variant="transparent"
              >
                <IconMinus />
              </ActionIcon>
            </Tooltip>
          ) : null}
          <Tooltip
            label={fullscreen ? t("windowedMode") : t("fullscreenMode")}
            withArrow
          >
            <ActionIcon
              c="dimmed"
              size={navbarIconSize}
              onClick={() => void toggleFullscreen()}
              variant="transparent"
            >
              {fullscreen ? <IconSquaresDiagonal /> : <IconSquare />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("closeApp")} withArrow>
            <ActionIcon
              c="dimmed"
              size={navbarIconSize}
              onClick={() => handleCloseApp()}
              variant="transparent"
            >
              <IconSquareX />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
    </AppShell.Header>
  );
};

export default AppHeader;
