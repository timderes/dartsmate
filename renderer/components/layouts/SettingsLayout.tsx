import { Grid, NavLink } from "@mantine/core";
import DefaultLayout from "./Default";
import {
  IconFileDatabase,
  IconLanguage,
  IconPalette,
  IconUser,
} from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import getDefaultIconSize from "utils/misc/getDefaultIconSize";

type SettingsLayoutProps = {
  children: React.ReactNode;
  route: string;
};

type SettingsLink = {
  activeRoute: string;
  icon: React.ReactNode;
  href: string;
  label: string;
};

const SettingsLayout = ({ children, route }: SettingsLayoutProps) => {
  const router = useRouter();
  const {
    t,
    i18n: { language: locale },
  } = useTranslation(["common", "settings"]);

  const settingsNavigationLinks: SettingsLink[] = [
    {
      activeRoute: "/",
      icon: <IconUser style={getDefaultIconSize()} />,
      href: `/`,
      label: t("routes.profile"),
    },
    {
      activeRoute: "colorScheme",
      icon: <IconPalette style={getDefaultIconSize()} />,
      href: "/colorScheme/",
      label: t("settings:colorScheme.title"),
    },
    {
      activeRoute: "language",
      icon: <IconLanguage style={getDefaultIconSize()} />,
      href: "/language/",
      label: t("settings:language.title"),
    },
    {
      activeRoute: "storage",
      icon: <IconFileDatabase style={getDefaultIconSize()} />,
      href: "/storage/",
      label: t("settings:storage.title"),
    },
  ];

  return (
    <DefaultLayout withNavbarOpen>
      <Grid gutter={0}>
        <Grid.Col span={4}>
          {settingsNavigationLinks.map((navLink) => (
            <NavLink
              active={route === navLink.activeRoute}
              label={navLink.label}
              leftSection={navLink.icon}
              key={navLink.href}
              onClick={() =>
                void router.push(`/${locale}/settings${navLink.href}`)
              }
              variant="filled"
            />
          ))}
        </Grid.Col>
        <Grid.Col span="auto" px="xs">
          {children}
        </Grid.Col>
      </Grid>
    </DefaultLayout>
  );
};

export default SettingsLayout;
