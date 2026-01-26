import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import {
  Center,
  useMantineTheme,
  Stack,
  Text,
  Progress,
  Divider,
  ButtonGroup,
  Button,
  Box,
  Modal,
  ScrollArea,
} from "@mantine/core";
import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { ProgressInfo, UpdateInfo } from "electron-updater";
import { UpdaterProvider } from "@/contexts/useUpdater";

type UpdateStatus =
  | "appIsUpToDate"
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloadComplete"
  | "done"
  | "error";

const SplashUpdatePage = () => {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const theme = useMantineTheme();
  const { t } = useTranslation();

  // Handle update IPC events
  useEffect(() => {
    const unsubscribe = window.ipc.onUpdateMessage((event, data) => {
      console.log("Update event:", event, data);

      switch (event) {
        case "checking":
          setStatus("checking");
          break;

        case "available":
          setStatus("available");
          if (data) {
            const info = data as UpdateInfo;
            setUpdateInfo(info);
            setShowModal(true);
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
          console.log(`Unhandled update event: ${event}`, data);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Format bytes into human-readable size
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // UI text based on state
  const getStatusLabel = () => {
    switch (status) {
      case "checking":
        return t("updateStatus.checking", "Checking for updates…");
      case "available":
        return t("updateStatus.available", "Update available!");
      case "downloading":
        return t("updateStatus.downloading", "Downloading update…");
      case "downloadComplete":
        return t("updateStatus.downloadComplete", "Download complete!");
      case "appIsUpToDate":
        return t("updateStatus.upToDate", "App is up to date!");
      case "error":
        return t("updateStatus.error", "Update error");
      default:
        return t("updateStatus.idle", "Idle");
    }
  };

  return (
    <UpdaterProvider>
      {/* Release Notes Modal */}
      <Modal
        opened={showModal}
        onClose={() => setShowModal(false)}
        title={t("releaseNotes", "Release Notes")}
        centered
        size="lg"
      >
        <Stack>
          <Text fw={500}>
            {t("newVersionAvailable", "A new version is available!")}
          </Text>
          {updateInfo && (
            <>
              <Text>
                <b>{t("version", "Version")}:</b> {updateInfo.version}
              </Text>
              <Text>
                <b>{t("size", "Size")}:</b>{" "}
                {formatBytes(updateInfo.files?.[0]?.size)}
              </Text>
              <Divider my="xs" />
              <ScrollArea h={240}>
                <Box
                  dangerouslySetInnerHTML={{
                    __html:
                      (updateInfo.releaseNotes as string) ||
                      t("noReleaseNotes", "No release notes provided."),
                  }}
                />
              </ScrollArea>
            </>
          )}
          <ButtonGroup>
            <Button
              onClick={() => {
                void window.ipc.startDownload();
                setShowModal(false);
                setStatus("downloading");
              }}
            >
              {t("downloadUpdate", "Download update")}
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowModal(false);
                window.ipc.destroyUpdaterWindow();
              }}
            >
              {t("skip", "Skip")}
            </Button>
          </ButtonGroup>
        </Stack>
      </Modal>

      {/* Main content */}
      <Center h="100dvh" w="100dvw">
        <Stack ta="center">
          <AnimatedLoaderIcon
            color={theme.colors.red[7]}
            style={{ margin: "auto" }}
            width={92}
            height={92}
          />

          <Text>{getStatusLabel()}</Text>

          {status === "downloading" && (
            <Progress value={progress} w={240} mx="auto" />
          )}

          {(status === "downloadComplete" ||
            status === "error" ||
            status === "appIsUpToDate") && (
            <Button
              onClick={() => {
                if (downloaded) {
                  window.ipc.send("quit-and-install", null);
                } else {
                  window.ipc.destroyUpdaterWindow();
                }
              }}
            >
              {downloaded
                ? t("installUpdate", "Install update")
                : t("closeApp", "Close")}
            </Button>
          )}
        </Stack>
      </Center>
    </UpdaterProvider>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);
export { getStaticPaths };
