import path from "node:path";
import type { UserConfig } from "next-i18next/pages";
import { defaultLocale, supportedLocales } from "./shared/i18n/locales";

const config: UserConfig = {
  i18n: {
    defaultLocale: defaultLocale,
    locales: supportedLocales,
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? path.resolve("./renderer/public/locales")
      : "/locales",
};

export default config;
