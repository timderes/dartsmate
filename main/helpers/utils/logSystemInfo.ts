import { app } from "electron";
import { getSystemVersion } from "process";
import log from "electron-log";

/**
 * Logs system information at application startup.
 *
 * Collects data about the application environment mode,
 * operating system platform, architecture, and OS version,
 * and logs it for diagnostic purposes.
 *
 * Logged information includes:
 * - Application name and version
 * - Environment mode (e.g., development or production)
 * - Operating system platform (e.g., win32, darwin)
 * - System architecture (e.g., x64, arm)
 * - Operating system version
 *
 * @returns {void}
 */
const logSystemInfo = (): void => {
  const systemInfo = {
    applicationName: app.getName(),
    applicationVersion: app.getVersion(),
    environmentMode: process.env.NODE_ENV ?? "undefined",
    operatingSystem: process.platform,
    systemArchitecture: process.arch,
    osVersion: getSystemVersion(),
  };

  const formattedSystemInfo = JSON.stringify(systemInfo, null, 2);

  log.info("System information collected at startup:\n", formattedSystemInfo);
};

export default logSystemInfo;
