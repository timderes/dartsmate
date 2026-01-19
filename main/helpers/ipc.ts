import { BrowserWindow, app, ipcMain } from "electron";
import { appSettingsStore } from "./stores";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { getWindow } from "./window-registry";

ipcMain.handle("setLocale", (_, locale: { locale: string }) => {
  appSettingsStore.set("locale", locale);
});

ipcMain.handle("removeAppSettings", () => {
  appSettingsStore.clear();
});

ipcMain.handle("setDefaultProfileUUID", (_, uuid: { uuid: string }) => {
  appSettingsStore.set("defaultProfileUUID", uuid);
});

ipcMain.handle("getDefaultProfileUUID", (): string | undefined => {
  const uuid = appSettingsStore.get("defaultProfileUUID");

  return uuid;
});

ipcMain.handle("removeDefaultProfileUUID", () => {
  appSettingsStore.delete("defaultProfileUUID");
});

ipcMain.on("minimize-app-window", () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  if (focusedWindow) {
    focusedWindow.minimize();
  } else {
    log.error("Attempted to minimize app window, but no focused window found.");
  }
});

ipcMain.on("close-app", () => {
  app.quit();
});

ipcMain.on("reload-app", () => {
  //! Note that this method does not quit the app when executed, you have to call
  //! `app.quit` or `app.exit` after calling app.relaunch to make the app restart.
  app.relaunch();
  app.quit();
});

ipcMain.on("destroy-updater-window", () => {
  const updater = getWindow("updater");

  if (!updater) {
    log.error(
      "Attempted to destroy updater window, but no updater window found in registry.",
    );
    return;
  }
  try {
    if (updater) updater.close();
  } catch (err) {
    log.error("Failed to destroy updater window: %O", err);
  }
});

ipcMain.handle("check-for-app-update", async () => {
  autoUpdater.allowPrerelease = false;
  const result = await autoUpdater.checkForUpdatesAndNotify();
  return result;
});
