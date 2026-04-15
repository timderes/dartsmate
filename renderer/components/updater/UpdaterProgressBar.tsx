import { useUpdater } from "@/contexts/UpdaterContext";
import { Progress, Text, type ProgressProps } from "@mantine/core";
import { formatBytes } from "@/lib/updater/formatBytes";

/**
 * Displays a progress bar during the update download process.
 */
const UpdaterProgressBar = ({ ...props }: Omit<ProgressProps, "value">) => {
  const { progress, progressInfo, status } = useUpdater();

  if (status === "downloading") {
    return (
      <>
        <Progress {...props} w={props.w ?? 200} value={progress ?? 0} />
        {progressInfo && (
          <Text size="xs" ta="center" mt="xs">
            {formatBytes(progressInfo.transferred)} /{" "}
            {formatBytes(progressInfo.total)} (
            {formatBytes(progressInfo.bytesPerSecond)}/s)
          </Text>
        )}
      </>
    );
  }

  return undefined;
};

export default UpdaterProgressBar;
