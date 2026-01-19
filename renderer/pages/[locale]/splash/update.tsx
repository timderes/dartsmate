import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import { Center, useMantineTheme, Stack, Text, Progress } from "@mantine/core";

import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";

import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";

import type { UpdateCheckResult } from "electron-updater";

const SplashUpdatePage = () => {
  const [status, setStatus] = useState<"idle" | "checking" | "done" | "error">(
    "idle",
  );
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

    if (status === "done") {
      window.ipc.destroyUpdaterWindow();
    }

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
        <pre>
          RESULT={JSON.stringify(result, null, 2)}
          {""} ERROR={JSON.stringify(error, null, 2)} PROGRESS={progress}{" "}
          STATUS={status}
        </pre>
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
