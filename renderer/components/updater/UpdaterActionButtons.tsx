import { useUpdater } from "@/contexts/UpdaterContext";
import { Button } from "@mantine/core";
import log from "electron-log/renderer";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

const UpdaterActionButtons = () => {
  const { status, downloaded } = useUpdater();
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(10);
  const { t } = useTranslation();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    // If the app is up to date, start a countdown to auto-close the updater window
    if (status === "appIsUpToDate") {
      timer = setInterval(() => {
        setAutoCloseSeconds((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      setAutoCloseSeconds(10);
    }

    // When the countdown reaches 0, close the updater window
    if (autoCloseSeconds === 0) {
      window.ipc.destroyUpdaterWindow();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoCloseSeconds, status]);

  // If an update is available, show a button to start downloading the update
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

  // If the update has been downloaded, show a button to install the update
  if (downloaded) {
    return (
      <Button onClick={void window.ipc.quitAndInstall()}>
        {t("updater:installUpdate")}
      </Button>
    );
  }

  // If the app is up to date, show a button to close the updater window with a countdown
  return (
    <Button
      onClick={() => {
        window.ipc.destroyUpdaterWindow();
      }}
    >
      {t("updater:closeUpdaterWithSeconds", { SECONDS: autoCloseSeconds })}
    </Button>
  );
};

export default UpdaterActionButtons;
