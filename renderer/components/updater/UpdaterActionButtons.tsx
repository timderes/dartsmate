import { useUpdater } from "@/contexts/UpdaterContext";
import { Button } from "@mantine/core";
import log from "electron-log/renderer";
import { useTranslation } from "next-i18next";

const UpdaterActionButtons = () => {
  const { status, downloaded } = useUpdater();
  const { t } = useTranslation();

  if (status === "available") {
    return (
      <Button
        onClick={() => {
          window.ipc.startDownload().catch((err) => {
            log.error("Failed to start update download:", err);
          });
        }}
      >
        {t("updater:downloadUpdate")}
      </Button>
    );
  }
  if (
    status === "downloadComplete" ||
    status === "error" ||
    status === "appIsUpToDate"
  ) {
    return (
      <Button
        onClick={() => {
          if (downloaded) {
            window.ipc.send("quit-and-install", null);
          } else {
            window.ipc.destroyUpdaterWindow();
          }
        }}
      >
        {downloaded ? t("updater:installUpdate") : t("common:closeApp")}
      </Button>
    );
  }

  return null;
};

export default UpdaterActionButtons;
