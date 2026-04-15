import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/updater/formatBytes";

describe("formatBytes", () => {
  it("formats 0 bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500 Bytes");
  });

  it("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
    expect(formatBytes(1610612736)).toBe("1.5 GB");
  });

  it("handles custom decimals correctly", () => {
    expect(formatBytes(1572864, 0)).toBe("2 MB"); // 1.5 rounds up? Actually toFixed(0) of 1.5 is "2" in JS.
    expect(formatBytes(1572864, 3)).toBe("1.5 MB"); // parseFloat strips trailing zeros
  });

  it("handles negative decimals by treating them as 0", () => {
    expect(formatBytes(1572864, -1)).toBe("2 MB");
  });
});
