import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import {
  AppShell,
  type AppShellNavbarProps,
  Divider,
  NavLink,
  ScrollAreaAutosize,
  Stack,
  Text,
} from "@mantine/core";
import { upperFirst, useNetwork, useOs } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import ChangelogModal from "@/components/updater/ChangelogModal";
import { APP_VERSION } from "@utils/constants";

import navbarRoutes from "@utils/content/navbarRoutes";
import formatLocalizedRoute from "@utils/navigation/formatLocalizedRoute";

/**
 * The navigation sidebar displaying the app routes.
 */
const AppNavbar = ({ ...props }: AppShellNavbarProps) => {
  const router = useRouter();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const clientOs = useOs();
  const networkStatus = useNetwork();

  const isActiveRoute = (route: string) => {
    const currentRoute = router.asPath;
    const localizedRoute = formatLocalizedRoute({
      locale,
      route,
    });

    // Check if the current route is exactly equal to the localized one.
    // Also returns `true` if the current route is sub-route of base route.
    return (
      currentRoute === localizedRoute ||
      currentRoute.startsWith(`${localizedRoute}/`)
    );
  };

  const isIndexRoute = isActiveRoute("/");

  const openChangelogModal = () => {
    modals.open({
      modalId: "changelog-modal",
      fullScreen: true,
      withCloseButton: false,
      title: t("changelogTitle", { VERSION: APP_VERSION }),
      children: <ChangelogModal />,
      onClose: () => {
        window.ipc.setLatestSeenChangelogVersion(APP_VERSION);
      },
    });
  };

  return (
    <AppShell.Navbar {...props}>
      <AppShell.Section component={ScrollAreaAutosize} grow>
        {navbarRoutes.map(({ icon, label, route }) => (
          <NavLink
            active={isActiveRoute(route)}
            key={route}
            label={t(label)}
            leftSection={icon}
            variant="filled"
            onClick={() =>
              void router.push(
                formatLocalizedRoute({
                  locale,
                  route,
                }),
              )
            }
          />
        ))}
      </AppShell.Section>
      <Divider />
      <AppShell.Section p="lg">
        <Stack c="dimmed" gap={0} ta="center">
          <Text component="span" fz="xs">
            {APP_VERSION}
          </Text>
          <Text component="span" fz="xs">
            {upperFirst(clientOs)}
          </Text>
          <Text component="span" fz="xs">
            {networkStatus.online ? t("online") : t("offline")}
          </Text>
          {isIndexRoute && (
            <Text
              component="span"
              fz="xs"
              mt="xs"
              style={{ cursor: "pointer" }}
              onClick={openChangelogModal}
            >
              {t("openChangelog")}
            </Text>
          )}
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
};

export default AppNavbar;
