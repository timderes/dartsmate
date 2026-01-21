import type { PropsWithChildren } from "react";
import { AppShell, type AppShellProps } from "@mantine/core";

import WindowControls from "./shared/WindowControls";
import { APP_SHELL } from "@/utils/constants";

type OnlyControlsLayoutProps = AppShellProps & PropsWithChildren;

const OnlyControlsLayout = ({
  children,
  ...props
}: OnlyControlsLayoutProps) => {
  return (
    <AppShell
      header={{
        height: APP_SHELL.HEADER_HEIGHT,
      }}
      {...props}
    >
      <AppShell.Header>
        <WindowControls />
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default OnlyControlsLayout;
