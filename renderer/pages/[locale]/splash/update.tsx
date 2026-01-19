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
} from "@mantine/core";

import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { UpdateCheckResult } from "electron-updater";
import { APP_NAME, APP_VERSION } from "@/utils/constants";

// result shape is forwarded from main; keep it untyped here

const SplashUpdatePage = () => {
  const [status, setStatus] = useState<
    | "appIsUpToDate"
    | "idle"
    | "checking"
    | "available"
    | "downloading"
    | "downloadComplete"
    | "done"
    | "error"
  >("idle");
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const theme = useMantineTheme();
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    setStatus("checking");

    const unsubProgress = window.ipc.on(
      "update-download-progress",
      (p: any) => {
        if (!mounted) return;
        setStatus("downloading");
        setProgress(Math.round(p?.percent ?? 0));
      },
    );

    const unsubAvailable = window.ipc.on("update-available", (info: any) => {
      if (!mounted) return;
      // new flow: ask user to download or skip
      setStatus("available");
      setResult(info ?? null);
      setDownloaded(false);
    });

    const unsubDownloaded = window.ipc.on("update-downloaded", (info: any) => {
      if (!mounted) return;
      setStatus("downloadComplete");
      setProgress(100);
      setResult(info ?? null);
      setDownloaded(true);
    });

    const unsubChecking = window.ipc.on("update-checking", () => {
      if (!mounted) return;
      setStatus("checking");
    });

    const unsubError = window.ipc.on("update-error", (e: any) => {
      if (!mounted) return;
      setStatus("error");
      setError(e?.message ?? String(e));
    });

    (async () => {
      try {
        const res = await window.ipc.checkForAppUpdate();
        if (!mounted) return;
        // Handler returns { success: boolean, result: { isUpdateAvailable, updateInfo } }.
        if (res && typeof res === "object" && "success" in res) {
          if (res.success) {
            const payload = (res as any).result ?? null;
            setResult(payload);
            if (payload?.isUpdateAvailable) {
              setStatus("available");
              setDownloaded(false);
            } else {
              setStatus("appIsUpToDate");
              setProgress(100);
            }
          } else {
            setStatus("error");
            setError((res as any).error ?? "Update check failed");
          }
        } else {
          // Fallback: treat as no update
          setResult(res ?? null);
          setStatus("done");
          setProgress(100);
        }
        /*
        if (!res.) {
          setStatus("error");
          setError(res?.error ?? "Update check failed");
        }*/
      } catch (err: unknown) {
        if (!mounted) return;
        setError((err as Error)?.message ?? String(err));
        setStatus("error");
      }
    })().catch((e) => {
      if (!mounted) return;
      setError((e as Error)?.message ?? String(e));
      setStatus("error");
    });

    return () => {
      mounted = false;
      try {
        unsubProgress();
        unsubAvailable();
        unsubDownloaded();
        unsubChecking();
        unsubError();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <Center h="100dvh" w="100dvw">
      <Stack ta="center">
        <AnimatedLoaderIcon
          color={theme.colors.red[7]}
          style={{
            margin: "auto",
          }}
          width={92}
          height={92}
        />
        <Text>{t(`lookingForUpdate.${status}`, { APP_NAME })}</Text>
        {status === "downloading" && <Progress value={progress} />}
        {status === "available" ? (
          <ButtonGroup>
            <Button
              onClick={async () => {
                setStatus("downloading");
                const res = await window.ipc.startDownload();
                if (!res?.success) {
                  setError(res?.error ?? "Failed to start download");
                  setStatus("error");
                }
              }}
            >
              {t("downloadUpdate")}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.ipc.destroyUpdaterWindow()}
            >
              {t("skip")}
            </Button>
          </ButtonGroup>
        ) : (
          <Button
            onClick={() => {
              if (downloaded) {
                // install and restart
                if (window.ipc.quitAndInstall) window.ipc.quitAndInstall();
                else window.ipc.send("quit-and-install", null);
              } else {
                window.ipc.destroyUpdaterWindow();
              }
            }}
          >
            {downloaded ? t("installUpdate") : t("closeApp")}
          </Button>
        )}
        <Box pos="absolute" bottom={10} left={0} ta="center" w="100%">
          <Divider my="sm" />
          <Text component="small" fz="xs" c="dimmed">
            {APP_VERSION}
          </Text>
        </Box>
      </Stack>
    </Center>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
