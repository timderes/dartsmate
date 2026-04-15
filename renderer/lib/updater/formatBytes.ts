/**
 * Formats a given number of bytes into a human-readable string.
 *
 * @param bytes - The number of bytes to format.
 * @param decimals - The number of decimal places to include (default: 2).
 * @returns A formatted string with the appropriate unit (e.g., "1.50 MB").
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
