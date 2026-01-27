import { Center, type CenterProps, Stack } from "@mantine/core";
import type { PropsWithChildren } from "react";

type UpdaterLayoutProps = CenterProps & PropsWithChildren;

const UpdaterLayout = ({ children, ...props }: UpdaterLayoutProps) => {
  return (
    <Center h={props.h ?? "100dvh"} w={props.w ?? "100dvw"} {...props}>
      <Stack ta="center">{children}</Stack>
    </Center>
  );
};
export default UpdaterLayout;
