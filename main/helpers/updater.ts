import {
  autoUpdater,
  type ProgressInfo,
  type UpdateInfo,
} from "electron-updater";
import { ipcMain, app, BrowserWindow } from "electron";
import log from "electron-log";
import { getWindow } from "./window-registry";

/**
 * Registers the application updater and sets up IPC handlers for update events.
 * This is used to stop the main window from loading until the update process is
 * complete.
 */
let isUpdateInstalling = false;

const registerUpdater = () => {
  // Skipping auto-updater in development mode
  if (!app.isPackaged) {
    return;

    // Use this to simulate an update event to test the bridge
    /*
    setTimeout(() => {
      BrowserWindow.getAllWindows().forEach((window) => {
        log.info("[Updater] Sending fake update-message");
        window.webContents.send("update-message", {
          event: "available",
          data: { version: "9.9.9" },
        });
      });
    }, 2000);
    return;
    */
  }

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
