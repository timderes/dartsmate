import type { AppProps } from "next/app";
import { createTheme, MantineProvider } from "@mantine/core";
import { appWithTranslation } from "next-i18next";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { useHotkeys } from "@mantine/hooks";
import sendIPC from "@utils/ipc/send";
import { NOTIFICATION_LIMIT } from "utils/constants";

// All packages except `@mantine/hooks` require styles imports!
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

// Put overrides with custom stylesheets here
import "../styles/globals.css";
import "../styles/scrollbar.css";

/*
 * @see https://mantine.dev/theming/mantine-provider/#theme
 */
const appTheme = createTheme({
  primaryColor: "red",
});

const App = ({ Component, pageProps }: AppProps) => {
  /**
   * Hotkeys that can be used throughout the app.
   *
   * @see https://mantine.dev/hooks/use-hotkeys/
   */
  useHotkeys([["CTRL+F1", () => sendIPC("reload-app")]], ["INPUT", "TEXTAREA"]);

  return (
    <MantineProvider defaultColorScheme="auto" theme={appTheme}>
      <Notifications position="top-right" limit={NOTIFICATION_LIMIT} />
      <ModalsProvider>
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
};

export default appWithTranslation(App);
