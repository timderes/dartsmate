import { app } from "electron";
import i18next from "../../../next-i18next.config.js";
import log from "electron-log";

const defaultLocale = i18next.i18n.defaultLocale;
const supportedLocales = i18next.i18n.locales;

/**
 * Checks if the user's current os locale is included in the
 * supported locales list from the i18n configuration. If the user's locale
 * is supported, it will be used unless overridden in the app settings.
 * Otherwise, the function falls back to the default locale (English).
 *
 * @returns {string} - The preferred locale
 */
const getPreferredLocale = (): string => {
  const appLocale = app.getLocale().toLowerCase();

  const isSupportedLocale = supportedLocales.includes(appLocale);

  if (isSupportedLocale) {
    log.info(
      `User's preferred locale is ${app.getLocale()}. This locale will be used unless the user has overwritten it in the app settings.`,
    );
    return appLocale;
  }

  log.warn(
    `User's preferred locale is not included in the i18n locales config. Falling back to default locale: ${defaultLocale}!`,
  );

  return defaultLocale;
};

export { getPreferredLocale as default, defaultLocale, supportedLocales };
