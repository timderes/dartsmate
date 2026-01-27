import { useMantineTheme } from "@mantine/core";
import { getStaticPaths, makeStaticProperties } from "@lib/getStatic";
import AnimatedLoaderIcon from "@/components/content/AnimatedLoaderIcon";
import { UpdaterProvider } from "@/contexts/UpdaterContext";
import useUpdater from "@/hooks/useUpdater";
import UpdaterActionButtons from "@/components/updater/UpdaterActionButtons";
import UpdaterContainer from "@/components/updater/UpdaterContainer";
import UpdaterProgressBar from "@/components/updater/UpdaterProgressBar";
import UpdaterStatusText from "@/components/updater/UpdaterStatusText";

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
      <UpdaterContainer>
        <AnimatedLoaderIcon
          color={theme.colors.red[7]}
          style={{ margin: "auto" }}
          width={92}
          height={92}
        />
        <UpdaterStatusText />
        <UpdaterProgressBar />
        <UpdaterActionButtons />
      </UpdaterContainer>
    </UpdaterProvider>
  );
};

export default SplashUpdatePage;

export const getStaticProps = makeStaticProperties(["common"]);
export { getStaticPaths };
