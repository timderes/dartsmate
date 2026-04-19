import { useUpdater } from "@/contexts/UpdaterContext";
import {
  Progress,
  Text,
  NumberFormatter,
  type ProgressProps,
} from "@mantine/core";
import { formatBytes } from "@/lib/updater/formatBytes";

/**
 * Displays a progress bar during the update download process.
 */
const UpdaterProgressBar = ({ ...props }: Omit<ProgressProps, "value">) => {
  const { progress, progressInfo, status } = useUpdater();

  if (status === "downloading") {
    const transferred = progressInfo
      ? formatBytes(progressInfo.transferred)
      : null;
    const total = progressInfo ? formatBytes(progressInfo.total) : null;
    const speed = progressInfo
      ? formatBytes(progressInfo.bytesPerSecond)
      : null;

    return (
      <>
        <Progress {...props} w={props.w ?? 200} value={progress ?? 0} />
        {progressInfo && transferred && total && speed && (
          <Text size="xs" ta="center" mt="xs">
            <NumberFormatter value={transferred.value} decimalScale={2} />{" "}
            {transferred.unit} /{" "}
            <NumberFormatter value={total.value} decimalScale={2} />{" "}
            {total.unit} (
            <NumberFormatter value={speed.value} decimalScale={2} />{" "}
            {speed.unit}/s)
          </Text>
        )}
      </>
    );
  }

  return undefined;
};

export default UpdaterProgressBar;
