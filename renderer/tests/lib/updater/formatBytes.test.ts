import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/updater/formatBytes";

describe("formatBytes", () => {
  it("formats 0 bytes correctly", () => {
    expect(formatBytes(0)).toEqual({ value: 0, unit: "Bytes" });
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toEqual({ value: 500, unit: "Bytes" });
  });

  it("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toEqual({ value: 1, unit: "KB" });
    expect(formatBytes(1536)).toEqual({ value: 1.5, unit: "KB" });
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(1048576)).toEqual({ value: 1, unit: "MB" });
    expect(formatBytes(1572864)).toEqual({ value: 1.5, unit: "MB" });
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toEqual({ value: 1, unit: "GB" });
    expect(formatBytes(1610612736)).toEqual({ value: 1.5, unit: "GB" });
  });
});
