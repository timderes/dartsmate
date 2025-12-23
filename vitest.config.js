import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "renderer"),
            "@lib": resolve(__dirname, "renderer/lib"),
            "@utils": resolve(__dirname, "renderer/utils"),
        },
    },
    test: {},
});