import { Center, type CenterProps, Stack } from "@mantine/core";
import type { PropsWithChildren } from "react";

type UpdateContainerProps = CenterProps & PropsWithChildren;

const UpdateContainer = ({ children, ...props }: UpdateContainerProps) => {
  return (
    <Center h={props.h ?? "100dvh"} w={props.w ?? "100dvw"} {...props}>
      <Stack ta="center">{children}</Stack>
    </Center>
  );
};
export default UpdateContainer;
