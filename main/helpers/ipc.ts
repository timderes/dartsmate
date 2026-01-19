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

ipcMain.on("quit-and-install", () => {
  const updater = getWindow("updater");

  // Try to close the updater window first so the app can quit cleanly.
  try {
    if (updater && !updater.isDestroyed()) {
      try {
        // remove listeners that might block close, then close
        updater.removeAllListeners("close");
      } catch (e) {
        log.warn(
          "Failed to remove updater window close listeners before install: %O",
          e,
        );
      }
      try {
        // If the window was created non-closable in production, attempt to make
        // it closable before closing.
        if (typeof updater.setClosable === "function") {
          try {
            updater.setClosable(true);
          } catch {
            /* ignore */
          }
        }

        updater.close();
      } catch (e) {
        log.warn(
          "Failed to close updater window before install, will destroy: %O",
          e,
        );
        try {
          // Forcefully destroy as a last resort so the app can quit.
          if (!updater.isDestroyed()) updater.destroy();
        } catch (dErr) {
          log.error("Failed to destroy updater window: %O", dErr);
        }
      }
    }

    // Give the window a short moment to close, then trigger quit and install.
    setTimeout(() => {
      try {
        // Try quitting the app cleanly first to ensure windows close.
        try {
          app.quit();
        } catch {
          /* ignore */
        }

        autoUpdater.quitAndInstall();
      } catch (err) {
        log.error("Failed to quit and install update: %O", err);
      }
    }, 250);
  } catch (err) {
    log.error("Error during quit-and-install flow: %O", err);
    try {
      autoUpdater.quitAndInstall();
    } catch (e) {
      log.error("Fallback quitAndInstall failed: %O", e);
    }
  }
});

ipcMain.handle("check-for-app-update", async () => {
  autoUpdater.allowPrerelease = false;
  // Ensure we don't auto-download when checking for updates; renderer decides.
  autoUpdater.autoDownload = false;
  try {
    const result = await autoUpdater.checkForUpdates();

    // Return a minimal, JSON-serializable result.
    const serializable: Record<string, unknown> = {};
    if (result) {
      serializable.updateInfo = result.updateInfo
        ? {
            version: result.updateInfo.version ?? null,
            // path: (result.updateInfo).path ?? null,
            files: result.updateInfo.files ?? null,
          }
        : null;
      serializable.isUpdateAvailable = !!result?.updateInfo?.version;
    }

    return { success: true, result: serializable };
  } catch (err) {
    log.error("check-for-app-update failed: %O", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
});

ipcMain.handle("start-download", async () => {
  try {
    // start download; electron-updater will emit `download-progress` and `update-downloaded`
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    log.error("start-download failed: %O", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
});
