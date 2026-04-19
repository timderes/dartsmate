import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "renderer"),
      "@hooks": resolve(__dirname, "renderer/hooks"),
      "@lib": resolve(__dirname, "renderer/lib"),
      "@types": resolve(__dirname, "renderer/types"),
      "@utils": resolve(__dirname, "renderer/utils"),
      "@components": resolve(__dirname, "renderer/components"),
      "@pages": resolve(__dirname, "renderer/pages"),
      "@styles": resolve(__dirname, "renderer/styles"),
      "utils": resolve(__dirname, "renderer/utils"),
      "types": resolve(__dirname, "renderer/types"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
