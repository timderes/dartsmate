/**
 * Formats a given number of bytes into a value and unit object.
 *
 * @param bytes - The number of bytes to format.
 * @returns An object containing the value and the appropriate unit (e.g., { value: 1.5, unit: "MB" }).
 */
export const formatBytes = (bytes: number): { value: number; unit: string } => {
  if (!Number(bytes)) return { value: 0, unit: "Bytes" };

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return {
    value: bytes / Math.pow(k, i),
    unit: sizes[i],
  };
};
