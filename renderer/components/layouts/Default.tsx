import type { PropsWithChildren } from "react";
import {
  AppShell,
  type AppShellHeaderConfiguration,
  type AppShellNavbarConfiguration,
  Container,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import AppHeader from "./shared/AppHeader";
import AppNavbar from "./shared/AppNavbar";
import { NavbarProvider } from "@/contexts/NavbarContext";

type DefaultLayoutProps = {
  fluid?: boolean;
  withNavbarOpen: boolean;
} & PropsWithChildren;

export const headerHeight = 32; // px
export const navbarWidth = 200; // px
export const navbarIconSize = 24; // px

const AppHeaderSettings: AppShellHeaderConfiguration = {
  height: headerHeight,
};

const AppNavbarSettings: AppShellNavbarConfiguration = {
  width: {
    // `md` is the smallest used breakpoint since the
    // app requires 1024x768 pixels
    md: navbarWidth,
    lg: navbarWidth,
    xl: navbarWidth,
  },
  breakpoint: "xs",
};

const DefaultLayout = ({
  children,
  withNavbarOpen = true,
  fluid = true,
}: DefaultLayoutProps) => {
  const [isNavbarOpened, { toggle: toggleNavbar }] =
    useDisclosure(withNavbarOpen);

  return (
    <NavbarProvider toggleNavbar={toggleNavbar}>
      <AppShell
        header={AppHeaderSettings}
        navbar={{
          ...AppNavbarSettings,
          collapsed: {
            mobile: !isNavbarOpened,
            desktop: !isNavbarOpened,
          },
        }}
      >
        <AppHeader />
        <AppNavbar />
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
    </NavbarProvider>
  );
};

export default DefaultLayout;
