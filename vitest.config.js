import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "renderer"),
      "@hooks": resolve(__dirname, "renderer/hooks"),
      "@lib": resolve(__dirname, "renderer/lib"),
      "@types": resolve(__dirname, "renderer/types"),
      "@utils": resolve(__dirname, "renderer/utils"),
    },
  },
  test: {},
});
