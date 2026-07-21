import path from "node:path";
import type { UserConfig } from "next-i18next/pages";

const config: UserConfig = {
  i18n: {
    defaultLocale: "en",
    locales: ["de", "en"],
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? path.resolve("./renderer/public/locales")
      : "/locales",
};

export default config;
