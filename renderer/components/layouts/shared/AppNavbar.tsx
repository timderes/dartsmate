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

import navbarRoutes from "@utils/content/navbarRoutes";
import formatLocalizedRoute from "@utils/navigation/formatLocalizedRoute";
import { APP_VERSION } from "@/utils/constants";

type AppNavbarProps = AppShellNavbarProps;

/**
 * The navigation sidebar displaying the app routes.
 */
const AppNavbar = ({ ...props }: AppNavbarProps) => {
  const router = useRouter();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation();
  const CLIENT_OS = useOs();
  const NETWORK_STATUS = useNetwork();

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
            {upperFirst(CLIENT_OS)}
          </Text>
          <Text component="span" fz="xs">
            {NETWORK_STATUS ? t("online") : t("offline")}
          </Text>
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
};

export default AppNavbar;
