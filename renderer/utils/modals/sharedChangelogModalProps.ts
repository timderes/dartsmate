import { ModalProps } from "@mantine/core";

type SharedChangelogModalProps = Partial<ModalProps> & {
  modalId: string;
};

const sharedChangelogModalProps: SharedChangelogModalProps = {
  modalId: "changelog-modal",
  fullScreen: true,
  withCloseButton: false,
  closeOnEscape: false,
};

export default sharedChangelogModalProps;
