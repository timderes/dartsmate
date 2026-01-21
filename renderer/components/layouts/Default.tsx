import {
  ActionIcon,
  AppShell,
  Container,
  Flex,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useFullscreen } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconMenu2,
  IconMinus,
  IconSquare,
  IconSquareX,
  IconSquaresDiagonal,
} from "@tabler/icons-react";
import SharedConfirmModalProps from "@utils/modals/sharedConfirmModalProps";
import { useTranslation } from "next-i18next";
import { APP_NAME } from "@utils/constants";
import sendIPC from "@utils/ipc/send";

import Navbar from "./shared/Navbar";

type DefaultLayoutProps = {
  children: React.ReactNode;
  fluid?: boolean;
  withNavbarOpen: boolean;
};

export const headerHeight = 32; // px
export const navbarWidth = 200; // px
export const navbarIconSize = 24; // px

const DefaultLayout = ({
  children,
  withNavbarOpen = true,
  fluid = true,
}: DefaultLayoutProps) => {
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();
  const [isNavbarOpened, { toggle: toggleNavbar }] =
    useDisclosure(withNavbarOpen);
  const { t } = useTranslation();

  const handleCloseApp = () =>
    modals.openConfirmModal({
      title: t("confirmCloseAppTitle", { APP_NAME }),
      children: <Text>{t("confirmCloseAppText")}</Text>,
      labels: { confirm: t("yes"), cancel: t("cancel") },
      onConfirm: () => sendIPC("close-app"),
      ...SharedConfirmModalProps,
    });

  return (
    <AppShell
      header={{
        height: headerHeight,
      }}
      navbar={{
        width: {
          // `md` is the smallest used breakpoint since the app requires 1024x768 pixels
          md: navbarWidth,
          lg: navbarWidth,
          xl: navbarWidth,
        },
        breakpoint: "xs",
        collapsed: {
          mobile: !isNavbarOpened,
          desktop: !isNavbarOpened,
        },
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
      <Navbar />
      <AppShell.Main>
        <Container
          px={{
            xs: 0,
          }}
          fluid={fluid}
        >
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default DefaultLayout;
