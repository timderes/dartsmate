/**
 * This file contains constants used in the main process of the Electron application.
 */

/**
 * The minimum window size for the application.
 */
const MINIMAL_WINDOW_SIZE = {
  height: 768,
  width: 1024,
};

/**
 * Returns `true` if the application is build and running in production mode.
 */
const IS_APP_RUNNING_IN_PRODUCTION_MODE = process.env.NODE_ENV === "production";

export { IS_APP_RUNNING_IN_PRODUCTION_MODE, MINIMAL_WINDOW_SIZE };
