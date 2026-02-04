import { Text } from "@mantine/core";
import { useUpdater } from "@/contexts/UpdaterContext";
import { useTranslation } from "next-i18next";
import { APP_NAME } from "@/utils/constants";

const UpdaterStatusText = () => {
  const { t } = useTranslation();
  const { error, status } = useUpdater();

  const getStatusLabel = () => {
    switch (status) {
      case "appIsUpToDate":
        return t("updater:status.appIsUpToDate", { APP_NAME });
      case "available":
        return t("updater:status.available");
      case "checking":
        return t("updater:status.checking");
      case "downloadComplete":
        return t("updater:status.downloadComplete");
      case "downloading":
        return t("updater:status.downloading");
      case "error":
        return t("updater:status.error", { APP_NAME, ERROR_MESSAGE: error });
      default:
        return t("updater:status.idle");
    }
  };

  return <Text>{getStatusLabel()}</Text>;
};

export default UpdaterStatusText;
