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
import { APP_SHELL } from "@/utils/constants";

type DefaultLayoutProps = {
  fluid?: boolean;
  withNavbarOpen: boolean;
} & PropsWithChildren;

const AppHeaderSettings: AppShellHeaderConfiguration = {
  height: APP_SHELL.HEADER_HEIGHT,
};

const AppNavbarSettings: AppShellNavbarConfiguration = {
  width: {
    // `md` is the smallest used breakpoint since the
    // app requires 1024x768 pixels
    md: APP_SHELL.NAVBAR_WIDTH,
    lg: APP_SHELL.NAVBAR_WIDTH,
    xl: APP_SHELL.NAVBAR_WIDTH,
  },
  breakpoint: "xs",
};

/**
 * The app structure with a header for app controls and a sidebar
 * navbar for navigation. Wraps content in a container.
 */
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
