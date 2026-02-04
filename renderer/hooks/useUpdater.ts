import { useEffect, useState } from "react";
import type { ProgressInfo, UpdateInfo } from "electron-updater";
import type { UpdateStatus } from "@/contexts/UpdaterContext";
import log from "electron-log/renderer";
import { useMounted } from "@mantine/hooks";

/**
 * Hook to manage the application update process.
 */
const useUpdater = () => {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const isMounted = useMounted();

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = window.ipc.onUpdateMessage((event, data) => {
      log.info("Update event:", event, data);

      switch (event) {
        case "checking":
          setStatus("checking");
          break;

        case "available":
          setStatus("available");
          if (data) {
            const info = data as UpdateInfo;
            setUpdateInfo(info);
          }
          break;

        case "not-available":
          setStatus("appIsUpToDate");
          break;

        case "progress":
          setStatus("downloading");
          if (data) setProgress((data as ProgressInfo).percent ?? 0);
          break;

        case "downloaded":
          setStatus("downloadComplete");
          setDownloaded(true);
          break;

        case "error":
          setStatus("error");
          setError(data ? JSON.stringify(data, null, 2) : "Unknown error");
          break;

        default:
          log.warn(`Unhandled update event: ${event}`, data);
      }
    });

    // Trigger an initial update check after subscribing so status won't stay idle
    window.ipc.checkForAppUpdate().catch((err) => {
      log.error("Failed to check for app update:", err);
      setStatus("error");
      setError(JSON.stringify(err, null, 2));
    });

    return () => {
      unsubscribe?.();
    };
  }, [isMounted]);

  return {
    status,
    updateInfo,
    error,
    progress,
    downloaded,
  };
};

export default useUpdater;
