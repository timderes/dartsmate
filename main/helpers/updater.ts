import {
  autoUpdater,
  type ProgressInfo,
  type UpdateInfo,
} from "electron-updater";
import { ipcMain, app, BrowserWindow } from "electron";
import log from "electron-log";
import { getWindow } from "./window-registry";
import { IS_APP_RUNNING_IN_PRODUCTION_MODE } from "../constants/application";

/**
 * Registers the application updater and sets up IPC handlers for update events.
 * This is used to stop the main window from loading until the update process is
 * complete.
 */
let isUpdateInstalling = false;

const registerUpdater = () => {
  autoUpdater.autoDownload = false;
  autoUpdater.logger = log;

  // Send update status to all available app windows
  const broadcast = (
    event: string,
    data?: UpdateInfo | ProgressInfo | Error,
  ) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send("update-message", { event, data });
    });
  };

  // Handle all events and broadcast them to renderer process
  autoUpdater.on("checking-for-update", () => broadcast("checking"));
  autoUpdater.on("update-available", (info) => broadcast("available", info));
  autoUpdater.on("update-not-available", () => broadcast("not-available"));
  autoUpdater.on("download-progress", (progress) =>
    broadcast("progress", progress),
  );
  autoUpdater.on("update-downloaded", (info) => broadcast("downloaded", info));
  autoUpdater.on("error", (err) => broadcast("error", err));

  ipcMain.handle("check-for-app-update", async () => {
    if (!IS_APP_RUNNING_IN_PRODUCTION_MODE) {
      broadcast(
        "not-available",
        // Not really an error since this the expected behavior in development mode
        // But this way we can see in the electron log that update checks were attempted
        new Error("Updates are disabled in development mode!"),
      );
      return;
    }
    return await autoUpdater.checkForUpdates();
  });

  ipcMain.handle("start-download", async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.on("quit-and-install", () => {
    isUpdateInstalling = true;
    autoUpdater.quitAndInstall();
  });

  ipcMain.on("destroy-updater-window", () => {
    const updater = getWindow("updater");

    if (updater) {
      updater.close();
    }
  });
};

export { isUpdateInstalling };
export default registerUpdater;
