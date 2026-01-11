import Store from "electron-store";
import pkg from "../../package.json";
import { IS_APP_RUNNING_IN_PRODUCTION_MODE } from "../constants/application";

type AppSettingsStoreType = {
  defaultProfileUUID?: string;
  locale?: string;
};

const lowerCasedProductName = pkg.productName.toLowerCase();
const storePrefix = `store.${lowerCasedProductName}`;

// To avoid profile loading conflicts between production and development modes,
// we append a ".dev" suffix to the store name when in development mode.
const devSuffix = IS_APP_RUNNING_IN_PRODUCTION_MODE ? "" : ".dev";

export const appSettingsStore = new Store<AppSettingsStoreType>({
  name: `${storePrefix}.appSettings${devSuffix}`,
});
