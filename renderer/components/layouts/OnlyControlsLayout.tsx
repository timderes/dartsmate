import {
  ActionIcon,
  AppShell,
  Flex,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import {
  IconMinus,
  IconSquare,
  IconSquareX,
  IconSquaresDiagonal,
} from "@tabler/icons-react";
import { useTranslation } from "next-i18next";

import { APP_NAME } from "utils/constants";
import sendIPC from "utils/ipc/send";
import { navbarIconSize, headerHeight } from "./Default";

type OnlyControlsLayoutProps = {
  children: React.ReactNode;
};

const OnlyControlsLayout = ({ children }: OnlyControlsLayoutProps) => {
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();

  const { t } = useTranslation(["common"]);

  return (
    <AppShell
      header={{
        height: headerHeight,
      }}
    >
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
                onClick={() => sendIPC("close-app")}
                variant="transparent"
              >
                <IconSquareX />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default OnlyControlsLayout;
