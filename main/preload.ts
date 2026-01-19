import type { IpcRendererEvent } from "electron";
import { contextBridge, ipcRenderer } from "electron";
import type { UpdateCheckResult } from "electron-updater";

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  setLocale(locale: string) {
    void ipcRenderer.invoke("setLocale", locale);
  },
  setDefaultProfileUUID(uuid: string) {
    void ipcRenderer.invoke("setDefaultProfileUUID", uuid);
  },
  getDefaultProfileUUID() {
    return ipcRenderer.invoke("getDefaultProfileUUID");
  },
  removeDefaultProfileUUID() {
    void ipcRenderer.invoke("removeDefaultProfileUUID");
  },
  removeAppSettings() {
    void ipcRenderer.invoke("removeAppSettings");
  },
  checkForAppUpdate(): Promise<UpdateCheckResult | null> {
    return ipcRenderer.invoke("check-for-app-update");
  },
  destroyUpdaterWindow() {
    ipcRenderer.send("destroy-updater-window");
  },
  quitAndInstall() {
    ipcRenderer.send("quit-and-install");
  },
  startDownload() {
    return ipcRenderer.invoke("start-download");
  },
};

contextBridge.exposeInMainWorld("ipc", handler);
export type IpcHandler = typeof handler;
