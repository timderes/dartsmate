import type { ActionIconProps } from "@mantine/core";
import { ActionIcon, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

type ActionButtonProps = ActionIconProps & {
  action: () => void;
  icon: ReactNode;
  label: string;
};

const ActionButton = ({ action, icon, label, ...rest }: ActionButtonProps) => {
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon {...rest} onClick={() => action()}>
        {icon}
      </ActionIcon>
    </Tooltip>
  );
};

export default ActionButton;
