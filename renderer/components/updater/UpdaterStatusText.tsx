import { Text } from "@mantine/core";
import { useUpdater } from "@/contexts/UpdaterContext";
import { useTranslation } from "next-i18next";

const UpdaterStatusText = () => {
  const { t } = useTranslation();
  const { status } = useUpdater();

  const getStatusLabel = () => {
    switch (status) {
      case "checking":
        return t("updateStatus.checking");
      case "available":
        return t("updateStatus.available");
      case "downloading":
        return t("updateStatus.downloading");
      case "downloadComplete":
        return t("updateStatus.downloadComplete");
      case "appIsUpToDate":
        return t("updateStatus.upToDate");
      case "error":
        return t("updateStatus.error");
      default:
        return t("updateStatus.idle");
    }
  };

  return <Text>{getStatusLabel()}</Text>;
};

export default UpdaterStatusText;
