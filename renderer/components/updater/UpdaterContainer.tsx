import { Center, type CenterProps, Stack } from "@mantine/core";
import type { PropsWithChildren } from "react";

type UpdaterContainerProps = CenterProps & PropsWithChildren;

const UpdaterContainer = ({ children, ...props }: UpdaterContainerProps) => {
  return (
    <Center h={props.h ?? "100dvh"} w={props.w ?? "100dvw"} {...props}>
      <Stack ta="center">{children}</Stack>
    </Center>
  );
};
export default UpdaterContainer;
