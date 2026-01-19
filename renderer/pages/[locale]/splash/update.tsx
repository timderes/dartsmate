import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import { Center, useMantineTheme, Stack, Text, Progress } from "@mantine/core";

import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";

import type { UpdateCheckResult } from "electron-updater";

const SplashUpdatePage = () => {
  const [status, setStatus] = useState<
    "idle" | "checking" | "downloading" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const theme = useMantineTheme();
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    async function check() {
      setStatus("checking");
      try {
        const res = await window.ipc.checkForAppUpdate();

        if (!mounted) return;
        setResult(res);

        if (res?.isUpdateAvailable) {
          // Update is available, you can handle it here if needed
          setStatus("downloading");

          setProgress(res?.downloadPromise ? 0 : 100);

          if (res?.downloadPromise) {
            await res.downloadPromise.then(() => {
              if (!mounted) return;
              setProgress(100);
            });
          }
        }

        setStatus("done");
        setProgress(100);
      } catch (err: unknown) {
        if (!mounted) return;
        setError((err as Error)?.message ?? String(err));
        setStatus("error");
      }
    }

    check().catch((e) => {
      if (!mounted) return;

      setError((e as Error)?.message ?? String(e));
      setStatus("error");
    });

    return () => {
      mounted = false;
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
        <Text>{t(`lookingForUpdate.${status}`)}</Text>
        <Progress value={progress} />
        <pre
          style={{
            display: "block",
            whiteSpace: "pre-wrap",
            textAlign: "left",
            maxWidth: 600,
            margin: "0 auto",
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>

        <pre
          style={{
            display: "block",
            whiteSpace: "pre-wrap",
            textAlign: "left",
            maxWidth: 600,
            margin: "0 auto",
            color: "red",
          }}
        >
          ERROR={error}
        </pre>

        <pre>STATUS={status}</pre>
        <pre>PROGRESS={progress}</pre>
        <button onClick={() => window.ipc.destroyUpdaterWindow()}>
          DESTORY
        </button>
      </Stack>
    </Center>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);

export { getStaticPaths };
