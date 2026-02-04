import {
  screen,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  Rectangle,
} from "electron";
import Store from "electron-store";

import log from "electron-log";
import { registerWindow, unregisterWindow } from "./window-registry";

import {
  IS_APP_RUNNING_IN_PRODUCTION_MODE,
  MINIMAL_WINDOW_SIZE,
} from "../constants/application";

export default (
  windowName: string,
  options: BrowserWindowConstructorOptions,
): BrowserWindow => {
  const key = "window-state";
  const name = `window-state-${windowName}`;
  const store = new Store({ name });
  const defaultSize = {
    height: MINIMAL_WINDOW_SIZE.height,
    width: MINIMAL_WINDOW_SIZE.width,
  };
  let state = {};

  // eslint-disable-next-line prefer-const
  let win: BrowserWindow;

  const restore = () => store.get(key, defaultSize);

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const windowWithinBounds = (windowState: Rectangle, bounds: Rectangle) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2,
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState: Rectangle) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    store.set(key, state);
  };

  state = ensureVisibleOnSomeDisplay(restore() as Rectangle);

  const browserOptions: BrowserWindowConstructorOptions = {
    ...options,
    ...state,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      ...options.webPreferences,
    },
    // Keep frame and menu bar for easier debugging in dev mode
    autoHideMenuBar: IS_APP_RUNNING_IN_PRODUCTION_MODE ? true : false,
    resizable: true,
    movable: true,
    frame: IS_APP_RUNNING_IN_PRODUCTION_MODE ? false : true,
  };
  win = new BrowserWindow(browserOptions);

  // Register window in the central registry so other modules can access it by name
  try {
    registerWindow(windowName, win);
  } catch (err) {
    log.error("Failed to register window %s: %O", windowName, err);
  }

  // Remove application menu, when the app runs in production mode
  if (IS_APP_RUNNING_IN_PRODUCTION_MODE) {
    win.setMenu(null);
    Menu.setApplicationMenu(null);
  }

  win.on("close", saveState);

  // https://stackoverflow.com/questions/66257921/how-to-disable-next-previous-key-from-mouse-in-electron
  const disableMouseNavigation = async (): Promise<void> => {
    // Allow mouse navigation in dev mode
    if (!IS_APP_RUNNING_IN_PRODUCTION_MODE) return;

    const disableNavigationScript = `
    document.addEventListener('mouseup', (event) => {
      if (event.button === 3 || event.button === 4) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  `;

    try {
      await win.webContents.executeJavaScript(disableNavigationScript);
      log.info("Disabled mouse navigation!");
    } catch (error) {
      log.error("Failed to disable mouse navigation:", error);
    }
  };

  win.webContents.on("dom-ready", () => {
    void disableMouseNavigation();
  });

  // Ensure registry cleanup after window is closed
  win.on("closed", () => {
    try {
      unregisterWindow(windowName);
    } catch (err) {
      log.error("Failed to unregister window %s: %O", windowName, err);
    }
  });

  return win;
};
