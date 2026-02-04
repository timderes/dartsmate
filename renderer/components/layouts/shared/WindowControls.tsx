import { useTranslation } from "next-i18next";
import { modals } from "@mantine/modals";
import { useFullscreen } from "@mantine/hooks";
import sendIPC from "@/utils/ipc/send";
import SharedConfirmModalProps from "@/utils/modals/sharedConfirmModalProps";
import { ActionIcon, Flex, Group, Text, Tooltip } from "@mantine/core";
import {
  IconMinus,
  IconSquare,
  IconSquaresDiagonal,
  IconSquareX,
} from "@tabler/icons-react";
import { APP_NAME, APP_SHELL } from "@/utils/constants";

/**
 * The window control buttons to minimize, toggle fullscreen and close the app window.
 */
const WindowControls = () => {
  const { t } = useTranslation();
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen();

  const handleCloseApp = () =>
    modals.openConfirmModal({
      title: t("confirmCloseAppTitle", { APP_NAME }),
      children: <Text>{t("confirmCloseAppText")}</Text>,
      labels: { confirm: t("yes"), cancel: t("cancel") },
      onConfirm: () => sendIPC("close-app"),
      ...SharedConfirmModalProps,
    });

  return (
    <Group
      component={Flex}
      align="center"
      justify="end"
      h={APP_SHELL.HEADER_HEIGHT}
      gap="lg"
    >
      {!fullscreen ? (
        <Tooltip label={t("minimizeApp")} withArrow>
          <ActionIcon
            c="dimmed"
            size={APP_SHELL.ICON_SIZE}
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
          size={APP_SHELL.ICON_SIZE}
          onClick={() => void toggleFullscreen()}
          variant="transparent"
        >
          {fullscreen ? <IconSquaresDiagonal /> : <IconSquare />}
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t("closeApp")} withArrow>
        <ActionIcon
          c="dimmed"
          size={APP_SHELL.ICON_SIZE}
          onClick={() => handleCloseApp()}
          variant="transparent"
        >
          <IconSquareX />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export default WindowControls;
