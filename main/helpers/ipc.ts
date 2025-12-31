import { BrowserWindow, app, ipcMain } from "electron";
import { appSettingsStore } from "./stores";
import log from "electron-log";
import { IS_APP_RUNNING_IN_PRODUCTION_MODE } from "../constants";

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
  // In development mode, relaunch the app for easier testing
  if (!IS_APP_RUNNING_IN_PRODUCTION_MODE) {
    app.relaunch();
  }

  app.quit();
});
