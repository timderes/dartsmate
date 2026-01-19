import { app } from "electron";
import serve from "electron-serve";
import createWindow from "./helpers/create-window";
import "./helpers/ipc";
import path from "path";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { appSettingsStore } from "./helpers/stores";
import getPreferredLocale from "./helpers/utils/getPreferredLocale";
import logSystemInfo from "./helpers/utils/logSystemInfo";
import {
  IS_APP_RUNNING_IN_PRODUCTION_MODE,
  MINIMAL_WINDOW_SIZE,
} from "./constants/application";

const sessionId = new Date().valueOf();

if (IS_APP_RUNNING_IN_PRODUCTION_MODE) {
  serve({ directory: "app" });

  log.transports.file.resolvePathFn = () => {
    return path.join(app.getPath("logs"), `${sessionId}.log`);
  };
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

void (async () => {
  await app.whenReady().then(() => {
    logSystemInfo();
    log.initialize(); // Initialize the logger for renderer process
    autoUpdater.logger = log;

    if (IS_APP_RUNNING_IN_PRODUCTION_MODE) {
      // autoUpdater.allowPrerelease = false;
      // void autoUpdater.checkForUpdatesAndNotify();
    } else {
      // log.info("Skipping auto-updater in development mode.");
    }
  });

  const port = process.argv[2];
  const preferredLocale = getPreferredLocale();
  const locale = appSettingsStore.get("locale", preferredLocale);
  const defaultProfile = appSettingsStore.get("defaultProfileUUID");

  const updaterWindow = createWindow("updater", {
    resizable: false,
    center: true,
    closable: IS_APP_RUNNING_IN_PRODUCTION_MODE ? false : true,
    minimizable: false,
    // skipTaskbar: true,
    frame: IS_APP_RUNNING_IN_PRODUCTION_MODE ? false : true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (IS_APP_RUNNING_IN_PRODUCTION_MODE) {
    await updaterWindow.loadURL(`app://./${locale}/splash/update`);
  } else {
    await updaterWindow.loadURL(
      `http://localhost:${port}/${locale}/splash/update`,
    );
    updaterWindow.webContents.openDevTools({ mode: "detach" });
  }

  // Wait until the updater window is closed, then show the main window
  await new Promise<void>((resolve) => {
    updaterWindow.on("closed", () => resolve());
  });

  const mainWindow = createWindow("main", {
    height: MINIMAL_WINDOW_SIZE.height,
    width: MINIMAL_WINDOW_SIZE.width,
    minHeight: MINIMAL_WINDOW_SIZE.height,
    minWidth: MINIMAL_WINDOW_SIZE.width,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const profileSetupIntroRoute = IS_APP_RUNNING_IN_PRODUCTION_MODE
    ? `app://./${locale}/profileSetupIntro`
    : `http://localhost:${port}/${locale}/profileSetupIntro`;

  if (!defaultProfile) {
    log.info(
      "No default profile detected. Redirecting user to the Profile Setup Intro route: %s",
      profileSetupIntroRoute,
    );
    await mainWindow.loadURL(profileSetupIntroRoute);
  } else {
    log.info(
      "Default profile found. Redirecting user to the main Index route.",
    );
    if (IS_APP_RUNNING_IN_PRODUCTION_MODE) {
      await mainWindow.loadURL(`app://./${locale}/`);
    } else {
      await mainWindow.loadURL(`http://localhost:${port}/${locale}`);
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  }
})();

app.on("window-all-closed", () => {
  // On macOS, apps typically remain active after closing all windows
  if (process.platform !== "darwin") {
    app.quit();
  }
});
