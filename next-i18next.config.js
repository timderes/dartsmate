/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

/**
 *
 * @type {import('next-i18next').UserConfig}
 *
 */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["de", "en"],
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  // pluralSeparator: "_",
  // keySeparator: false,
  localePath:
    typeof window === "undefined"
      ? require("path").resolve("./renderer/public/locales")
      : "/locales",
};
