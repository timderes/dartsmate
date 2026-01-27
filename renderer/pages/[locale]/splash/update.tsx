import { useTranslation } from "next-i18next";
import { useMantineTheme, Text } from "@mantine/core";
import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import { UpdaterProvider } from "@/contexts/UpdaterContext";
import UpdaterProgressBar from "@/components/updater/UpdaterProgressBar";
import useUpdater from "@/hooks/useUpdater";
import UpdaterActionButtons from "@/components/updater/UpdaterActionButtons";
import UpdaterContainer from "@/components/updater/UpdaterContainer";

const SplashUpdatePage = () => {
  const theme = useMantineTheme();
  const { t } = useTranslation();
  const { status, updateInfo, error, progress, downloaded } = useUpdater();

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
    <UpdaterProvider
      downloaded={downloaded}
      error={error}
      progress={progress}
      status={status}
      updateInfo={updateInfo}
    >
      <UpdaterContainer>
        <AnimatedLoaderIcon
          color={theme.colors.red[7]}
          style={{ margin: "auto" }}
          width={92}
          height={92}
        />
        <Text>{getStatusLabel()}</Text>
        <UpdaterProgressBar />
        <UpdaterActionButtons />
      </UpdaterContainer>
    </UpdaterProvider>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);
export { getStaticPaths };
