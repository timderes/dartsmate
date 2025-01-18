import type { ModalProps } from "@mantine/core";
import type { ConfirmModalProps } from "@mantine/modals/lib/ConfirmModal";

type SharedConfirmModalPropsType = Partial<ModalProps> &
  Partial<ConfirmModalProps>;

const SharedConfirmModalProps: SharedConfirmModalPropsType = {
  centered: true,
  overlayProps: {
    backgroundOpacity: 0.75,
    blur: 3,
  },
};

export default SharedConfirmModalProps;
