import { useMantineTheme } from "@mantine/core";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";
import { UpdaterProvider } from "@/contexts/UpdaterContext";
import useUpdater from "@/hooks/useUpdater";
import UpdaterActionButtons from "@/components/updater/UpdaterActionButtons";
import UpdaterProgressBar from "@/components/updater/UpdaterProgressBar";
import UpdaterStatusText from "@/components/updater/UpdaterStatusText";
import UpdaterLayout from "@/components/layouts/UpdaterLayout";

/*
 * Size of the animated loader icon
 */
const iconSize = 92; // px

/**
 * Splash page displayed during the update process.
 */
const SplashUpdatePage = () => {
  const theme = useMantineTheme();
  const { status, updateInfo, error, progress, downloaded } = useUpdater();

  return (
    <UpdaterProvider
      downloaded={downloaded}
      error={error}
      progress={progress}
      status={status}
      updateInfo={updateInfo}
    >
      <UpdaterLayout>
        <AnimatedLoaderIcon
          color={theme.colors.red[7]}
          style={{ margin: "auto" }}
          width={iconSize}
          height={iconSize}
        />
        <UpdaterStatusText />
        <UpdaterProgressBar />
        <UpdaterActionButtons />
      </UpdaterLayout>
    </UpdaterProvider>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);
export { getStaticPaths };
