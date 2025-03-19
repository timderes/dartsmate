import { Center, type CenterProps, Container } from "@mantine/core";
import type { PropsWithChildren } from "react";

type CenteredContentProps = CenterProps & PropsWithChildren;

const CenteredContent = ({ ...props }: CenteredContentProps) => {
  return (
    <Container h="100dvh">
      <Center
        w={props.w || 600}
        mx={props.mx || "auto"}
        h={props.h || "100dvh"}
        {...props}
      >
        {props.children}
      </Center>
    </Container>
  );
};

export default CenteredContent;
