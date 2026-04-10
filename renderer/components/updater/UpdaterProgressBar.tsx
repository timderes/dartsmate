import { useUpdater } from "@/contexts/UpdaterContext";
import { Progress, type ProgressProps } from "@mantine/core";

/**
 * Displays a progress bar during the update download process.
 */
const UpdaterProgressBar = ({ ...props }: Omit<ProgressProps, "value">) => {
  const { progress, status } = useUpdater();

  if (status === "downloading") {
    return <Progress {...props} w={props.w ?? 200} value={progress ?? 0} />;
  }

  return undefined;
};

export default UpdaterProgressBar;
