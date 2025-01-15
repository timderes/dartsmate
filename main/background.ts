import { app } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import path from "path";
import log from "electron-log";
import { appSettingsStore } from "./helpers/stores";
import { getPreferredLocale, logSystemInfo } from "./helpers/utils";
import { autoUpdater } from "electron-updater";

export const isProd: boolean = process.env.NODE_ENV === "production";

export const minWindowSize = {
  height: 768,
  width: 1024,
};

const sessionId = new Date().valueOf();

if (isProd) {
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

    if (isProd) {
      autoUpdater.allowPrerelease = false;
      void autoUpdater.checkForUpdatesAndNotify();
    } else {
      log.info("Skipping auto-updater in development mode.");
    }
  });

  const mainWindow = createWindow("main", {
    height: minWindowSize.height,
    width: minWindowSize.width,
    minHeight: minWindowSize.height,
    minWidth: minWindowSize.width,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Retrieve the stored locale from app settings, or use the client's preferred locale
  const preferredLocale = getPreferredLocale();
  const locale = appSettingsStore.get("locale", preferredLocale);
  const defaultProfile = appSettingsStore.get("defaultProfileUUID");

  const port = process.argv[2];
  const profileSetupIntroRoute = isProd
    ? `app://./${locale}/profileSetupIntro`
    : `http://localhost:${port}/${locale}/profileSetupIntro`;

  if (!defaultProfile) {
    log.info(
      "No default profile detected. Redirecting user to the Profile Setup Intro route: %s",
      profileSetupIntroRoute
    );
    await mainWindow.loadURL(profileSetupIntroRoute);
  } else {
    log.info(
      "Default profile found. Redirecting user to the main Index route."
    );
    if (isProd) {
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

// TODO: Add more meaningful code to these functions :)
autoUpdater.on("checking-for-update", () => {
  log.info("Checking for update...");
});

autoUpdater.on("update-available", () => {
  log.info("Update available.");
});

autoUpdater.on("update-not-available", () => {
  log.info("Update not available.");
});

autoUpdater.on("error", (error) => {
  log.error(`Error in auto-updater: ${error.message}`);
});

autoUpdater.on("update-downloaded", () => {
  log.info("Download completed.");

  //TODO: Let the user decide if he wants to update after download
  autoUpdater.quitAndInstall();
});

autoUpdater.on("download-progress", (info) => {
  log.info("Download running", info);
});
