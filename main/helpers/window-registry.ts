import { BrowserWindow } from "electron";

const registry = new Map<string, BrowserWindow>();

export const registerWindow = (name: string, win: BrowserWindow) => {
  registry.set(name, win);
};

export const unregisterWindow = (name: string) => {
  registry.delete(name);
};

export const getWindow = (name: string): BrowserWindow | undefined => {
  return registry.get(name);
};

export const findWindow = (
  predicate: (win: BrowserWindow, name: string) => boolean,
): BrowserWindow | undefined => {
  for (const [name, win] of registry.entries()) {
    if (predicate(win, name)) return win;
  }
  return undefined;
};

export const listWindows = (): { name: string; win: BrowserWindow }[] => {
  return Array.from(registry.entries()).map(([name, win]) => ({ name, win }));
};

export default {
  registerWindow,
  unregisterWindow,
  getWindow,
  findWindow,
  listWindows,
};
